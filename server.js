require("dotenv").config();
const express = require("express");
const multer = require("multer");
const axios = require("axios");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const ejs = require("ejs");
const session = require("express-session");
const assignmentDeletion = require("./assignmentDeletionController");

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

if (!process.env.GITHUB_TOKEN) {
    console.error("GITHUB_TOKEN is missing from .env file.");
    process.exit(1);
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = "chrisG759";
const REPO_NAME = "WEDC-IT_Support";
const BRANCH = "main";
const STUDENTS_JSON_PATH = process.env.STUDENTS_JSON_PATH || './students.json';

// Parse and write the students.json content from the environment variable
if (process.env.STUDENTS_JSON_CONTENT) {
    const jsonContent = JSON.parse(process.env.STUDENTS_JSON_CONTENT);
    fs.writeFileSync(STUDENTS_JSON_PATH, JSON.stringify(jsonContent, null, 2));
}

// const DELETION_THRESHOLD = 60000 * 60 * 24 * 31 * 6; // set to 6 months
const DELETION_THRESHOLD = 30000; // test timing(30 seconds)

assignmentDeletion.deleteAllAssignments();

// index path
app.get("/Wedc-It", isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// login path
app.get("/", redirectUserIfLoggedIn, (req, res) => {
    const uploadSuccess = req.query.upload === 'success';
    res.render('registration', { loginError: null, accountCreated: null, uploadSuccess });
});

// sign-up path
app.get("/signup", redirectUserIfLoggedIn, (req, res) => {
    res.render('signup', { signupError: null });
});

// logout Path
app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Logout error: ", err);
            return res.status(500).send("Logout failed.");
        }
        res.redirect("/");
    });
});

// signup functionality
app.post("/studentSignup", (req, res) => {
    const { studentEmail, password, confirmPassword } = req.body;

    if (!studentEmail || !password || !confirmPassword) {
        return res.render("signup", { signupError: "Signup form is not complete" });
    }

    if (confirmPassword !== password) {
        return res.render("signup", { signupError: "Confirm password does not match" });
    }

    fs.readFile(STUDENTS_JSON_PATH, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading students.json:", err);
            return res.status(500).json({ message: "Server error" });
        }

        try {
            let jsonData = JSON.parse(data);

            // Ensure jsonData is an array
            if (!Array.isArray(jsonData)) {
                jsonData = [];
            }

            // Check if student is already registered
            const existingUser = jsonData.find(student => student.email === studentEmail);
            if (existingUser) {
                return res.render('signup', { signupError: "Student has already registered" });
            }

            // Add new user
            const newUser = { email: studentEmail, password };
            jsonData.push(newUser);

            // Write back to file
            fs.writeFile(STUDENTS_JSON_PATH, JSON.stringify(jsonData, null, 2), (writeErr) => {
                if (writeErr) {
                    console.error("Error writing to students.json:", writeErr);
                    return res.status(500).json({ message: "Error saving user" });
                }
                return res.render('registration', { accountCreated: "Account successfully created", loginError: null });
            });

        } catch (parseError) {
            console.error("Error parsing JSON:", parseError);
            return res.status(500).json({ message: "Server error" });
        }
    });
});

// login functionality
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.render('registration', { loginError: "Please complete login form" });
    }

    if(email === process.env.ADMIN_USERNAME && email === process.env.ADMIN_PASSWORD){
        req.session.user = { email };
        res.sendFile(path.join(__dirname, 'index.html'));
    }

    if (email === ADMIN_USERNAME && password === ADMIN_PASSWORD){
        req.session.user = { email };
        res.sendFile(path.join(__dirname, 'index.html'));
    } else {
        return res.status(500).json({ loginError: "Invalid Username or Password", accountCreated: null });
    }

    // read json for verification
    // fs.readFile(STUDENTS_JSON_PATH, 'utf-8', (err, data) => {
    //     if (err) {
    //         console.error(err);
           
    //     }

    //     try {
    //         var jsonData = JSON.parse(data);

    //         const existingUser = jsonData.find(student => student.email === email && student.password === password);

    //         if (existingUser || (email === ADMIN_USERNAME && ADMIN_PASSWORD === password)) {
    //             req.session.user = { email };
    //             res.sendFile(path.join(__dirname, 'index.html'));
    //         } else {
    //             return res.render("registration", { loginError: "Invalid email or password", accountCreated: null });
    //         }
    //     } catch (err) {
    //         console.error(err);
    //         return res.status(500).json({ message: "Server error" });
    //     }
    // });
});

//redirect authentication function
function redirectUserIfLoggedIn(req, res, next) {
    if (req.session.user) {
        return res.redirect("/Wedc-It");
    }
    next();
}

// authentication function
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        return res.redirect("Wedc-It");
    }
}

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;


// Upload assignment routes
const upload = multer({ storage: multer.memoryStorage() });

app.post("/excel_upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded." });
        }

        const fileContent = req.file.buffer.toString("base64");
        const githubFilePath = `Excel_Student_Assignments/${Date.now()}-${req.file.originalname}`;

        const githubResponse = await axios.put(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${githubFilePath}`,
            {
                message: `Uploaded ${req.file.originalname}`,
                content: fileContent,
                branch: BRANCH,
            },
            {
                headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
            }
        );

        return res.redirect("/?upload=success");
    } catch (error) {
        console.error("Error uploading file:", error.response?.data || error.message);
        return res.status(500).json({ message: "Error uploading file." });
    }
});

// Advanced Excel assignment upload
app.post("/advanced_excel_upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded." });
        }

        const fileContent = req.file.buffer.toString("base64");
        const githubFilePath = `Advanced_Excel_Student_Assignments/${Date.now()}-${req.file.originalname}`;

        const githubResponse = await axios.put(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${githubFilePath}`,
            {
                message: `Uploaded ${req.file.originalname}`,
                content: fileContent,
                branch: BRANCH,
            },
            {
                headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
            }
        );

        return res.redirect("/?upload=success");
    } catch (error) {
        console.error("Error uploading file:", error.response?.data || error.message);
        return res.status(500).json({ message: "Error uploading file." });
    }
});

// Basic teams assignment upload
app.post("/teams_upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded." });
        }

        const fileContent = req.file.buffer.toString("base64");
        const githubFilePath = `Teams_Student_Assignments/${Date.now()}-${req.file.originalname}`;

        const githubResponse = await axios.put(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${githubFilePath}`,
            {
                message: `Uploaded ${req.file.originalname}`,
                content: fileContent,
                branch: BRANCH,
            },
            {
                headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
            }
        );

        return res.redirect("/?upload=success");
    } catch (error) {
        console.error("Error uploading file:", error.response?.data || error.message);
        return res.status(500).json({ message: "Error uploading file." });
    }
});

// Advanced teams assignment upload
app.post("/advanced_teams_upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded." });
        }

        const fileContent = req.file.buffer.toString("base64");
        const githubFilePath = `Advanced_Teams_Student_Assignments/${Date.now()}-${req.file.originalname}`;

        const githubResponse = await axios.put(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${githubFilePath}`,
            {
                message: `Uploaded ${req.file.originalname}`,
                content: fileContent,
                branch: BRANCH,
            },
            {
                headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
            }
        );

        return res.redirect("/?upload=success");
    } catch (error) {
        console.error("Error uploading file:", error.response?.data || error.message);
        return res.status(500).json({ message: "Error uploading file." });
    }
});

// OS assignment upload
app.post("/OS_upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded." });
        }

        const fileContent = req.file.buffer.toString("base64");
        const githubFilePath = `OS_Student_Assignments/${Date.now()}-${req.file.originalname}`;

        const githubResponse = await axios.put(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${githubFilePath}`,
            {
                message: `Uploaded ${req.file.originalname}`,
                content: fileContent,
                branch: BRANCH,
            },
            {
                headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
            }
        );

        return res.redirect("/?upload=success");
    } catch (error) {
        console.error("Error uploading file:", error.response?.data || error.message);
        return res.status(500).json({ message: "Error uploading file." });
    }
});

// DBMS assignment upload
app.post("/DBMS_upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded." });
        }

        const fileContent = req.file.buffer.toString("base64");
        const githubFilePath = `DBMS_Student_Assignments/${Date.now()}-${req.file.originalname}`;

        const githubResponse = await axios.put(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${githubFilePath}`,
            {
                message: `Uploaded ${req.file.originalname}`,
                content: fileContent,
                branch: BRANCH,
            },
            {
                headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
            }
        );

        return res.redirect("/?upload=success");
    } catch (error) {
        console.error("Error uploading file:", error.response?.data || error.message);
        return res.status(500).json({ message: "Error uploading file." });
    }
});

// PC and Hardware assignment upload
app.post("/PC_HW_upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded." });
        }

        const fileContent = req.file.buffer.toString("base64");
        const githubFilePath = `PC_HW_Student_Assignments/${Date.now()}-${req.file.originalname}`;

        const githubResponse = await axios.put(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${githubFilePath}`,
            {
                message: `Uploaded ${req.file.originalname}`,
                content: fileContent,
                branch: BRANCH,
            },
            {
                headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
            }
        );

        return res.redirect("/?upload=success");
    } catch (error) {
        console.error("Error uploading file:", error.response?.data || error.message);
        return res.status(500).json({ message: "Error uploading file." });
    }
});

// server launch
app.listen(3000, () => console.log("Server running at http://localhost:3000"));
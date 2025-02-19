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
    saveUninitialized: false, 
    cookie: { 
        maxAge: 60000 * 60 * 24,
        secure: process.env.NODE_ENV === "production"
    }  
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
const STUDENTS_JSON_PATH = path.join(__dirname, "students.json");


// const DELETION_THRESHOLD = 60000 * 60 * 24 * 31 * 6; // set to 6 months
const DELETION_THRESHOLD = 30000; // test timing(30 seconds)

assignmentDeletion.deleteAllAssignments();

// index path
app.get("/Wedc-It", (req, res) => {
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
        res.clearCookie('connect.sid');
        res.redirect("/");
    });
});

// Sign up functionality
app.post("/studentSignup", async (req, res) => {
    const { studentEmail, password, confirmPassword } = req.body;

    if (!studentEmail || !password || !confirmPassword) {
        return res.render("signup", { signupError: "Signup form is not complete" });
    }

    if (confirmPassword !== password) {
        return res.render("signup", { signupError: "Confirm password does not match" });
    }

    try {
        // Instead of reading local file, get the file from GitHub
        const response = await axios.get(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/students.json`,
            {
                headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
            }
        );

        // Decode the content from base64
        const content = Buffer.from(response.data.content, 'base64').toString();
        let jsonData = JSON.parse(content);

        // Check if student exists
        const existingUser = jsonData.find(student => student.email === studentEmail);
        if (existingUser) {
            return res.render('signup', { signupError: "Student has already registered" });
        }

        // Add new user
        const newUser = { 
            email: studentEmail, 
            password
        };
        jsonData.push(newUser);

        // Update the file in GitHub
        await axios.put(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/students.json`,
            {
                message: 'Add new student',
                content: Buffer.from(JSON.stringify(jsonData, null, 2)).toString('base64'),
                sha: response.data.sha,
                branch: BRANCH
            },
            {
                headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
            }
        );

        return res.render('registration', { 
            accountCreated: "Account successfully created", 
            loginError: null 
        });

    } catch (error) {
        console.error("Error in signup process:", error);
        return res.render("signup", { signupError: "Error saving user: " + error.message });
    }
});

// wedc IT folder route
app.get("/LecturesWebPages/lectures.html", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesWebPages/lectures.html"))
});

// Excel upload assignment page route
app.get("/LecturesWebPages/Excel/excelAssignmentUpload.html", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesWebPages/Excel/excelAssignmentUpload.html"));
});

// Advanced Excel assignment page route
app.get("/LecturesWebPages/Excel/advanceExcelAssignmentUpload.html", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesWebPages/Excel/advanceExcelAssignmentUpload.html"));
})

// Basic Teams assignmnet page route
app.get("/LecturesWebPages/Teams/teamsUpload.html", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesWebPages/Teams/teamsUpload.html"));
});

// Advanced teams assignment page route
app.get("/LecturesWebPages/Teams/advancedTeamsUpload.html", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesWebPages/Teams/advancedTeamsUpload.html"));
});

// OS assignment page route
app.get("/LecturesWebPages/OS/osUpload.html", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesWebPages/OS/osUpload.html"));
});

// PC Hardware assignment page route
app.get("/LecturesWebPages/PC_Hardware/pcUpload.html", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesWebPages/PC_Hardware/pcUpload.html"))
});

// DBMS upload assignment page route
app.get("/LecturesWebPages/dbmsAssignmentUpload.html", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesWebPages/DBMS/dbmsAssignmentUpload.html"));
});

// Excel folder route
app.get("/LecturesWebPages/Excel/excel.html", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesWebPages/Excel/excel.html"));
});

// advanced excel folder route
app.get("/LecturesWebPages/Excel/advancedExcel.html", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesWebPages/Excel/advancedExcel.html"));
});

// basic teams folder route
app.get("/LecturesWebPages/Teams/teams.html", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesWebPages/Teams/teams.html"));
});

// advanced teams folder route
app.get("/LecturesWebPages/Teams/advancedTeam.html", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesWebPages/Teams/advancedTeam.html"));
});

// os folder route
app.get("/LecturesWebPages/OS/os.html", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesWebPages/OS/os.html"));
});

// dbms folder route
app.get("/LecturesWebPages/DBMS/dbms.html", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesWebPages/DBMS/dbms.html"));
});

// pc hardware folder route
app.get("/LecturesWebPages/PC_Hardware/pc.html", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesWebPages/PC_Hardware/pc.html"));
});

// Excel lecture download routes
// lecture 1
app.get("/LecturesPPT/Excel/L1_Excel.pptx", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesPPT/Excel/L1_Excel.pptx"));
});

// lecture 2
app.get("/LecturesPPT/Excel/L2_Excel.pptx", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesPPT/Excel/L2_Excel.pptx"));
});

// lecture 3
app.get("/LecturesPPT/Excel/L3_Excel.pptx", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesPPT/Excel/L3_Excel.pptx"));
});

// lecture 4
app.get("/LecturesPPT/Excel/L4_Excel.pptx", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesPPT/Excel/L4_Excel.pptx"));
});

// lecture 5
app.get("/LecturesPPT/Excel/L5_Excel.pptx", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesPPT/Excel/L5_Excel.pptx"));
});

// lecture 6
app.get("/LecturesPPT/Excel/L6_Excel.pptx", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesPPT/Excel/L6_Excel.pptx"));
});

// advanced excel lecture download
//lecture 4
app.get("/LecturesPPT/Excel/L4_Excel.pptx", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesPPT/Excel/L4_Excel.pptx"));
});

// lecture 5
app.get("/LecturesPPT/Excel/L5_Excel.pptx", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesPPT/Excel/L5_Excel.pptx"));
});

// lecture 6
app.get("/LecturesPPT/Excel/L6_Excel.pptx", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesPPT/Excel/L6_Excel.pptx"));
});

// teams lecture downloads
// lecture 1
app.get("/LecturesPPT/Teams/lecture_1_teams.pptx", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesPPT/Teams/lecture_1_teams.pptx"));
});

// advanced teams lecure downloads
// lecture 2
app.get("/LecturesPPT/Teams/lecture_2_teams.pptx", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesPPT/Teams/lecture_2_teams.pptx"));
});

// lecture 3
app.get("/LecturesPPT/Teams/lecture_3_teams.pptx", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesPPT/Teams/lecture_3_teams.pptx"));
});

// os lecture downloads
// basics
app.get("/LecturesPPT/OS/OS-Basic.pptx", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesPPT/OS/OS-Basic.pptx"));
});

// lecture 1
app.get("/LecturesPPT/OS/Lecture-1-new.pptx", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesPPT/OS/Lecture-1-new.pptx"));
});

// lecture 2
app.get("/LecturesPPT/OS/Lecture-2-new.pptx", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesPPT/OS/Lecture-2-new.pptx"));
});

// lecture 3
app.get("/LecturesPPT/OS/Lecture-3-new.pptx", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesPPT/OS/Lecture-3-new.pptx"));
});

// lecture 4
app.get("/LecturesPPT/OS/Lecture-4-new.pptx", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesPPT/OS/Lecture-4-new.pptx"));
});

// lecture 5
app.get("/LecturesPPT/OS/Lecture-5-new.pptx", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesPPT/OS/Lecture-5-new.pptx"));
});

// lecture 6
app.get("/LecturesPPT/OS/Lecture-6-new.pptx", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesPPT/OS/Lecture-6-new.pptx"));
});

// lecture 7
app.get("/LecturesPPT/OS/Lecture-7-new.pptx", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesPPT/OS/Lecture-7-new.pptx"));
});

// lecture 8
app.get("/LecturesPPT/OS/Lecture-8-new.pptx", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesPPT/OS/Lecture-8-new.pptx"));
});

// lecture 9
app.get("/LecturesPPT/OS/Lecture-9-new.pptx", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesPPT/OS/Lecture-9-new.pptx"));
});

// installing os system lecture 
app.get("/LecturesPPT/OS/Intalling-OS-System.pptx", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesPPT/OS/Intalling-OS-System.pptx"));
});

// lecture 11
app.get("/LecturesPPT/OS/Lecture-11-new.pptx", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesPPT/OS/Lecture-11-new.pptx"));
});

// lecture 12
app.get("/LecturesPPT/OS/Lecture-12-new.pptx", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesPPT/OS/Lecture-12-new.pptx"));
});

// lecture 13
app.get("/LecturesPPT/OS/Lecture-13-new.pptx", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesPPT/OS/Lecture-13-new.pptx"));
});

// lecture 14
app.get("/LecturesPPT/OS/Lecture-14-new.pptx", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesPPT/OS/Lecture-14-new.pptx"));
});

// dbms lecture downloads
// lecture 1
app.get("/LecturesPPT/DBMS/Lecture-1-DBMS.pptx", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesPPT/DBMS/Lecture-1-DBMS.pptx"));
});

// pc hardware lecture downloads
// lecture 6
app.get("/LecturesPPT/PC_Hardware/Lecture-6.pptx", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesPPT/PC_Hardware/Lecture-6.pptx"));
});

// lecture 7
app.get("/LecturesPPT/PC_Hardware/Lecture-7.pptx", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesPPT/PC_Hardware/Lecture-7.pptx"));
});

// lecture 8
app.get("/LecturesPPT/PC_Hardware/Lecture-8.pptx", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesPPT/PC_Hardware/Lecture-8.pptx"));
});

// lecture 10
app.get("/LecturesPPT/PC_Hardware/Lecture-10.pptx", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesPPT/PC_Hardware/Lecture-10.pptx"));
});

// login functionality
app.post("/login", async (req, res) => {
    console.log("Login route hit");
    const { email, password } = req.body;

    console.log("Email:", email);
    console.log("Password:", password);

    if (!email || !password) {
        console.log("Incomplete login form");
        return res.render('registration', { loginError: "Please complete login form" });
    }

    if (email === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        req.session.user = { email, isAdmin: true };
        req.session.isAuthenticated = true;
        req.session.save((err) => {
            if (err) {
                console.error("Session save error:", err);
                return res.status(500).json({ message: "Server error" });
            }
            console.log("Admin logged in:", req.session.user);
            return res.sendFile(path.join(__dirname, "index.html"));
        });
        return;
    }

    try {
        // Get students.json from GitHub
        const response = await axios.get(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/students.json`,
            {
                headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
            }
        );

        // Decode the content from base64
        const content = Buffer.from(response.data.content, 'base64').toString();
        const students = JSON.parse(content);

        // Find student
        const student = students.find(s => s.email === email && s.password === password);

        if (student) {
            req.session.user = { email, isStudent: true };
            req.session.isAuthenticated = true;
            req.session.save((err) => {
                if (err) {
                    console.error("Session save error:", err);
                    return res.status(500).json({ message: "Server error" });
                }
                console.log("Student logged in:", req.session.user);
                return res.sendFile(path.join(__dirname, "index.html"));
            });
        } else {
            console.log("Invalid email or password");
            return res.render("registration", { 
                loginError: "Invalid email or password", 
                accountCreated: null 
            });
        }

    } catch (error) {
        console.error("Error in login process:", error);
        return res.render("registration", { 
            loginError: "Login error occurred", 
            accountCreated: null 
        });
    }
});


//redirect authentication function
function redirectUserIfLoggedIn(req, res, next) {
    if (req.session.user) {
        return res.redirect("/Wedc-It");
    }
    next();
}

function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    console.log("No session found, redirecting...");
    res.redirect("/");
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

        return res.status(200).json({message: "File uploaded successfully"});
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

        return res.status(200).json({message: "File uploaded successfully"});
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

        return res.status(200).json({message: "File uploaded successfully"});
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

        return res.status(200).json({message: "File uploaded successfully"});
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

        return res.status(200).json({message: "File uploaded successfully"});
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

        return res.status(200).json({message: "File uploaded successfully"});
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

        return res.status(200).json({message: "File uploaded successfully"});
    } catch (error) {
        console.error("Error uploading file:", error.response?.data || error.message);
        return res.status(500).json({ message: "Error uploading file." });
    }
});

// server launch
app.listen(3000, () => console.log("Server running at http://localhost:3000"));
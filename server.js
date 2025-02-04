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


const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
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

// index path
app.get("/Wedc-It", isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// login path
app.get("/", redirectUserIfLoggedIn, (req, res) => {
    res.render('registration', {loginError: null, accountCreated: null});
});

// sign-up path
app.get("/signup", redirectUserIfLoggedIn, (req, res) => {
    res.render('signup', {signupError: null});
});

// logout Path
app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Logout error: ", err);
            return res.status(500).send("Logout failed.")
        }
        res.redirect("/");
    });
});

// signup functionality
app.post("/studentSignup", (req, res) => {
    const { studentEmail, password, confirmPassword } = req.body;

    if (!studentEmail || !password || !confirmPassword) {
        return res.render("signup", {signupError: "Signup form is not complete"})
    }

    if (confirmPassword !== password) {
        return res.render("signup", {signupError: "Confirm password does not match"})
    }

    fs.readFile('students.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
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

                return res.render('signup', {signupError: "Student has already registered"});
            }

            // Add new user
            const newUser = { email: studentEmail, password };
            jsonData.push(newUser);

            // Write back to file
            fs.writeFile('students.json', JSON.stringify(jsonData, null, 2), (writeErr) => {
                if (writeErr) {
                    console.error(writeErr);
                    return res.status(500).json({ message: "Error saving user" });
                }
                return res.render('registration', {accountCreated : "Account successfully created", loginError: null})
            });

        } catch (parseError) {
            console.error("Error parsing JSON:", parseError);
            return res.status(500).json({ message: "Server error" });
        }
    });
});

//redirect authentication function
function redirectUserIfLoggedIn(req, res, next){
    if (req.session.user){
        return res.redirect("/Wedc-It");
    }
    next();
}

// authentication function
function isAuthenticated(req, res, next){
    if(req.session.user){
        return next();
    } else {
        return res.redirect("Wedc-It");
    }
}

// login functionality
app.post("/login", (req, res) => {
    const {email, password} = req.body;

    if(!email || !password){
        return res.render('registration', {loginError: "Please complete login form"})
    }

    // read json for verification
    fs.readFile('students.json', 'utf-8', (err, data) => {
        try{
            var jsonData = JSON.parse(data);
            
            const existingUser = jsonData.find(student => student.email === email && student.password === password);
            
            if (existingUser){
                req.session.user = {email};
                res.sendFile(path.join(__dirname, 'index.html'))
            } else {
                return res.render("registration", { loginError: "Invalid email or password", accountCreated: null });
            }
        } catch(err){
            console.error(err);
        }
        
    });
});

// wedc IT folder route
app.get("/LecturesWebPages/lectures.html", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesWebPages/lectures.html"))
});

// upload assignment page route
app.get("/LecturesWebPages/Excel/upload.html", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesWebPages/Excel/upload.html"));
});

// excel folder route
app.get("/LecturesWebPages/Excel/excel.html", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesWebPages/Excel/excel.html"));
});

// advanced excel folder route
app.get("/LecturesWebPages/Teams/teams.html", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesWebPages/Teams/teams.html"));
});

// basic teams folder route
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


// assignment upload functionality
const upload = multer();

app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded." });
        }

        const fileContent = req.file.buffer.toString("base64");
        const githubFilePath = `Student_Assignments/${Date.now()}-${req.file.originalname}`;

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

        res.json({ message: "File uploaded successfully.", url: githubResponse.data.content.html_url });
        location.reload();
    } catch (error) {
        console.error("Error uploading file:", error.response?.data || error.message);
        res.status(500).json({ message: "Error uploading file." });
    }
});

// server launch
app.listen(3000, () => console.log("Server running at http://localhost:3000"));

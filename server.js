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
const adminControl = require('./adminController');
const registrationControl = require('./registrationController');
const uploadControl = require('./fileUploadController');

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

assignmentDeletion.deleteAllAssignments();

// Admin paths
// Admin-Grades
app.get('/admin-grade', adminControl.getGrades);
// Visable Modules for Students
app.get('/admin-modules', adminControl.getModules);
// Account Registrations page
app.get('/admin-accounts', adminControl.getAccountsPage);
// Send accounts to registrations page
app.get('/admin-accounts-data', adminControl.getAccounts);


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
app.post("/studentSignup", registrationControl.signup);

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

// Login functionality
app.post("/login", registrationControl.login);


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

// Upload assignment routes
const upload = multer({ storage: multer.memoryStorage() });

app.post("/excel_upload", upload.single("file"), uploadControl.excelUpload);

// Advanced Excel assignment upload
app.post("/advanced_excel_upload", upload.single("file"), uploadControl.advancedExcelUpload);


// Basic teams assignment upload
app.post("/teams_upload", upload.single("file"), uploadControl.teamsUpload);

// Advanced teams assignment upload
app.post("/advanced_teams_upload", upload.single("file"), uploadControl.advancedTeamsUpload);

// OS assignment upload
app.post("/OS_upload", upload.single("file"), uploadControl.oSupload);

// DBMS assignment upload
app.post("/DBMS_upload", upload.single("file"), uploadControl.dbmsUpload);

// PC and Hardware assignment upload
app.post("/PC_HW_upload", upload.single("file"), uploadControl.pcHWupload);

// server launch
app.listen(3000, () => console.log("Server running at http://localhost:3000"));
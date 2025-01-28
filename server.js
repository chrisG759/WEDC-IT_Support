require("dotenv").config();
const express = require("express");
const multer = require("multer");
const axios = require("axios");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());

if (!process.env.GITHUB_TOKEN) {
    console.error("GITHUB_TOKEN is missing from .env file.");
    process.exit(1);
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = "chrisG759";
const REPO_NAME = "WEDC-IT_Support";
const BRANCH = "main";

// index path
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
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
app.get("/LecturesWebPages/Excel/advancedExcel.html", (req, res) => {
    res.sendFile(path.join(__dirname, "/LecturesWebPages/Excel/advancedExcel.html"));
});

// lecture download routes
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

const multer = require('multer');
const axios = require('axios');


const upload = multer({ storage: multer.memoryStorage() });

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = "chrisG759";
const REPO_NAME = "WEDC-IT_Support";
const BRANCH = "main";


async function excelUpload(req, res){
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
}

async function advancedExcelUpload(req, res){
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
}

async function teamsUpload(req, res){
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
}

async function advancedTeamsUpload(req, res){
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
}

async function oSupload(req, res){
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
}

async function dbmsUpload(req, res){
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
}

async function pcHWupload(req, res){
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
}

module.exports = {
    excelUpload,
    advancedExcelUpload,
    teamsUpload,
    advancedTeamsUpload,
    oSupload,
    dbmsUpload,
    pcHWupload
}
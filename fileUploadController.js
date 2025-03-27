const multer = require('multer');
const axios = require('axios');
const unzipper = require('unzipper');
const path = require('path');

const upload = multer({ storage: multer.memoryStorage() });

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = "chrisG759";
const REPO_NAME = "WEDC-IT_Support";
const BRANCH = "main";

async function getFileSha(filePath) {
    try {
        const response = await axios.get(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`,
            { headers: { Authorization: `Bearer ${GITHUB_TOKEN}` } }
        );
        return response.data.sha;
    } catch (error) {
        return null; // If the file doesn't exist, return null
    }
}

async function uploadToGitHub(filePath, content, message) {
    const sha = await getFileSha(filePath); // Get SHA if file exists
    const payload = {
        message,
        content: content.toString("base64"),
        branch: BRANCH,
    };
    if (sha) payload.sha = sha; // Include SHA if updating a file

    await axios.put(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`,
        payload,
        { headers: { Authorization: `Bearer ${GITHUB_TOKEN}` } }
    );
}

async function uploadAndExtract(req, res, folderPath) {
    try {
        if (!req.file) {
            console.log("❌ No file received."); // Log missing file
            return res.status(400).json({ message: "No file uploaded." });
        }

        const fileBuffer = req.file.buffer;
        const originalFileName = req.file.originalname;

        console.log(`🟡 Uploaded file name: ${originalFileName}`);
        console.log(`🟡 File extension: ${path.extname(originalFileName)}`);
        console.log(`🟡 File buffer size: ${fileBuffer.length} bytes`);

        if (path.extname(originalFileName).toLowerCase() !== ".zip") {
            console.log("❌ Uploaded file is NOT a ZIP archive.");
            return res.status(400).json({ message: "Uploaded file is not a ZIP archive." });
        }

        console.log("🟢 File is recognized as ZIP, attempting to extract...");

        // Try opening the ZIP archive
        const zip = await unzipper.Open.buffer(fileBuffer);
        console.log(`🟢 ZIP file successfully recognized! Contains ${zip.files.length} files.`);

        // Create a root folder name based on the zip file name (without extension)
        const rootFolderName = path.basename(originalFileName, '.zip');
        const rootFolderPath = `${folderPath}/${rootFolderName}`;

        // Iterate over the files in the zip archive
        const uploadPromises = zip.files.map(async (file) => {
            if (file.type === "Directory") return; // Skip directories

            const content = await file.buffer();
            const githubFilePath = `${rootFolderPath}/${file.path}`; // Ensure proper pathing

            // Upload the extracted file to GitHub
            await uploadToGitHub(githubFilePath, content, `Uploaded ${file.path}`);
        });

        await Promise.all(uploadPromises);
        return res.status(200).json({ message: "Zip file uploaded and extracted successfully." });
    } catch (error) {
        console.error("❌ Error uploading file:", error.response?.data || error.message);
        return res.status(500).json({ message: "Error uploading file." });
    }
}

async function uploadAndExtract(req, res, folderPath) {
    try {
        if (!req.file) {
            console.log("❌ No file received."); // Log missing file
            return res.status(400).json({ message: "No file uploaded." });
        }

        const fileBuffer = req.file.buffer;
        const originalFileName = req.file.originalname;

        console.log(`🟡 Uploaded file name: ${originalFileName}`);
        console.log(`🟡 File extension: ${path.extname(originalFileName)}`);
        console.log(`🟡 File buffer size: ${fileBuffer.length} bytes`);

        if (path.extname(originalFileName).toLowerCase() !== ".zip") {
            console.log("❌ Uploaded file is NOT a ZIP archive.");
            return res.status(400).json({ message: "Uploaded file is not a ZIP archive." });
        }

        console.log("🟢 File is recognized as ZIP, attempting to extract...");

        // Try opening the ZIP archive
        const zip = await unzipper.Open.buffer(fileBuffer);
        console.log(`🟢 ZIP file successfully recognized! Contains ${zip.files.length} files.`);

        // Create a root folder name based on the zip file name (without extension)
        const rootFolderName = path.basename(originalFileName, '.zip');
        const rootFolderPath = `${folderPath}/${rootFolderName}`;

        // Iterate over the files in the zip archive
        const uploadPromises = zip.files.map(async (file) => {
            if (file.type === "Directory") return; // Skip directories

            const content = await file.buffer();
            const githubFilePath = `${rootFolderPath}/${file.path}`; // Ensure proper pathing

            // Upload the extracted file to GitHub
            await uploadToGitHub(githubFilePath, content, `Uploaded ${file.path}`);
        });

        await Promise.all(uploadPromises);
        return res.status(200).json({ message: "Zip file uploaded and extracted successfully." });
    } catch (error) {
        console.error("❌ Error uploading file:", error.response?.data || error.message);
        return res.status(500).json({ message: "Error uploading file." });
    }
}


async function excelUpload(req, res) {
    await uploadAndExtract(req, res, 'Excel_Student_Assignments');
}

async function advancedExcelUpload(req, res) {
    await uploadAndExtract(req, res, 'Advanced_Excel_Student_Assignments');
}

async function teamsUpload(req, res) {
    await uploadAndExtract(req, res, 'Teams_Student_Assignments');
}

async function advancedTeamsUpload(req, res) {
    await uploadAndExtract(req, res, 'Advanced_Teams_Student_Assignments');
}

async function oSupload(req, res) {
    await uploadAndExtract(req, res, 'OS_Student_Assignments');
}

async function dbmsUpload(req, res) {
    await uploadAndExtract(req, res, 'DBMS_Student_Assignments');
}

async function pcHWupload(req, res) {
    await uploadAndExtract(req, res, 'PC_HW_Student_Assignments');
}

module.exports = {
    excelUpload,
    advancedExcelUpload,
    teamsUpload,
    advancedTeamsUpload,
    oSupload,
    dbmsUpload,
    pcHWupload
};

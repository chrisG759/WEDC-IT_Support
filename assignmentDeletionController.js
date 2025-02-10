const axios = require("axios");

if (!process.env.GITHUB_TOKEN) {
    console.error("GITHUB_TOKEN is missing from .env file.");
    process.exit(1);
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = "chrisG759";
const REPO_NAME = "WEDC-IT_Support";
const BRANCH = "main";

// const DELETION_THRESHOLD = 60000 * 60 * 24 * 31 * 6; // set to 6 months
const DELETION_THRESHOLD = 30000; // test timing(30 seconds)

async function deleteOldAssignments(folder) {
    try {
        const { data: files } = await axios.get(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${folder}`, {
            headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
        });

        const now = Date.now();

        for (const file of files) {
            const { data: commits } = await axios.get(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits`, {
                params: {
                    path: file.path,
                    sha: BRANCH,
                    per_page: 1
                },
                headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
            });

            if (commits.length > 0) {
                const lastModified = new Date(commits[0].commit.committer.date).getTime();
                if (now - lastModified > DELETION_THRESHOLD) {
                    try {
                        await axios.delete(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${file.path}`, {
                            headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
                            data: {
                                message: `Deleting old file: ${file.path}`,
                                sha: file.sha,
                                branch: BRANCH
                            }
                        });
                        console.log(`Deleted ${file.path}`);
                    } catch (error) {
                        if (error.response && error.response.status === 409) {
                            console.error(`Conflict error deleting file ${file.path}:`, error.response.data);
                        } else {
                            console.error(`Error deleting file ${file.path}:`, error.response?.data || error.message);
                        }
                    }
                }
            }
        }
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.log(`Folder ${folder} does not exist or is empty.`);
        } else {
            console.error(`Error fetching contents of folder ${folder}:`, error.response?.data || error.message);
        }
    }
}

async function deleteAllAssignments() {
    const folders = [
        "Excel_Student_Assignments", 
        "Advanced_Excel_Student_Assignments", 
        "Teams_Student_Assignments",
        "Advanced_Teams_Student_Assignments", 
        "OS_Student_Assignments", 
        "DBMS_Student_Assignments", 
        "PC_HW_Student_Assignments"
    ];

    for (const folder of folders) {
        await deleteOldAssignments(folder);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Delay of 1 second between each folder
    }
}

deleteAllAssignments();

module.exports = {
    deleteAllAssignments
};
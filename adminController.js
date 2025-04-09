const path = require('path');
const express = require('express');
const axios = require('axios');
const { json } = require('stream/consumers');
const fs = require('fs');

const app = express();

app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', [path.join(__dirname, 'views'), path.join(__dirname, 'AdminWebPages')]);

function getGrades(req, res){
    return res.sendFile(path.join(__dirname, '/AdminWebPages/Grades.html'));
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = "chrisG759";
const REPO_NAME = "WEDC-IT_Support";
const BRANCH = "main";

async function getAccountsPage(req, res) {
    const response = await axios.get(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/students.json`,
        {
            headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
        }
    );

    const content = Buffer.from(response.data.content, 'base64').toString();
    const data = JSON.parse(content);

    return res.render('AccountRegistrations', {users : data});
}


async function deleteRegistration(req, res) {
    try {
        const emailToDelete = req.body.requestAccount;

        console.log("Email to delete: ", emailToDelete);

        const response = await axios.get(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/students.json`,
            {
                headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
            }
        );

        const content = Buffer.from(response.data.content, 'base64').toString();
        const data = JSON.parse(content);

        // Filter out the student to delete
        const updatedData = data.filter(student => student.email !== emailToDelete);

        const updatedContent = Buffer.from(JSON.stringify(updatedData, null, 2)).toString('base64');

        await axios.put(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/students.json`,
            {
                message: 'Student Removed',
                content: updatedContent,
                sha: response.data.sha,
                branch: BRANCH
            },
            {
                headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
            }
        );

        return res.render('AccountRegistrations', {users : updatedData});
    } catch (error) {
        console.error('Error deleting student:', error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

function getModules(req, res) {
    fs.readFile(path.join(__dirname, 'modules.json'), 'utf8', (err, data) => {
        if (err) {
            console.error("Error loading modules:", err);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        try {
            for(var element in data){
                console.log(element.name, element.data);
                
            }
            return;
        } catch (parseErr) {
            console.error("Error parsing modules JSON:", parseErr);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    });
}

module.exports = {
    getGrades, 
    getModules,
    getAccountsPage,
    deleteRegistration
};
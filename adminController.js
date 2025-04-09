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

async function getModules(req, res) {

    try{
        const response = await axios.get(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/modules.json`,
            {
                headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
            }
        );

        const content = Buffer.from(response.data.content, 'base64').toString();
        const data = JSON.parse(content);

        return res.render('Modules', {modules : data});

    } catch(error){
        console.error("Error retrieving modules: ", error);
        return res.status(500).json({message : "Internal Server Error"});
    }
}

function addModulePage(req, res){
    return res.render('addModule');
}

async function uploadModule(req, res) {
    const moduleName = req.body.moduleName;
    const modulePath = req.body.modulePath;

    try {
        const response = await axios.get(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/modules.json`,
            {
                headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
            }
        );

        const fileSha = response.data.sha;
        const content = Buffer.from(response.data.content, 'base64').toString();
        const modules = JSON.parse(content);

        modules.push({
            Name: moduleName,
            Path: modulePath
        });

        const updatedContent = Buffer.from(JSON.stringify(modules, null, 2)).toString('base64');

        await axios.put(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/modules.json`,
            {
                message: 'Module Added',
                content: updatedContent,
                sha: fileSha,
                branch: BRANCH
            },
            {
                headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
            }
        );

        return res.render('Modules', {modules : modules});

    } catch (error) {
        console.error("Error uploading module: ", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

async function removeModule(req, res) {
    const removalModule = req.body.mod;

    try {
        const response = await axios.get(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/modules.json`,
            {
                headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
            }
        );

        

        const fileSha = response.data.sha;
        const content = Buffer.from(response.data.content, 'base64').toString();
        const modules = JSON.parse(content);

        const updatedModules = modules.filter(modules => modules.Name !== removalModule);
        const updatedContent = Buffer.from(JSON.stringify(updatedModules, null, 2)).toString('base64');

        await axios.put(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/modules.json`,
            {
                message: 'Module Removed',
                content: updatedContent,
                sha: fileSha,
                branch: BRANCH
            },
            {
                headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
            }
        );

        const updatedResponse = await axios.get(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/modules.json`,
            {
                headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
            }
        );

        const reloadContent = Buffer.from(updatedResponse.data.content, 'base64').toString();
        const reloadModules = JSON.parse(reloadContent); 

        return res.render('Modules', {modules : reloadModules});

    } catch (error){
        console.error("Could not find module: ", error);
        return res.status(500).json({message : "Internal Server Error"});
    }
    
}


module.exports = {
    getGrades, 
    getModules,
    getAccountsPage,
    deleteRegistration,
    addModulePage,
    uploadModule,
    removeModule
};
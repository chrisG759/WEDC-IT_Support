const path = require('path');
const express = require('express');
const fs = require('fs');
const ejs = require('ejs');
const { json } = require('stream/consumers');
const axios = require('axios');

const app = express();

app.set('view engine', 'ejs');
app.set('views', [path.join(__dirname, 'views'), path.join(__dirname, 'AdminWebPages')]);

function getGrades(req, res){
    return res.sendFile(path.join(__dirname, '/AdminWebPages/Grades.html'));
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = "chrisG759";
const REPO_NAME = "WEDC-IT_Support";
const BRANCH = "main";

function getAccountsPage(req, res) {
    fs.readFile(path.join(__dirname, 'students.json'), 'utf-8', (err, data) => {
        if(err){
            console.error("Error loading file: ", err);
            return;
        }
        
        data = JSON.parse(data);
        return res.render('AccountRegistrations', {users : data})
    });
}

async function deleteRegistration(req, res){
    const emailToDelete = req.body.email;

    const response = await axios.get(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/students.json`,
        {
            headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
        }
    );

    const content = Buffer.from(response.data.content, 'base64').toString();
    const data = JSON.parse(content);

    let newData = [];

    for(let student in data){
        if(student.email !== emailToDelete){
            newData.push({data})
        }
    }

    for(let element in newData){
        console.log(element);
    }
    return;
}

function getModules(req, res){
    return res.sendFile(path.join(__dirname, '/AdminWebPages/Modules.html'));
}

module.exports = {
    getGrades, 
    getModules,
    getAccountsPage,
    deleteRegistration
};
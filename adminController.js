const path = require('path');
const express = require('express');
const fs = require('fs');

const app = express();

function getGrades(req, res){
    return res.sendFile(path.join(__dirname, '/AdminWebPages/Grades.html'));
}

function getAccounts(req, res){
    fs.readFile(path.join(__dirname, 'students.json'), 'utf-8', (err, data) => {
        if(err){
            console.err("Error loading file: ", err);
            return;
        }
        const accounts = JSON.parse(data);
        res.json(accounts);
    });
};

function getAccountsPage(req, res) {
    return res.sendFile(path.join(__dirname, '/AdminWebPages/AccountRegistrations.html'));
}

function getModules(req, res){
    return res.sendFile(path.join(__dirname, '/AdminWebPages/Modules.html'));
}

module.exports = {
    getGrades, 
    getAccounts,
    getModules,
    getAccountsPage
};
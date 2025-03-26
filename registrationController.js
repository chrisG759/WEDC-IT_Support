const axios = require('axios');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = "chrisG759";
const REPO_NAME = "WEDC-IT_Support";
const BRANCH = "main";

async function signup(req, res){
    const { studentEmail, password, confirmPassword, role } = req.body;
    
        if (!studentEmail || !password || !confirmPassword || role === "role") {
            return res.render("signup", { signupError: "Signup form is not complete" });
        }
    
        if (confirmPassword !== password) {
            return res.render("signup", { signupError: "Confirm password does not match" });
        }
    
    
        try {
            // Instead of reading local file, get the file from GitHub
            const response = await axios.get(
                `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/students.json`,
                {
                    headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
                }
            );
    
            // Decode the content from base64
            const content = Buffer.from(response.data.content, 'base64').toString();
            let jsonData = JSON.parse(content);
    
            // Check if student exists
            const existingUser = jsonData.find(student => student.email === studentEmail);
            if (existingUser) {
                return res.render('signup', { signupError: "Student has already registered" });
            }
    
            // Add new user
            const newUser = { 
                email: studentEmail, 
                password: password,
                role: role
            };
            jsonData.push(newUser);
    
            // Update the file in GitHub
            await axios.put(
                `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/students.json`,
                {
                    message: 'Add new student',
                    content: Buffer.from(JSON.stringify(jsonData, null, 2)).toString('base64'),
                    sha: response.data.sha,
                    branch: BRANCH
                },
                {
                    headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
                }
            );
    
            return res.render('registration', { 
                accountCreated: "Account successfully created", 
                loginError: null 
            });
    
        } catch (error) {
            console.error("Error in signup process:", error);
            return res.render("signup", { signupError: "Error saving user: " + error.message });
        }
}

async function login(req, res){
    const { email, password } = req.body;
    
        if (!email || !password) {
            return res.render('registration', { loginError: "Please complete login form" });
        }
    
        try {
            const response = await axios.get(
                `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/students.json`,
                {
                    headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
                }
            );
    
            const content = Buffer.from(response.data.content, 'base64').toString();
            const students = JSON.parse(content);
            const student = students.find(s => s.email === email && s.password === password);
    
            if (student) {
                req.session.user = {
                    email,
                    role: student.role,
                    isAdmin: student.role === 'admin'
                };
                req.session.isAuthenticated = true;
    
                req.session.save((err) => {
                    if (err) {
                        console.error("Session save error:", err);
                        return res.status(500).send("Server error");
                    }
                    console.log(`${student.role} logged in:`, req.session.user);
                    // Redirect to index page with role parameter
                    res.redirect(`/Wedc-It?role=${student.role}`);
                });
            } else {
                return res.render("registration", { 
                    loginError: "Invalid email or password", 
                    accountCreated: null 
                });
            }
        } catch (error) {
            console.error("Error in login process:", error);
            return res.render("registration", { 
                loginError: "Login error occurred", 
                accountCreated: null 
            });
        }
}

module.exports = {
    signup,
    login
}
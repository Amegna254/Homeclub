const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

let users = JSON.parse(fs.existsSync('users.json') ? fs.readFileSync('users.json') : '[]');

function saveUsers() {
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
}

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        res.redirect('/index.html');
    } else {
        res.send('Invalid credentials. <a href="/login.html">Try again</a>');
    }
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (users.some(u => u.username === username)) {
        return res.send('Username already exists. <a href="/register.html">Try again</a>');
    }
    users.push({ username, password });
    saveUsers();
    res.redirect('/login.html');
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const type = req.body.type;
        const dir = `uploads/${type}`;
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

app.post('/upload', upload.single('file'), (req, res) => {
    res.send(`<p>File uploaded. <a href="/${req.body.type}.html">Go back</a></p>`);
});

app.listen(PORT, () => {
    console.log(`Home Club running at http://localhost:${PORT}`);
});
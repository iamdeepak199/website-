const bcrypt = require('bcrypt');
const chalk =require('chalk');
const mysql = require('mysql2');
const express = require('express');
const path = require('path');
const session = require('express-session');
const crypto = require('crypto');
const secret = crypto.randomBytes(32).toString('hex');
const app = express();
const port = 3000;
const saltRounds = 10;

// Middleware setup
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

require('dotenv').config();
app.use(session({
    secret: 'process.env.SESSION_SECRET,',
    resave: false,
    saveUninitialized: true,
}));

app.set('view engine', 'hbs');

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'register'
});

// Connection to another database, e.g., 'contacts'
const db2 = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'usersquery'
});
db.connect(err => {
    if (err) throw err;
    console.log(chalk.blue.italic('Connected to MySQL database.'));
});

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('dashboard', (req, res) => {
    // Assuming user data is available in req.user (like from a session or authentication middleware)
    if (req.user) {
        res.render('dashboard', { user: req.user });
    } else {
        // Handle the case where there is no user data (e.g., redirect to login)
        res.redirect('/login');
    }
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) {
            res.status(500).send('Error hashing password');
            return;
        }

        const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        db.execute(query, [username, email, hashedPassword], (err, results) => {
            if (err) {
                res.status(500).send('Username Must be Unique : Please try again ');
                return;
            }
            res.send('User registered successfully');
        });
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM users WHERE username = ?';
    db.execute(query, [username], (err, results) => {
        if (err) {
            res.status(500).send('Database query error');
            return;
        }

        if (results.length > 0) {
            const user = results[0];
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    res.status(500).send('Error comparing passwords');
                    return;
                }

                if (isMatch) {
                    console.log(user);
                    req.session.user = user;
                    res.redirect('/dashboard');
                } else {
                    res.status(401).send('Invalid credentials');
                }
            });
        } else {
            res.status(401).send('Invalid credentials');
        }
    });
});

const dashboardRouter = require('./routes/dashboard');
app.use('/', dashboardRouter);

// POST route for handling contact form submissions
app.post('/contact', (req, res) => {
    const { name, email, message } = req.body;

    const query = 'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)';

    db2.query(query, [name, email, message], (err, result) => {
        if (err) {
            console.error('Error saving contact information:', err);
            return res.status(500).send('Server error, please try again later.');
        }
        res.send('Thank you for your message!');
    });
});

app.listen(port, () => {
    console.log(chalk.green.bold.inverse(`Server is running at http://localhost:${port}`));
});

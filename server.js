const express = require('express');
const app = express();
app.use(express.json());  // for parsing application/json
const cors = require('cors');

// Enable CORS for all routes and origins

// Alternatively, to enable CORS only for specific origin (your frontend):
app.use(cors({
    origin: 'http://localhost:3002' // Replace with the URL of your frontend app
}));


const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.get('/', (req, res) => {
    res.send('Hello from the server!');
});


const mysql = require('mysql');
const db = mysql.createConnection({
    host: 'todo-app-database.cpny0bipdyus.us-east-1.rds.amazonaws.com',  // AWS RDS Endpoint
    user: 'admin',
    password: 'Niharika20',
    database: 'todo_app'
});

db.connect((err) => {
    if (err) { throw err; }
    console.log('Connected to the database');
});

const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const query = 'SELECT * FROM users WHERE email = ?';

        db.query(query, [email], async (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send(err.message);
            }

            if (result.length > 0) {
                const user = result[0];
                const passwordIsValid = await bcrypt.compare(password, user.password);

                if (passwordIsValid) {
                    const token = jwt.sign({ userId: user.id }, 'YOUR_SECRET_KEY', { expiresIn: '1h' });
                    res.json({ token });
                } else {
                    res.status(401).send('Invalid credentials');
                }
            } else {
                res.status(404).send('User not found');
            }
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).send('Error in login');
    }
});



app.post('/api/register', async (req, res) => {
    try {
        const { email, password, phoneNumber, gender } = req.body;
        console.log("Received data:", { email, password, phoneNumber, gender });


        // Validate input data

        const hashedPassword = await bcrypt.hash(password, 10);
        // SQL query to insert the new user into the database
        const query = 'INSERT INTO users (email, password, phoneNumber, gender) VALUES (?, ?, ?, ?)';

        db.query(query, [email, hashedPassword, phoneNumber, gender], (err, result) => {
            if (err) {
                console.error('Database error:', err);  // Log the detailed error
                return res.
                status(500).send(err.message);
            }
            res.status(201).send('User registered successfully');
        });
    } catch (error) {
        console.error('Server error:', error);  // Log the detailed error
        res.status(500).send('Error in registration');
    }
});


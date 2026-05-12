const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createPool({
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root_password',
    database: process.env.DB_NAME || 'pvz_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the pool connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to MySQL Pool:', err.message);
    } else {
        console.log('Connected to MySQL via Pool! 🌻');
        connection.release(); // Important: release the test connection back to the pool
    }
});

app.get('/', (req, res) => {
    res.send('PVZ Public API (Read-Only) 🌻');
});

app.get('/plants', (req, res) => {
    // Safety check: Is the DB object ready?
    if (!db) {
        return res.status(503).send('Database connection is being established. Try again in a moment.');
    }

    db.query('SELECT * FROM plants', (err, results) => {
        if (err) {
            console.error('Query error:', err);
            res.status(500).json({ error: 'Error fetching plants', details: err.message });
        } else {
            res.json(results);
        }
    });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// --- LOGGING SETUP ---
// Maps to the Docker volume ./logs:/app/logs
const logDir = '/app/logs';
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
const logStream = fs.createWriteStream(path.join(logDir, 'app.log'), { flags: 'a' });

function logToFile(level, message) {
    const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
    const formattedMessage = `[${timestamp}] ${level}: ${message}\n`;
    logStream.write(formattedMessage);
    console.log(formattedMessage.trim()); 
}

// --- DATABASE POOL ---
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Zombidito-100',
    database: process.env.DB_NAME || 'pvz_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test Pool Connection
pool.getConnection((err, connection) => {
    if (err) {
        logToFile('ERROR', `Error connecting to MySQL Pool: ${err.message}`);
    } else {
        logToFile('INFO', 'Conectado a MySQL Pool 🌻');
        connection.release();
    }
});

// --- ROUTES ---

// 1. Root Route
app.get('/', (req, res) => {
    res.send('PVZ Intranet funcionando 🌻');
});

// 2. GET All Plants
app.get('/plants', (req, res) => {
    pool.query('SELECT * FROM plants', (err, results) => {
        if (err) {
            logToFile('ERROR', `Select failed: ${err.message}`);
            res.status(500).send(err);
        } else {
            res.json(results);
        }
    });
});

// 3. POST New Plant
app.post('/plants', (req, res) => {
    const { name, damage, sun_cost, description, image_url } = req.body;
    const sql = `INSERT INTO plants (name, damage, sun_cost, description, image_url) VALUES (?, ?, ?, ?, ?)`;

    pool.query(sql, [name, damage, sun_cost, description, image_url], (err, result) => {
        if (err) {
            logToFile('ERROR', `Insert failed: ${err.message}`);
            res.status(500).send(err);
        } else {
            logToFile('INFO', `Planta agregada: ${name}`);
            res.send('Planta agregada 🌻');
        }
    });
});

// 4. DELETE Plant
app.delete('/plants/:id', (req, res) => {
    const plantId = req.params.id;
    const sql = 'DELETE FROM plants WHERE id = ?';

    pool.query(sql, [plantId], (err, result) => {
        if (err) {
            logToFile('ERROR', `Delete failed for ID ${plantId}: ${err.message}`);
            res.status(500).send(err);
        } else {
            logToFile('INFO', `Planta eliminada ID: ${plantId} 🗑️`);
            res.send('Planta eliminada 🗑️');
        }
    });
});

// 5. UPDATE Plant
app.put('/plants/:id', (req, res) => {
    const plantId = req.params.id;
    const { name, damage, sun_cost, description, image_url } = req.body;
    const sql = `
        UPDATE plants 
        SET name = ?, damage = ?, sun_cost = ?, description = ?, image_url = ? 
        WHERE id = ?
    `;

    pool.query(sql, [name, damage, sun_cost, description, image_url, plantId], (err, result) => {
        if (err) {
            logToFile('ERROR', `Update failed for ID ${plantId}: ${err.message}`);
            res.status(500).send(err);
        } else {
            logToFile('INFO', `Planta actualizada ID: ${plantId} ✏️`);
            res.send('Planta actualizada ✏️');
        }
    });
});

// Start Server
app.listen(8080, () => {
    logToFile('INFO', 'Servidor corriendo en puerto 8080');
});

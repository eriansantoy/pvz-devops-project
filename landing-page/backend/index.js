const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
});

db.connect((err) => {
    if (err) {
        console.log('Error conectando a MySQL:', err);
    } else {
        console.log('Conectado a MySQL (Read-Only) 🌻');
    }
});

app.get('/', (req, res) => {
    res.send('PVZ Public API (Read-Only) 🌻');
});

// Only GET routes allowed for the public landing page
app.get('/plants', (req, res) => {
    db.query('SELECT * FROM plants', (err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(results);
        }
    });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});

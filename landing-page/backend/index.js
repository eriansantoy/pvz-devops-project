const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const winston = require('winston'); // For logging
require('dotenv').config();

// --- LOGGER CONFIGURATION ---
// Get log file path from .env (e.g., LOG_FILE_PATH=./logs/app.log)
const logFilePath = process.env.LOG_FILE_PATH || 'combined.log';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.File({ filename: logFilePath }),
        new winston.transports.Console() // Still log to console for dev
    ]
});

const app = express();
app.use(express.json());
app.use(cors());

// --- MIDDLEWARE TO LOG EVERY REQUEST ---
app.use((req, res, next) => {
    logger.info(`Incoming ${req.method} request to ${req.url} from ${req.ip}`);
    next();
});

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
        logger.error(`Error connecting to MySQL Pool: ${err.message}`);
    } else {
        logger.info('Connected to MySQL via Pool! 🌻');
        connection.release();
    }
});

app.get('/', (req, res) => {
    res.send('PVZ Public API (Read-Only) 🌻');
});

app.get('/plants', (req, res) => {
    if (!db) {
        logger.warn('Plants endpoint hit but DB object is null');
        return res.status(503).send('Database connection issues.');
    }

    db.query('SELECT * FROM plants', (err, results) => {
        if (err) {
            logger.error(`Query error on /plants: ${err.message}`);
            res.status(500).json({ error: 'Error fetching plants' });
        } else {
            logger.info(`Successfully fetched ${results.length} plants`);
            res.json(results);
        }
    });
});

// Error handling middleware to catch any unhandled app errors
app.use((err, req, res, next) => {
    logger.error(`Unhandled Error: ${err.stack}`);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    logger.info(`Servidor corriendo en puerto ${PORT}`);
});

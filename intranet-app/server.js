const express = require('express');
const mysql = require('mysql2');

const cors = require('cors');

const app = express();
app.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Zombidito-100',
    database: 'pvz_db'
});


db.connect((err) => {
    if (err) {
        console.log('Error conectando a MySQL:', err);
    } else {
        console.log('Conectado a MySQL 🌻');
    }
});

app.get('/', (req, res) => {
    res.send('PVZ Intranet funcionando 🌻');
});

app.get('/plants', (req, res) => {

    db.query('SELECT * FROM plants', (err, results) => {

        if (err) {
            res.status(500).send(err);
        } else {
            res.json(results);
        }

    });

});

app.listen(8080, () => {
    console.log('Servidor corriendo en puerto 8080');
});
const express = require('express');
const mysql = require('mysql2');

const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

app.use(express.static('public')); 

const db = mysql.createConnection({
    host: 'mysql-db',
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

app.post('/plants', (req, res) => {

    const {
        name,
        damage,
        sun_cost,
        description,
        image_url
    } = req.body;

    const sql = `
        INSERT INTO plants
        (name, damage, sun_cost, description, image_url)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            name,
            damage,
            sun_cost,
            description,
            image_url
        ],
        (err, result) => {

            if (err) {
                res.status(500).send(err);
            } else {
                res.send('Planta agregada 🌻');
            }

        }
    );

});

app.delete('/plants/:id', (req, res) => {

    const plantId = req.params.id;

    const sql = 'DELETE FROM plants WHERE id = ?';

    db.query(sql, [plantId], (err, result) => {

        if (err) {
            res.status(500).send(err);
        } else {
            res.send('Planta eliminada 🗑️');
        }

    });

});

app.put('/plants/:id', (req, res) => {

    const plantId = req.params.id;

    const {
        name,
        damage,
        sun_cost,
        description,
        image_url
    } = req.body;

    const sql = `
        UPDATE plants
        SET
            name = ?,
            damage = ?,
            sun_cost = ?,
            description = ?,
            image_url = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            name,
            damage,
            sun_cost,
            description,
            image_url,
            plantId
        ],
        (err, result) => {

            if (err) {
                res.status(500).send(err);
            } else {
                res.send('Planta actualizada ✏️');
            }

        }
    );

});

app.listen(8080, () => {

    console.log('Servidor corriendo en puerto 8080');

});
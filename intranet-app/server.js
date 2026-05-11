const express = require('express');

const app = express();

app.get('/', (req, res) => {
    res.send('PVZ Intranet funcionando 🌻');
});

app.listen(8080, () => {
    console.log('Servidor corriendo en puerto 8080');
});
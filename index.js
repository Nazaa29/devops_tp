const express = require('express');
const app = express();
const port = 3000;

// Ruta "Hola Mundo"
app.get('/', (req, res) => {
    res.send('Hola Mundo');
});

// Nueva ruta para sumar dos números
app.get('/sum', (req, res) => {
    const num1 = parseFloat(req.query.num1);
    const num2 = parseFloat(req.query.num2);

    if (isNaN(num1) || isNaN(num2)) {
        return res.status(400).send({ error: 'Invalid number input' });
    }

    const sum = num1 + num2;
    res.send({ sum });
});

const server = app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});

module.exports = { app, server }; // Exportar la app y el servidor

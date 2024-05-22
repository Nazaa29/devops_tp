const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const port = 3001;

// Servir archivos estáticos desde el directorio 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta "Hola Mundo"
app.get('/', (req, res) => {
    res.send('Hola Munda');
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

// Ruta para obtener una lista de Pokémon
app.get('/pokemons', async (req, res) => {
    try {
        const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=10');
        const pokemons = response.data.results.map((pokemon, index) => ({
            name: pokemon.name,
            number: index + 1
        }));
        res.send(pokemons);
    } catch (error) {
        res.status(500).send({ error: 'Failed to fetch Pokémon data' });
    }
});

const server = app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});

module.exports = { app, server }; // Exportar la app y el servidor

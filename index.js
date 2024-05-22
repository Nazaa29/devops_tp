const express = require('express');
const axios = require('axios');
const path = require('path');
const promClient = require('prom-client');

const app = express();
const port = process.env.PORT || 3001;

// Prometheus metrics
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const fetchDuration = new promClient.Histogram({
    name: 'fetch_pokemon_duration_seconds',
    help: 'Duration of Pokémon fetch requests in seconds',
    buckets: [0.1, 0.5, 1, 2, 5]
});
register.registerMetric(fetchDuration);

const clickCounter = new promClient.Counter({
    name: 'button_click_count',
    help: 'Count of button clicks'
});
register.registerMetric(clickCounter);

app.use(express.static(path.join(__dirname, 'public')));

// Ruta "Hola Mundo"
app.get('/hello', (req, res) => {
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

// Ruta para obtener una lista de Pokémon
app.get('/pokemons', async (req, res) => {
    const end = fetchDuration.startTimer();
    try {
        const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=10');
        const pokemons = response.data.results.map((pokemon, index) => ({
            name: pokemon.name,
            number: index + 1
        }));
        res.send(pokemons);
    } catch (error) {
        res.status(500).send({ error: 'Failed to fetch Pokémon data' });
    } finally {
        end();
    }
});

// Endpoint para incrementar el contador de clics
app.post('/increment_click', (req, res) => {
    clickCounter.inc();
    res.sendStatus(200);
});

// Ruta para métricas de Prometheus
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

const server = app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});

module.exports = { app, server }; // Exportar la app y el servidor

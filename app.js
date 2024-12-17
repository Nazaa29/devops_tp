const express = require('express');
const axios = require('axios');
const path = require('path');
const promClient = require('prom-client');

const app = express();

// Prometheus metrics
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Gauge para registrar la última duración del fetch (reemplaza el Histograma)
const lastFetchDuration = new promClient.Gauge({
    name: 'last_fetch_pokemon_duration_seconds',
    help: 'Duration of the last Pokémon fetch request in seconds'
});
register.registerMetric(lastFetchDuration);

const clickCounter = new promClient.Counter({
    name: 'button_click_count',
    help: 'Count of button clicks'
});
register.registerMetric(clickCounter);

const helloCounter = new promClient.Counter({
    name: 'hello_endpoint_count',
    help: 'Count of accesses to /hello endpoint'
});
register.registerMetric(helloCounter);

const sumCounter = new promClient.Counter({
    name: 'sum_endpoint_count',
    help: 'Count of accesses to /sum endpoint'
});
register.registerMetric(sumCounter);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/hello', (req, res) => {
    helloCounter.inc();
    res.send('Hola Mundo');
});

app.get('/sum', (req, res) => {
    sumCounter.inc();
    const num1 = parseFloat(req.query.num1);
    const num2 = parseFloat(req.query.num2);

    if (isNaN(num1) || isNaN(num2)) {
        return res.status(400).send({ error: 'Invalid number input' });
    }

    const sum = num1 + num2;
    res.send({ sum });
});

app.get('/pokemons', async (req, res) => {
    const startTime = process.hrtime();
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
        // Calculamos la duración en segundos
        const diff = process.hrtime(startTime);
        const duration = diff[0] + diff[1] / 1e9;
        // Actualizamos el Gauge con la última duración
        lastFetchDuration.set(duration);
    }
});

app.post('/increment_click', (req, res) => {
    clickCounter.inc();
    res.sendStatus(200);
});

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

module.exports = { app };

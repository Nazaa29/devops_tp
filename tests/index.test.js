const request = require('supertest');
const puppeteer = require('puppeteer');
const { app, server } = require('../index'); // Importar la app y el servidor

// Cerrar el servidor después de todas las pruebas
afterAll((done) => {
    server.close(done);
});

describe('API Tests', () => {
    it('should respond with Hola Mundo', async () => {
        const response = await request(app).get('/');
        expect(response.text).toBe('Hola Mundo');
        expect(response.statusCode).toBe(200);
    });

    it('should respond with the sum of two numbers', async () => {
        const response = await request(app)
            .get('/sum')
            .query({ num1: 5, num2: 3 });
        expect(response.body.sum).toBe(8);
        expect(response.statusCode).toBe(200);
    });

    it('should handle invalid numbers gracefully', async () => {
        const response = await request(app)
            .get('/sum')
            .query({ num1: 'a', num2: 3 });
        expect(response.body.error).toBe('Invalid number input');
        expect(response.statusCode).toBe(400);
    });

    it('should handle missing numbers gracefully', async () => {
        const response = await request(app)
            .get('/sum')
            .query({ num1: 5 });
        expect(response.body.error).toBe('Invalid number input');
        expect(response.statusCode).toBe(400);
    });
});

describe('UI Tests', () => {
    it('should fetch and display Pokémon list when button is clicked', async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(`http://localhost:${server.address().port}`);

        await page.waitForSelector('button', { timeout: 5000 });
        await page.click('button');
        await page.waitForSelector('#pokemon-list li', { timeout: 5000 });

        const pokemonList = await page.evaluate(() => {
            const items = document.querySelectorAll('#pokemon-list li');
            return Array.from(items).map(item => item.textContent);
        });

        expect(pokemonList.length).toBeGreaterThan(0);
        expect(pokemonList[0]).toMatch(/^#\d+ \w+$/);

        await browser.close();
    }, 10000); // Aumentar el tiempo de espera para esta prueba a 10000 ms
});

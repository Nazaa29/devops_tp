const request = require('supertest');
const puppeteer = require('puppeteer');
const { app } = require('../app');
const server = require('../server');

let browser;
let page;

beforeAll(async () => {
    browser = await puppeteer.launch({ headless: true });
    page = await browser.newPage();
});

afterAll(async () => {
    if (page) await page.close();
    if (browser) await browser.close();
    await new Promise((resolve, reject) => {
        server.close((err) => {
            if (err) {
                reject(err);
            } else {
                console.log('Server closed');
                resolve();
            }
        });
    });
});

describe('API Tests', () => {
    it('should respond with Hola Mundo', async () => {
        const response = await request(app).get('/hello');
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
        await page.goto(`http://localhost:${server.address().port}/`, { waitUntil: 'load', timeout: 0 });

        await page.waitForSelector('button', { timeout: 10000 });
        await page.click('button');
        await page.waitForSelector('#pokemon-list li', { timeout: 10000 });

        const pokemonList = await page.evaluate(() => {
            const items = document.querySelectorAll('#pokemon-list li');
            return Array.from(items).map(item => item.textContent);
        });

        expect(pokemonList.length).toBeGreaterThan(0);
        expect(pokemonList[0]).toMatch(/^#\d+ \w+$/);
    }, 20000);
});

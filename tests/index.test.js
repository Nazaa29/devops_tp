const request = require('supertest');
const { app, server } = require('../index'); // Importar tanto la app como el servidor

describe('GET /', () => {
    it('should respond with Hola Mundo', async () => {
        const response = await request(app).get('/');
        expect(response.text).toBe('Hola Mundo');
        expect(response.statusCode).toBe(200);
    });
});

describe('GET /sum', () => {
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

afterAll(() => {
    server.close(); // Cerrar el servidor después de todas las pruebas
});

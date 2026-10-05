const request = require('supertest');
const app = require('./src/app');
const pool = require('./src/db');

afterAll(async () => {
  await pool.end();
});

describe('Pruebas de la API Monolítica', () => {
  test('GET /health debe responder correctamente', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
  });

  test('GET /usuarios debe devolver usuarios', async () => {
    const res = await request(app).get('/usuarios');
    expect(res.statusCode).toBe(200);
  });

  test('GET /productos debe devolver productos', async () => {
    const res = await request(app).get('/productos');
    expect(res.statusCode).toBe(200);
  });

  test('GET /pedidos debe devolver pedidos', async () => {
    const res = await request(app).get('/pedidos');
    expect(res.statusCode).toBe(200);
  });
});

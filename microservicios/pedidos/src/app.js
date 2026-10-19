const express = require('express');
const axios = require('axios');
const pool = require('./db');

const app = express();
app.use(express.json());

const USUARIOS_URL = process.env.USUARIOS_SERVICE_URL || 'http://localhost:3001';
const PRODUCTOS_URL = process.env.PRODUCTOS_SERVICE_URL || 'http://localhost:3002';

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ms-pedidos' });
});

app.get('/pedidos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pedidos');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/pedidos', async (req, res) => {
  const { usuario_id, producto_id, cantidad } = req.body;

  try {
    // Validar usuario
    await axios.get(`${USUARIOS_URL}/usuarios`);
    
    // Validar producto
    const prodRes = await axios.get(`${PRODUCTOS_URL}/productos`);
    const producto = prodRes.data.find(p => p.id === producto_id);

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const total = producto.precio * cantidad;

    const result = await pool.query(
      'INSERT INTO pedidos (usuario_id, producto_id, cantidad, total) VALUES ($1, $2, $3, $4) RETURNING *',
      [usuario_id, producto_id, cantidad, total]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;

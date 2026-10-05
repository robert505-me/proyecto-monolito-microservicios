const express = require('express');
const pool = require('./db');

const app = express();
app.use(express.json());

// Endpoint de prueba de salud
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servicio monolítico funcionando correctamente' });
});

// Rutas de Usuarios
app.get('/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/usuarios', async (req, res) => {
  const { nombre, email } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, email) RETURNING *',
      [nombre, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rutas de Productos
app.get('/productos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM productos');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/productos', async (req, res) => {
  const { nombre, precio } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO productos (nombre, precio) RETURNING *',
      [nombre, precio]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rutas de Pedidos
app.get('/pedidos', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id, u.nombre as usuario, pr.nombre as producto, p.cantidad
      FROM pedidos p
      JOIN usuarios u ON p.usuario_id = u.id
      JOIN productos pr ON p.producto_id = pr.id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/pedidos', async (req, res) => {
  const { usuario_id, producto_id, cantidad } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO pedidos (usuario_id, producto_id, cantidad) RETURNING *',
      [usuario_id, producto_id, cantidad]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor monolítico corriendo en el puerto ${PORT}`);
});

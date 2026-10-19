const express = require('express');
const axios = require('axios');
const pool = require('./db');

const app = express();
async function validarReferencias(usuarioId, productoId) {
    const [usuario, producto] = await Promise.all([
        fetch(`${process.env.USUARIOS_URL}/usuarios/${usuarioId}`),
        fetch(`${process.env.PRODUCTOS_URL}/productos/${productoId}`)
    ]);

    if (usuario.status === 404 || producto.status === 404) {
        return false;
    }

    if (!usuario.ok || !producto.ok) {
        throw new Error('Error al consultar Usuarios o Productos');
    }

    return true;
}
app.use(express.json());

const USUARIOS_SERVICE_URL = process.env.USUARIOS_SERVICE_URL || 'http://usuarios-app:3001';
const PRODUCTOS_SERVICE_URL = process.env.PRODUCTOS_SERVICE_URL || 'http://productos-app:3002';

app.get('/health', (req, res) => {
  res.json({ status: 'OK', servicio: 'pedidos' });
});

app.get('/pedidos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pedidos');
    const pedidos = result.rows;

    const pedidosEnriquecidos = await Promise.all(
      pedidos.map(async (pedido) => {
        let usuario = null;
        let producto = null;

        try {
          const resUsuario = await axios.get(`${USUARIOS_SERVICE_URL}/usuarios`);
          usuario = resUsuario.data.find(u => u.id === pedido.usuario_id) || null;
        } catch (err) {
          console.error(`Error consultando usuario ${pedido.usuario_id}:`, err.message);
        }

        try {
          const resProducto = await axios.get(`${PRODUCTOS_SERVICE_URL}/productos`);
          producto = resProducto.data.find(p => p.id === pedido.producto_id) || null;
        } catch (err) {
          console.error(`Error consultando producto ${pedido.producto_id}:`, err.message);
        }

        return {
          id: pedido.id,
          cantidad: pedido.cantidad,
          total: pedido.total,
          fecha: pedido.fecha,
          usuario,
          producto
        };
      })
    );

    res.json(pedidosEnriquecidos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/pedidos', async (req, res) => {
    const { usuario_id, producto_id, cantidad } = req.body;

    if (![usuario_id, producto_id, cantidad].every(
        valor => Number.isInteger(Number(valor)) && Number(valor) > 0
    )) {
        return res.status(400).json({
            error: 'Los identificadores y la cantidad deben ser enteros positivos'
        });
    }

    try {
        const referenciasValidas = await validarReferencias(
            usuario_id,
            producto_id
        );

        if (!referenciasValidas) {
            return res.status(400).json({
                error: 'El usuario o producto indicado no existe'
            });
        }

        const result = await pool.query(
            `INSERT INTO pedidos (usuario_id, producto_id, cantidad, total)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [usuario_id, producto_id, cantidad, 0]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear pedido' });
    }
});

app.put('/pedidos/:id', async (req, res) => {
    const { usuario_id, producto_id, cantidad } = req.body;

    if (![usuario_id, producto_id, cantidad].every(
        valor => Number.isInteger(Number(valor)) && Number(valor) > 0
    )) {
        return res.status(400).json({
            error: 'Los identificadores y la cantidad deben ser enteros positivos'
        });
    }

    try {
        const referenciasValidas = await validarReferencias(
            usuario_id,
            producto_id
        );

        if (!referenciasValidas) {
            return res.status(400).json({
                error: 'El usuario o producto indicado no existe'
            });
        }

        const result = await pool.query(
            `UPDATE pedidos
             SET usuario_id = $1, producto_id = $2, cantidad = $3
             WHERE id = $4 RETURNING *`,
            [usuario_id, producto_id, cantidad, req.params.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar pedido' });
    }
});

app.delete('/pedidos/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM pedidos WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    res.json({ mensaje: 'Pedido eliminado', pedido: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar pedido' });
  }
});

module.exports = app;

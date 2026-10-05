const pool = require('./db');

async function seed() {
  try {
    await pool.query(`
      INSERT INTO usuarios (nombre, email) VALUES
      ('Alice', 'alice@example.com'),
      ('Bob', 'bob@example.com');

      INSERT INTO productos (nombre, precio) VALUES
      ('Laptop', 1200.00),
      ('Mouse', 25.50);

      INSERT INTO pedidos (usuario_id, producto_id, cantidad) VALUES
      (1, 1, 1),
      (2, 2, 2);
    `);
    console.log('Datos de prueba insertados correctamente');
  } catch (err) {
    console.error('Error insertando datos:', err);
  } finally {
    pool.end();
  }
}

seed();

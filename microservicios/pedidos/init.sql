CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO pedidos (usuario_id, producto_id, cantidad, total) VALUES
(1, 1, 1, 1200.00),
(2, 2, 2, 50.00);

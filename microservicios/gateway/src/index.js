const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

const USUARIOS_SERVICE_URL = process.env.USUARIOS_SERVICE_URL || 'http://usuarios-app:3001';
const PRODUCTOS_SERVICE_URL = process.env.PRODUCTOS_SERVICE_URL || 'http://productos-app:3002';
const PEDIDOS_SERVICE_URL = process.env.PEDIDOS_SERVICE_URL || 'http://pedidos-app:3003';

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

app.use('/usuarios', createProxyMiddleware({
  target: USUARIOS_SERVICE_URL,
  changeOrigin: true
}));

app.use('/productos', createProxyMiddleware({
  target: PRODUCTOS_SERVICE_URL,
  changeOrigin: true
}));

app.use('/pedidos', createProxyMiddleware({
  target: PEDIDOS_SERVICE_URL,
  changeOrigin: true
}));

app.listen(PORT, () => {
  console.log(`API Gateway escuchando en el puerto ${PORT}`);
});

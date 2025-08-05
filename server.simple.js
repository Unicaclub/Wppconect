const express = require('express');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware básico
app.use(express.json());

// Rota de health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'WPPConnect Server está rodando',
    version: '2.8.6'
  });
});

// Rota de health para Railway
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;

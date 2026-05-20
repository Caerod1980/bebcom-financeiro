require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const entryRoutes = require('./src/routes/entryRoutes');
const dreRoutes = require('./src/routes/dreRoutes');
const balanceSheetRoutes = require('./src/routes/balanceSheetRoutes');
const accountRoutes = require('./src/routes/accountRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// CORS
const allowedOrigins =
  process.env.NODE_ENV === 'production'
    ? [
        'https://bebcomfinanceiro.com',
        'https://www.bebcomfinanceiro.com',
        'https://caerod1980.github.io',
        process.env.FRONTEND_URL,
      ].filter(Boolean)
    : [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'https://caerod1980.github.io',
        process.env.FRONTEND_URL,
      ].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Permite chamadas sem origin: Postman, curl, health checks, Azure
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn(`⚠️ CORS bloqueou requisição da origem: ${origin}`);
      return callback(new Error(`Origem não permitida pelo CORS: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Bebcom Financeiro API running',
    env: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || null,
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/dre', dreRoutes);
app.use('/api/balance-sheet', balanceSheetRoutes);
app.use('/api/accounts', accountRoutes);

// Not found handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl,
    method: req.method,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Erro no servidor:', err.message);

  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      error: 'Acesso bloqueado pelo CORS',
      origin: req.headers.origin || null,
    });
  }

  return res.status(500).json({
    error: 'Algo deu errado no servidor!',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📦 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 CORS permitindo: ${allowedOrigins.join(', ')}`);
});

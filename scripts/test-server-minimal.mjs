import express from 'express';
import cors from 'cors';
import { testDatabaseConnection } from '../src/configs/database.config.js';

const app = express();

// Middlewares de base
app.use(cors());
app.use(express.json());

// Route de test simple
app.get('/test', (req, res) => {
  res.json({
    message: 'Serveur fonctionne',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Route de test DB
app.get('/test-db', async (req, res) => {
  try {
    const dbResult = await testDatabaseConnection();
    res.json({
      database: dbResult ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Démarrage du serveur
const PORT = 3002;
const server = app.listen(PORT, () => {
  console.log(`✅ Serveur de test démarré sur http://localhost:${PORT}`);
  console.log(`📊 Test: http://localhost:${PORT}/test`);
  console.log(`🗄️  Test DB: http://localhost:${PORT}/test-db`);
});

// Gestion des erreurs
server.on('error', (error) => {
  console.error('❌ Erreur du serveur:', error);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Exception non capturée:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesse rejetée non gérée:', reason);
  process.exit(1);
});
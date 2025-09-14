import express from 'express';
import cors from 'cors';

const app = express();

// Middlewares de base
app.use(cors());
app.use(express.json());

// Route de test simple
app.get('/test', (req, res) => {
  res.json({
    message: 'Serveur ultra-minimal fonctionne',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Démarrage du serveur
const PORT = 3003;
const server = app.listen(PORT, () => {
  console.log(`✅ Serveur ultra-minimal démarré sur http://localhost:${PORT}`);
  console.log(`📊 Test: http://localhost:${PORT}/test`);
});

// Gestion des erreurs
server.on('error', (error) => {
  console.error('❌ Erreur du serveur:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Exception non capturée:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesse rejetée non gérée:', reason);
  process.exit(1);
});

// Garder le processus en vie
setInterval(() => {
  console.log('Serveur toujours en vie...', new Date().toISOString());
}, 30000);
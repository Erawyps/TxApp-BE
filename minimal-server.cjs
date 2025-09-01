console.log('🔧 Initialisation du serveur...');

// Middleware de base
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
// Serveur d'authentification minimal et stable
console.log('✅ Middleware configurés');

// Health check simple
app.get('/api/health', (req, res) => {
  console.log('✅ Health check appelé');
  res.json({
    ok: true,
    env: 'express-minimal',
    timestamp: new Date().toISOString(),
    port: PORT,
    status: 'Serveur fonctionnel'
  });
});

console.log('✅ Routes configurées');

// Test simple sans base de données
app.get('/api/test', (req, res) => {
  console.log('🧪 Test simple appelé');
  res.json({
    message: 'Serveur Express fonctionne correctement',
    timestamp: new Date().toISOString()
  });
});

// Démarrer le serveur
try {
  app.listen(PORT, () => {
    console.log('🚀 SERVEUR DÉMARRÉ AVEC SUCCÈS !');
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log('🔗 Endpoints de test:');
    console.log('  - GET /api/health');
    console.log('  - GET /api/test');
    console.log('✅ Prêt à recevoir des requêtes !');
    console.log('='.repeat(50));
  });
} catch (error) {
  console.error('❌ Erreur lors du démarrage:', error);
}

// Gestion des erreurs
process.on('uncaughtException', (error) => {
  console.error('❌ Exception non gérée:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesse rejetée:', reason);
});

console.log('🎯 Fin de l\'initialisation - en attente du démarrage...');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8787;



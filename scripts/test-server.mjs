import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Route de test simple
app.get('/test', (req, res) => {
  res.json({ message: 'Serveur fonctionne', timestamp: new Date().toISOString() });
});

// Démarrage du serveur
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`✅ Serveur de test démarré sur http://localhost:${PORT}`);
  console.log(`📊 Test: http://localhost:${PORT}/test`);
});
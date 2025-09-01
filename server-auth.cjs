// Serveur d'authentification avec imports dynamiques
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = 8787;
const JWT_SECRET = 'xNXpyUCbw+G4UCJYwPj5xyCKoAGlOVLuudU0PNtG8+E=';

// Import dynamique du module JWT ES6
let jwtModule;
(async () => {
  jwtModule = await import('@tsndr/cloudflare-worker-jwt');
})();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  console.log('✅ Health check appelé');
  res.json({
    ok: true,
    env: 'express-cjs-fixed',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Middleware d'authentification
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  try {
    if (!jwtModule) {
      return res.status(500).json({ error: 'Module JWT non initialisé' });
    }
    const payload = await jwtModule.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide' });
  }
};

// Route de connexion
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 Tentative de connexion...');
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Email ou mot de passe manquant');
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    console.log('📧 Recherche utilisateur:', email);

    const user = await prisma.utilisateur.findFirst({
      where: { email: email, actif: true }
    });

    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    console.log('👤 Vérification du mot de passe...');
    const passwordValid = await bcrypt.compare(password, user.mot_de_passe);

    if (!passwordValid) {
      console.log('❌ Mot de passe incorrect');
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    console.log('✅ Création du token...');

    if (!jwtModule) {
      return res.status(500).json({ error: 'Module JWT non initialisé' });
    }

    const token = await jwtModule.sign({
      sub: user.id.toString(),
      email: user.email,
      role: user.type_utilisateur,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
    }, JWT_SECRET);

    const { mot_de_passe, ...userWithoutPassword } = user;
    console.log('✅ Connexion réussie pour:', user.email);

    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('❌ Erreur lors de la connexion:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Route d'inscription
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('📝 Tentative d\'inscription...');
    const { email, password, nom, prenom, telephone, type_utilisateur = 'chauffeur' } = req.body;

    if (!email || !password || !nom) {
      return res.status(400).json({ error: 'Email, mot de passe et nom requis' });
    }

    const existingUser = await prisma.utilisateur.findFirst({
      where: { email: email }
    });

    if (existingUser) {
      console.log('❌ Email déjà utilisé');
      return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.utilisateur.create({
      data: {
        email,
        mot_de_passe: hashedPassword,
        nom,
        prenom: prenom || '',
        telephone: telephone || '',
        type_utilisateur,
        actif: true,
      }
    });

    if (!jwtModule) {
      return res.status(500).json({ error: 'Module JWT non initialisé' });
    }

    const token = await jwtModule.sign({
      sub: user.id.toString(),
      email: user.email,
      role: user.type_utilisateur,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
    }, JWT_SECRET);

    const { mot_de_passe, ...userWithoutPassword } = user;
    console.log('✅ Inscription réussie pour:', user.email);

    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('❌ Erreur lors de l\'inscription:', error);
    res.status(500).json({ error: 'Erreur lors de la création du compte' });
  }
});

// Route de vérification du token
app.get('/api/auth/verify', authMiddleware, async (req, res) => {
  try {
    console.log('🔍 Vérification du token...');
    const user = await prisma.utilisateur.findFirst({
      where: { id: parseInt(req.user.sub), actif: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const { mot_de_passe, ...userWithoutPassword } = user;
    console.log('✅ Token vérifié pour:', user.email);

    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('❌ Erreur de vérification:', error);
    res.status(500).json({ error: 'Erreur de vérification' });
  }
});

// Test base de données
app.get('/api/test-db', async (req, res) => {
  try {
    const userCount = await prisma.utilisateur.count();
    res.json({
      message: 'Base de données connectée',
      userCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erreur de connexion à la base:', error);
    res.status(500).json({ error: 'Erreur de connexion à la base de données' });
  }
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log('🚀 Serveur d\'authentification Express démarré !');
  console.log(`📍 URL: http://localhost:${PORT}/api`);
  console.log('🔗 Endpoints:');
  console.log('  - GET  /api/health');
  console.log('  - POST /api/auth/login');
  console.log('  - POST /api/auth/register');
  console.log('  - GET  /api/auth/verify');
  console.log('  - GET  /api/test-db');
  console.log('✅ Prêt à recevoir des requêtes !');
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du serveur...');
  await prisma.$disconnect();
  process.exit(0);
});

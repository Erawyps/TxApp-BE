const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const express = require('express');
const cors = require('cors');

const app = express();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Log des requêtes pour debug
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', { ...req.body, password: req.body.password ? '***' : undefined });
  }
  next();
});

// Fonction simple pour créer un JWT
function createJWT(payload) {
  const header = {
    "alg": "HS256",
    "typ": "JWT"
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

  const crypto = require('crypto');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Fonction simple pour vérifier un JWT
function verifyJWT(token) {
  try {
    const [header, payload, signature] = token.split('.');

    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return null;
    }

    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString());

    // Vérifier l'expiration
    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return decodedPayload;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

// Routes d'authentification
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 Tentative de connexion');
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Email ou mot de passe manquant');
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    console.log('📧 Email:', email);

    // Rechercher l'utilisateur
    const user = await prisma.utilisateur.findUnique({
      where: { email },
      include: { chauffeur: true }
    });

    if (!user || !user.actif) {
      console.log('❌ Utilisateur non trouvé ou inactif');
      return res.status(401).json({ error: 'Utilisateur non trouvé ou inactif' });
    }

    console.log('👤 Utilisateur trouvé:', user.nom, user.prenom);

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.mot_de_passe);
    if (!isValidPassword) {
      console.log('❌ Mot de passe incorrect');
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }

    console.log('✅ Mot de passe correct');

    // Mettre à jour la dernière connexion
    await prisma.utilisateur.update({
      where: { id: user.id },
      data: { last_login: new Date() }
    });

    // Générer le token JWT
    const token = createJWT({
      userId: user.id,
      email: user.email,
      type: user.type_utilisateur,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24h
    });

    const { mot_de_passe, ...userWithoutPassword } = user;

    console.log('🎉 Connexion réussie pour:', user.email);
    res.json({
      authToken: token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('💥 Login error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/auth/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token d\'authentification requis' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyJWT(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Token invalide' });
    }

    const user = await prisma.utilisateur.findUnique({
      where: { id: decoded.userId },
      include: { chauffeur: true },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        type_utilisateur: true,
        telephone: true,
        adresse: true,
        ville: true,
        code_postal: true,
        pays: true,
        actif: true,
        last_login: true,
        chauffeur: {
          select: {
            numero_badge: true,
            date_embauche: true,
            type_contrat: true,
            taux_commission: true,
            salaire_base: true,
            actif: true
          }
        }
      }
    });

    if (!user || !user.actif) {
      return res.status(404).json({ error: 'Utilisateur non trouvé ou inactif' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route de test
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Serveur API TxApp fonctionnel'
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('🚀 Serveur API démarré avec succès !');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log('📋 Comptes de test disponibles:');
  console.log('   Admin: admin@txapp.com / password123');
  console.log('   Chauffeur: chauffeur@txapp.com / chauffeur123');
});

process.on('SIGINT', async () => {
  console.log('Arrêt du serveur...');
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = app;

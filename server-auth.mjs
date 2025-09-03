// Serveur Node.js simple pour émuler le worker Hono
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { sign, verify } from '@tsndr/cloudflare-worker-jwt';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const app = new Hono();
const prisma = new PrismaClient();

// Configuration
const JWT_SECRET = 'xNXpyUCbw+G4UCJYwPj5xyCKoAGlOVLuudU0PNtG8+E=';
const PORT = 8787;

// CORS pour les routes API
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

// Health check
app.get('/api/health', (c) => {
  console.log('✅ Health check appelé');
  return c.json({ ok: true, env: 'node-server', timestamp: new Date().toISOString() });
});

// Middleware pour vérifier le token JWT
const authMiddleware = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return c.json({ error: 'Token manquant' }, 401);
  }

  try {
    const payload = await verify(token, JWT_SECRET);
    c.set('user', payload);
    await next();
  } catch {
    return c.json({ error: 'Token invalide' }, 401);
  }
};

// Route de connexion
app.post('/api/auth/login', async (c) => {
  try {
    console.log('🔐 Tentative de connexion...');
    const { email, password } = await c.req.json();

    if (!email || !password) {
      console.log('❌ Email ou mot de passe manquant');
      return c.json({ error: 'Email et mot de passe requis' }, 400);
    }

    console.log('📧 Recherche utilisateur:', email);

    // Récupérer l'utilisateur par email
    const user = await prisma.utilisateur.findFirst({
      where: {
        email: email,
        actif: true
      }
    });

    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return c.json({ error: 'Email ou mot de passe incorrect' }, 401);
    }

    console.log('👤 Utilisateur trouvé, vérification du mot de passe...');

    // Vérifier le mot de passe
    const passwordValid = await bcrypt.compare(password, user.mot_de_passe);

    if (!passwordValid) {
      console.log('❌ Mot de passe incorrect');
      return c.json({ error: 'Email ou mot de passe incorrect' }, 401);
    }

    console.log('✅ Mot de passe valide, création du token...');

    // Créer le token JWT
    const token = await sign(
      {
        sub: user.id.toString(),
        email: user.email,
        role: user.type_utilisateur,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24h
      },
      JWT_SECRET
    );

    // Retourner les données utilisateur (sans le mot de passe)
    const { mot_de_passe, ...userWithoutPassword } = user;

    console.log('✅ Connexion réussie pour:', user.email);

    return c.json({
      user: userWithoutPassword,
      token,
    });

  } catch (error) {
    console.error('❌ Erreur lors de la connexion:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

// Route pour créer un utilisateur (inscription)
app.post('/api/auth/register', async (c) => {
  try {
    console.log('📝 Tentative d\'inscription...');
    const { email, password, nom, prenom, telephone, type_utilisateur = 'chauffeur' } = await c.req.json();

    if (!email || !password || !nom) {
      return c.json({ error: 'Email, mot de passe et nom requis' }, 400);
    }

    console.log('📧 Vérification de l\'unicité de l\'email:', email);

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.utilisateur.findFirst({
      where: { email: email }
    });

    if (existingUser) {
      console.log('❌ Email déjà utilisé');
      return c.json({ error: 'Cet email est déjà utilisé' }, 409);
    }

    console.log('🔐 Hashage du mot de passe...');

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    console.log('👤 Création de l\'utilisateur...');

    // Créer l'utilisateur
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

    console.log('✅ Utilisateur créé, génération du token...');

    // Créer le token JWT
    const token = await sign(
      {
        sub: user.id.toString(),
        email: user.email,
        role: user.type_utilisateur,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24h
      },
      JWT_SECRET
    );

    const { mot_de_passe, ...userWithoutPassword } = user;

    console.log('✅ Inscription réussie pour:', user.email);

    return c.json({
      user: userWithoutPassword,
      token,
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'inscription:', error);
    return c.json({ error: 'Erreur lors de la création du compte' }, 500);
  }
});

// Route de vérification du token
app.get('/api/auth/verify', authMiddleware, async (c) => {
  try {
    console.log('🔍 Vérification du token...');
    const userPayload = c.get('user');

    // Récupérer les données utilisateur actuelles
    const user = await prisma.utilisateur.findFirst({
      where: {
        id: parseInt(userPayload.sub),
        actif: true
      }
    });

    if (!user) {
      console.log('❌ Utilisateur non trouvé lors de la vérification');
      return c.json({ error: 'Utilisateur non trouvé' }, 404);
    }

    const { mot_de_passe, ...userWithoutPassword } = user;
    
    console.log('✅ Token vérifié pour:', user.email);
    
    return c.json({ user: userWithoutPassword });

  } catch (error) {
    console.error('❌ Erreur de vérification:', error);
    return c.json({ error: 'Erreur de vérification' }, 500);
  }
});

// Test de connexion à la base de données
app.get('/api/test-db', async (c) => {
  try {
    const userCount = await prisma.utilisateur.count();
    return c.json({ 
      message: 'Base de données connectée', 
      userCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erreur de connexion à la base:', error);
    return c.json({ error: 'Erreur de connexion à la base de données' }, 500);
  }
});

// Démarrer le serveur
console.log('🚀 Démarrage du serveur d\'authentification...');
console.log(`📍 URL de base: http://localhost:${PORT}/api`);
console.log('🔗 Endpoints disponibles:');
console.log('  - GET  /api/health');
console.log('  - POST /api/auth/login');
console.log('  - POST /api/auth/register');
console.log('  - GET  /api/auth/verify');
console.log('  - GET  /api/test-db');

serve({
  fetch: app.fetch,
  port: PORT,
}, (info) => {
  console.log(`✅ Serveur d'authentification démarré sur http://localhost:${info.port}`);
});

// Gestion propre de l'arrêt
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du serveur...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Arrêt du serveur...');
  await prisma.$disconnect();
  process.exit(0);
});

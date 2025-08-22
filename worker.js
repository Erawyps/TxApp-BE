/* eslint-disable no-unused-vars */
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { sign, verify } from '@tsndr/cloudflare-worker-jwt';
import bcrypt from 'bcryptjs';
import postgres from 'postgres';

const app = new Hono();

// CORS pour les routes API
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

// Health check
app.get('/api/health', (c) => c.json({ ok: true, env: 'worker' }));

// Middleware pour initialiser la connexion PostgreSQL avec Hyperdrive
const dbMiddleware = async (c, next) => {
  try {
    const connectionString = c.env.HYPERDRIVE.connectionString;
    const sql = postgres(connectionString);
    c.set('db', sql);
    await next();
    await sql.end(); // Fermer la connexion après utilisation
  } catch (error) {
    console.error('Database connection error:', error);
    return c.json({ error: 'Database connection error' }, 500);
  }
};

// Middleware pour vérifier le token JWT
const authMiddleware = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return c.json({ error: 'Token manquant' }, 401);
  }

  try {
    const secret = c.env.JWT_SECRET;
    const payload = await verify(token, secret);
    c.set('user', payload);
    await next();
  } catch {
    return c.json({ error: 'Token invalide' }, 401);
  }
};

// Route de connexion
app.post('/api/auth/login', dbMiddleware, async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email et mot de passe requis' }, 400);
    }

    const sql = c.get('db');

    // Récupérer l'utilisateur par email
    const users = await sql`
      SELECT * FROM utilisateur 
      WHERE email = ${email} AND actif = true
      LIMIT 1
    `;

    const user = users[0];

    if (!user) {
      return c.json({ error: 'Email ou mot de passe incorrect' }, 401);
    }

    // Vérifier le mot de passe
    const passwordValid = await bcrypt.compare(password, user.mot_de_passe);

    if (!passwordValid) {
      return c.json({ error: 'Email ou mot de passe incorrect' }, 401);
    }

    // Créer le token JWT
    const secret = c.env.JWT_SECRET;
    const token = await sign(
      {
        sub: user.id.toString(),
        email: user.email,
        role: user.type_utilisateur,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24h
      },
      secret
    );

    // Retourner les données utilisateur (sans le mot de passe)
    const { mot_de_passe, ...userWithoutPassword } = user;

    return c.json({
      user: userWithoutPassword,
      token,
    });

  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

// Route pour créer un utilisateur (inscription)
app.post('/api/auth/register', dbMiddleware, async (c) => {
  try {
    const { email, password, nom, prenom, telephone, type_utilisateur = 'chauffeur' } = await c.req.json();

    if (!email || !password || !nom) {
      return c.json({ error: 'Email, mot de passe et nom requis' }, 400);
    }

    const sql = c.get('db');

    // Vérifier si l'email existe déjà
    const existingUsers = await sql`
      SELECT id FROM utilisateur WHERE email = ${email} LIMIT 1
    `;

    if (existingUsers.length > 0) {
      return c.json({ error: 'Cet email est déjà utilisé' }, 409);
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'utilisateur avec SQL direct
    const newUsers = await sql`
      INSERT INTO utilisateur 
        (email, mot_de_passe, nom, prenom, telephone, type_utilisateur, actif, created_at, updated_at)
      VALUES 
        (${email}, ${hashedPassword}, ${nom}, ${prenom || ''}, ${telephone || ''}, ${type_utilisateur}, true, NOW(), NOW())
      RETURNING *
    `;

    const user = newUsers[0];

    // Créer le token JWT
    const secret = c.env.JWT_SECRET;
    const token = await sign(
      {
        sub: user.id.toString(),
        email: user.email,
        role: user.type_utilisateur,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24h
      },
      secret
    );

    const { mot_de_passe, ...userWithoutPassword } = user;

    return c.json({
      user: userWithoutPassword,
      token,
    });

  } catch (error) {
    console.error('Register error:', error);
    return c.json({ error: 'Erreur lors de la création du compte' }, 500);
  }
});

// Route de vérification du token
app.get('/api/auth/verify', authMiddleware, dbMiddleware, async (c) => {
  try {
    const userPayload = c.get('user');
    const sql = c.get('db');

    // Récupérer les données utilisateur actuelles
    const users = await sql`
      SELECT * FROM utilisateur 
      WHERE id = ${parseInt(userPayload.sub)} AND actif = true
      LIMIT 1
    `;

    const user = users[0];

    if (!user) {
      return c.json({ error: 'Utilisateur non trouvé' }, 404);
    }

    const { mot_de_passe, ...userWithoutPassword } = user;
    return c.json({ user: userWithoutPassword });

  } catch (error) {
    console.error('Verify error:', error);
    return c.json({ error: 'Erreur de vérification' }, 500);
  }
});

// Test de connexion à la base de données
app.get('/api/test-db', dbMiddleware, async (c) => {
  try {
    const sql = c.get('db');
    const result = await sql`SELECT NOW() as current_time`;
    return c.json({ success: true, time: result[0].current_time });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

export default app;
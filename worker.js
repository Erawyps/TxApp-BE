/* eslint-disable no-unused-vars */
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createClient } from '@supabase/supabase-js';
import { sign, verify } from '@tsndr/cloudflare-worker-jwt';
import bcrypt from 'bcryptjs';

const app = new Hono();

// CORS pour les routes API
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

// Health check
app.get('/api/health', (c) => c.json({ ok: true, env: 'worker' }));

// Middleware pour vérifier le token JWT
const authMiddleware = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return c.json({ error: 'Token manquant' }, 401);
  }

  try {
    const secret = c.env.JWT_SECRET || 'your-secret-key';
    const payload = await verify(token, secret);
    c.set('user', payload);
    await next();
  } catch {
    return c.json({ error: 'Token invalide' }, 401);
  }
};

// Route de connexion
app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email et mot de passe requis' }, 400);
    }

    const { SUPABASE_URL, SUPABASE_ANON_KEY } = c.env;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return c.json({ error: 'Configuration Supabase manquante' }, 500);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false }
    });

    // Récupérer l'utilisateur par email
    const { data: user, error } = await supabase
      .from('utilisateur')
      .select('*')
      .eq('email', email)
      .eq('actif', true)
      .single();

    if (error || !user) {
      return c.json({ error: 'Email ou mot de passe incorrect' }, 401);
    }

    // Vérifier le mot de passe
    // Note: Dans un vrai projet, les mots de passe devraient être hashés
    // Pour cette démo, on compare directement ou on hash le mot de passe
    let passwordValid = false;

    if (user.mot_de_passe === password) {
      // Mot de passe en clair (pour la démo)
      passwordValid = true;
    } else {
      // Essayer avec bcrypt si le mot de passe est hashé
      try {
        passwordValid = await bcrypt.compare(password, user.mot_de_passe);
      } catch {
        passwordValid = false;
      }
    }

    if (!passwordValid) {
      return c.json({ error: 'Email ou mot de passe incorrect' }, 401);
    }

    // Créer le token JWT
    const secret = c.env.JWT_SECRET || 'your-secret-key';
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
    const { mot_de_passe: _, ...userWithoutPassword } = user;

    return c.json({
      user: userWithoutPassword,
      token,
    });

  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

// Route de vérification du token
app.get('/api/auth/verify', authMiddleware, async (c) => {
  try {
    const userPayload = c.get('user');
    const { SUPABASE_URL, SUPABASE_ANON_KEY } = c.env;

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false }
    });

    // Récupérer les données utilisateur actuelles
    const { data: user, error } = await supabase
      .from('utilisateur')
      .select('*')
      .eq('id', userPayload.sub)
      .eq('actif', true)
      .single();

    if (error || !user) {
      return c.json({ error: 'Utilisateur non trouvé' }, 404);
    }

    // Retourner les données utilisateur (sans le mot de passe)
    const { mot_de_passe: _, ...userWithoutPassword } = user;

    return c.json({ user: userWithoutPassword });

  } catch (error) {
    console.error('Verify error:', error);
    return c.json({ error: 'Erreur de vérification' }, 500);
  }
});

// Route de déconnexion
app.post('/api/auth/logout', authMiddleware, async (c) => {
  // Dans une implémentation complète, on pourrait blacklister le token
  // Pour cette démo, on retourne simplement un succès
  return c.json({ message: 'Déconnexion réussie' });
});

// Route pour récupérer le profil utilisateur
app.get('/api/auth/profile', authMiddleware, async (c) => {
  try {
    const userPayload = c.get('user');
    const { SUPABASE_URL, SUPABASE_ANON_KEY } = c.env;

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false }
    });

    const { data: user, error } = await supabase
      .from('utilisateur')
      .select('*')
      .eq('id', userPayload.sub)
      .single();

    if (error || !user) {
      return c.json({ error: 'Utilisateur non trouvé' }, 404);
    }

    const { mot_de_passe: _, ...userWithoutPassword } = user;
    return c.json({ user: userWithoutPassword });

  } catch (error) {
    console.error('Profile error:', error);
    return c.json({ error: 'Erreur lors de la récupération du profil' }, 500);
  }
});

// Route pour créer un utilisateur (inscription)
app.post('/api/auth/register', async (c) => {
  try {
    const { email, password, nom, prenom, telephone, type_utilisateur = 'chauffeur' } = await c.req.json();

    if (!email || !password || !nom) {
      return c.json({ error: 'Email, mot de passe et nom requis' }, 400);
    }

    const { SUPABASE_URL, SUPABASE_ANON_KEY } = c.env;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return c.json({ error: 'Configuration Supabase manquante' }, 500);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false }
    });

    // Vérifier si l'email existe déjà
    const { data: existing } = await supabase
      .from('utilisateur')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return c.json({ error: 'Cet email est déjà utilisé' }, 409);
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'utilisateur
    const { data: user, error } = await supabase
      .from('utilisateur')
      .insert([{
        email,
        mot_de_passe: hashedPassword,
        nom,
        prenom: prenom || '',
        telephone: telephone || '',
        type_utilisateur,
        actif: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      console.error('User creation error:', error);
      return c.json({ error: 'Erreur lors de la création du compte' }, 500);
    }

    // Créer le token JWT
    const secret = c.env.JWT_SECRET || 'your-secret-key';
    const token = await sign(
      {
        sub: user.id.toString(),
        email: user.email,
        role: user.type_utilisateur,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24h
      },
      secret
    );

    const { mot_de_passe: _, ...userWithoutPassword } = user;

    return c.json({
      user: userWithoutPassword,
      token,
    });

  } catch (error) {
    console.error('Register error:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

// Routes existantes...
app.get('/api/profile', async (c) => {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = c.env;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return c.json({ error: 'Supabase env not configured' }, 500);
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false }
  });

  const { data, error } = await supabase.from('utilisateur').select('*').limit(1);
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data });
});

export default app;
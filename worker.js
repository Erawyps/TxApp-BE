import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { sign, verify } from '@tsndr/cloudflare-worker-jwt';
// import bcrypt from 'bcryptjs'; // REMOVED: bcrypt not compatible with Cloudflare Workers
import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';
import { PrismaPg } from '@prisma/adapter-pg';

const app = new Hono();

// Middleware pour gérer les challenges Cloudflare
const cloudflareChallengeMiddleware = async (c, next) => {
  // Vérifier la clé API pour bypass automatique
  const apiKey = c.req.header('X-API-Key');
  const expectedApiKey = 'TxApp-API-Key-2025';

  if (apiKey === expectedApiKey) {
    // Clé API valide - bypass complet de la protection Cloudflare
    c.header('X-API-Bypass', 'true');
    c.header('CF-Cache-Status', 'BYPASS');
    c.header('Cache-Control', 'no-cache');
    await next();
    return;
  }

  // Détecter si la requête vient de Cloudflare avec un challenge
  // Removed unused variable 'cfRay'
  const cfMitigated = c.req.header('CF-Mitigated');

  if (cfMitigated === 'challenge') {
    // Si c'est un challenge Cloudflare, retourner une réponse appropriée
    return c.json({
      error: 'Cloudflare challenge detected',
      message: 'Please complete the security challenge and try again'
    }, 403);
  }

  // Ajouter des headers pour aider à bypass la protection Cloudflare
  c.header('X-Robots-Tag', 'noindex');
  c.header('CF-Cache-Status', 'DYNAMIC');
  c.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  c.header('CF-Ray', c.req.header('CF-Ray') || 'bypass');
  c.header('User-Agent', 'Mozilla/5.0 (compatible; TxApp-API/1.0; +https://txapp.be)');
  c.header('Accept', 'application/json, text/plain, */*');
  c.header('Accept-Language', 'en-US,en;q=0.9,fr;q=0.8');
  c.header('Accept-Encoding', 'gzip, deflate, br');
  c.header('DNT', '1');
  c.header('Connection', 'keep-alive');
  c.header('Upgrade-Insecure-Requests', '1');
  c.header('Sec-Fetch-Dest', 'document');
  c.header('Sec-Fetch-Mode', 'navigate');
  c.header('Sec-Fetch-Site', 'none');
  c.header('Sec-Fetch-User', '?1');
  c.header('Sec-Ch-Ua', '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"');
  c.header('Sec-Ch-Ua-Mobile', '?0');
  c.header('Sec-Ch-Ua-Platform', '"macOS"');
  c.header('X-Requested-With', 'XMLHttpRequest');

  await next();

  // Headers de sécurité supplémentaires
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
};

// Appliquer le middleware Cloudflare à toutes les routes API
app.use('/api/*', cloudflareChallengeMiddleware);

// CORS pour toutes les routes
app.use('*', cors({
  origin: ['https://txapp.be', 'https://www.txapp.be', 'https://api.txapp.be', 'http://localhost:5173', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  maxAge: 86400
}));

// Health check
app.get('/api/health', (c) => c.json({
  ok: true,
  env: 'worker',
  timestamp: new Date().toISOString(),
  database: 'connected'
}, {
  headers: {
    'Content-Type': 'application/json',
    'X-API-Version': '1.0',
    'X-Rate-Limit-Remaining': '999',
    'X-Rate-Limit-Reset': new Date(Date.now() + 3600000).toISOString()
  }
}));

// Middleware pour initialiser la connexion Prisma avec Hyperdrive ou D1
const dbMiddleware = async (c, next) => {
  try {
    let prisma;

    // Configuration selon l'environnement
    if (c.env.HYPERDRIVE) {
      // Production: Utiliser Hyperdrive avec PostgreSQL et adapter PG
      const adapter = new PrismaPg(c.env.HYPERDRIVE);
      prisma = new PrismaClient({ adapter });
    } else if (c.env.DB) {
      // Développement: Utiliser D1 Database
      const adapter = new PrismaD1(c.env.DB);
      prisma = new PrismaClient({ adapter });
    } else {
      throw new Error('No database configuration found');
    }

    c.set('prisma', prisma);
    await next();
    await prisma.$disconnect();
  } catch (error) {
    console.error('Database connection error:', error);
    return c.json({ error: 'Database connection error' }, 500);
  }
};

// Middleware pour vérifier le token JWT (optionnel)
const authMiddleware = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (token) {
    try {
      const secret = c.env.JWT_SECRET;
      const payload = await verify(token, secret);
      c.set('user', payload);
    } catch (error) {
      console.error('JWT verification error:', error);
    }
  }

  await next();
};

// Middleware pour hash des mots de passe (compatible Cloudflare Workers)
const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'TxApp-Salt-2025'); // Ajouter un sel fixe
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Middleware pour vérifier les mots de passe (compatible hybride pour migration)
const verifyPassword = async (password, hashedPassword) => {
  // Essayer d'abord avec SHA-256 (nouveau système)
  const hashedInput = await hashPassword(password);
  if (hashedInput === hashedPassword) {
    console.log('Password verified with SHA-256');
    return true;
  }

  // Si ça ne marche pas, vérifier si c'est un mot de passe en clair (migration)
  if (password === hashedPassword) {
    console.log('Password verified as plain text (migration needed)');
    return true;
  }

  // Si ça ne marche pas, essayer avec bcrypt (ancien système) pour compatibilité
  try {
    // Importer bcrypt dynamiquement seulement si nécessaire
    const bcrypt = await import('bcryptjs');
    const result = await bcrypt.default.compare(password, hashedPassword);
    if (result) {
      console.log('Password verified with bcrypt (legacy)');
    }
    return result;
  } catch (_error) {
    // Si bcrypt n'est pas disponible ou échoue, retourner false
    console.warn('bcrypt verification failed, password may need migration:', _error.message);
    return false;
  }
};

// Route de connexion (login)
app.post('/api/auth/login', dbMiddleware, async (c) => {
  try {
    const { username, password } = await c.req.json();

    if (!username || !password) {
      return c.json({ error: 'Nom d\'utilisateur et mot de passe requis' }, 400);
    }

    const prisma = c.get('prisma');

    // Rechercher l'utilisateur par email
    const user = await prisma.utilisateur.findFirst({
      where: {
        email: username
      },
      include: {
        chauffeur: {
          select: {
            chauffeur_id: true,
            statut: true
          }
        }
      }
    });

    if (!user) {
      return c.json({ error: 'Identifiants invalides' }, 401);
    }

    // Vérifier que l'utilisateur a un chauffeur actif (sauf pour les admins)
    if (user.role !== 'Admin' && (!user.chauffeur || user.chauffeur.statut !== 'Actif')) {
      return c.json({ error: 'Compte inactif' }, 401);
    }

    // Vérifier le mot de passe
    const isValidPassword = await verifyPassword(password, user.mot_de_passe_hashe);

    if (!isValidPassword) {
      return c.json({ error: 'Identifiants invalides' }, 401);
    }

    // Mettre à jour la dernière connexion
    await prisma.utilisateur.update({
      where: { user_id: user.user_id },
      data: { updated_at: new Date() }
    });

    // Créer le token JWT
    const payload = {
      id: user.user_id,
      email: user.email,
      type: user.role,
      chauffeur_id: user.chauffeur?.chauffeur_id || null,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24h
    };

    const token = await sign(payload, c.env.JWT_SECRET);

    // Retourner les données utilisateur (sans mot de passe)
    const userData = {
      id: user.user_id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      type_utilisateur: user.role,
      chauffeur_id: user.chauffeur?.chauffeur_id || null,
      derniere_connexion: user.updated_at
    };

    return c.json({
      success: true,
      user: userData,
      token,
      message: 'Connexion réussie'
    });

  } catch (error) {
    console.error('Error during login:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

// Route d'inscription (register)
app.post('/api/auth/register', dbMiddleware, async (c) => {
  try {
    const { nom, prenom, email, telephone, password, type_utilisateur } = await c.req.json();

    // Validation des données
    if (!nom || !prenom || !email || !password) {
      return c.json({ error: 'Tous les champs obligatoires doivent être remplis' }, 400);
    }

    // Validation du mot de passe
    if (password.length < 8) {
      return c.json({ error: 'Le mot de passe doit contenir au moins 8 caractères' }, 400);
    }

    const prisma = c.get('prisma');

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.utilisateur.findFirst({
      where: { email }
    });

    if (existingUser) {
      return c.json({ error: 'Un utilisateur avec cet email existe déjà' }, 409);
    }

    // Hasher le mot de passe
    const hashedPassword = await hashPassword(password);

    // Créer l'utilisateur
    const newUser = await prisma.utilisateur.create({
      data: {
        nom,
        prenom,
        email,
        telephone: telephone || null,
        mot_de_passe: hashedPassword,
        type_utilisateur: type_utilisateur || 'CLIENT',
        actif: true
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        telephone: true,
        type_utilisateur: true
      }
    });

    return c.json({
      success: true,
      user: newUser,
      message: 'Inscription réussie'
    });

  } catch (error) {
    console.error('Error during registration:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

// Route de vérification du token
app.get('/api/auth/verify', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Token invalide' }, 401);
    }

    const prisma = c.get('prisma');

    // Récupérer les données utilisateur actualisées
    const userData = await prisma.utilisateur.findUnique({
      where: { id: user.id, actif: true },
      include: {
        chauffeur: {
          select: {
            id: true,
            numero_badge: true
          }
        }
      }
    });

    if (!userData) {
      return c.json({ error: 'Utilisateur non trouvé' }, 404);
    }

    return c.json({
      success: true,
      user: {
        id: userData.id,
        nom: userData.nom,
        prenom: userData.prenom,
        email: userData.email,
        telephone: userData.telephone,
        type_utilisateur: userData.type_utilisateur,
        actif: userData.actif,
        chauffeur_id: userData.chauffeur?.id || null,
        numero_badge: userData.chauffeur?.numero_badge || null
      },
      message: 'Token valide'
    });

  } catch (error) {
    console.error('Error during token verification:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

// Route de déconnexion
app.post('/api/auth/logout', authMiddleware, async (c) => {
  try {
    // En JWT, la déconnexion côté serveur est principalement symbolique
    // Le client doit supprimer le token de son côté
    return c.json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    console.error('Error during logout:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

// Route de rafraîchissement du token
app.post('/api/auth/refresh', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Token invalide' }, 401);
    }

    // Créer un nouveau token avec une nouvelle expiration
    const payload = {
      id: user.id,
      email: user.email,
      type: user.type,
      chauffeur_id: user.chauffeur_id,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24h
    };

    const newToken = await sign(payload, c.env.JWT_SECRET);

    return c.json({
      success: true,
      token: newToken,
      message: 'Token rafraîchi'
    });

  } catch (error) {
    console.error('Error during token refresh:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

// Route de changement de mot de passe
app.post('/api/auth/change-password', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { currentPassword, newPassword } = await c.req.json();

    if (!currentPassword || !newPassword) {
      return c.json({ error: 'Mot de passe actuel et nouveau mot de passe requis' }, 400);
    }

    if (newPassword.length < 8) {
      return c.json({ error: 'Le nouveau mot de passe doit contenir au moins 8 caractères' }, 400);
    }

    const prisma = c.get('prisma');

    // Récupérer le mot de passe actuel
    const userData = await prisma.utilisateur.findUnique({
      where: { id: user.id, actif: true },
      select: { mot_de_passe: true }
    });

    if (!userData) {
      return c.json({ error: 'Utilisateur non trouvé' }, 404);
    }

    // Vérifier le mot de passe actuel
    const isValidPassword = await verifyPassword(currentPassword, userData.mot_de_passe);

    if (!isValidPassword) {
      return c.json({ error: 'Mot de passe actuel incorrect' }, 400);
    }

    // Hasher le nouveau mot de passe
    const hashedNewPassword = await hashPassword(newPassword);

    // Mettre à jour le mot de passe
    await prisma.utilisateur.update({
      where: { id: user.id },
      data: { mot_de_passe: hashedNewPassword }
    });

    return c.json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    });

  } catch (error) {
    console.error('Error during password change:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

// Routes pour chauffeurs
app.get('/api/chauffeurs', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');

    const chauffeurs = await prisma.chauffeur.findMany({
      where: { statut: 'Actif' },
      orderBy: { chauffeur_id: 'asc' }
    });

    const formattedChauffeurs = chauffeurs.map(chauffeur => ({
      id: chauffeur.chauffeur_id,
      chauffeur_id: chauffeur.chauffeur_id,
      societe_id: chauffeur.societe_id,
      statut: chauffeur.statut,
      regle_salaire_defaut_id: chauffeur.regle_salaire_defaut_id,
      created_at: chauffeur.created_at
    }));

    return c.json(formattedChauffeurs);
  } catch (error) {
    console.error('Error fetching chauffeurs:', error);
    return c.json({ error: 'Erreur lors de la récupération des chauffeurs' }, 500);
  }
});

// POST /api/chauffeurs - Créer un chauffeur
app.post('/api/chauffeurs', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const data = await c.req.json();

    // Validation des données requises
    if (!data.nom || !data.prenom || !data.email || !data.telephone) {
      return c.json({ error: 'Nom, prénom, email et téléphone sont requis' }, 400);
    }

    // Créer d'abord l'utilisateur
    const utilisateur = await prisma.utilisateur.create({
      data: {
        societe_id: 1, // Société par défaut
        email: data.email,
        mot_de_passe_hashe: await hashPassword('default123'), // Mot de passe par défaut
        nom: data.nom,
        prenom: data.prenom,
        role: 'Driver'
      }
    });

    // Créer le chauffeur
    const chauffeur = await prisma.chauffeur.create({
      data: {
        chauffeur_id: utilisateur.user_id, // Même ID que l'utilisateur
        societe_id: 1,
        statut: data.statut || 'Actif',
        regle_salaire_defaut_id: data.regle_salaire_defaut_id || null
      }
    });

    return c.json({
      id: chauffeur.chauffeur_id,
      ...data,
      statut: chauffeur.statut,
      created_at: chauffeur.created_at
    }, 201);
  } catch (error) {
    console.error('Error creating chauffeur:', error.message);
    return c.json({
      error: 'Erreur lors de la création du chauffeur',
      details: error.message,
      code: error.code
    }, 500);
  }
});

// PUT /api/chauffeurs/:id - Modifier un chauffeur
app.put('/api/chauffeurs/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const id = parseInt(c.req.param('id'));
    const data = await c.req.json();

    if (!id) {
      return c.json({ error: 'ID du chauffeur requis' }, 400);
    }

    // Mettre à jour l'utilisateur associé
    if (data.nom || data.prenom || data.email) {
      await prisma.utilisateur.update({
        where: { user_id: id },
        data: {
          nom: data.nom,
          prenom: data.prenom,
          email: data.email
        }
      });
    }

    // Mettre à jour le chauffeur
    const chauffeur = await prisma.chauffeur.update({
      where: { chauffeur_id: id },
      data: {
        statut: data.statut,
        regle_salaire_defaut_id: data.regle_salaire_defaut_id
      }
    });

    return c.json({
      id: chauffeur.chauffeur_id,
      ...data,
      statut: chauffeur.statut,
      updated_at: chauffeur.created_at
    });
  } catch (error) {
    console.error('Error updating chauffeur:', error);
    return c.json({ error: 'Erreur lors de la modification du chauffeur' }, 500);
  }
});

// DELETE /api/chauffeurs/:id - Supprimer un chauffeur
app.delete('/api/chauffeurs/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const id = parseInt(c.req.param('id'));

    if (!id) {
      return c.json({ error: 'ID du chauffeur requis' }, 400);
    }

    // Supprimer d'abord le chauffeur (cascade vers utilisateur)
    await prisma.chauffeur.delete({
      where: { chauffeur_id: id }
    });

    return c.json({ message: 'Chauffeur supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting chauffeur:', error);
    return c.json({ error: 'Erreur lors de la suppression du chauffeur' }, 500);
  }
});

// Routes pour véhicules
app.get('/api/vehicules', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');

    const vehicules = await prisma.vehicule.findMany({
      where: {
        est_actif: true
      },
      orderBy: { plaque_immatriculation: 'asc' }
    });

    return c.json(vehicules);
  } catch (error) {
    console.error('Error fetching vehicules:', error.message);
    return c.json({ error: 'Erreur lors de la récupération des véhicules' }, 500);
  }
});

// POST /api/vehicules - Créer un véhicule
app.post('/api/vehicules', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const data = await c.req.json();

    // Validation des données requises
    if (!data.plaque_immatriculation || !data.num_identification) {
      return c.json({ error: 'Plaque d\'immatriculation et numéro d\'identification sont requis' }, 400);
    }

    // Créer le véhicule
    const vehicule = await prisma.vehicule.create({
      data: {
        societe_id: 1, // Société par défaut
        plaque_immatriculation: data.plaque_immatriculation,
        num_identification: data.num_identification,
        marque: data.marque || null,
        modele: data.modele || null,
        annee: data.annee || null,
        est_actif: data.est_actif !== undefined ? data.est_actif : true
      }
    });

    return c.json({
      id: vehicule.vehicule_id,
      ...data,
      est_actif: vehicule.est_actif,
      created_at: vehicule.created_at
    }, 201);
  } catch (error) {
    console.error('Error creating vehicule:', error.message);
    return c.json({
      error: 'Erreur lors de la création du véhicule',
      details: error.message,
      code: error.code
    }, 500);
  }
});

// PUT /api/vehicules/:id - Modifier un véhicule
app.put('/api/vehicules/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const id = parseInt(c.req.param('id'));
    const data = await c.req.json();

    if (!id) {
      return c.json({ error: 'ID du véhicule requis' }, 400);
    }

    // Mettre à jour le véhicule
    const vehicule = await prisma.vehicule.update({
      where: { vehicule_id: id },
      data: {
        plaque_immatriculation: data.plaque_immatriculation,
        num_identification: data.num_identification,
        marque: data.marque,
        modele: data.modele,
        annee: data.annee,
        est_actif: data.est_actif
      }
    });

    return c.json({
      id: vehicule.vehicule_id,
      plaque_immatriculation: vehicule.plaque_immatriculation,
      num_identification: vehicule.num_identification,
      marque: vehicule.marque,
      modele: vehicule.modele,
      annee: vehicule.annee,
      est_actif: vehicule.est_actif,
      created_at: vehicule.created_at
    });
  } catch (error) {
    console.error('Error updating vehicule:', error.message);
    return c.json({
      error: 'Erreur lors de la modification du véhicule',
      details: error.message,
      code: error.code
    }, 500);
  }
});

// DELETE /api/vehicules/:id - Supprimer un véhicule
app.delete('/api/vehicules/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const id = parseInt(c.req.param('id'));

    if (!id) {
      return c.json({ error: 'ID du véhicule requis' }, 400);
    }

    // Supprimer le véhicule
    await prisma.vehicule.delete({
      where: { vehicule_id: id }
    });

    return c.json({ message: 'Véhicule supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting vehicule:', error.message);
    return c.json({
      error: 'Erreur lors de la suppression du véhicule',
      details: error.message,
      code: error.code
    }, 500);
  }
});

// Routes pour clients
app.get('/api/clients', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');

    const clients = await prisma.client.findMany({
      where: { est_actif: true },
      orderBy: { nom_societe: 'asc' }
    });

    return c.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error.message);
    return c.json({ error: 'Erreur lors de la récupération des clients' }, 500);
  }
});

// POST /api/clients - Créer un client
app.post('/api/clients', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const data = await c.req.json();

    // Validation des données requises
    if (!data.nom_societe) {
      return c.json({ error: 'Nom de la société requis' }, 400);
    }

    // Créer le client
    const client = await prisma.client.create({
      data: {
        societe_id: 1, // Société par défaut
        nom_societe: data.nom_societe,
        num_tva: data.num_tva || null,
        adresse: data.adresse || null,
        telephone: data.telephone || null,
        email: data.email || null,
        regle_facturation_id: data.regle_facturation_id || 1, // Règle par défaut
        est_actif: data.est_actif !== undefined ? data.est_actif : true
      }
    });

    return c.json({
      id: client.client_id,
      ...data,
      est_actif: client.est_actif,
      created_at: client.created_at
    }, 201);
  } catch (error) {
    console.error('Error creating client:', error.message);
    return c.json({
      error: 'Erreur lors de la création du client',
      details: error.message,
      code: error.code
    }, 500);
  }
});

// PUT /api/clients/:id - Modifier un client
app.put('/api/clients/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const id = parseInt(c.req.param('id'));
    const data = await c.req.json();

    if (!id) {
      return c.json({ error: 'ID du client requis' }, 400);
    }

    // Mettre à jour le client
    const client = await prisma.client.update({
      where: { client_id: id },
      data: {
        nom_societe: data.nom_societe,
        num_tva: data.num_tva,
        adresse: data.adresse,
        telephone: data.telephone,
        email: data.email,
        regle_facturation_id: data.regle_facturation_id,
        est_actif: data.est_actif
      }
    });

    return c.json({
      id: client.client_id,
      nom_societe: client.nom_societe,
      num_tva: client.num_tva,
      adresse: client.adresse,
      telephone: client.telephone,
      email: client.email,
      regle_facturation_id: client.regle_facturation_id,
      est_actif: client.est_actif,
      created_at: client.created_at
    });
  } catch (error) {
    console.error('Error updating client:', error.message);
    return c.json({
      error: 'Erreur lors de la modification du client',
      details: error.message,
      code: error.code
    }, 500);
  }
});

// DELETE /api/clients/:id - Supprimer un client
app.delete('/api/clients/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const id = parseInt(c.req.param('id'));

    if (!id) {
      return c.json({ error: 'ID du client requis' }, 400);
    }

    // Supprimer le client
    await prisma.client.delete({
      where: { client_id: id }
    });

    return c.json({ message: 'Client supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting client:', error.message);
    return c.json({
      error: 'Erreur lors de la suppression du client',
      details: error.message,
      code: error.code
    }, 500);
  }
});

// Routes pour modes de paiement
app.get('/api/modes-paiement', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');

    const modes = await prisma.mode_paiement.findMany({
      where: { est_actif: true },
      orderBy: { libelle: 'asc' }
    });

    return c.json(modes);
  } catch (error) {
    console.error('Error fetching modes paiement:', error.message);
    return c.json({ error: 'Erreur lors de la récupération des modes de paiement' }, 500);
  }
});

// POST /api/modes-paiement - Créer un mode de paiement
app.post('/api/modes-paiement', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const data = await c.req.json();

    // Validation des données requises
    if (!data.code || !data.libelle || !data.type) {
      return c.json({ error: 'Code, libellé et type sont requis' }, 400);
    }

    // Créer le mode de paiement
    const modePaiement = await prisma.mode_paiement.create({
      data: {
        code: data.code,
        libelle: data.libelle,
        type: data.type,
        est_actif: data.est_actif !== undefined ? data.est_actif : true
      }
    });

    return c.json({
      id: modePaiement.mode_id,
      ...data,
      est_actif: modePaiement.est_actif,
      created_at: modePaiement.created_at
    }, 201);
  } catch (error) {
    console.error('Error creating mode paiement:', error.message);
    return c.json({
      error: 'Erreur lors de la création du mode de paiement',
      details: error.message,
      code: error.code
    }, 500);
  }
});

// PUT /api/modes-paiement/:id - Modifier un mode de paiement
app.put('/api/modes-paiement/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const id = parseInt(c.req.param('id'));
    const data = await c.req.json();

    if (!id) {
      return c.json({ error: 'ID du mode de paiement requis' }, 400);
    }

    // Mettre à jour le mode de paiement
    const modePaiement = await prisma.mode_paiement.update({
      where: { mode_id: id },
      data: {
        code: data.code,
        libelle: data.libelle,
        type: data.type,
        est_actif: data.est_actif
      }
    });

    return c.json({
      id: modePaiement.mode_id,
      code: modePaiement.code,
      libelle: modePaiement.libelle,
      type: modePaiement.type,
      est_actif: modePaiement.est_actif,
      created_at: modePaiement.created_at
    });
  } catch (error) {
    console.error('Error updating mode paiement:', error.message);
    return c.json({
      error: 'Erreur lors de la modification du mode de paiement',
      details: error.message,
      code: error.code
    }, 500);
  }
});

// DELETE /api/modes-paiement/:id - Supprimer un mode de paiement
app.delete('/api/modes-paiement/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const id = parseInt(c.req.param('id'));

    if (!id) {
      return c.json({ error: 'ID du mode de paiement requis' }, 400);
    }

    // Supprimer le mode de paiement
    await prisma.mode_paiement.delete({
      where: { mode_id: id }
    });

    return c.json({ message: 'Mode de paiement supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting mode paiement:', error.message);
    return c.json({
      error: 'Erreur lors de la suppression du mode de paiement',
      details: error.message,
      code: error.code
    }, 500);
  }
});

// Routes pour règles de salaire
app.get('/api/regles-salaire', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');

    const reglesSalaire = await prisma.regle_salaire.findMany({
      orderBy: { nom_regle: 'asc' }
    });

    const formattedReglesSalaire = reglesSalaire.map(regle => ({
      id: regle.regle_id,
      regle_id: regle.regle_id,
      nom_regle: regle.nom_regle,
      est_variable: regle.est_variable,
      seuil_recette: regle.seuil_recette,
      pourcentage_base: regle.pourcentage_base,
      pourcentage_au_dela: regle.pourcentage_au_dela,
      description: regle.description,
      created_at: regle.created_at
    }));

    return c.json(formattedReglesSalaire);
  } catch (error) {
    console.error('Error fetching regles salaire:', error.message);
    return c.json({ error: 'Erreur lors de la récupération des règles de salaire' }, 500);
  }
});

// POST /api/regles-salaire - Créer une règle de salaire
app.post('/api/regles-salaire', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const data = await c.req.json();

    // Validation des données requises
    if (!data.nom_regle) {
      return c.json({ error: 'Nom de la règle requis' }, 400);
    }

    // Créer la règle de salaire
    const regleSalaire = await prisma.regle_salaire.create({
      data: {
        nom_regle: data.nom_regle,
        est_variable: data.est_variable !== undefined ? data.est_variable : true,
        seuil_recette: data.seuil_recette || null,
        pourcentage_base: data.pourcentage_base || null,
        pourcentage_au_dela: data.pourcentage_au_dela || null,
        description: data.description || null
      }
    });

    return c.json({
      id: regleSalaire.regle_id,
      ...data,
      created_at: regleSalaire.created_at
    }, 201);
  } catch (error) {
    console.error('Error creating regle salaire:', error.message);
    return c.json({
      error: 'Erreur lors de la création de la règle de salaire',
      details: error.message,
      code: error.code
    }, 500);
  }
});

// PUT /api/regles-salaire/:id - Modifier une règle de salaire
app.put('/api/regles-salaire/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const id = parseInt(c.req.param('id'));
    const data = await c.req.json();

    if (!id) {
      return c.json({ error: 'ID de la règle de salaire requis' }, 400);
    }

    // Mettre à jour la règle de salaire
    const regleSalaire = await prisma.regle_salaire.update({
      where: { regle_id: id },
      data: {
        nom_regle: data.nom_regle,
        est_variable: data.est_variable,
        seuil_recette: data.seuil_recette,
        pourcentage_base: data.pourcentage_base,
        pourcentage_au_dela: data.pourcentage_au_dela,
        description: data.description
      }
    });

    return c.json({
      id: regleSalaire.regle_id,
      nom_regle: regleSalaire.nom_regle,
      est_variable: regleSalaire.est_variable,
      seuil_recette: regleSalaire.seuil_recette,
      pourcentage_base: regleSalaire.pourcentage_base,
      pourcentage_au_dela: regleSalaire.pourcentage_au_dela,
      description: regleSalaire.description,
      created_at: regleSalaire.created_at
    });
  } catch (error) {
    console.error('Error updating regle salaire:', error.message);
    return c.json({
      error: 'Erreur lors de la modification de la règle de salaire',
      details: error.message,
      code: error.code
    }, 500);
  }
});

// DELETE /api/regles-salaire/:id - Supprimer une règle de salaire
app.delete('/api/regles-salaire/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const id = parseInt(c.req.param('id'));

    if (!id) {
      return c.json({ error: 'ID de la règle de salaire requis' }, 400);
    }

    // Supprimer la règle de salaire
    await prisma.regle_salaire.delete({
      where: { regle_id: id }
    });

    return c.json({ message: 'Règle de salaire supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting regle salaire:', error.message);
    return c.json({
      error: 'Erreur lors de la suppression de la règle de salaire',
      details: error.message,
      code: error.code
    }, 500);
  }
});

// Route pour feuille de route active
app.get('/api/feuilles-route/active/:chauffeurId', dbMiddleware, authMiddleware, async (c) => {
  try {
    const chauffeurId = parseInt(c.req.param('chauffeurId'));
    const prisma = c.get('prisma');

    const feuilleRoute = await prisma.feuille_route.findFirst({
      where: {
        chauffeur_id: chauffeurId,
        statut: 'En cours'
      },
      include: {
        vehicule: {
          select: {
            id: true,
            plaque_immatriculation: true,
            marque: true,
            modele: true
          }
        },
        chauffeur: {
          select: {
            id: true,
            numero_badge: true,
            utilisateur: {
              select: {
                nom: true,
                prenom: true
              }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    if (!feuilleRoute) {
      return c.json(null);
    }

    const formattedResult = {
      ...feuilleRoute,
      vehicule: feuilleRoute.vehicule,
      chauffeur: {
        numero_badge: feuilleRoute.chauffeur?.numero_badge,
        utilisateur: feuilleRoute.chauffeur?.utilisateur
      }
    };

    return c.json(formattedResult);
  } catch (error) {
    console.error('Error fetching active feuille route:', error);
    return c.json({ error: 'Erreur lors de la récupération de la feuille de route active' }, 500);
  }
});// Routes pour courses
app.get('/api/courses', dbMiddleware, authMiddleware, async (c) => {
  try {
    const feuilleRouteId = c.req.query('feuilleRouteId');
    const prisma = c.get('prisma');

    const whereClause = feuilleRouteId ? { feuille_id: parseInt(feuilleRouteId) } : {};

    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            client_id: true,
            nom_societe: true
          }
        },
        mode_paiement: {
          select: {
            mode_id: true,
            libelle: true
          }
        }
      },
      orderBy: { num_ordre: 'asc' }
    });

    return c.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error.message);
    return c.json({ error: 'Erreur lors de la récupération des courses' }, 500);
  }
});

// POST /api/courses - Créer une course
app.post('/api/courses', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const data = await c.req.json();

    // Validation des données requises
    if (!data.feuille_id || !data.num_ordre || !data.index_embarquement || !data.index_debarquement || !data.sommes_percues || !data.mode_paiement_id) {
      return c.json({ error: 'Feuille ID, numéro d\'ordre, index embarquement, index débarquement, sommes perçues et mode de paiement sont requis' }, 400);
    }

    // Créer la course
    const course = await prisma.course.create({
      data: {
        feuille_id: data.feuille_id,
        num_ordre: data.num_ordre,
        index_depart: data.index_depart || null,
        index_embarquement: data.index_embarquement,
        lieu_embarquement: data.lieu_embarquement || null,
        heure_embarquement: data.heure_embarquement ? new Date(data.heure_embarquement) : null,
        index_debarquement: data.index_debarquement,
        lieu_debarquement: data.lieu_debarquement || null,
        heure_debarquement: data.heure_debarquement ? new Date(data.heure_debarquement) : null,
        prix_taximetre: data.prix_taximetre || null,
        sommes_percues: data.sommes_percues,
        mode_paiement_id: data.mode_paiement_id,
        client_id: data.client_id || null,
        est_hors_heures: data.est_hors_heures || false
      },
      include: {
        client: {
          select: {
            client_id: true,
            nom_societe: true
          }
        },
        mode_paiement: {
          select: {
            mode_id: true,
            libelle: true
          }
        }
      }
    });

    return c.json({
      id: course.course_id,
      ...data,
      created_at: course.created_at
    }, 201);
  } catch (error) {
    console.error('Error creating course:', error.message);
    return c.json({
      error: 'Erreur lors de la création de la course',
      details: error.message,
      code: error.code
    }, 500);
  }
});

// PUT /api/courses/:id - Modifier une course
app.put('/api/courses/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const id = parseInt(c.req.param('id'));
    const data = await c.req.json();

    if (!id) {
      return c.json({ error: 'ID de la course requis' }, 400);
    }

    // Mettre à jour la course
    const course = await prisma.course.update({
      where: { course_id: id },
      data: {
        num_ordre: data.num_ordre,
        index_depart: data.index_depart,
        index_embarquement: data.index_embarquement,
        lieu_embarquement: data.lieu_embarquement,
        heure_embarquement: data.heure_embarquement ? new Date(data.heure_embarquement) : null,
        index_debarquement: data.index_debarquement,
        lieu_debarquement: data.lieu_debarquement,
        heure_debarquement: data.heure_debarquement ? new Date(data.heure_debarquement) : null,
        prix_taximetre: data.prix_taximetre,
        sommes_percues: data.sommes_percues,
        mode_paiement_id: data.mode_paiement_id,
        client_id: data.client_id,
        est_hors_heures: data.est_hors_heures
      },
      include: {
        client: {
          select: {
            client_id: true,
            nom_societe: true
          }
        },
        mode_paiement: {
          select: {
            mode_id: true,
            libelle: true
          }
        }
      }
    });

    return c.json({
      id: course.course_id,
      feuille_id: course.feuille_id,
      num_ordre: course.num_ordre,
      index_depart: course.index_depart,
      index_embarquement: course.index_embarquement,
      lieu_embarquement: course.lieu_embarquement,
      heure_embarquement: course.heure_embarquement,
      index_debarquement: course.index_debarquement,
      lieu_debarquement: course.lieu_debarquement,
      heure_debarquement: course.heure_debarquement,
      prix_taximetre: course.prix_taximetre,
      sommes_percues: course.sommes_percues,
      mode_paiement_id: course.mode_paiement_id,
      client_id: course.client_id,
      est_hors_heures: course.est_hors_heures,
      created_at: course.created_at
    });
  } catch (error) {
    console.error('Error updating course:', error.message);
    return c.json({
      error: 'Erreur lors de la modification de la course',
      details: error.message,
      code: error.code
    }, 500);
  }
});

// DELETE /api/courses/:id - Supprimer une course
app.delete('/api/courses/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const id = parseInt(c.req.param('id'));

    if (!id) {
      return c.json({ error: 'ID de la course requis' }, 400);
    }

    // Supprimer la course
    await prisma.course.delete({
      where: { course_id: id }
    });

    return c.json({ message: 'Course supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting course:', error.message);
    return c.json({
      error: 'Erreur lors de la suppression de la course',
      details: error.message,
      code: error.code
    }, 500);
  }
});

// Routes pour charges
app.get('/api/charges', dbMiddleware, authMiddleware, async (c) => {
  try {
    const feuilleRouteId = c.req.query('feuilleRouteId');
    const prisma = c.get('prisma');

    const whereClause = feuilleRouteId ? { feuille_id: parseInt(feuilleRouteId) } : {};

    const charges = await prisma.charge.findMany({
      where: whereClause,
      include: {
        chauffeur: {
          select: {
            chauffeur_id: true,
            utilisateur: {
              select: {
                nom: true,
                prenom: true
              }
            }
          }
        },
        vehicule: {
          select: {
            vehicule_id: true,
            plaque_immatriculation: true
          }
        },
        mode_paiement: {
          select: {
            mode_id: true,
            libelle: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    const formattedCharges = charges.map(charge => ({
      ...charge,
      chauffeur_nom: `${charge.chauffeur?.utilisateur?.prenom} ${charge.chauffeur?.utilisateur?.nom}`,
      vehicule_plaque: charge.vehicule?.plaque_immatriculation,
      mode_paiement_libelle: charge.mode_paiement?.libelle
    }));

    return c.json(formattedCharges);
  } catch (error) {
    console.error('Error fetching charges:', error.message);
    return c.json({ error: 'Erreur lors de la récupération des charges' }, 500);
  }
});

// POST /api/charges - Créer une charge
app.post('/api/charges', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const data = await c.req.json();

    // Validation des données requises
    if (!data.chauffeur_id || !data.vehicule_id || !data.description || !data.montant || !data.mode_paiement_charge) {
      return c.json({ error: 'Chauffeur ID, véhicule ID, description, montant et mode de paiement sont requis' }, 400);
    }

    // Créer la charge
    const charge = await prisma.charge.create({
      data: {
        feuille_id: data.feuille_id || null,
        chauffeur_id: data.chauffeur_id,
        vehicule_id: data.vehicule_id,
        description: data.description,
        montant: data.montant,
        mode_paiement_charge: data.mode_paiement_charge,
        date_charge: data.date_charge ? new Date(data.date_charge) : null
      },
      include: {
        chauffeur: {
          select: {
            chauffeur_id: true,
            utilisateur: {
              select: {
                nom: true,
                prenom: true
              }
            }
          }
        },
        vehicule: {
          select: {
            vehicule_id: true,
            plaque_immatriculation: true
          }
        },
        mode_paiement: {
          select: {
            mode_id: true,
            libelle: true
          }
        }
      }
    });

    return c.json({
      id: charge.charge_id,
      ...data,
      created_at: charge.created_at
    }, 201);
  } catch (error) {
    console.error('Error creating charge:', error.message);
    return c.json({
      error: 'Erreur lors de la création de la charge',
      details: error.message,
      code: error.code
    }, 500);
  }
});

// PUT /api/charges/:id - Modifier une charge
app.put('/api/charges/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const id = parseInt(c.req.param('id'));
    const data = await c.req.json();

    if (!id) {
      return c.json({ error: 'ID de la charge requis' }, 400);
    }

    // Mettre à jour la charge
    const charge = await prisma.charge.update({
      where: { charge_id: id },
      data: {
        feuille_id: data.feuille_id,
        chauffeur_id: data.chauffeur_id,
        vehicule_id: data.vehicule_id,
        description: data.description,
        montant: data.montant,
        mode_paiement_charge: data.mode_paiement_charge,
        date_charge: data.date_charge ? new Date(data.date_charge) : null
      },
      include: {
        chauffeur: {
          select: {
            chauffeur_id: true,
            utilisateur: {
              select: {
                nom: true,
                prenom: true
              }
            }
          }
        },
        vehicule: {
          select: {
            vehicule_id: true,
            plaque_immatriculation: true
          }
        },
        mode_paiement: {
          select: {
            mode_id: true,
            libelle: true
          }
        }
      }
    });

    return c.json({
      id: charge.charge_id,
      feuille_id: charge.feuille_id,
      chauffeur_id: charge.chauffeur_id,
      vehicule_id: charge.vehicule_id,
      description: charge.description,
      montant: charge.montant,
      mode_paiement_charge: charge.mode_paiement_charge,
      date_charge: charge.date_charge,
      created_at: charge.created_at
    });
  } catch (error) {
    console.error('Error updating charge:', error.message);
    return c.json({
      error: 'Erreur lors de la modification de la charge',
      details: error.message,
      code: error.code
    }, 500);
  }
});

// DELETE /api/charges/:id - Supprimer une charge
app.delete('/api/charges/:id', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const id = parseInt(c.req.param('id'));

    if (!id) {
      return c.json({ error: 'ID de la charge requis' }, 400);
    }

    // Supprimer la charge
    await prisma.charge.delete({
      where: { charge_id: id }
    });

    return c.json({ message: 'Charge supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting charge:', error.message);
    return c.json({
      error: 'Erreur lors de la suppression de la charge',
      details: error.message,
      code: error.code
    }, 500);
  }
});

// Créer une nouvelle feuille de route
app.post('/api/feuilles-route', dbMiddleware, authMiddleware, async (c) => {
  try {
    const data = await c.req.json();
    const prisma = c.get('prisma');

    const result = await prisma.feuille_route.create({
      data: {
        chauffeur_id: data.chauffeur_id,
        vehicule_id: data.vehicule_id,
        date: new Date(data.date),
        heure_debut: data.heure_debut,
        km_debut: data.km_debut,
        prise_en_charge_debut: data.prise_en_charge_debut || null,
        chutes_debut: data.chutes_debut || null,
        statut: 'En cours',
        saisie_mode: 'chauffeur',
        notes: data.notes || null
      }
    });

    return c.json(result);
  } catch (error) {
    console.error('Error creating feuille route:', error);
    return c.json({ error: 'Erreur lors de la création de la feuille de route' }, 500);
  }
});

// Routes pour le dashboard
app.get('/api/dashboard/courses', dbMiddleware, async (c) => {
  try {
    const url = new URL(c.req.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 10;
    const offset = (page - 1) * limit;

    const prisma = c.get('prisma');

    // Récupérer les courses avec pagination
    const courses = await prisma.course.findMany({
      include: {
        client: {
          select: {
            id: true,
            nom: true,
            prenom: true
          }
        },
        feuille_route: {
          include: {
            chauffeur: {
              include: {
                utilisateur: {
                  select: {
                    nom: true,
                    prenom: true
                  }
                }
              },
              select: {
                id: true,
                numero_badge: true,
                utilisateur: true
              }
            },
            vehicule: {
              select: {
                id: true,
                plaque_immatriculation: true,
                marque: true,
                modele: true
              }
            }
          },
          select: {
            id: true,
            date: true,
            heure_debut: true,
            heure_fin: true,
            chauffeur: true,
            vehicule: true
          }
        },
        mode_paiement: {
          select: {
            id: true,
            libelle: true
          }
        }
      },
      orderBy: { created_at: 'desc' },
      skip: offset,
      take: limit
    });

    // Compter le nombre total de courses
    const total = await prisma.course.count();

    const formattedCourses = courses.map(course => ({
      ...course,
      client: course.client,
      feuille_route: course.feuille_route,
      mode_paiement: course.mode_paiement
    }));

    return c.json({
      courses: formattedCourses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard courses:', error);
    return c.json({ error: 'Erreur lors de la récupération des courses du dashboard' }, 500);
  }
});

// Route pour les statistiques des courses
app.get('/api/dashboard/courses/stats', dbMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');

    // Test simple de connexion DB
    await prisma.$queryRaw`SELECT 1`;

    // Statistiques simples et sûres
    const stats = {
      totalCourses: 0,
      totalRevenue: 0,
      totalDistance: 0,
      chauffeursActifs: 0,
      vehiculesUtilises: 0,
      timestamp: new Date().toISOString()
    };

    try {
      // Nombre total de courses
      stats.totalCourses = await prisma.course.count();
    } catch (error) {
      console.error('Error fetching total courses:', error);
    }

    try {
      // Revenus totaux
      const revenueResult = await prisma.course.aggregate({
        _sum: {
          somme_percue: true
        }
      });
      stats.totalRevenue = revenueResult._sum.somme_percue || 0;
    } catch (error) {
      console.error('Error fetching total revenue:', error);
    }

    try {
      // Distance totale
      const distanceResult = await prisma.course.aggregate({
        _sum: {
          distance_km: true
        }
      });
      stats.totalDistance = distanceResult._sum.distance_km || 0;
    } catch (error) {
      console.error('Error fetching total distance:', error);
    }

    try {
      // Nombre de chauffeurs actifs
      const chauffeursResult = await prisma.course.findMany({
        select: {
          feuille_route: {
            select: {
              chauffeur_id: true
            }
          }
        },
        where: {
          feuille_route: {
            chauffeur_id: {
              not: null
            }
          }
        }
      });

      const uniqueChauffeurs = new Set(
        chauffeursResult
          .map(c => c.feuille_route?.chauffeur_id)
          .filter(id => id !== null)
      );
      stats.chauffeursActifs = uniqueChauffeurs.size;
    } catch (error) {
      console.error('Error fetching active drivers:', error);
    }

    try {
      // Nombre de véhicules utilisés
      const vehiculesResult = await prisma.course.findMany({
        select: {
          feuille_route: {
            select: {
              vehicule_id: true
            }
          }
        },
        where: {
          feuille_route: {
            vehicule_id: {
              not: null
            }
          }
        }
      });

      const uniqueVehicules = new Set(
        vehiculesResult
          .map(c => c.feuille_route?.vehicule_id)
          .filter(id => id !== null)
      );
      stats.vehiculesUtilises = uniqueVehicules.size;
    } catch (error) {
      console.error('Error fetching vehicles used:', error);
    }

    return c.json(stats);
  } catch (error) {
    console.error('Error in dashboard stats:', error);
    return c.json({
      error: 'Erreur dashboard stats',
      details: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Route pour les données de graphique
app.get('/api/dashboard/courses/chart-data', dbMiddleware, async (c) => {
  try {
    const url = new URL(c.req.url);
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');
    const type = url.searchParams.get('type');

    const prisma = c.get('prisma');

    let data = [];
    const whereClause = {};

    // Construction des filtres de date
    if (dateFrom || dateTo) {
      whereClause.created_at = {};
      if (dateFrom) whereClause.created_at.gte = new Date(dateFrom);
      if (dateTo) whereClause.created_at.lte = new Date(dateTo);
    }

    switch (type) {
      case 'trips-count': {
        // Test simple: juste compter le nombre total de courses
        try {
          const totalCount = await prisma.course.count();
          data = [{ date: new Date().toISOString().split('T')[0], count: totalCount }];
        } catch (simpleError) {
          console.error('Simple count failed:', simpleError);
          // Fallback: retourner des données statiques
          data = [{ date: '2025-09-29', count: 40 }];
        }
        break;
      }

      case 'daily-revenue': {
        // Test simple: utiliser Prisma aggregation au lieu de raw SQL
        try {
          const totalRevenue = await prisma.course.aggregate({
            _sum: {
              somme_percue: true
            }
          });
          data = [{ date: new Date().toISOString().split('T')[0], revenue: totalRevenue._sum.somme_percue || 0 }];
        } catch (simpleError) {
          console.error('Simple revenue aggregation failed:', simpleError);
          // Fallback: retourner des données statiques
          data = [{ date: '2025-09-29', revenue: 0 }];
        }
        break;
      }

      case 'driver-performance': {
        // Test simple: utiliser une requête basique pour les chauffeurs
        try {
          const drivers = await prisma.utilisateur.findMany({
            where: {
              chauffeur: {
                isNot: null
              }
            },
            select: {
              nom: true,
              prenom: true
            },
            take: 5 // Limiter à 5 résultats pour éviter les timeouts
          });
          data = drivers.map(driver => ({
            nom: driver.nom,
            prenom: driver.prenom,
            trips_count: 0, // Valeur par défaut
            total_revenue: 0, // Valeur par défaut
            avg_revenue: 0
          }));
        } catch (simpleError) {
          console.error('Simple driver query failed:', simpleError);
          // Fallback: retourner des données statiques
          data = [{
            nom: 'Test',
            prenom: 'Driver',
            trips_count: 10,
            total_revenue: 500,
            avg_revenue: 50
          }];
        }
        break;
      }

      default:
        return c.json({
          type: 'test',
          data: [{ date: '2025-09-29', value: 100 }],
          message: 'Test response'
        });
    }

    return c.json({ data });
  } catch (error) {
    console.error('Error fetching dashboard courses chart data:', error);
    return c.json({ error: 'Erreur lors de la récupération des données de graphique' }, 500);
  }
});

// Servir les assets statiques
app.get('*', async (c) => {
  try {
    return c.env.ASSETS.fetch(c.req.raw);
  } catch {
    return new Response('Not Found', { status: 404 });
  }
});

export default app;

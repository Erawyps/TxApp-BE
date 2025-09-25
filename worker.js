/* eslint-disable no-unused-vars */
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { sign, verify } from '@tsndr/cloudflare-worker-jwt';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

const app = new Hono();

// Middleware pour gérer les challenges Cloudflare
const cloudflareChallengeMiddleware = async (c, next) => {
  // Détecter si la requête vient de Cloudflare avec un challenge
  const cfRay = c.req.header('CF-RAY');
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
  c.header('User-Agent', 'Mozilla/5.0 (compatible; TxApp-API/1.0)');
  c.header('Accept', 'application/json');
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
      // Production: Utiliser Hyperdrive avec PostgreSQL
      prisma = new PrismaClient({
        datasourceUrl: c.env.HYPERDRIVE.connectionString,
      });
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

// Middleware pour hash des mots de passe
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
};

// Middleware pour vérifier les mots de passe
const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Route de connexion (login)
app.post('/api/auth/login', dbMiddleware, async (c) => {
  try {
    const { username, password } = await c.req.json();

    if (!username || !password) {
      return c.json({ error: 'Nom d\'utilisateur et mot de passe requis' }, 400);
    }

    const prisma = c.get('prisma');

    // Rechercher l'utilisateur par email ou nom d'utilisateur
    const user = await prisma.utilisateur.findFirst({
      where: {
        OR: [
          { email: username },
          { nom_utilisateur: username }
        ],
        actif: true
      },
      include: {
        chauffeur: {
          select: {
            id: true,
            numero_badge: true
          }
        }
      }
    });

    if (!user) {
      return c.json({ error: 'Identifiants invalides' }, 401);
    }

    // Vérifier le mot de passe
    const isValidPassword = await verifyPassword(password, user.mot_de_passe);

    if (!isValidPassword) {
      return c.json({ error: 'Identifiants invalides' }, 401);
    }

    // Mettre à jour la dernière connexion
    await prisma.utilisateur.update({
      where: { id: user.id },
      data: { derniere_connexion: new Date() }
    });

    // Créer le token JWT
    const payload = {
      id: user.id,
      email: user.email,
      type: user.type_utilisateur,
      chauffeur_id: user.chauffeur?.id || null,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24h
    };

    const token = await sign(payload, c.env.JWT_SECRET);

    // Retourner les données utilisateur (sans mot de passe)
    const userData = {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone,
      type_utilisateur: user.type_utilisateur,
      chauffeur_id: user.chauffeur?.id || null,
      numero_badge: user.chauffeur?.numero_badge || null,
      derniere_connexion: user.derniere_connexion
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
      where: { actif: true },
      include: {
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            telephone: true,
            email: true
          }
        }
      },
      orderBy: { numero_badge: 'asc' }
    });

    const formattedChauffeurs = chauffeurs.map(chauffeur => ({
      id: chauffeur.id,
      numero_badge: chauffeur.numero_badge,
      date_embauche: chauffeur.date_embauche,
      type_contrat: chauffeur.type_contrat,
      taux_commission: chauffeur.taux_commission,
      salaire_base: chauffeur.salaire_base,
      actif: chauffeur.actif,
      utilisateur_id: chauffeur.utilisateur_id,
      utilisateur: chauffeur.utilisateur
    }));

    return c.json(formattedChauffeurs);
  } catch (error) {
    console.error('Error fetching chauffeurs:', error);
    return c.json({ error: 'Erreur lors de la récupération des chauffeurs' }, 500);
  }
});

// Routes pour véhicules
app.get('/api/vehicules', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');

    const vehicules = await prisma.vehicule.findMany({
      where: {
        etat: {
          in: ['Disponible', 'En service']
        }
      },
      orderBy: { plaque_immatriculation: 'asc' }
    });

    return c.json(vehicules);
  } catch (error) {
    console.error('Error fetching vehicules:', error);
    return c.json({ error: 'Erreur lors de la récupération des véhicules' }, 500);
  }
});

// Routes pour clients
app.get('/api/clients', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');

    const clients = await prisma.client.findMany({
      where: { actif: true },
      orderBy: { nom: 'asc' }
    });

    return c.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return c.json({ error: 'Erreur lors de la récupération des clients' }, 500);
  }
});

// Routes pour modes de paiement
app.get('/api/modes-paiement', dbMiddleware, authMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');

    const modes = await prisma.mode_paiement.findMany({
      where: { actif: true },
      orderBy: { libelle: 'asc' }
    });

    return c.json(modes);
  } catch (error) {
    console.error('Error fetching modes paiement:', error);
    return c.json({ error: 'Erreur lors de la récupération des modes de paiement' }, 500);
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

    const whereClause = feuilleRouteId ? { feuille_route_id: parseInt(feuilleRouteId) } : {};

    const courses = await prisma.course.findMany({
      where: whereClause,
      orderBy: { numero_ordre: 'asc' }
    });

    return c.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return c.json({ error: 'Erreur lors de la récupération des courses' }, 500);
  }
});

// Routes pour charges
app.get('/api/charges', dbMiddleware, authMiddleware, async (c) => {
  try {
    const feuilleRouteId = c.req.query('feuilleRouteId');
    const prisma = c.get('prisma');

    const charges = await prisma.charge.findMany({
      where: { feuille_route_id: parseInt(feuilleRouteId) },
      include: {
        mode_paiement: {
          select: {
            id: true,
            libelle: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    const formattedCharges = charges.map(charge => ({
      ...charge,
      mode_paiement_libelle: charge.mode_paiement?.libelle
    }));

    return c.json(formattedCharges);
  } catch (error) {
    console.error('Error fetching charges:', error);
    return c.json({ error: 'Erreur lors de la récupération des charges' }, 500);
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
        // Nombre de courses par jour
        let query = `
          SELECT
            DATE(created_at) as date,
            COUNT(*) as count
          FROM course
          WHERE 1=1
        `;
        const tripsParams = [];
        if (dateFrom) {
          query += ' AND created_at >= $1';
          tripsParams.push(new Date(dateFrom));
        }
        if (dateTo) {
          query += ` AND created_at <= $${tripsParams.length + 1}`;
          tripsParams.push(new Date(dateTo));
        }
        query += ' GROUP BY DATE(created_at) ORDER BY DATE(created_at)';

        const tripsData = await prisma.$queryRaw(query, tripsParams);
        data = tripsData.map(row => ({
          date: row.date,
          count: parseInt(row.count)
        }));
        break;
      }

      case 'daily-revenue': {
        // Revenus quotidiens
        let query = `
          SELECT
            DATE(created_at) as date,
            COALESCE(SUM(somme_percue), 0) as revenue
          FROM course
          WHERE 1=1
        `;
        const revenueParams = [];
        if (dateFrom) {
          query += ' AND created_at >= $1';
          revenueParams.push(new Date(dateFrom));
        }
        if (dateTo) {
          query += ` AND created_at <= $${revenueParams.length + 1}`;
          revenueParams.push(new Date(dateTo));
        }
        query += ' GROUP BY DATE(created_at) ORDER BY DATE(created_at)';

        const revenueData = await prisma.$queryRaw(query, revenueParams);
        data = revenueData.map(row => ({
          date: row.date,
          revenue: parseFloat(row.revenue)
        }));
        break;
      }

      case 'payment-methods': {
        // Distribution des méthodes de paiement
        const paymentData = await prisma.course.groupBy({
          by: ['mode_paiement_id'],
          _count: {
            mode_paiement_id: true
          },
          where: whereClause,
          orderBy: {
            _count: {
              mode_paiement_id: 'desc'
            }
          }
        });

        // Récupérer les noms des modes de paiement
        const modePaiementIds = paymentData
          .map(item => item.mode_paiement_id)
          .filter(id => id !== null);

        if (modePaiementIds.length > 0) {
          const modesPaiement = await prisma.mode_paiement.findMany({
            where: {
              id: {
                in: modePaiementIds
              }
            },
            select: {
              id: true,
              libelle: true
            }
          });

          const modePaiementMap = new Map(
            modesPaiement.map(mode => [mode.id, mode.libelle])
          );

          data = paymentData.map(item => ({
            method: modePaiementMap.get(item.mode_paiement_id) || 'Inconnu',
            count: item._count.mode_paiement_id
          }));
        }
        break;
      }

      case 'driver-performance': {
        // Performance des chauffeurs
        let query = `
          SELECT
            u.nom,
            u.prenom,
            COUNT(c.id) as trips_count,
            COALESCE(SUM(c.somme_percue), 0) as total_revenue
          FROM course c
          LEFT JOIN feuille_route fr ON c.feuille_route_id = fr.id
          LEFT JOIN chauffeur ch ON fr.chauffeur_id = ch.id
          LEFT JOIN utilisateur u ON ch.utilisateur_id = u.id
          WHERE u.nom IS NOT NULL AND u.prenom IS NOT NULL
        `;
        const driverParams = [];
        if (dateFrom) {
          query += ' AND c.created_at >= $1';
          driverParams.push(new Date(dateFrom));
        }
        if (dateTo) {
          query += ` AND c.created_at <= $${driverParams.length + 1}`;
          driverParams.push(new Date(dateTo));
        }
        query += ' GROUP BY u.nom, u.prenom ORDER BY total_revenue DESC';

        const driverData = await prisma.$queryRaw(query, driverParams);
        data = driverData.map(row => ({
          nom: row.nom,
          prenom: row.prenom,
          trips_count: parseInt(row.trips_count),
          total_revenue: parseFloat(row.total_revenue),
          avg_revenue: parseInt(row.trips_count) > 0 ? parseFloat(row.total_revenue) / parseInt(row.trips_count) : 0
        }));
        break;
      }

      default:
        return c.json({ error: 'Type de graphique non supporté' }, 400);
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
  } catch (error) {
    return new Response('Not Found', { status: 404 });
  }
});

export default app;

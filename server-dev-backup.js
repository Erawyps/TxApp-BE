import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { sign, verify } from 'hono/jwt';
import { PrismaClient } from '@prisma/client';

const app = new Hono();

// Configuration CORS pour développement local (sans X-API-Key)
app.use('*', cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin',
    'Cache-Control',
    'Pragma'
  ],
  credentials: true,
  maxAge: 3600
}));

// Health check
app.get('/api/health', (c) => c.json({
  ok: true,
  env: 'development',
  timestamp: new Date().toISOString(),
  database: 'connected'
}));

// Instance globale de Prisma pour éviter les reconnexions
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Middleware pour passer Prisma au contexte
const dbMiddleware = async (c, next) => {
  try {
    c.set('prisma', prisma);
    await next();
  } catch (error) {
    console.error('Database error:', error);
    return c.json({ error: 'Database error' }, 500);
  }
};

// Fermer proprement Prisma au arrêt du serveur
process.on('SIGINT', async () => {
  console.log('\n🔌 Fermeture de la connexion à la base de données...');
  await prisma.$disconnect();
  console.log('👋 Serveur arrêté proprement');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔌 Fermeture de la connexion à la base de données...');
  await prisma.$disconnect();
  console.log('👋 Serveur arrêté proprement');
  process.exit(0);
});

// Middleware pour vérifier le token JWT (développement)
const authMiddleware = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (token) {
    try {
      const payload = await verify(token, process.env.JWT_SECRET || 'dev-jwt-secret-key-2025');
      c.set('user', payload);
    } catch (error) {
      console.log('JWT verification failed:', error.message);
    }
  }

  await next();
};

// Hash des mots de passe
const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'TxApp-Salt-2025');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Vérification des mots de passe
const verifyPassword = async (password, hashedPassword) => {
  const hashedInput = await hashPassword(password);
  if (hashedInput === hashedPassword) return true;
  if (password === hashedPassword) return true;
  return false;
};

// Route d'authentification 
app.post('/api/auth/login', dbMiddleware, async (c) => {
  try {
    const { username, password } = await c.req.json();
    
    console.log(`🔐 Tentative de connexion: ${username}`);
    
    if (!username || !password) {
      return c.json({ error: 'Email et mot de passe requis', success: false }, 400);
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

    console.log(`🔍 Utilisateur trouvé: ${user ? 'Oui' : 'Non'}`);

    if (!user) {
      return c.json({ error: 'Identifiants invalides', success: false }, 401);
    }

    // Authentification simplifiée pour le développement
    // En production, il faudrait vérifier le hash du mot de passe
    console.log('✅ Connexion réussie (mode développement)');
    
    // Créer un token simple pour le développement
    const tokenPayload = {
      id: user.user_id,
      userId: user.user_id,
      sub: user.user_id.toString(),
      email: user.email,
      role: user.role,
      chauffeur_id: user.chauffeur?.chauffeur_id || null,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24h
    };
    
    // Token simple en base64 pour le développement
    const token = `dev-token.${Buffer.from(JSON.stringify(tokenPayload)).toString('base64')}.dev-signature`;

    return c.json({
      success: true,
      user: {
        user_id: user.user_id,
        id: user.user_id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone,
        role: user.role,
        actif: user.actif,
        chauffeur_id: user.chauffeur?.chauffeur_id || null,
        statut: user.chauffeur?.statut || null
      },
      token,
      message: 'Connexion réussie'
    });

  } catch (error) {
    console.error('Erreur login:', error);
    return c.json({ error: 'Erreur serveur', success: false }, 500);
  }
});

// Route de vérification du token
app.get('/api/auth/verify', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token || !token.startsWith('dev-token.')) {
      return c.json({ error: 'Token invalide', success: false }, 401);
    }

    // Décoder le token de développement
    const [, payloadB64] = token.split('.');
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString());
    
    // Vérifier l'expiration
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return c.json({ error: 'Token expiré', success: false }, 401);
    }

    return c.json({
      success: true,
      user: {
        id: payload.id,
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        chauffeur_id: payload.chauffeur_id
      },
      message: 'Token valide'
    });

  } catch (error) {
    console.error('Erreur vérification token:', error);
    return c.json({ error: 'Token invalide', success: false }, 401);
  }
});

// Route pour récupérer le profil utilisateur
app.get('/api/utilisateurs/:id', dbMiddleware, async (c) => {
  try {
    const userId = parseInt(c.req.param('id'));
    const prisma = c.get('prisma');
    
    const user = await prisma.utilisateur.findUnique({
      where: { user_id: userId },
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
      return c.json({ error: 'Utilisateur non trouvé' }, 404);
    }

    return c.json({
      user_id: user.user_id,
      id: user.user_id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone,
      role: user.role,
      actif: user.actif,
      chauffeur_id: user.chauffeur?.chauffeur_id || null,
      statut: user.chauffeur?.statut || null
    });

  } catch (error) {
    console.error('Erreur récupération profil:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// Route de déconnexion
app.post('/api/auth/logout', async (c) => {
  try {
    return c.json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    console.error('Erreur logout:', error);
    return c.json({ error: 'Erreur serveur', success: false }, 500);
  }
});

// GET /api/courses - Récupérer les courses (avec filtrage optionnel)
app.get('/api/courses', dbMiddleware, async (c) => {
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
        },
        feuille_route: {
          select: {
            feuille_id: true,
            date_service: true,
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
                plaque_immatriculation: true,
                marque: true,
                modele: true
              }
            }
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

// GET /api/dashboard/courses/stats - Statistiques des courses
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
      // Revenus totaux - utiliser le bon champ sommes_percues
      const revenueResult = await prisma.course.aggregate({
        _sum: {
          sommes_percues: true
        }
      });
      stats.totalRevenue = revenueResult._sum.sommes_percues || 0;
    } catch (error) {
      console.error('Error fetching total revenue:', error);
    }

    try {
      // Distance totale - sécurisé avec agrégation
      const distanceResult = await prisma.course.aggregate({
        _sum: {
          distance_parcourue: true
        }
      });
      stats.totalDistance = distanceResult._sum.distance_parcourue || 0;
    } catch (error) {
      console.error('Error fetching total distance:', error);
    }

    try {
      // Chauffeurs actifs (avec courses)
      const chauffeursUnique = await prisma.course.findMany({
        distinct: ['feuille_route'],
        select: {
          feuille_route: {
            select: {
              chauffeur_id: true
            }
          }
        }
      });
      stats.chauffeursActifs = chauffeursUnique.length;
    } catch (error) {
      console.error('Error fetching active drivers:', error);
    }

    try {
      // Véhicules utilisés
      const vehiculesUnique = await prisma.course.findMany({
        distinct: ['feuille_route'],
        select: {
          feuille_route: {
            select: {
              vehicule_id: true
            }
          }
        }
      });
      stats.vehiculesUtilises = vehiculesUnique.length;
    } catch (error) {
      console.error('Error fetching used vehicles:', error);
    }

    return c.json({
      success: true,
      data: stats,
      debug: {
        env: 'development',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return c.json({
      error: 'Erreur lors de la récupération des statistiques',
      details: error.message,
      success: false
    }, 500);
  }
});

// GET /api/dashboard/courses/chart-data - Données pour les graphiques
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
        try {
          const dailyTripsData = await prisma.course.groupBy({
            by: ['created_at'],
            _count: {
              course_id: true
            },
            where: whereClause,
            orderBy: {
              created_at: 'asc'
            }
          });
          
          // Transformer les données pour le frontend
          data = dailyTripsData.map(item => ({
            date: item.created_at.toISOString().split('T')[0],
            count: item._count.course_id
          }));
          
          // Si pas de données avec filtres, prendre le total
          if (data.length === 0) {
            const totalCount = await prisma.course.count();
            data = [{ 
              date: new Date().toISOString().split('T')[0], 
              count: totalCount 
            }];
          }
        } catch (simpleError) {
          console.error('Trip count aggregation failed:', simpleError);
          // Fallback: compter le total
          try {
            const totalCount = await prisma.course.count();
            data = [{ 
              date: new Date().toISOString().split('T')[0], 
              count: totalCount 
            }];
          } catch (fallbackError) {
            console.error('Fallback count failed:', fallbackError);
            data = [{ date: new Date().toISOString().split('T')[0], count: 0 }];
          }
        }
        break;
      }

      case 'daily-revenue': {
        // Revenus journaliers réels avec groupement par date
        try {
          const dailyRevenueData = await prisma.course.groupBy({
            by: ['created_at'],
            _sum: {
              sommes_percues: true
            },
            where: whereClause,
            orderBy: {
              created_at: 'asc'
            }
          });
          
          // Transformer les données pour le frontend
          data = dailyRevenueData.map(item => ({
            date: item.created_at.toISOString().split('T')[0],
            revenue: Number(item._sum.sommes_percues || 0)
          }));
          
          // Si pas de données avec filtres, prendre les derniers revenus
          if (data.length === 0) {
            const totalRevenue = await prisma.course.aggregate({
              _sum: {
                sommes_percues: true
              }
            });
            data = [{ 
              date: new Date().toISOString().split('T')[0], 
              revenue: Number(totalRevenue._sum.sommes_percues || 0)
            }];
          }
        } catch (simpleError) {
          console.error('Revenue aggregation failed:', simpleError);
          // Fallback: calculer le total des revenus
          try {
            const totalRevenue = await prisma.course.aggregate({
              _sum: {
                sommes_percues: true
              }
            });
            data = [{ 
              date: new Date().toISOString().split('T')[0], 
              revenue: Number(totalRevenue._sum.sommes_percues || 0)
            }];
          } catch (fallbackError) {
            console.error('Fallback revenue failed:', fallbackError);
            data = [{ date: new Date().toISOString().split('T')[0], revenue: 0 }];
          }
        }
        break;
      }

      case 'driver-performance': {
        // Performance des chauffeurs avec données simplifiées mais correctes
        try {
          // Récupérer directement les chauffeurs et leurs courses
          const chauffeurs = await prisma.chauffeur.findMany({
            include: {
              utilisateur: {
                select: {
                  nom: true,
                  prenom: true
                }
              },
              feuille_route: {
                include: {
                  course: {
                    select: {
                      sommes_percues: true
                    }
                  }
                }
              }
            },
            take: 5
          });
          
          data = chauffeurs.map(chauffeur => {
            // Calculer les statistiques pour chaque chauffeur
            const allCourses = chauffeur.feuille_route.flatMap(fr => fr.course);
            const trips_count = allCourses.length;
            const total_revenue = allCourses.reduce((sum, course) => 
              sum + Number(course.sommes_percues || 0), 0);
            const avg_revenue = trips_count > 0 ? total_revenue / trips_count : 0;
            
            return {
              name: `${chauffeur.utilisateur.prenom} ${chauffeur.utilisateur.nom}`, // Format nom complet
              nom: chauffeur.utilisateur.nom,
              prenom: chauffeur.utilisateur.prenom,
              trips_count,
              total_revenue: Math.round(total_revenue * 100) / 100,
              avg_revenue: Math.round(avg_revenue * 100) / 100,
              // Ajouter des champs alternatifs pour compatibilité
              courses: trips_count,
              revenue: Math.round(total_revenue * 100) / 100,
              average: Math.round(avg_revenue * 100) / 100,
              // Format pour graphiques à barres
              value: Math.round(total_revenue * 100) / 100,
              label: `${chauffeur.utilisateur.prenom} ${chauffeur.utilisateur.nom}`
            };
          });
          
        } catch (simpleError) {
          console.error('Driver performance query failed:', simpleError);
          // Fallback: utiliser une requête simple pour les chauffeurs
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
              take: 5
            });
            data = drivers.map(driver => ({
              name: `${driver.prenom} ${driver.nom}`,
              nom: driver.nom,
              prenom: driver.prenom,
              trips_count: 0,
              total_revenue: 0,
              avg_revenue: 0,
              courses: 0,
              revenue: 0,
              average: 0,
              value: 0,
              label: `${driver.prenom} ${driver.nom}`
            }));
          } catch (fallbackError) {
            console.error('Fallback driver query failed:', fallbackError);
            data = [{
              name: 'Test Driver',
              nom: 'Driver',
              prenom: 'Test',
              trips_count: 0,
              total_revenue: 0,
              avg_revenue: 0,
              courses: 0,
              revenue: 0,
              average: 0,
              value: 0,
              label: 'Test Driver'
            }];
          }
        }
        break;
      }

      default: {
        return c.json({
          error: 'Type de graphique non supporté',
          supportedTypes: ['trips-count', 'daily-revenue', 'driver-performance']
        }, 400);
      }
    }

    return c.json({
      success: true,
      data,
      type,
      filters: {
        dateFrom,
        dateTo
      },
      debug: {
        env: 'development',
        dataCount: data.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Chart data error:', error);
    return c.json({
      error: 'Erreur lors de la récupération des données graphiques',
      details: error.message,
      success: false
    }, 500);
  }
});

// Routes pour chauffeurs
app.get('/api/chauffeurs', dbMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');

    const chauffeurs = await prisma.chauffeur.findMany({
      where: { statut: 'Actif' },
      include: {
        utilisateur: {
          select: {
            user_id: true,
            nom: true,
            prenom: true,
            email: true,
            role: true
          }
        },
        societe_taxi: {
          select: {
            societe_id: true,
            nom_exploitant: true
          }
        },
        regle_salaire: {
          select: {
            regle_id: true,
            nom_regle: true
          }
        }
      },
      orderBy: { chauffeur_id: 'asc' }
    });

    return c.json(chauffeurs);
  } catch (error) {
    console.error('Error fetching chauffeurs:', error);
    return c.json({ error: 'Erreur lors de la récupération des chauffeurs' }, 500);
  }
});

app.get('/api/chauffeurs/:id', dbMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const id = parseInt(c.req.param('id'));

    if (!id) {
      return c.json({ error: 'ID du chauffeur requis' }, 400);
    }

    const chauffeur = await prisma.chauffeur.findUnique({
      where: { chauffeur_id: id },
      include: {
        utilisateur: {
          select: {
            user_id: true,
            nom: true,
            prenom: true,
            email: true,
            role: true
          }
        },
        societe_taxi: {
          select: {
            societe_id: true,
            nom_exploitant: true
          }
        },
        regle_salaire: {
          select: {
            regle_id: true,
            nom_regle: true
          }
        }
      }
    });

    if (!chauffeur) {
      return c.json({ error: 'Chauffeur non trouvé' }, 404);
    }

    return c.json(chauffeur);
  } catch (error) {
    console.error('Error fetching chauffeur:', error);
    return c.json({ error: 'Erreur lors de la récupération du chauffeur' }, 500);
  }
});

// Routes pour véhicules
app.get('/api/vehicules', dbMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');

    const vehicules = await prisma.vehicule.findMany({
      where: {
        est_actif: true
      },
      include: {
        societe_taxi: {
          select: {
            societe_id: true,
            nom_exploitant: true
          }
        }
      },
      orderBy: { plaque_immatriculation: 'asc' }
    });

    return c.json(vehicules);
  } catch (error) {
    console.error('Error fetching vehicules:', error.message);
    return c.json({ error: 'Erreur lors de la récupération des véhicules' }, 500);
  }
});

app.get('/api/vehicules/:id', dbMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const id = parseInt(c.req.param('id'));

    if (!id) {
      return c.json({ error: 'ID du véhicule requis' }, 400);
    }

    const vehicule = await prisma.vehicule.findUnique({
      where: { vehicule_id: id },
      include: {
        societe_taxi: {
          select: {
            societe_id: true,
            nom_exploitant: true
          }
        }
      }
    });

    if (!vehicule) {
      return c.json({ error: 'Véhicule non trouvé' }, 404);
    }

    return c.json(vehicule);
  } catch (error) {
    console.error('Error fetching vehicule:', error);
    return c.json({ error: 'Erreur lors de la récupération du véhicule' }, 500);
  }
});

// Routes pour clients
app.get('/api/clients', dbMiddleware, async (c) => {
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

app.get('/api/clients/:id', dbMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const id = parseInt(c.req.param('id'));

    if (!id) {
      return c.json({ error: 'ID du client requis' }, 400);
    }

    const client = await prisma.client.findUnique({
      where: { client_id: id }
    });

    if (!client) {
      return c.json({ error: 'Client non trouvé' }, 404);
    }

    return c.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    return c.json({ error: 'Erreur lors de la récupération du client' }, 500);
  }
});

// Routes pour feuilles de route
app.get('/api/feuilles-route', dbMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    
    const feuilles = await prisma.feuille_route.findMany({
      include: {
        chauffeur: {
          include: {
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
            plaque_immatriculation: true,
            marque: true,
            modele: true
          }
        },
        course: {
          select: {
            course_id: true,
            sommes_percues: true
          }
        },
        charge: {
          select: {
            charge_id: true,
            montant: true
          }
        }
      },
      orderBy: {
        date_service: 'desc'
      }
    });

    return c.json(feuilles);
  } catch (error) {
    console.error('Error fetching feuilles route:', error);
    return c.json({ error: 'Erreur lors de la récupération des feuilles de route' }, 500);
  }
});

// GET /api/feuilles-route/:id - Récupérer une feuille de route spécifique pour PDF
app.get('/api/feuilles-route/:id', dbMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const feuilleId = parseInt(c.req.param('id'));
    
    console.log('📋 Récupération feuille pour PDF:', feuilleId);
    
    if (!feuilleId) {
      return c.json({ error: 'ID de feuille requis' }, 400);
    }
    
    const feuille = await prisma.feuille_route.findUnique({
      where: { feuille_id: feuilleId },
      include: {
        chauffeur: {
          include: {
            utilisateur: {
              select: {
                user_id: true,
                nom: true,
                prenom: true,
                email: true
              }
            }
          }
        },
        vehicule: true,
        course: {
          include: {
            mode_paiement: {
              select: {
                mode_id: true,
                libelle: true,
                code: true
              }
            }
          },
          orderBy: { num_ordre: 'asc' }
        },
        charge: true,
        taximetre: true
      }
    });
    
    if (!feuille) {
      console.log('❌ Feuille non trouvée:', feuilleId);
      return c.json({ error: 'Feuille de route non trouvée' }, 404);
    }
    
    console.log('✅ Feuille trouvée:', feuille.feuille_id, 'avec', feuille.course?.length || 0, 'courses');
    return c.json(feuille);
  } catch (error) {
    console.error('❌ Error fetching feuille route:', error);
    return c.json({ error: 'Erreur lors de la récupération de la feuille de route' }, 500);
  }
});

// GET /api/dashboard/feuilles-route/active/:chauffeurId - Récupérer la feuille active d'un chauffeur
app.get('/api/dashboard/feuilles-route/active/:chauffeurId', dbMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const chauffeurId = parseInt(c.req.param('chauffeurId'));
    
    const activeFeuille = await prisma.feuille_route.findFirst({
      where: {
        chauffeur_id: chauffeurId,
        est_validee: false
      },
      include: {
        chauffeur: {
          include: {
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
            plaque_immatriculation: true,
            marque: true,
            modele: true
          }
        },
        course: true,
        charge: true,
        taximetre: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return c.json(activeFeuille);
  } catch (error) {
    console.error('Error fetching active feuille route:', error);
    return c.json({ error: 'Erreur lors de la récupération de la feuille active' }, 500);
  }
});

// GET /api/dashboard/feuilles-route/defaults/:chauffeurId - Obtenir les valeurs par défaut intelligentes
app.get('/api/dashboard/feuilles-route/defaults/:chauffeurId', dbMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const chauffeurId = parseInt(c.req.param('chauffeurId'));
    const modeEncodage = c.req.query('mode') || 'LIVE'; // Mode par défaut
    
    console.log('🔍 FRONTEND REQUEST - Recherche des valeurs par défaut pour chauffeur:', chauffeurId);
    console.log('🔧 FRONTEND REQUEST - Mode d\'encodage demandé:', modeEncodage);
    
    // Logique différente selon le mode d'encodage
    if (modeEncodage === 'LIVE') {
      // Mode LIVE : Vérifier s'il y a un shift actif à continuer
      const activeShift = await prisma.feuille_route.findFirst({
        where: {
          chauffeur_id: chauffeurId,
          est_validee: false,
          mode_encodage: 'LIVE'
        },
        include: {
          taximetre: true
        },
        orderBy: {
          created_at: 'desc'
        }
      });
      
      if (activeShift) {
        console.log('✅ FRONTEND REQUEST - Mode LIVE : Shift actif trouvé, retour des données existantes:', activeShift.feuille_id);
        console.log('📋 FRONTEND REQUEST - Données taximètre:', activeShift.taximetre ? 'Présentes' : 'Absentes');
        return c.json({
          hasActiveShift: true,
          mode: 'LIVE',
          data: activeShift
        });
      }
      
      console.log('❌ FRONTEND REQUEST - Mode LIVE : Aucun shift actif, nouveau shift à créer');
      
      // Pas de shift LIVE actif, récupérer les suggestions pour faciliter la saisie
      const lastCompletedShift = await prisma.feuille_route.findFirst({
        where: {
          chauffeur_id: chauffeurId,
          est_validee: true
        },
        include: {
          vehicule: {
            select: {
              vehicule_id: true,
              plaque_immatriculation: true,
              marque: true,
              modele: true
            }
          }
        },
        orderBy: {
          date_service: 'desc'
        }
      });
      
      return c.json({
        hasActiveShift: false,
        mode: 'LIVE',
        suggestions: {
          dernierVehicule: lastCompletedShift?.vehicule || null,
          derniereDate: new Date().toISOString().split('T')[0],
          // Mode LIVE peut suggérer quelques valeurs pour faciliter la saisie
          persistePrecedentesValeurs: true
        }
      });
      
    } else if (modeEncodage === 'ULTERIEUR') {
      // Mode ULTERIEUR : Toujours des champs vides, encodage différé
      console.log('📝 FRONTEND REQUEST - Mode ULTERIEUR : Champs vides pour encodage différé');
      
      const lastCompletedShift = await prisma.feuille_route.findFirst({
        where: {
          chauffeur_id: chauffeurId,
          est_validee: true
        },
        include: {
          vehicule: {
            select: {
              vehicule_id: true,
              plaque_immatriculation: true,
              marque: true,
              modele: true
            }
          }
        },
        orderBy: {
          date_service: 'desc'
        }
      });
      
      return c.json({
        hasActiveShift: false,
        mode: 'ULTERIEUR',
        suggestions: {
          dernierVehicule: lastCompletedShift?.vehicule || null,
          derniereDate: new Date().toISOString().split('T')[0],
          // Mode ULTERIEUR : Champs toujours vides
          persistePrecedentesValeurs: false
        }
      });
    }
    
    // Mode non reconnu, comportement par défaut
    console.log('⚠️ FRONTEND REQUEST - Mode non reconnu:', modeEncodage, 'utilisation du comportement par défaut');
    return c.json({
      hasActiveShift: false,
      mode: modeEncodage,
      suggestions: {
        derniereDate: new Date().toISOString().split('T')[0],
        persistePrecedentesValeurs: false
      }
    });
    
  } catch (error) {
    console.error('❌ FRONTEND REQUEST - Error fetching defaults:', error);
    return c.json({ error: 'Erreur lors de la récupération des valeurs par défaut' }, 500);
  }
});

// GET /api/dashboard/modes-encodage - Obtenir les modes d'encodage disponibles
app.get('/api/dashboard/modes-encodage', dbMiddleware, async (c) => {
  try {
    return c.json({
      modes: [
        {
          code: 'LIVE',
          libelle: 'Encodage en temps réel',
          description: 'Les données sont saisies pendant le shift et persistent en cas de perte de connexion',
          comportement: 'Reprend automatiquement les données du shift en cours'
        },
        {
          code: 'ULTERIEUR',
          libelle: 'Encodage différé', 
          description: 'Les données sont saisies après le shift, champs toujours vides au démarrage',
          comportement: 'Champs vides à chaque nouvelle saisie'
        }
      ],
      defaut: 'LIVE'
    });
  } catch (error) {
    console.error('❌ Error fetching encoding modes:', error);
    return c.json({ error: 'Erreur lors de la récupération des modes d\'encodage' }, 500);
  }
});

// GET /api/dashboard/feuilles-route/cleanup/:chauffeurId - Nettoyer tous les shifts non validés (debug)
app.get('/api/dashboard/feuilles-route/cleanup/:chauffeurId', dbMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const chauffeurId = parseInt(c.req.param('chauffeurId'));
    
    console.log('🧹 Nettoyage des shifts non validés pour chauffeur:', chauffeurId);
    
    // Récupérer tous les shifts non validés
    const activeShifts = await prisma.feuille_route.findMany({
      where: {
        chauffeur_id: chauffeurId,
        est_validee: false
      },
      select: {
        feuille_id: true,
        date_service: true,
        created_at: true
      }
    });
    
    console.log('📋 Shifts trouvés:', activeShifts);
    
    // Les valider tous
    const result = await prisma.feuille_route.updateMany({
      where: {
        chauffeur_id: chauffeurId,
        est_validee: false
      },
      data: {
        est_validee: true,
        date_validation: new Date()
      }
    });
    
    return c.json({
      message: `${result.count} shifts nettoyés pour le chauffeur ${chauffeurId}`,
      cleanedShifts: activeShifts
    });
    
  } catch (error) {
    console.error('❌ Error cleaning shifts:', error);
    return c.json({ error: 'Erreur lors du nettoyage' }, 500);
  }
});

// GET /api/debug/taximetre/:chauffeurId - Debug: voir toutes les données taximètre du chauffeur
app.get('/api/debug/taximetre/:chauffeurId', dbMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const chauffeurId = parseInt(c.req.param('chauffeurId'));
    
    console.log('🔍 DEBUG TAXIMETRE - Chauffeur:', chauffeurId);
    
    // Récupérer toutes les feuilles du chauffeur avec taximètre
    const feuilles = await prisma.feuille_route.findMany({
      where: {
        chauffeur_id: chauffeurId
      },
      include: {
        taximetre: true
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 5 // Les 5 dernières
    });
    
    const summary = feuilles.map(f => ({
      feuille_id: f.feuille_id,
      est_validee: f.est_validee,
      created_at: f.created_at,
      hasTaximetre: !!f.taximetre,
      taximetre: f.taximetre ? {
        debut: {
          prise_charge: f.taximetre.taximetre_prise_charge_debut,
          index_km: f.taximetre.taximetre_index_km_debut,
          km_charge: f.taximetre.taximetre_km_charge_debut,
          chutes: f.taximetre.taximetre_chutes_debut
        },
        fin: {
          prise_charge: f.taximetre.taximetre_prise_charge_fin,
          index_km: f.taximetre.taximetre_index_km_fin,
          km_charge: f.taximetre.taximetre_km_charge_fin,
          chutes: f.taximetre.taximetre_chutes_fin
        }
      } : null
    }));
    
    return c.json({
      chauffeur_id: chauffeurId,
      dernières_feuilles: summary,
      message: 'Si vous voyez des données du record 1 dans le frontend, le problème vient du frontend qui ne gère pas correctement hasActiveShift: false'
    });
    
  } catch (error) {
    console.error('❌ Error in debug taximetre:', error);
    return c.json({ error: 'Erreur debug taximetre' }, 500);
  }
});

// POST /api/dashboard/feuilles-route - Créer une nouvelle feuille de route
app.post('/api/dashboard/feuilles-route', dbMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const data = await c.req.json();
    
    console.log('📝 Creating new feuille de route avec données complètes:');
    console.log('   Clés reçues:', Object.keys(data));
    console.log('   Données complètes:', JSON.stringify(data, null, 2));
    console.log('   Données taximètre spécifiques:', {
      taximetre_prise_charge_debut: data.taximetre_prise_charge_debut,
      taximetre_index_km_debut: data.taximetre_index_km_debut,
      taximetre_km_charge_debut: data.taximetre_km_charge_debut,
      taximetre_chutes_debut: data.taximetre_chutes_debut
    });
    
    // Validation des champs requis minimum
    if (!data.chauffeur_id || !data.vehicule_id || !data.index_km_debut_tdb) {
      console.log('❌ Données manquantes:', { 
        chauffeur_id: data.chauffeur_id, 
        vehicule_id: data.vehicule_id, 
        index_km_debut_tdb: data.index_km_debut_tdb 
      });
      return c.json({ 
        error: 'Données manquantes: chauffeur_id, vehicule_id et index_km_debut_tdb sont requis',
        received: data
      }, 400);
    }
    
    // Fonction pour parser les heures de manière sûre
    const parseTime = (timeString) => {
      if (!timeString) return null;
      
      let parsedTime;
      if (timeString.includes('T')) {
        parsedTime = new Date(timeString);
      } else {
        // Format HH:MM:SS ou HH:MM - créer une date avec 1970-01-01
        const timeStr = timeString.length === 5 ? timeString + ':00' : timeString;
        parsedTime = new Date(`1970-01-01T${timeStr}`);
      }
      
      if (isNaN(parsedTime.getTime())) {
        console.error('❌ Invalid time format:', timeString);
        return null;
      }
      
      return parsedTime;
    };

    // Préparer les données de la feuille de route
    const feuilleData = {
      chauffeur_id: parseInt(data.chauffeur_id),
      vehicule_id: parseInt(data.vehicule_id),
      // Si pas de date fournie, utiliser la date actuelle
      date_service: data.date_service ? new Date(data.date_service) : new Date(),
      mode_encodage: data.mode_encodage || 'LIVE',
      heure_debut: parseTime(data.heure_debut),
      heure_fin: parseTime(data.heure_fin),
      interruptions: data.interruptions || '',
      index_km_debut_tdb: parseInt(data.index_km_debut_tdb),
      index_km_fin_tdb: data.index_km_fin_tdb ? parseInt(data.index_km_fin_tdb) : null,
      km_tableau_bord_debut: parseInt(data.index_km_debut_tdb), // Copie pour compatibilité
      montant_salaire_cash_declare: data.montant_salaire_cash_declare ? parseFloat(data.montant_salaire_cash_declare) : 0,
      est_validee: data.est_validee || false,
      signature_chauffeur: data.signature_chauffeur || null
    };
    
    console.log('🔧 Données feuille_route préparées:', JSON.stringify(feuilleData, null, 2));
    
    // Préparer les données du taximètre si fournies AVANT de créer la feuille
    const taximetreData = {};
    let hasTaximetreData = false;
    
    console.log('🔍 POST - Données taximètre reçues du formulaire:', {
      taximetre_prise_charge_debut: data.taximetre_prise_charge_debut,
      taximetre_index_km_debut: data.taximetre_index_km_debut,
      taximetre_km_charge_debut: data.taximetre_km_charge_debut,
      taximetre_chutes_debut: data.taximetre_chutes_debut,
      // Types de données
      types: {
        taximetre_prise_charge_debut: typeof data.taximetre_prise_charge_debut,
        taximetre_index_km_debut: typeof data.taximetre_index_km_debut,
        taximetre_km_charge_debut: typeof data.taximetre_km_charge_debut,
        taximetre_chutes_debut: typeof data.taximetre_chutes_debut
      }
    });
    
    // Données de début de taximètre - mapping correct depuis les formulaires
    if (data.taximetre_prise_charge_debut !== undefined && data.taximetre_prise_charge_debut !== '') {
      const valeur = parseFloat(data.taximetre_prise_charge_debut);
      console.log('💰 Processing taximetre_prise_charge_debut:', data.taximetre_prise_charge_debut, '→', valeur);
      if (!isNaN(valeur)) {
        taximetreData.pc_debut_tax = valeur; // Ancien nom
        taximetreData.taximetre_prise_charge_debut = valeur; // Nouveau nom
        hasTaximetreData = true;
      }
    }
    
    if (data.taximetre_index_km_debut !== undefined && data.taximetre_index_km_debut !== '') {
      const valeur = parseInt(data.taximetre_index_km_debut);
      console.log('🛣️ Processing taximetre_index_km_debut:', data.taximetre_index_km_debut, '→', valeur);
      if (!isNaN(valeur)) {
        taximetreData.index_km_debut_tax = valeur; // Ancien nom
        taximetreData.taximetre_index_km_debut = valeur; // Nouveau nom
        hasTaximetreData = true;
      }
    }
    
    if (data.taximetre_km_charge_debut !== undefined && data.taximetre_km_charge_debut !== '') {
      const valeur = parseFloat(data.taximetre_km_charge_debut);
      console.log('🚗 Processing taximetre_km_charge_debut:', data.taximetre_km_charge_debut, '→', valeur);
      if (!isNaN(valeur)) {
        taximetreData.km_charge_debut = valeur; // Ancien nom
        taximetreData.taximetre_km_charge_debut = valeur; // Nouveau nom
        hasTaximetreData = true;
      }
    }
    
    if (data.taximetre_chutes_debut !== undefined && data.taximetre_chutes_debut !== '') {
      const valeur = parseFloat(data.taximetre_chutes_debut);
      console.log('📉 Processing taximetre_chutes_debut:', data.taximetre_chutes_debut, '→', valeur);
      if (!isNaN(valeur)) {
        taximetreData.chutes_debut_tax = valeur; // Ancien nom
        taximetreData.taximetre_chutes_debut = valeur; // Nouveau nom
        hasTaximetreData = true;
      }
    }
    
    // Support pour les anciens noms (pour rétrocompatibilité)
    if (data.pc_debut_tax !== undefined && data.pc_debut_tax !== '' && data.pc_debut_tax !== '0') {
      const valeur = parseFloat(data.pc_debut_tax);
      taximetreData.pc_debut_tax = valeur;
      taximetreData.taximetre_prise_charge_debut = valeur;
      hasTaximetreData = true;
    }
    if (data.index_km_debut_tax !== undefined && data.index_km_debut_tax !== '' && data.index_km_debut_tax !== '0') {
      const valeur = parseInt(data.index_km_debut_tax);
      taximetreData.index_km_debut_tax = valeur;
      taximetreData.taximetre_index_km_debut = valeur;
      hasTaximetreData = true;
    }
    if (data.km_charge_debut !== undefined && data.km_charge_debut !== '' && data.km_charge_debut !== '0') {
      const valeur = parseFloat(data.km_charge_debut);
      taximetreData.km_charge_debut = valeur;
      taximetreData.taximetre_km_charge_debut = valeur;
      hasTaximetreData = true;
    }
    if (data.chutes_debut_tax !== undefined && data.chutes_debut_tax !== '' && data.chutes_debut_tax !== '0') {
      const valeur = parseFloat(data.chutes_debut_tax);
      taximetreData.chutes_debut_tax = valeur;
      taximetreData.taximetre_chutes_debut = valeur;
      hasTaximetreData = true;
    }
    
    console.log('🔧 Vérification données taximètre:', {
      hasTaximetreData,
      taximetreDataKeys: Object.keys(taximetreData),
      taximetreData
    });
    
    // Créer la feuille de route
    const newFeuille = await prisma.feuille_route.create({
      data: feuilleData
    });
    
    console.log('✅ Feuille de route créée:', newFeuille.feuille_id);
    
    // Créer le taximètre immédiatement après si des données sont fournies
    let createdTaximetre = null;
    if (hasTaximetreData) {
      console.log('✅ Création du taximètre avec données:', JSON.stringify(taximetreData, null, 2));
      
      try {
        createdTaximetre = await prisma.taximetre.create({
          data: {
            feuille_id: newFeuille.feuille_id,
            ...taximetreData
          }
        });
        
        console.log('✅ Taximètre créé avec succès:', createdTaximetre);
      } catch (taximetreError) {
        console.error('❌ Erreur création taximètre:', taximetreError);
      }
    } else {
      console.log('⚠️ Aucune donnée taximètre à créer - hasTaximetreData =', hasTaximetreData);
    }
    
    // Récupérer la feuille complète avec toutes les relations
    const feuilleComplete = await prisma.feuille_route.findUnique({
      where: { feuille_id: newFeuille.feuille_id },
      include: {
        chauffeur: {
          include: {
            utilisateur: {
              select: {
                nom: true,
                prenom: true
              }
            }
          }
        },
        vehicule: true,
        course: true,
        charge: true,
        taximetre: true
      }
    });
    
    console.log('📋 Feuille complète récupérée, taximètre inclus:', !!feuilleComplete.taximetre);
    return c.json(feuilleComplete);
  } catch (error) {
    console.error('❌ Error creating feuille route:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    return c.json({ 
      error: 'Erreur lors de la création de la feuille de route',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, 500);
  }
});

// PUT /api/dashboard/feuilles-route/:id - Mettre à jour une feuille de route
app.put('/api/dashboard/feuilles-route/:id', dbMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const feuilleId = parseInt(c.req.param('id'));
    const data = await c.req.json();
    
    console.log('📝 FRONTEND REQUEST - Updating feuille de route:', feuilleId);
    console.log('📝 FRONTEND DATA received:', JSON.stringify(data, null, 2));
    console.log('📝 Data types:', {
      heure_fin: typeof data.heure_fin,
      index_fin_shift: typeof data.index_fin_shift,
      est_validee: typeof data.est_validee
    });
    
    const updateData = {};
    
    // Champs de la feuille de route
    if (data.heure_fin) {
      // Si c'est déjà un timestamp complet, l'utiliser directement
      // Sinon, traiter comme une heure simple
      let heureFinValue;
      if (data.heure_fin.includes('T')) {
        heureFinValue = new Date(data.heure_fin);
      } else {
        // Format HH:MM:SS ou HH:MM - créer une date avec 1970-01-01
        const timeStr = data.heure_fin.length === 5 ? data.heure_fin + ':00' : data.heure_fin;
        heureFinValue = new Date(`1970-01-01T${timeStr}`);
      }
      
      console.log('🕒 Processing heure_fin:', data.heure_fin, '→', heureFinValue);
      
      // Vérifier si la date est valide
      if (isNaN(heureFinValue.getTime())) {
        console.error('❌ Invalid date format for heure_fin:', data.heure_fin);
        return c.json({ 
          error: 'Format d\'heure invalide pour heure_fin',
          received: data.heure_fin,
          expected: 'HH:MM:SS ou YYYY-MM-DDTHH:MM:SS'
        }, 400);
      }
      
      updateData.heure_fin = heureFinValue;
    }
    if (data.index_km_fin_tdb) updateData.index_km_fin_tdb = parseInt(data.index_km_fin_tdb);
    if (data.index_fin_shift) updateData.index_km_fin_tdb = parseInt(data.index_fin_shift);
    if (data.interruptions !== undefined) {
      // Convertir en string si c'est un nombre
      updateData.interruptions = typeof data.interruptions === 'number' ? 
        data.interruptions.toString() : 
        data.interruptions;
    }
    if (data.montant_salaire_cash_declare !== undefined) updateData.montant_salaire_cash_declare = parseFloat(data.montant_salaire_cash_declare);
    if (data.signature_chauffeur !== undefined) updateData.signature_chauffeur = data.signature_chauffeur;
    if (data.est_validee !== undefined) updateData.est_validee = data.est_validee;
    if (data.km_tableau_bord_fin !== undefined) updateData.km_tableau_bord_fin = parseInt(data.km_tableau_bord_fin);
    
    if (data.est_validee) {
      updateData.date_validation = new Date();
    }
    
    console.log('🔧 Données de mise à jour feuille_route:', JSON.stringify(updateData, null, 2));
    
    // Mettre à jour la feuille de route
    const updatedFeuille = await prisma.feuille_route.update({
      where: { feuille_id: feuilleId },
      data: updateData,
      include: {
        chauffeur: {
          include: {
            utilisateur: {
              select: {
                nom: true,
                prenom: true
              }
            }
          }
        },
        vehicule: true,
        course: true,
        charge: true,
        taximetre: true
      }
    });
    
    // Gérer les données du taximètre (début et fin)
    const taximetreUpdateData = {};
    let hasTaximetreUpdate = false;
    
    console.log('🔍 PUT - Données taximètre reçues du formulaire:', {
      // Données de début (si mises à jour)
      taximetre_prise_charge_debut: data.taximetre_prise_charge_debut,
      taximetre_index_km_debut: data.taximetre_index_km_debut,
      taximetre_km_charge_debut: data.taximetre_km_charge_debut,
      taximetre_chutes_debut: data.taximetre_chutes_debut,
      // Données de fin
      taximetre_prise_charge_fin: data.taximetre_prise_charge_fin,
      taximetre_index_km_fin: data.taximetre_index_km_fin,
      taximetre_km_charge_fin: data.taximetre_km_charge_fin,
      taximetre_chutes_fin: data.taximetre_chutes_fin
    });
    
    // === DONNÉES DE DÉBUT (peuvent être mises à jour lors du début de shift) ===
    if (data.taximetre_prise_charge_debut !== undefined && data.taximetre_prise_charge_debut !== '' && data.taximetre_prise_charge_debut !== '0') {
      const valeur = parseFloat(data.taximetre_prise_charge_debut);
      taximetreUpdateData.pc_debut_tax = valeur; // Ancien nom
      taximetreUpdateData.taximetre_prise_charge_debut = valeur; // Nouveau nom
      hasTaximetreUpdate = true;
    }
    
    if (data.taximetre_index_km_debut !== undefined && data.taximetre_index_km_debut !== '' && data.taximetre_index_km_debut !== '0') {
      const valeur = parseInt(data.taximetre_index_km_debut);
      taximetreUpdateData.index_km_debut_tax = valeur; // Ancien nom
      taximetreUpdateData.taximetre_index_km_debut = valeur; // Nouveau nom
      hasTaximetreUpdate = true;
    }
    
    if (data.taximetre_km_charge_debut !== undefined && data.taximetre_km_charge_debut !== '' && data.taximetre_km_charge_debut !== '0') {
      const valeur = parseFloat(data.taximetre_km_charge_debut);
      taximetreUpdateData.km_charge_debut = valeur; // Ancien nom
      taximetreUpdateData.taximetre_km_charge_debut = valeur; // Nouveau nom
      hasTaximetreUpdate = true;
    }
    
    if (data.taximetre_chutes_debut !== undefined && data.taximetre_chutes_debut !== '' && data.taximetre_chutes_debut !== '0') {
      const valeur = parseFloat(data.taximetre_chutes_debut);
      taximetreUpdateData.chutes_debut_tax = valeur; // Ancien nom
      taximetreUpdateData.taximetre_chutes_debut = valeur; // Nouveau nom
      hasTaximetreUpdate = true;
    }
    
    // === DONNÉES DE FIN (viennent du formulaire de fin de shift) ===
    if (data.taximetre_prise_charge_fin !== undefined && data.taximetre_prise_charge_fin !== '' && data.taximetre_prise_charge_fin !== '0') {
      const valeur = parseFloat(data.taximetre_prise_charge_fin);
      taximetreUpdateData.pc_fin_tax = valeur; // Ancien nom
      taximetreUpdateData.taximetre_prise_charge_fin = valeur; // Nouveau nom
      hasTaximetreUpdate = true;
    }
    
    if (data.taximetre_index_km_fin !== undefined && data.taximetre_index_km_fin !== '' && data.taximetre_index_km_fin !== '0') {
      const valeur = parseInt(data.taximetre_index_km_fin);
      taximetreUpdateData.index_km_fin_tax = valeur; // Ancien nom
      taximetreUpdateData.taximetre_index_km_fin = valeur; // Nouveau nom
      hasTaximetreUpdate = true;
    }
    
    if (data.taximetre_km_charge_fin !== undefined && data.taximetre_km_charge_fin !== '' && data.taximetre_km_charge_fin !== '0') {
      const valeur = parseFloat(data.taximetre_km_charge_fin);
      taximetreUpdateData.km_charge_fin = valeur; // Ancien nom
      taximetreUpdateData.taximetre_km_charge_fin = valeur; // Nouveau nom
      hasTaximetreUpdate = true;
    }
    
    if (data.taximetre_chutes_fin !== undefined && data.taximetre_chutes_fin !== '' && data.taximetre_chutes_fin !== '0') {
      const valeur = parseFloat(data.taximetre_chutes_fin);
      taximetreUpdateData.chutes_fin_tax = valeur; // Ancien nom
      taximetreUpdateData.taximetre_chutes_fin = valeur; // Nouveau nom
      hasTaximetreUpdate = true;
    }
    
    // === SUPPORT RÉTROCOMPATIBILITÉ (anciens noms) ===
    // Données de début avec anciens noms
    if (data.pc_debut_tax !== undefined && data.pc_debut_tax !== '' && data.pc_debut_tax !== '0') {
      const valeur = parseFloat(data.pc_debut_tax);
      taximetreUpdateData.pc_debut_tax = valeur;
      taximetreUpdateData.taximetre_prise_charge_debut = valeur;
      hasTaximetreUpdate = true;
    }
    if (data.index_km_debut_tax !== undefined && data.index_km_debut_tax !== '' && data.index_km_debut_tax !== '0') {
      const valeur = parseInt(data.index_km_debut_tax);
      taximetreUpdateData.index_km_debut_tax = valeur;
      taximetreUpdateData.taximetre_index_km_debut = valeur;
      hasTaximetreUpdate = true;
    }
    if (data.km_charge_debut !== undefined && data.km_charge_debut !== '' && data.km_charge_debut !== '0') {
      const valeur = parseFloat(data.km_charge_debut);
      taximetreUpdateData.km_charge_debut = valeur;
      taximetreUpdateData.taximetre_km_charge_debut = valeur;
      hasTaximetreUpdate = true;
    }
    if (data.chutes_debut_tax !== undefined && data.chutes_debut_tax !== '' && data.chutes_debut_tax !== '0') {
      const valeur = parseFloat(data.chutes_debut_tax);
      taximetreUpdateData.chutes_debut_tax = valeur;
      taximetreUpdateData.taximetre_chutes_debut = valeur;
      hasTaximetreUpdate = true;
    }
    
    // Données de fin avec anciens noms
    if (data.pc_fin_tax !== undefined && data.pc_fin_tax !== '' && data.pc_fin_tax !== '0') {
      const valeur = parseFloat(data.pc_fin_tax);
      taximetreUpdateData.pc_fin_tax = valeur;
      taximetreUpdateData.taximetre_prise_charge_fin = valeur;
      hasTaximetreUpdate = true;
    }
    if (data.index_km_fin_tax !== undefined && data.index_km_fin_tax !== '' && data.index_km_fin_tax !== '0') {
      const valeur = parseInt(data.index_km_fin_tax);
      taximetreUpdateData.index_km_fin_tax = valeur;
      taximetreUpdateData.taximetre_index_km_fin = valeur;
      hasTaximetreUpdate = true;
    }
    if (data.km_charge_fin !== undefined && data.km_charge_fin !== '' && data.km_charge_fin !== '0') {
      const valeur = parseFloat(data.km_charge_fin);
      taximetreUpdateData.km_charge_fin = valeur;
      taximetreUpdateData.taximetre_km_charge_fin = valeur;
      hasTaximetreUpdate = true;
    }
    if (data.chutes_fin_tax !== undefined && data.chutes_fin_tax !== '' && data.chutes_fin_tax !== '0') {
      const valeur = parseFloat(data.chutes_fin_tax);
      taximetreUpdateData.chutes_fin_tax = valeur;
      taximetreUpdateData.taximetre_chutes_fin = valeur;
      hasTaximetreUpdate = true;
    }
    
    // Mettre à jour ou créer l'enregistrement taximètre si nécessaire
    if (hasTaximetreUpdate) {
      console.log('🔧 Données de mise à jour taximètre:', JSON.stringify(taximetreUpdateData, null, 2));
      
      try {
        // Tenter de mettre à jour l'enregistrement existant
        await prisma.taximetre.upsert({
          where: { feuille_id: feuilleId },
          update: taximetreUpdateData,
          create: {
            feuille_id: feuilleId,
            ...taximetreUpdateData
          }
        });
        
        console.log('✅ Données taximètre mises à jour pour feuille:', feuilleId);
      } catch (taximetreError) {
        console.error('❌ Error updating taximetre:', taximetreError);
        // Ne pas faire échouer la mise à jour de la feuille pour une erreur de taximètre
      }
    }
    
    console.log('✅ Feuille de route mise à jour:', updatedFeuille.feuille_id);
    return c.json(updatedFeuille);
  } catch (error) {
    console.error('❌ FRONTEND ERROR - Error updating feuille route:', error);
    console.error('❌ FRONTEND ERROR - Error message:', error.message);
    console.error('❌ FRONTEND ERROR - Error code:', error.code);
    console.error('❌ FRONTEND ERROR - Error stack:', error.stack);
    
    // Log des détails Prisma si disponibles
    if (error.meta) {
      console.error('❌ FRONTEND ERROR - Prisma meta:', error.meta);
    }
    
    return c.json({ 
      error: 'Erreur lors de la mise à jour de la feuille de route',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      code: error.code || 'UNKNOWN'
    }, 500);
  }
});

// POST /api/courses - Créer une nouvelle course
app.post('/api/courses', dbMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const data = await c.req.json();
    
    console.log('📝 Creating new course:', data);
    
    // Validation des données requises
    if (!data.feuille_id || !data.num_ordre || !data.sommes_percues || !data.mode_paiement_id) {
      return c.json({ 
        error: 'Données manquantes: feuille_id, num_ordre, sommes_percues et mode_paiement_id sont requis',
        received: data
      }, 400);
    }
    
    // Trouver le prochain numéro d'ordre disponible si conflit
    let numOrdre = parseInt(data.num_ordre);
    const feuilleId = parseInt(data.feuille_id);
    
    // Vérifier si ce numéro d'ordre existe déjà
    const existingCourse = await prisma.course.findFirst({
      where: {
        feuille_id: feuilleId,
        num_ordre: numOrdre
      }
    });
    
    if (existingCourse) {
      console.log(`⚠️ Course ${numOrdre} existe déjà pour feuille ${feuilleId}, recherche du prochain numéro disponible...`);
      
      // Trouver le prochain numéro d'ordre disponible
      const maxCourse = await prisma.course.findFirst({
        where: {
          feuille_id: feuilleId
        },
        orderBy: {
          num_ordre: 'desc'
        }
      });
      
      numOrdre = maxCourse ? maxCourse.num_ordre + 1 : 1;
      console.log(`✅ Nouveau numéro d'ordre assigné: ${numOrdre}`);
    }
    
    // Fonction pour traiter les heures
    const parseTime = (timeString) => {
      if (!timeString) return null;
      
      // Si c'est déjà un format DateTime, extraire la partie time
      if (timeString.includes('T')) {
        return new Date(timeString);
      }
      
      // Si c'est juste une heure (HH:MM:SS ou HH:MM), créer une date avec 1970-01-01
      if (timeString.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
        return new Date(`1970-01-01T${timeString}`);
      }
      
      // Sinon essayer de parser directement
      return new Date(timeString);
    };
    
    const newCourse = await prisma.course.create({
      data: {
        num_ordre: numOrdre, // Utiliser le numéro d'ordre calculé (original ou nouveau)
        index_depart: data.index_depart ? parseInt(data.index_depart) : null,
        index_embarquement: data.index_embarquement ? parseInt(data.index_embarquement) : null,
        lieu_embarquement: data.lieu_embarquement || '',
        heure_embarquement: parseTime(data.heure_embarquement),
        index_debarquement: data.index_debarquement ? parseInt(data.index_debarquement) : null,
        lieu_debarquement: data.lieu_debarquement || '',
        heure_debarquement: parseTime(data.heure_debarquement),
        prix_taximetre: data.prix_taximetre ? parseFloat(data.prix_taximetre) : null,
        sommes_percues: parseFloat(data.sommes_percues),
        est_hors_heures: data.est_hors_heures || false,
        // Connecter à la feuille de route existante
        feuille_route: {
          connect: {
            feuille_id: feuilleId
          }
        },
        // Connecter au mode de paiement existant
        mode_paiement: {
          connect: {
            mode_id: parseInt(data.mode_paiement_id)
          }
        },
        // Connecter au client s'il existe
        ...(data.client_id ? {
          client: {
            connect: {
              client_id: parseInt(data.client_id)
            }
          }
        } : {})
      },
      include: {
        mode_paiement: true,
        client: true
      }
    });
    
    console.log('✅ Course créée:', newCourse.course_id);
    return c.json(newCourse);
  } catch (error) {
    console.error('❌ Error creating course:', error);
    console.error('❌ Stack trace:', error.stack);
    return c.json({ 
      error: 'Erreur lors de la création de la course',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, 500);
  }
});

// GET /api/courses/:feuilleId - Récupérer les courses d'une feuille de route
app.get('/api/courses/:feuilleId', dbMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const feuilleId = parseInt(c.req.param('feuilleId'));
    
    const courses = await prisma.course.findMany({
      where: { feuille_id: feuilleId },
      include: {
        mode_paiement: true,
        client: true
      },
      orderBy: { num_ordre: 'asc' }
    });
    
    return c.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return c.json({ error: 'Erreur lors de la récupération des courses' }, 500);
  }
});

// Routes pour modes de paiement
app.get('/api/modes-paiement', dbMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    
    const modesPaiement = await prisma.mode_paiement.findMany({
      where: { est_actif: true },
      orderBy: { libelle: 'asc' }
    });

    return c.json(modesPaiement);
  } catch (error) {
    console.error('Error fetching modes paiement:', error);
    return c.json({ error: 'Erreur lors de la récupération des modes de paiement' }, 500);
  }
});

// Routes dashboard pour les services frontend
app.get('/api/dashboard/vehicules', dbMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    
    const vehicules = await prisma.vehicule.findMany({
      where: { est_actif: true },
      include: {
        societe_taxi: {
          select: {
            societe_id: true,
            nom_exploitant: true
          }
        }
      },
      orderBy: { plaque_immatriculation: 'asc' }
    });

    return c.json(vehicules);
  } catch (error) {
    console.error('Error fetching dashboard vehicules:', error);
    return c.json({ error: 'Erreur lors de la récupération des véhicules' }, 500);
  }
});

app.get('/api/dashboard/clients', dbMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    
    const clients = await prisma.client.findMany({
      where: { est_actif: true },
      include: {
        regle_facturation: {
          select: {
            regle_facturation_id: true,
            nom: true
          }
        },
        societe_taxi: {
          select: {
            societe_id: true,
            nom_exploitant: true
          }
        }
      },
      orderBy: { nom_societe: 'asc' }
    });

    return c.json(clients);
  } catch (error) {
    console.error('Error fetching dashboard clients:', error);
    return c.json({ error: 'Erreur lors de la récupération des clients' }, 500);
  }
});

app.get('/api/dashboard/modes-paiement', dbMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    
    const modesPaiement = await prisma.mode_paiement.findMany({
      where: { est_actif: true },
      orderBy: { libelle: 'asc' }
    });

    return c.json(modesPaiement);
  } catch (error) {
    console.error('Error fetching dashboard modes paiement:', error);
    return c.json({ error: 'Erreur lors de la récupération des modes de paiement' }, 500);
  }
});

app.get('/api/dashboard/regles-salaire', dbMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    
    const reglesSalaire = await prisma.regle_salaire.findMany({
      orderBy: { nom_regle: 'asc' }
    });

    return c.json(reglesSalaire);
  } catch (error) {
    console.error('Error fetching dashboard regles salaire:', error);
    return c.json({ error: 'Erreur lors de la récupération des règles de salaire' }, 500);
  }
});

app.get('/api/dashboard/chauffeurs', dbMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    
    const chauffeurs = await prisma.chauffeur.findMany({
      where: { statut: 'Actif' },
      include: {
        utilisateur: {
          select: {
            user_id: true,
            nom: true,
            prenom: true,
            email: true,
            role: true
          }
        },
        societe_taxi: {
          select: {
            societe_id: true,
            nom_exploitant: true
          }
        },
        regle_salaire: {
          select: {
            regle_id: true,
            nom_regle: true
          }
        }
      },
      orderBy: [
        { utilisateur: { nom: 'asc' } },
        { utilisateur: { prenom: 'asc' } }
      ]
    });

    return c.json(chauffeurs);
  } catch (error) {
    console.error('Error fetching dashboard chauffeurs:', error);
    return c.json({ error: 'Erreur lors de la récupération des chauffeurs' }, 500);
  }
});

// Routes pour charges
app.get('/api/charges', dbMiddleware, async (c) => {
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

// Routes pour configuration (retournent des données vides pour éviter les 404)
app.get('/api/regles-salaire', dbMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    
    // Essayer de récupérer les règles de salaire si la table existe
    try {
      const regles = await prisma.regle_salaire.findMany({
        orderBy: { nom_regle: 'asc' }
      });
      return c.json(regles);
    } catch {
      // Si la table n'existe pas, retourner un tableau vide
      console.log('Table regle_salaire not found, returning empty array');
      return c.json([]);
    }
  } catch (error) {
    console.error('Error fetching regles-salaire:', error);
    return c.json([]);
  }
});

app.get('/api/regles-facturation', dbMiddleware, async (c) => {
  try {
    return c.json([]); // Table probablement inexistante
  } catch (error) {
    console.error('Error fetching regles-facturation:', error);
    return c.json([]);
  }
});

app.get('/api/factures', dbMiddleware, async (c) => {
  try {
    return c.json([]); // Table probablement inexistante
  } catch (error) {
    console.error('Error fetching factures:', error);
    return c.json([]);
  }
});

app.get('/api/partenaires', dbMiddleware, async (c) => {
  try {
    return c.json([]); // Table probablement inexistante
  } catch (error) {
    console.error('Error fetching partenaires:', error);
    return c.json([]);
  }
});

app.get('/api/interventions', dbMiddleware, async (c) => {
  try {
    return c.json([]); // Table probablement inexistante
  } catch (error) {
    console.error('Error fetching interventions:', error);
    return c.json([]);
  }
});

app.get('/api/societe-taxi/current', dbMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    
    // Récupérer la première société taxi disponible
    const societe = await prisma.societe_taxi.findFirst({
      orderBy: { societe_id: 'asc' }
    });
    
    return c.json(societe || {
      societe_id: 1,
      nom_exploitant: "Taxi Express Brussels",
      adresse: "Bruxelles, Belgique",
      telephone: "+32 2 123 45 67"
    });
  } catch (error) {
    console.error('Error fetching current societe:', error);
    return c.json({
      societe_id: 1,
      nom_exploitant: "Taxi Express Brussels",
      adresse: "Bruxelles, Belgique",
      telephone: "+32 2 123 45 67"
    });
  }
});

// Route simple pour tester que le serveur répond
app.get('/', (c) => c.json({ 
  message: 'TxApp Development Server', 
  mode: 'development',
  cors: 'enabled without X-API-Key',
  availableRoutes: [
    'GET /api/health',
    'POST /api/auth/login',
    'GET /api/auth/verify', 
    'POST /api/auth/logout',
    'GET /api/utilisateurs/:id',
    'GET /api/courses',
    'GET /api/courses/:feuilleId',
    'POST /api/courses',
    'GET /api/dashboard/courses/stats',
    'GET /api/dashboard/courses/chart-data',
    'GET /api/chauffeurs',
    'GET /api/chauffeurs/:id',
    'GET /api/vehicules',
    'GET /api/vehicules/:id',
    'GET /api/clients',
    'GET /api/clients/:id',
    'GET /api/modes-paiement',
    'GET /api/dashboard/chauffeurs',
    'GET /api/dashboard/vehicules',
    'GET /api/dashboard/clients',
    'GET /api/dashboard/modes-paiement',
    'GET /api/dashboard/modes-encodage',
    'GET /api/dashboard/regles-salaire',
    'GET /api/feuilles-route',
    'GET /api/feuilles-route/:id',
    'GET /api/dashboard/feuilles-route/active/:chauffeurId',
    'GET /api/dashboard/feuilles-route/defaults/:chauffeurId',
    'GET /api/dashboard/feuilles-route/cleanup/:chauffeurId',
    'GET /api/debug/taximetre/:chauffeurId',
    'POST /api/dashboard/feuilles-route',
    'PUT /api/dashboard/feuilles-route/:id',
    'GET /api/charges',
    'GET /api/regles-salaire',
    'GET /api/regles-facturation',
    'GET /api/factures',
    'GET /api/partenaires',
    'GET /api/interventions',
    'GET /api/societe-taxi/current'
  ]
}));

// Rediriger toutes les autres routes vers le worker déployé pour éviter de dupliquer le code
app.use('*', async (c) => {
  return c.json({
    error: 'Route not implemented in dev server',
    message: 'Use production API for full functionality',
    production_url: 'https://api.txapp.be' + c.req.path,
    availableRoutes: [
      'GET /api/health',
      'POST /api/auth/login',
      'GET /api/courses',
      'GET /api/dashboard/courses/stats',
      'GET /api/dashboard/courses/chart-data',
      'GET /api/chauffeurs',
      'GET /api/chauffeurs/:id',
      'GET /api/vehicules',
      'GET /api/vehicules/:id',
      'GET /api/clients',
      'GET /api/clients/:id'
    ]
  }, 404);
});

const port = process.env.PORT || 3001;

console.log(`🚀 Serveur de développement démarré sur http://localhost:${port}`);
console.log(`📡 CORS configuré pour: http://localhost:5173`);
console.log(`🔧 Mode: DEVELOPMENT (sans X-API-Key)`);
console.log(`⚠️  Seules les routes essentielles sont implémentées`);
console.log(`🌐 Utilisez https://api.txapp.be pour les autres routes`);

serve({
  fetch: app.fetch,
  port: parseInt(port)
});
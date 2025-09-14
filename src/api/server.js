import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import prisma, { testDatabaseConnection, getDatabaseHealth } from '../configs/database.config.js';
import { monitor, monitoringMiddleware } from '../configs/monitoring.config.js';

const app = express();

// Démarrer le monitoring en production
if (process.env.NODE_ENV === 'production') {
  monitor.start();
}

// Compression middleware pour optimiser les réponses
app.use(compression());

// Logging middleware conditionnel
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Middleware de monitoring pour toutes les requêtes
app.use(monitoringMiddleware);

// Security middleware amélioré
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://jfrhzwtkfotsrjkacrns.supabase.co", "wss://jfrhzwtkfotsrjkacrns.supabase.co"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting amélioré
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: {
    error: 'Trop de requêtes',
    message: 'Veuillez réessayer dans 15 minutes',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Exclure les health checks du rate limiting
    return req.path === '/health' || req.path === '/api/health';
  }
});
app.use('/api/', limiter);

// CORS configuration pour production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.CORS_ORIGIN, 'https://www.txapp.be']
    : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Body parsing avec validation
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      console.error('Erreur de parsing JSON:', e.message);
      res.status(400).json({ error: 'JSON invalide' });
      throw new Error('JSON invalide');
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de gestion d'erreurs global
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err.stack);

  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({
      error: 'Erreur interne du serveur',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(500).json({
      error: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check endpoints améliorés
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await getDatabaseHealth();
    const monitorStatus = monitor.getStatus();

    res.status(dbHealth.status === 'healthy' ? 200 : 503).json({
      status: dbHealth.status === 'healthy' ? 'OK' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: dbHealth,
      monitoring: {
        uptime: monitorStatus.uptime,
        requests: monitorStatus.requests,
        errorRate: monitorStatus.errorRate,
        recentAlerts: monitorStatus.recentAlerts.length
      },
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        platform: process.platform,
        nodeVersion: process.version
      }
    });
  } catch (error) {
    console.error('Erreur lors du health check:', error.message);
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// Endpoint de monitoring détaillé (accès restreint)
app.get('/api/monitoring/status', async (req, res) => {
  try {
    // Vérification d'autorisation basique (à améliorer avec votre système d'auth)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token d\'autorisation requis' });
    }

    const monitorStatus = monitor.getStatus();
    res.json(monitorStatus);
  } catch (error) {
    console.error('Erreur lors de la récupération du statut:', error.message);
    res.status(500).json({ error: 'Erreur lors de la récupération du statut' });
  }
});

// API prefix pour toutes les routes
const router = express.Router();

// Middleware de validation de connexion DB pour les routes API
router.use(async (req, res, next) => {
  try {
    // Test rapide de la connexion DB
    await prisma.$queryRaw`SELECT 1`;
    next();
  } catch (error) {
    console.error('Erreur de connexion DB:', error);
    res.status(503).json({
      error: 'Service temporairement indisponible',
      message: 'Problème de connexion à la base de données'
    });
  }
});

// Fonction pour calculer les métriques d'un chauffeur
async function calculateChauffeurMetrics(chauffeur) {
  try {
    const feuillesRoute = chauffeur.feuille_route || [];

    // Calculer les métriques
    let totalCourses = 0;
    let totalChiffreAffaires = 0;
    let totalTaximetre = 0;
    let totalKmParcourus = 0;
    let totalDepenses = 0;
    let courses = [];

    feuillesRoute.forEach(feuille => {
      // Courses de cette feuille de route
      if (feuille.course && Array.isArray(feuille.course)) {
        feuille.course.forEach(course => {
          totalCourses++;
          totalChiffreAffaires += parseFloat(course.somme_percue || 0);
          totalTaximetre += parseFloat(course.prix_taximetre || 0);
          totalKmParcourus += parseInt(course.distance_km || 0);

          courses.push({
            id: course.id,
            date: course.heure_embarquement,
            depart: course.lieu_embarquement,
            arrivee: course.lieu_debarquement,
            index_depart: course.index_depart, // Ajouter l'index de départ
            index_arrivee: course.index_arrivee, // Ajouter l'index d'arrivée
            prix_taximetre: parseFloat(course.prix_taximetre || 0),
            somme_percue: parseFloat(course.somme_percue || 0),
            distance_km: parseInt(course.distance_km || 0),
            ratio_euro_km: parseFloat(course.ratio_euro_km || 0),
            client: course.client ? `${course.client.prenom} ${course.client.nom}` : null,
            mode_paiement: course.mode_paiement ? course.mode_paiement.libelle : null
          });
        });
      }

      // Charges de cette feuille de route
      if (feuille.charge && Array.isArray(feuille.charge)) {
        feuille.charge.forEach(charge => {
          totalDepenses += parseFloat(charge.montant || 0);
        });
      }

      // Km parcourus de la feuille de route (si pas déjà compté dans les courses)
      if (feuille.km_parcourus && totalKmParcourus === 0) {
        totalKmParcourus = parseInt(feuille.km_parcourus);
      }
    });

    // Calculs supplémentaires
    const differenceRecettes = totalChiffreAffaires - totalTaximetre;
    const beneficeNet = totalChiffreAffaires - totalDepenses;
    const ratioEuroKm = totalKmParcourus > 0 ? totalChiffreAffaires / totalKmParcourus : 0;

    // Trouver l'index km début de la feuille active
    const feuilleActive = feuillesRoute.find(f => f.statut === 'En cours');
    const indexKmDebut = feuilleActive ? feuilleActive.km_debut : null;

    return {
      chiffre_affaires_total: totalChiffreAffaires,
      nombre_total_courses: totalCourses,
      km_parcourus: totalKmParcourus,
      ratio_euro_km: ratioEuroKm,
      index_km_debut: indexKmDebut,
      verification_taximetre: totalTaximetre,
      total_taximetre: totalTaximetre,
      total_feuille_route: totalChiffreAffaires,
      difference_total_recettes: differenceRecettes,
      total_depenses: totalDepenses,
      benefice_net: beneficeNet,
      nb_courses: totalCourses,
      courses: courses
    };
  } catch (error) {
    console.error('Erreur lors du calcul des métriques:', error);
    return {
      chiffre_affaires_total: 0,
      nombre_total_courses: 0,
      km_parcourus: 0,
      ratio_euro_km: 0,
      index_km_debut: null,
      verification_taximetre: 0,
      total_taximetre: 0,
      total_feuille_route: 0,
      difference_total_recettes: 0,
      total_depenses: 0,
      benefice_net: 0,
      nb_courses: 0,
      courses: []
    };
  }
}

// Routes pour chauffeurs avec pagination et filtrage
router.get('/chauffeurs', async (req, res) => {
  try {
    const { page = 1, limit = 50, search, actif = 'true' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      actif: actif === 'true',
      ...(search && {
        OR: [
          { numero_badge: { contains: search, mode: 'insensitive' } },
          { utilisateur: { nom: { contains: search, mode: 'insensitive' } } },
          { utilisateur: { prenom: { contains: search, mode: 'insensitive' } } }
        ]
      })
    };

    const [chauffeursBase, total] = await Promise.all([
      prisma.chauffeur.findMany({
        where,
        include: {
          utilisateur: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              telephone: true,
              email: true
            }
          },
          regle_salaire: true,
          feuille_route: {
            include: {
              vehicule: {
                select: {
                  id: true,
                  plaque_immatriculation: true,
                  marque: true,
                  modele: true,
                  etat: true
                }
              },
              course: {
                include: {
                  mode_paiement: true,
                  client: {
                    select: {
                      id: true,
                      nom: true,
                      prenom: true
                    }
                  }
                }
              },
              charge: {
                include: {
                  mode_paiement: true
                }
              }
            }
          }
        },
        orderBy: { numero_badge: 'asc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.chauffeur.count({ where })
    ]);

    // Calculer les métriques pour chaque chauffeur
    const chauffeurs = await Promise.all(
      chauffeursBase.map(async (chauffeur) => {
        const metrics = await calculateChauffeurMetrics(chauffeur);
        return {
          ...chauffeur,
          metrics: metrics
        };
      })
    );

    res.json({
      data: chauffeurs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des chauffeurs:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des chauffeurs',
      timestamp: new Date().toISOString()
    });
  }
});

// Route pour mettre à jour un chauffeur
router.put('/chauffeurs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const chauffeur = await prisma.chauffeur.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            telephone: true,
            email: true
          }
        },
        regle_salaire: true
      }
    });

    res.json({
      success: true,
      data: chauffeur,
      message: 'Chauffeur mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du chauffeur:', error.message);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour du chauffeur',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Route pour récupérer un chauffeur spécifique
router.get('/chauffeurs/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const chauffeur = await prisma.chauffeur.findUnique({
      where: { id: parseInt(id) },
      include: {
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            telephone: true,
            email: true
          }
        },
        regle_salaire: true,
        vehicules: {
          include: {
            vehicule: true
          }
        },
        feuille_route: {
          include: {
            vehicule: true
          }
        }
      }
    });

    if (!chauffeur) {
      return res.status(404).json({
        error: 'Chauffeur non trouvé',
        timestamp: new Date().toISOString()
      });
    }

    res.json(chauffeur);
  } catch (error) {
    console.error('Erreur lors de la récupération du chauffeur:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération du chauffeur',
      timestamp: new Date().toISOString()
    });
  }
});

// Routes pour véhicules avec pagination
router.get('/vehicules', async (req, res) => {
  try {
    const { page = 1, limit = 50, etat } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = etat
      ? { etat }
      : { etat: { in: ['Disponible', 'En service'] } };

    const [vehicules, total] = await Promise.all([
      prisma.vehicule.findMany({
        where,
        orderBy: { plaque_immatriculation: 'asc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.vehicule.count({ where })
    ]);

    res.json({
      data: vehicules,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des véhicules:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des véhicules',
      timestamp: new Date().toISOString()
    });
  }
});

// Récupérer un véhicule par ID
router.get('/vehicules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const vehicule = await prisma.vehicule.findUnique({
      where: { id: parseInt(id) }
    });
    res.json(vehicule);
  } catch (error) {
    console.error('Erreur lors de la récupération du véhicule:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Routes pour règles de salaire
router.get('/regles-salaire', async (req, res) => {
  try {
    const { page = 1, limit = 50, search, actif = 'true' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      actif: actif === 'true',
      ...(search && {
        OR: [
          { nom: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { type_regle: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [reglesSalaire, total] = await Promise.all([
      prisma.regle_salaire.findMany({
        where,
        orderBy: { nom: 'asc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.regle_salaire.count({ where })
    ]);

    res.json({
      data: reglesSalaire,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des règles de salaire:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des règles de salaire',
      timestamp: new Date().toISOString()
    });
  }
});

// Récupérer une règle de salaire par ID
router.get('/regles-salaire/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const regleSalaire = await prisma.regle_salaire.findUnique({
      where: { id: parseInt(id) }
    });

    if (!regleSalaire) {
      return res.status(404).json({ error: 'Règle de salaire non trouvée' });
    }

    res.json(regleSalaire);
  } catch (error) {
    console.error('Erreur lors de la récupération de la règle de salaire:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération de la règle de salaire',
      timestamp: new Date().toISOString()
    });
  }
});

// Mettre à jour un véhicule
router.put('/vehicules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const vehicule = await prisma.vehicule.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updated_at: new Date()
      }
    });
    res.json(vehicule);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du véhicule:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// Routes pour clients
router.get('/clients', async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      where: { actif: true },
      orderBy: { nom: 'asc' }
    });
    res.json(clients);
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Routes pour modes de paiement
router.get('/modes-paiement', async (req, res) => {
  try {
    const modes = await prisma.mode_paiement.findMany({
      where: { actif: true },
      orderBy: { libelle: 'asc' }
    });
    res.json(modes);
  } catch (error) {
    console.error('Erreur lors de la récupération des modes de paiement:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Routes pour feuilles de route
router.get('/feuilles-route', async (req, res) => {
  try {
    const { chauffeur_id } = req.query;
    const where = chauffeur_id ? { chauffeur_id: parseInt(chauffeur_id) } : {};

    const feuillesRoute = await prisma.feuille_route.findMany({
      where,
      include: {
        chauffeur: { include: { utilisateur: true } },
        vehicule: true,
        course: { include: { client: true, mode_paiement: true } }
      },
      orderBy: { created_at: 'desc' }
    });
    res.json({ data: feuillesRoute });
  } catch (error) {
    console.error('Erreur lors de la récupération des feuilles de route:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/feuilles-route/active/:chauffeurId', async (req, res) => {
  try {
    const { chauffeurId } = req.params;
    const feuilleRoute = await prisma.feuille_route.findFirst({
      where: {
        chauffeur_id: parseInt(chauffeurId),
        statut: 'En cours'
      },
      include: {
        chauffeur: { include: { utilisateur: true } },
        vehicule: true,
        course: { include: { client: true, mode_paiement: true } }
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(feuilleRoute);
  } catch (error) {
    console.error('Erreur lors de la récupération de la feuille de route active:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/feuilles-route', async (req, res) => {
  try {
    const data = req.body;
    const feuilleRoute = await prisma.feuille_route.create({
      data: {
        chauffeur_id: data.chauffeur_id,
        vehicule_id: data.vehicule_id,
        date: new Date(data.date),
        heure_debut: data.heure_debut,
        km_debut: parseInt(data.km_debut),
        prise_en_charge_debut: data.prise_en_charge_debut ? parseFloat(data.prise_en_charge_debut) : null,
        chutes_debut: data.chutes_debut ? parseFloat(data.chutes_debut) : null,
        statut: 'En cours',
        saisie_mode: 'chauffeur',
        notes: data.notes || null
      },
      include: {
        chauffeur: { include: { utilisateur: true } },
        vehicule: true
      }
    });
    res.json(feuilleRoute);
  } catch (error) {
    console.error('Erreur lors de la création de la feuille de route:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.put('/feuilles-route/:id/end', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const feuilleRoute = await prisma.feuille_route.update({
      where: { id: parseInt(id) },
      data: {
        heure_fin: data.heure_fin,
        km_fin: parseInt(data.km_fin),
        prise_en_charge_fin: data.prise_en_charge_fin ? parseFloat(data.prise_en_charge_fin) : null,
        chutes_fin: data.chutes_fin ? parseFloat(data.chutes_fin) : null,
        statut: 'Terminé',
        notes: data.notes,
        updated_at: new Date()
      },
      include: {
        chauffeur: { include: { utilisateur: true } },
        vehicule: true,
        course: { include: { client: true, mode_paiement: true } }
      }
    });
    res.json(feuilleRoute);
  } catch (error) {
    console.error('Erreur lors de la finalisation de la feuille de route:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Routes pour courses
router.get('/courses', async (req, res) => {
  try {
    const { feuilleRouteId } = req.query;
    const where = feuilleRouteId ? { feuille_route_id: parseInt(feuilleRouteId) } : {};

    const courses = await prisma.course.findMany({
      where,
      include: {
        client: true,
        mode_paiement: true,
        feuille_route: {
          include: {
            chauffeur: { include: { utilisateur: true } },
            vehicule: true
          }
        }
      },
      orderBy: { numero_ordre: 'asc' }
    });
    res.json(courses);
  } catch (error) {
    console.error('Erreur lors de la récupération des courses:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/courses', async (req, res) => {
  try {
    const data = req.body;
    const course = await prisma.course.create({
      data: {
        feuille_route_id: data.feuille_route_id,
        client_id: data.client_id || null,
        mode_paiement_id: data.mode_paiement_id || null,
        numero_ordre: data.numero_ordre,
        index_depart: parseInt(data.index_embarquement) || 0,
        lieu_embarquement: data.lieu_embarquement,
        heure_embarquement: new Date(data.heure_embarquement),
        index_arrivee: parseInt(data.index_debarquement) || 0,
        lieu_debarquement: data.lieu_debarquement,
        heure_debarquement: data.heure_debarquement ? new Date(data.heure_debarquement) : null,
        prix_taximetre: parseFloat(data.prix_taximetre) || 0,
        somme_percue: parseFloat(data.sommes_percues) || 0,
        hors_creneau: data.hors_creneau || false,
        notes: data.notes || null
      },
      include: {
        client: true,
        mode_paiement: true,
        feuille_route: true
      }
    });
    res.json(course);
  } catch (error) {
    console.error('Erreur serveur:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.put('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const course = await prisma.course.update({
      where: { id: parseInt(id) },
      data: {
        client_id: data.client_id || null,
        mode_paiement_id: data.mode_paiement_id || null,
        numero_ordre: data.numero_ordre,
        index_depart: parseInt(data.index_embarquement) || 0,
        lieu_embarquement: data.lieu_embarquement,
        heure_embarquement: new Date(data.heure_embarquement),
        index_arrivee: parseInt(data.index_debarquement) || 0,
        lieu_debarquement: data.lieu_debarquement,
        heure_debarquement: data.heure_debarquement ? new Date(data.heure_debarquement) : null,
        prix_taximetre: parseFloat(data.prix_taximetre) || 0,
        somme_percue: parseFloat(data.sommes_percues) || 0,
        hors_creneau: data.hors_creneau || false,
        notes: data.notes || null,
        updated_at: new Date()
      },
      include: {
        client: true,
        mode_paiement: true,
        feuille_route: true
      }
    });
    res.json(course);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la course:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.course.delete({
      where: { id: parseInt(id) }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de la course:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Routes pour charges
router.get('/charges', async (req, res) => {
  try {
    const { feuilleRouteId } = req.query;
    const charges = await prisma.charge.findMany({
      where: { feuille_route_id: parseInt(feuilleRouteId) },
      include: { mode_paiement: true },
      orderBy: { created_at: 'desc' }
    });
    res.json(charges);
  } catch (error) {
    console.error('Erreur lors de la récupération des charges:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/charges', async (req, res) => {
  try {
    const data = req.body;
    const charge = await prisma.charge.create({
      data: {
        feuille_route_id: data.feuille_route_id,
        type_charge: data.type_charge,
        description: data.description,
        montant: parseFloat(data.montant),
        date: new Date(data.date || new Date()),
        mode_paiement_id: data.mode_paiement_id || null,
        justificatif: data.justificatif || null,
        notes: data.notes || null
      },
      include: { mode_paiement: true }
    });
    res.json(charge);
  } catch (error) {
    console.error('Erreur lors de la création de la charge:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Mount API routes
app.use('/api', router);

// Route 404 pour l'API
// app.use('/api/*', (req, res) => {
//   res.status(404).json({
//     error: 'Route non trouvée',
//     path: req.path,
//     method: req.method,
//     timestamp: new Date().toISOString()
//   });
// });

// Initialisation du serveur avec test de connexion DB
const startServer = async () => {
  try {
    console.log('🚀 Démarrage du serveur...');

    // Test de la connexion à la base de données au démarrage
    console.log('🔄 Test de connexion à la base de données...');
    const dbConnected = await testDatabaseConnection();
    console.log('📊 Résultat test DB:', dbConnected);

    if (!dbConnected) {
      console.error('❌ Impossible de se connecter à la base de données');
      process.exit(1);
    }

    // Routes pour le dashboard
    app.get('/api/dashboard/courses', async (req, res) => {
      try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Récupérer les courses avec pagination
        const courses = await prisma.course.findMany({
          skip: offset,
          take: limit,
          orderBy: {
            created_at: 'desc'
          },
          include: {
            client: {
              select: {
                id: true,
                nom: true,
                prenom: true
              }
            },
            feuille_route: {
              select: {
                id: true,
                date: true,
                heure_debut: true,
                heure_fin: true,
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
                },
                vehicule: {
                  select: {
                    id: true,
                    plaque_immatriculation: true,
                    marque: true,
                    modele: true
                  }
                }
              }
            },
            mode_paiement: {
              select: {
                id: true,
                libelle: true
              }
            }
          }
        });

        // Compter le nombre total de courses
        const total = await prisma.course.count();

        res.json({
          courses,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        });
      } catch (error) {
        console.error('Error fetching dashboard courses:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des courses du dashboard' });
      }
    });

    // Route pour les statistiques des courses
    app.get('/api/dashboard/courses/stats', async (req, res) => {
      try {
        const { dateFrom, dateTo, chauffeurId } = req.query;

        // Construire les conditions de filtrage
        const where = {};
        if (dateFrom || dateTo) {
          where.created_at = {};
          if (dateFrom) where.created_at.gte = new Date(dateFrom);
          if (dateTo) where.created_at.lte = new Date(dateTo);
        }
        if (chauffeurId) {
          where.feuille_route = {
            chauffeur_id: parseInt(chauffeurId)
          };
        }

        // Récupérer les statistiques
        const [
          totalCourses,
          totalRevenue,
          totalDistance,
          chauffeursActifs,
          vehiculesUtilises
        ] = await Promise.all([
          // Nombre total de courses
          prisma.course.count({ where }),

          // Revenus totaux (somme des montants)
          prisma.course.aggregate({
            where,
            _sum: { somme_percue: true }
          }).then(result => result._sum.somme_percue || 0),

          // Distance totale (somme des distances)
          prisma.course.aggregate({
            where,
            _sum: { distance_km: true }
          }).then(result => result._sum.distance_km || 0),

          // Nombre de chauffeurs actifs
          prisma.course.findMany({
            where,
            select: {
              feuille_route: {
                select: {
                  chauffeur_id: true
                }
              }
            }
          }).then(courses => {
            const chauffeurIds = [...new Set(
              courses
                .filter(c => c.feuille_route?.chauffeur_id)
                .map(c => c.feuille_route.chauffeur_id)
            )];
            return chauffeurIds.length;
          }),

          // Nombre de véhicules utilisés
          prisma.course.findMany({
            where,
            select: {
              feuille_route: {
                select: {
                  vehicule_id: true
                }
              }
            }
          }).then(courses => {
            const vehiculeIds = [...new Set(
              courses
                .filter(c => c.feuille_route?.vehicule_id)
                .map(c => c.feuille_route.vehicule_id)
            )];
            return vehiculeIds.length;
          })
        ]);

        // Calculer les moyennes
        const averageEarningsPerTrip = totalCourses > 0 ? Number(totalRevenue) / totalCourses : 0;
        const averageDistancePerTrip = totalCourses > 0 ? totalDistance / totalCourses : 0;

        // Convertir les valeurs en nombres et formater la réponse
        const response = {
          totalCourses,
          totalRevenue: Number(totalRevenue),
          totalDistance,
          chauffeursActifs,
          vehiculesUtilises,
          averageEarningsPerTrip: Math.round(averageEarningsPerTrip * 100) / 100,
          averageDistancePerTrip: Math.round(averageDistancePerTrip * 100) / 100
        };

        res.json(response);
      } catch (error) {
        console.error('Error fetching dashboard courses stats:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des statistiques des courses' });
      }
    });

    // Route pour les données de graphique
    app.get('/api/dashboard/courses/chart-data', async (req, res) => {
      try {
        const { dateFrom, dateTo, type } = req.query;

        // Construire les conditions de filtrage
        const where = {};
        if (dateFrom || dateTo) {
          where.created_at = {};
          if (dateFrom) where.created_at.gte = new Date(dateFrom);
          if (dateTo) where.created_at.lte = new Date(dateTo);
        }

        let data = [];

        switch (type) {
          case 'trips-count':
            // Nombre de courses par jour
            data = await prisma.$queryRaw`
              SELECT
                DATE(created_at) as date,
                COUNT(*) as count
              FROM course
              WHERE ${dateFrom ? prisma.course.fields.created_at.gte(new Date(dateFrom)) : true}
                AND ${dateTo ? prisma.course.fields.created_at.lte(new Date(dateTo)) : true}
              GROUP BY DATE(created_at)
              ORDER BY DATE(created_at)
            `;
            break;

          case 'daily-revenue':
            // Revenus quotidiens
            data = await prisma.$queryRaw`
              SELECT
                DATE(created_at) as date,
                SUM(somme_percue) as revenue
              FROM course
              WHERE ${dateFrom ? prisma.course.fields.created_at.gte(new Date(dateFrom)) : true}
                AND ${dateTo ? prisma.course.fields.created_at.lte(new Date(dateTo)) : true}
              GROUP BY DATE(created_at)
              ORDER BY DATE(created_at)
            `;
            break;

          case 'payment-methods': {
            // Distribution des méthodes de paiement
            data = await prisma.course.groupBy({
              by: ['mode_paiement_id'],
              where,
              _count: {
                id: true,
              },
            });

            // Récupérer les libellés séparément
            const paymentMethods = await prisma.mode_paiement.findMany({
              where: {
                id: {
                  in: data.map(item => item.mode_paiement_id).filter(id => id !== null)
                }
              },
              select: {
                id: true,
                libelle: true,
              },
            });

            // Combiner les données
            data = data.map(item => ({
              ...item,
              mode_paiement: paymentMethods.find(pm => pm.id === item.mode_paiement_id),
            }));
            break;
          }

          case 'driver-performance': {
            // Performance des chauffeurs
            const driverWhere = {};
            if (dateFrom || dateTo) {
              driverWhere.created_at = {};
              if (dateFrom) driverWhere.created_at.gte = new Date(dateFrom);
              if (dateTo) driverWhere.created_at.lte = new Date(dateTo);
            }

            data = await prisma.course.groupBy({
              by: ['feuille_route_id'],
              where: driverWhere,
              _count: {
                id: true,
              },
              _sum: {
                somme_percue: true,
              },
            });

            // Récupérer les informations des chauffeurs
            const feuilleRoutes = await prisma.feuille_route.findMany({
              where: {
                id: {
                  in: data.map(item => item.feuille_route_id)
                }
              },
              include: {
                chauffeur: {
                  include: {
                    utilisateur: {
                      select: {
                        nom: true,
                        prenom: true,
                      },
                    },
                  },
                },
              },
            });

            // Combiner les données
            data = data.map(item => {
              const feuilleRoute = feuilleRoutes.find(fr => fr.id === item.feuille_route_id);
              return {
                nom: feuilleRoute?.chauffeur?.utilisateur?.nom,
                prenom: feuilleRoute?.chauffeur?.utilisateur?.prenom,
                trips_count: item._count.id,
                total_revenue: item._sum.somme_percue,
                avg_revenue: item._count.id > 0 ? item._sum.somme_percue / item._count.id : 0,
              };
            }).filter(item => item.nom && item.prenom); // Filtrer les entrées valides
            break;
          }

          default:
            return res.status(400).json({ error: 'Type de graphique non supporté' });
        }

        // Convertir les BigInt en nombres et les chaînes numériques en nombres pour la sérialisation JSON
        const serializedData = JSON.parse(JSON.stringify(data, (key, value) => {
          if (typeof value === 'bigint') {
            return Number(value);
          }
          // Convertir les chaînes qui représentent des nombres
          if (typeof value === 'string' && !isNaN(value) && value.trim() !== '') {
            const numValue = Number(value);
            // Vérifier si c'est un nombre entier ou décimal
            if (numValue % 1 === 0) {
              return parseInt(value, 10);
            } else {
              return numValue;
            }
          }
          return value;
        }));

        res.json({ data: serializedData });
      } catch (error) {
        console.error('Error fetching dashboard courses chart data:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des données de graphique' });
      }
    });

    const PORT = process.env.PORT || 3001;
    const HOST = process.env.HOST || '0.0.0.0';
    console.log(`🌐 Configuration: ${HOST}:${PORT}`);

    const server = app.listen(PORT, HOST, () => {
      console.log(`✅ Serveur API démarré sur ${HOST}:${PORT}`);
      console.log(`🌍 Environnement: ${process.env.NODE_ENV}`);
      console.log(`📊 Health check: http://${HOST}:${PORT}/health`);
    });

    // Gestion des erreurs du serveur
    server.on('error', (error) => {
      console.error('❌ Erreur du serveur:', error);
      process.exit(1);
    });

    // Gestion des signaux d'arrêt
    process.on('SIGINT', () => {
      console.log('\n🛑 Arrêt du serveur...');
      server.close(() => {
        console.log('✅ Serveur arrêté');
        process.exit(0);
      });
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Arrêt du serveur...');
      server.close(() => {
        console.log('✅ Serveur arrêté');
        process.exit(0);
      });
    });

    return server;
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

startServer();

export default app;

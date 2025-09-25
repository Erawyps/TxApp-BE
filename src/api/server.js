import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import Joi from 'joi';
import prisma, { testDatabaseConnection, getDatabaseHealth } from '../configs/database.config.js';
import { monitor, monitoringMiddleware } from '../configs/monitoring.config.js';

// Import des nouvelles routes Prisma
import prismaRoutes from './prismaRoutes.js';

// Import des middlewares personnalisés
import {
  authenticateToken,
  requireRole,
  requireOwnership,
  optionalAuth
} from '../middlewares/auth.middleware.js';
import {
  validateRequest,
  validateParams,
  chauffeurValidation,
  vehiculeValidation,
  clientValidation,
  courseValidation,
  chargeValidation,
  feuilleRouteValidation,
  paramValidation
} from '../middlewares/validation.middleware.js';
import {
  errorHandler,
  notFoundHandler,
  requestLogger,
  rateLimiter
} from '../middlewares/error.middleware.js';

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
    : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174', 'http://localhost:3000', 'https://txapp.be', 'https://www.txapp.be'],
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
    let totalPourboires = 0;
    let courses = [];

    feuillesRoute.forEach(feuille => {
      // Calculer les km parcourus depuis la feuille de route (km_fin - km_debut)
      if (feuille.km_fin && feuille.km_debut) {
        totalKmParcourus += (feuille.km_fin - feuille.km_debut);
      }

      // Courses de cette feuille de route
      if (feuille.course && Array.isArray(feuille.course)) {
        feuille.course.forEach(course => {
          // Ne compter que les courses non annulées
          if (course.statut !== 'Annulee') {
            totalCourses++;
            const sommePercue = parseFloat(course.somme_percue || 0);
            const prixTaximetre = parseFloat(course.prix_taximetre || 0);
            const pourboire = parseFloat(course.pourboire || 0);

            totalChiffreAffaires += sommePercue;
            totalTaximetre += prixTaximetre;
            totalPourboires += pourboire;

            courses.push({
              id: course.id,
              date: course.heure_embarquement,
              depart: course.lieu_embarquement,
              arrivee: course.lieu_debarquement,
              index_depart: course.index_depart,
              index_arrivee: course.index_arrivee,
              prix_taximetre: prixTaximetre,
              somme_percue: sommePercue,
              pourboire: pourboire,
              statut: course.statut,
              client: course.client ? `${course.client.prenom} ${course.client.nom}` : null,
              mode_paiement: course.mode_paiement ? course.mode_paiement.libelle : null
            });
          }
        });
      }

      // Charges de cette feuille de route
      if (feuille.charge && Array.isArray(feuille.charge)) {
        feuille.charge.forEach(charge => {
          totalDepenses += parseFloat(charge.montant || 0);
        });
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
      ratio_euro_km: Math.round(ratioEuroKm * 100) / 100, // Arrondi à 2 décimales
      index_km_debut: indexKmDebut,
      verification_taximetre: totalTaximetre,
      total_taximetre: totalTaximetre,
      total_feuille_route: totalChiffreAffaires,
      difference_total_recettes: differenceRecettes,
      total_depenses: totalDepenses,
      benefice_net: beneficeNet,
      total_pourboires: totalPourboires,
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
router.put('/chauffeurs/:id',
  authenticateToken,
  validateParams(paramValidation.id),
  validateRequest(chauffeurValidation.update),
  requireRole('admin'),
  async (req, res) => {
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

// Route pour créer un chauffeur
router.post('/chauffeurs',
  authenticateToken,
  requireRole('admin'),
  validateRequest(chauffeurValidation.create),
  async (req, res) => {
  try {
    const chauffeurData = req.body;

    const chauffeur = await prisma.chauffeur.create({
      data: {
        utilisateur_id: chauffeurData.utilisateur_id,
        regle_salaire_id: chauffeurData.regle_salaire_id || null,
        numero_badge: chauffeurData.numero_badge,
        date_embauche: new Date(chauffeurData.date_embauche),
        date_fin_contrat: chauffeurData.date_fin_contrat ? new Date(chauffeurData.date_fin_contrat) : null,
        type_contrat: chauffeurData.type_contrat || null,
        compte_bancaire: chauffeurData.compte_bancaire || null,
        taux_commission: chauffeurData.taux_commission ? parseFloat(chauffeurData.taux_commission) : 0.00,
        salaire_base: chauffeurData.salaire_base ? parseFloat(chauffeurData.salaire_base) : 0.00,
        notes: chauffeurData.notes || null,
        actif: chauffeurData.actif !== undefined ? chauffeurData.actif : true
      },
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

    res.status(201).json({
      success: true,
      data: chauffeur,
      message: 'Chauffeur créé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création du chauffeur:', error.message);
    res.status(500).json({
      error: 'Erreur lors de la création du chauffeur',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Route pour supprimer un chauffeur
router.delete('/chauffeurs/:id',
  authenticateToken,
  validateParams(paramValidation.id),
  requireRole('admin'),
  async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que le chauffeur existe
    const chauffeur = await prisma.chauffeur.findUnique({
      where: { id: parseInt(id) },
      include: {
        feuille_route: {
          where: { statut: 'En cours' }
        }
      }
    });

    if (!chauffeur) {
      return res.status(404).json({
        error: 'Chauffeur non trouvé',
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier qu'il n'a pas de feuille de route en cours
    if (chauffeur.feuille_route && chauffeur.feuille_route.length > 0) {
      return res.status(400).json({
        error: 'Suppression impossible',
        message: 'Le chauffeur a des feuilles de route en cours',
        timestamp: new Date().toISOString()
      });
    }

    // Supprimer le chauffeur (cascade vers les relations)
    await prisma.chauffeur.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Chauffeur supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du chauffeur:', error.message);
    res.status(500).json({
      error: 'Erreur lors de la suppression du chauffeur',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Route pour récupérer les statistiques d'un chauffeur (avec ratio €/km)
router.get('/chauffeurs/:id/stats',
  authenticateToken,
  validateParams(paramValidation.id),
  async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    // Construire les filtres de date
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    } else if (startDate) {
      dateFilter.date = {
        gte: new Date(startDate)
      };
    } else if (endDate) {
      dateFilter.date = {
        lte: new Date(endDate)
      };
    }

    // Récupérer le chauffeur avec ses feuilles de route et courses
    const chauffeur = await prisma.chauffeur.findUnique({
      where: { id: parseInt(id) },
      include: {
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true
          }
        },
        feuille_route: {
          where: dateFilter,
          include: {
            course: {
              where: {
                statut: { not: 'Annulee' } // Exclure les courses annulées
              },
              include: {
                mode_paiement: true
              }
            },
            charge: true
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

    // Calculer les statistiques
    let totalRecettes = 0;
    let totalKm = 0;
    let totalCourses = 0;
    let totalPourboires = 0;
    let totalDepenses = 0;

    chauffeur.feuille_route.forEach(fe => {
      // Calculer les km parcourus (km_fin - km_debut)
      if (fe.km_fin && fe.km_debut) {
        totalKm += (fe.km_fin - fe.km_debut);
      }

      // Calculer les recettes des courses
      fe.course.forEach(course => {
        totalRecettes += course.somme_percue || 0;
        totalPourboires += course.pourboire || 0;
        totalCourses++;
      });

      // Calculer les dépenses (charges)
      fe.charge.forEach(charge => {
        totalDepenses += charge.montant || 0;
      });
    });

    // Calculer le ratio €/km
    const ratioEuroParKm = totalKm > 0 ? totalRecettes / totalKm : 0;

    // Calculer le bénéfice net
    const beneficeNet = totalRecettes - totalDepenses;

    const stats = {
      chauffeur: {
        id: chauffeur.id,
        nom: chauffeur.utilisateur.nom,
        prenom: chauffeur.utilisateur.prenom,
        numero_badge: chauffeur.numero_badge
      },
      periode: {
        startDate: startDate || null,
        endDate: endDate || null
      },
      metriques: {
        total_recettes: totalRecettes,
        total_km: totalKm,
        ratio_euro_par_km: Math.round(ratioEuroParKm * 100) / 100, // Arrondi à 2 décimales
        nombre_courses: totalCourses,
        total_pourboires: totalPourboires,
        total_depenses: totalDepenses,
        benefice_net: beneficeNet
      },
      details: {
        feuilles_route_analysees: chauffeur.feuille_route.length,
        courses_valides: totalCourses
      }
    };

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques chauffeur:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des statistiques chauffeur',
      details: error.message,
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

// Route pour créer un véhicule
router.post('/vehicules',
  authenticateToken,
  requireRole('admin'),
  validateRequest(vehiculeValidation.create),
  async (req, res) => {
  try {
    const vehiculeData = req.body;

    const vehicule = await prisma.vehicule.create({
      data: {
        plaque_immatriculation: vehiculeData.plaque_immatriculation,
        numero_identification: vehiculeData.numero_identification,
        marque: vehiculeData.marque,
        modele: vehiculeData.modele,
        annee: parseInt(vehiculeData.annee),
        type_vehicule: vehiculeData.type_vehicule || null,
        couleur: vehiculeData.couleur || null,
        date_mise_circulation: new Date(vehiculeData.date_mise_circulation),
        date_dernier_controle: vehiculeData.date_dernier_controle ? new Date(vehiculeData.date_dernier_controle) : null,
        capacite: vehiculeData.capacite ? parseInt(vehiculeData.capacite) : 4,
        carburant: vehiculeData.carburant || null,
        consommation: vehiculeData.consommation ? parseFloat(vehiculeData.consommation) : null,
        etat: vehiculeData.etat || 'Disponible',
        notes: vehiculeData.notes || null
      }
    });

    res.status(201).json({
      success: true,
      data: vehicule,
      message: 'Véhicule créé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création du véhicule:', error.message);
    res.status(500).json({
      error: 'Erreur lors de la création du véhicule',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Route pour supprimer un véhicule
router.delete('/vehicules/:id',
  authenticateToken,
  validateParams(paramValidation.id),
  requireRole('admin'),
  async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que le véhicule existe
    const vehicule = await prisma.vehicule.findUnique({
      where: { id: parseInt(id) },
      include: {
        feuille_route: {
          where: { statut: 'En cours' }
        }
      }
    });

    if (!vehicule) {
      return res.status(404).json({
        error: 'Véhicule non trouvé',
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier qu'il n'est pas utilisé dans une feuille de route en cours
    if (vehicule.feuille_route && vehicule.feuille_route.length > 0) {
      return res.status(400).json({
        error: 'Suppression impossible',
        message: 'Le véhicule est utilisé dans une feuille de route en cours',
        timestamp: new Date().toISOString()
      });
    }

    // Supprimer le véhicule (cascade vers les relations)
    await prisma.vehicule.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Véhicule supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du véhicule:', error.message);
    res.status(500).json({
      error: 'Erreur lors de la suppression du véhicule',
      details: error.message,
      timestamp: new Date().toISOString()
    });
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

// Route pour créer une règle de salaire
router.post('/regles-salaire', async (req, res) => {
  try {
    const regleData = req.body;

    // Validation des données requises
    if (!regleData.nom || !regleData.type_regle) {
      return res.status(400).json({
        error: 'Données manquantes',
        message: 'nom et type_regle sont requis',
        timestamp: new Date().toISOString()
      });
    }

    const regleSalaire = await prisma.regle_salaire.create({
      data: {
        nom: regleData.nom,
        description: regleData.description || null,
        type_regle: regleData.type_regle,
        taux_fixe: regleData.taux_fixe ? parseFloat(regleData.taux_fixe) : null,
        taux_variable: regleData.taux_variable ? parseFloat(regleData.taux_variable) : null,
        seuil: regleData.seuil ? parseFloat(regleData.seuil) : null,
        heure_debut: regleData.heure_debut ? new Date(`1970-01-01T${regleData.heure_debut}`) : null,
        heure_fin: regleData.heure_fin ? new Date(`1970-01-01T${regleData.heure_fin}`) : null,
        jours_semaine: regleData.jours_semaine || '1,2,3,4,5',
        actif: regleData.actif !== undefined ? regleData.actif : true
      }
    });

    res.status(201).json({
      success: true,
      data: regleSalaire,
      message: 'Règle de salaire créée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création de la règle de salaire:', error.message);
    res.status(500).json({
      error: 'Erreur lors de la création de la règle de salaire',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Route pour mettre à jour une règle de salaire
router.put('/regles-salaire/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const regleSalaire = await prisma.regle_salaire.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        updated_at: new Date()
      }
    });

    res.json({
      success: true,
      data: regleSalaire,
      message: 'Règle de salaire mise à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la règle de salaire:', error.message);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour de la règle de salaire',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Route pour supprimer une règle de salaire
router.delete('/regles-salaire/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que la règle de salaire existe
    const regleSalaire = await prisma.regle_salaire.findUnique({
      where: { id: parseInt(id) },
      include: {
        chauffeur: true
      }
    });

    if (!regleSalaire) {
      return res.status(404).json({
        error: 'Règle de salaire non trouvée',
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier qu'elle n'est pas utilisée par des chauffeurs
    if (regleSalaire.chauffeur && regleSalaire.chauffeur.length > 0) {
      return res.status(400).json({
        error: 'Suppression impossible',
        message: 'La règle de salaire est utilisée par des chauffeurs',
        timestamp: new Date().toISOString()
      });
    }

    // Désactiver la règle de salaire au lieu de la supprimer
    await prisma.regle_salaire.update({
      where: { id: parseInt(id) },
      data: {
        actif: false,
        updated_at: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Règle de salaire désactivée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la règle de salaire:', error.message);
    res.status(500).json({
      error: 'Erreur lors de la suppression de la règle de salaire',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Mettre à jour un véhicule
router.put('/vehicules/:id',
  authenticateToken,
  validateParams(paramValidation.id),
  validateRequest(vehiculeValidation.update),
  requireRole('admin'),
  async (req, res) => {
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

// Route pour récupérer un client par ID
router.get('/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await prisma.client.findUnique({
      where: { id: parseInt(id) }
    });

    if (!client) {
      return res.status(404).json({
        error: 'Client non trouvé',
        timestamp: new Date().toISOString()
      });
    }

    res.json(client);
  } catch (error) {
    console.error('Erreur lors de la récupération du client:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération du client',
      timestamp: new Date().toISOString()
    });
  }
});

// Route pour créer un client
router.post('/clients',
  authenticateToken,
  requireRole('admin', 'chauffeur'),
  validateRequest(clientValidation.create),
  async (req, res) => {
  try {
    const clientData = req.body;

    const client = await prisma.client.create({
      data: {
        type_client: clientData.type_client,
        nom: clientData.nom,
        prenom: clientData.prenom || null,
        telephone: clientData.telephone,
        email: clientData.email || null,
        adresse: clientData.adresse || null,
        ville: clientData.ville || null,
        code_postal: clientData.code_postal || null,
        pays: clientData.pays || 'Belgique',
        num_tva: clientData.num_tva || null,
        periode_facturation: clientData.periode_facturation || 'Mensuelle',
        mode_facturation: clientData.mode_facturation || 'Simple',
        procedure_envoi: clientData.procedure_envoi || null,
        adresse_facturation_diff: clientData.adresse_facturation_diff || false,
        adresse_facturation: clientData.adresse_facturation || null,
        notes: clientData.notes || null,
        actif: clientData.actif !== undefined ? clientData.actif : true
      }
    });

    res.status(201).json({
      success: true,
      data: client,
      message: 'Client créé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création du client:', error.message);
    res.status(500).json({
      error: 'Erreur lors de la création du client',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Route pour mettre à jour un client
router.put('/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const client = await prisma.client.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        updated_at: new Date()
      }
    });

    res.json({
      success: true,
      data: client,
      message: 'Client mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du client:', error.message);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour du client',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Route pour supprimer un client
router.delete('/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que le client existe
    const client = await prisma.client.findUnique({
      where: { id: parseInt(id) },
      include: {
        course: true
      }
    });

    if (!client) {
      return res.status(404).json({
        error: 'Client non trouvé',
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier qu'il n'a pas de courses associées
    if (client.course && client.course.length > 0) {
      return res.status(400).json({
        error: 'Suppression impossible',
        message: 'Le client a des courses associées',
        timestamp: new Date().toISOString()
      });
    }

    // Désactiver le client au lieu de le supprimer
    await prisma.client.update({
      where: { id: parseInt(id) },
      data: {
        actif: false,
        updated_at: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Client désactivé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du client:', error.message);
    res.status(500).json({
      error: 'Erreur lors de la suppression du client',
      details: error.message,
      timestamp: new Date().toISOString()
    });
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

// Route pour récupérer un mode de paiement par ID
router.get('/modes-paiement/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mode = await prisma.mode_paiement.findUnique({
      where: { id: parseInt(id) }
    });

    if (!mode) {
      return res.status(404).json({
        error: 'Mode de paiement non trouvé',
        timestamp: new Date().toISOString()
      });
    }

    res.json(mode);
  } catch (error) {
    console.error('Erreur lors de la récupération du mode de paiement:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération du mode de paiement',
      timestamp: new Date().toISOString()
    });
  }
});

// Route pour créer un mode de paiement
router.post('/modes-paiement', async (req, res) => {
  try {
    const modeData = req.body;

    // Validation des données requises
    if (!modeData.code || !modeData.libelle || !modeData.type_paiement) {
      return res.status(400).json({
        error: 'Données manquantes',
        message: 'code, libelle et type_paiement sont requis',
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier que le code est unique
    const existingMode = await prisma.mode_paiement.findUnique({
      where: { code: modeData.code }
    });

    if (existingMode) {
      return res.status(400).json({
        error: 'Code déjà utilisé',
        message: 'Un mode de paiement avec ce code existe déjà',
        timestamp: new Date().toISOString()
      });
    }

    const mode = await prisma.mode_paiement.create({
      data: {
        code: modeData.code,
        libelle: modeData.libelle,
        type_paiement: modeData.type_paiement,
        facturation_requise: modeData.facturation_requise || false,
        tva_applicable: modeData.tva_applicable !== undefined ? modeData.tva_applicable : true,
        actif: modeData.actif !== undefined ? modeData.actif : true
      }
    });

    res.status(201).json({
      success: true,
      data: mode,
      message: 'Mode de paiement créé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création du mode de paiement:', error.message);
    res.status(500).json({
      error: 'Erreur lors de la création du mode de paiement',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Route pour mettre à jour un mode de paiement
router.put('/modes-paiement/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const mode = await prisma.mode_paiement.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        updated_at: new Date()
      }
    });

    res.json({
      success: true,
      data: mode,
      message: 'Mode de paiement mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du mode de paiement:', error.message);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour du mode de paiement',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Route pour supprimer un mode de paiement
router.delete('/modes-paiement/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que le mode de paiement existe
    const mode = await prisma.mode_paiement.findUnique({
      where: { id: parseInt(id) },
      include: {
        course: true,
        charge: true,
        paiement_salaire: true
      }
    });

    if (!mode) {
      return res.status(404).json({
        error: 'Mode de paiement non trouvé',
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier qu'il n'est pas utilisé
    const hasUsage = (mode.course && mode.course.length > 0) ||
                     (mode.charge && mode.charge.length > 0) ||
                     (mode.paiement_salaire && mode.paiement_salaire.length > 0);

    if (hasUsage) {
      return res.status(400).json({
        error: 'Suppression impossible',
        message: 'Le mode de paiement est utilisé dans des courses, charges ou paiements de salaire',
        timestamp: new Date().toISOString()
      });
    }

    // Désactiver le mode de paiement au lieu de le supprimer
    await prisma.mode_paiement.update({
      where: { id: parseInt(id) },
      data: {
        actif: false,
        updated_at: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Mode de paiement désactivé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du mode de paiement:', error.message);
    res.status(500).json({
      error: 'Erreur lors de la suppression du mode de paiement',
      details: error.message,
      timestamp: new Date().toISOString()
    });
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

router.post('/feuilles-route',
  authenticateToken,
  async (req, res) => {
  try {
    const data = req.body;
    const userRole = req.user.role;

    // Utiliser la validation chauffeur si c'est un chauffeur, sinon validation standard
    const validationSchema = userRole === 'chauffeur' ? feuilleRouteValidation.chauffeur : feuilleRouteValidation.create;
    const { error } = validationSchema.validate(data, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        error: 'Données de validation invalides',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        })),
        timestamp: new Date().toISOString()
      });
    }

    const feuilleRoute = await prisma.feuille_route.create({
      data: {
        chauffeur_id: data.chauffeur_id,
        vehicule_id: data.vehicule_id,
        date: new Date(data.date),
        heure_debut: data.heure_debut,
        km_debut: data.km_debut,
        km_en_charge_debut: data.km_en_charge_debut || null,
        compteur_total_debut: data.compteur_total_debut || null,
        prise_en_charge_debut: data.prise_en_charge_debut || null,
        chutes_debut: data.chutes_debut || null,
        statut: 'En cours',
        saisie_mode: 'chauffeur',
        notes: data.notes || null
      },
      include: {
        chauffeur: { include: { utilisateur: true } },
        vehicule: true
      }
    });

    res.status(201).json({
      success: true,
      data: feuilleRoute,
      message: 'Feuille de route créée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création de la feuille de route:', error);
    res.status(500).json({
      error: 'Erreur lors de la création de la feuille de route',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

router.put('/feuilles-route/:id/end',
  authenticateToken,
  async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const userRole = req.user.role;

    // Utiliser la validation chauffeur si c'est un chauffeur, sinon validation standard
    const validationSchema = userRole === 'chauffeur' ? feuilleRouteValidation.chauffeur : feuilleRouteValidation.end;
    const { error } = validationSchema.validate(data, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        error: 'Données de validation invalides',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        })),
        timestamp: new Date().toISOString()
      });
    }

    const feuilleRoute = await prisma.feuille_route.update({
      where: { id: parseInt(id) },
      data: {
        heure_fin: data.heure_fin,
        km_fin: data.km_fin,
        km_en_charge_fin: data.km_en_charge_fin || null,
        compteur_total_fin: data.compteur_total_fin || null,
        prise_en_charge_fin: data.prise_en_charge_fin || null,
        chutes_fin: data.chutes_fin || null,
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

    res.json({
      success: true,
      data: feuilleRoute,
      message: 'Feuille de route finalisée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la finalisation de la feuille de route:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'Feuille de route non trouvée',
        timestamp: new Date().toISOString()
      });
    }
    res.status(500).json({
      error: 'Erreur lors de la finalisation de la feuille de route',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Route pour récupérer une feuille de route par ID
router.get('/feuilles-route/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const feuilleRoute = await prisma.feuille_route.findUnique({
      where: { id: parseInt(id) },
      include: {
        chauffeur: { include: { utilisateur: true } },
        vehicule: true,
        course: { include: { client: true, mode_paiement: true } },
        charge: { include: { mode_paiement: true } }
      }
    });

    if (!feuilleRoute) {
      return res.status(404).json({
        error: 'Feuille de route non trouvée',
        timestamp: new Date().toISOString()
      });
    }

    res.json(feuilleRoute);
  } catch (error) {
    console.error('Erreur lors de la récupération de la feuille de route:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération de la feuille de route',
      timestamp: new Date().toISOString()
    });
  }
});

// Route pour mettre à jour une feuille de route
router.put('/feuilles-route/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const feuilleRoute = await prisma.feuille_route.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        date: updateData.date ? new Date(updateData.date) : undefined,
        heure_debut: updateData.heure_debut ? new Date(`1970-01-01T${updateData.heure_debut}`) : undefined,
        heure_fin: updateData.heure_fin ? new Date(`1970-01-01T${updateData.heure_fin}`) : undefined,
        km_debut: updateData.km_debut ? parseInt(updateData.km_debut) : undefined,
        km_fin: updateData.km_fin ? parseInt(updateData.km_fin) : undefined,
        prise_en_charge_debut: updateData.prise_en_charge_debut ? parseFloat(updateData.prise_en_charge_debut) : undefined,
        prise_en_charge_fin: updateData.prise_en_charge_fin ? parseFloat(updateData.prise_en_charge_fin) : undefined,
        chutes_debut: updateData.chutes_debut ? parseFloat(updateData.chutes_debut) : undefined,
        chutes_fin: updateData.chutes_fin ? parseFloat(updateData.chutes_fin) : undefined,
        updated_at: new Date()
      },
      include: {
        chauffeur: { include: { utilisateur: true } },
        vehicule: true,
        course: { include: { client: true, mode_paiement: true } }
      }
    });

    res.json({
      success: true,
      data: feuilleRoute,
      message: 'Feuille de route mise à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la feuille de route:', error.message);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour de la feuille de route',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Route pour supprimer une feuille de route
router.delete('/feuilles-route/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que la feuille de route existe
    const feuilleRoute = await prisma.feuille_route.findUnique({
      where: { id: parseInt(id) },
      include: {
        course: true,
        charge: true
      }
    });

    if (!feuilleRoute) {
      return res.status(404).json({
        error: 'Feuille de route non trouvée',
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier qu'elle n'a pas de courses ou charges associées
    const hasCourses = feuilleRoute.course && feuilleRoute.course.length > 0;
    const hasCharges = feuilleRoute.charge && feuilleRoute.charge.length > 0;

    if (hasCourses || hasCharges) {
      return res.status(400).json({
        error: 'Suppression impossible',
        message: 'La feuille de route contient des courses ou des charges',
        timestamp: new Date().toISOString()
      });
    }

    await prisma.feuille_route.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Feuille de route supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la feuille de route:', error.message);
    res.status(500).json({
      error: 'Erreur lors de la suppression de la feuille de route',
      details: error.message,
      timestamp: new Date().toISOString()
    });
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

router.post('/courses',
  authenticateToken,
  async (req, res) => {
  try {
    const data = req.body;
    const userRole = req.user.role;

    // Utiliser la validation chauffeur si c'est un chauffeur, sinon validation standard
    const validationSchema = userRole === 'chauffeur' ? courseValidation.chauffeur : courseValidation.create;
    const { error } = validationSchema.validate(data, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        error: 'Données de validation invalides',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        })),
        timestamp: new Date().toISOString()
      });
    }

    // Calculer le pourboire si la somme perçue dépasse le prix taximètre
    const pourboire = data.somme_percue > data.prix_taximetre ? data.somme_percue - data.prix_taximetre : 0;

    const course = await prisma.course.create({
      data: {
        feuille_route_id: data.feuille_route_id,
        client_id: data.client_id || null,
        mode_paiement_id: data.mode_paiement_id || null,
        numero_ordre: data.numero_ordre,
        index_depart: data.index_depart,
        lieu_embarquement: data.lieu_embarquement,
        heure_embarquement: new Date(data.heure_embarquement),
        index_arrivee: data.index_arrivee,
        lieu_debarquement: data.lieu_debarquement,
        heure_debarquement: data.heure_debarquement ? new Date(data.heure_debarquement) : null,
        prix_taximetre: data.prix_taximetre,
        somme_percue: data.somme_percue,
        pourboire: pourboire,
        hors_creneau: data.hors_creneau || false,
        statut: data.statut || 'Active',
        notes: data.notes || null
      },
      include: {
        client: true,
        mode_paiement: true,
        feuille_route: {
          include: {
            chauffeur: {
              include: { utilisateur: true }
            },
            vehicule: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: course,
      message: 'Course créée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création de la course:', error);
    res.status(500).json({
      error: 'Erreur lors de la création de la course',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

router.put('/courses/:id',
  authenticateToken,
  async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const userRole = req.user.role;

    // Utiliser la validation chauffeur si c'est un chauffeur, sinon validation standard
    const validationSchema = userRole === 'chauffeur' ? courseValidation.chauffeur : courseValidation.update;
    const { error } = validationSchema.validate(data, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        error: 'Données de validation invalides',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        })),
        timestamp: new Date().toISOString()
      });
    }

    // Calculer le pourboire si la somme perçue dépasse le prix taximètre
    const pourboire = data.somme_percue > data.prix_taximetre ? data.somme_percue - data.prix_taximetre : 0;

    const course = await prisma.course.update({
      where: { id: parseInt(id) },
      data: {
        client_id: data.client_id || null,
        mode_paiement_id: data.mode_paiement_id || null,
        numero_ordre: data.numero_ordre,
        index_depart: data.index_depart,
        lieu_embarquement: data.lieu_embarquement,
        heure_embarquement: new Date(data.heure_embarquement),
        index_arrivee: data.index_arrivee,
        lieu_debarquement: data.lieu_debarquement,
        heure_debarquement: data.heure_debarquement ? new Date(data.heure_debarquement) : null,
        prix_taximetre: data.prix_taximetre,
        somme_percue: data.somme_percue,
        pourboire: pourboire,
        hors_creneau: data.hors_creneau || false,
        statut: data.statut || 'Active',
        notes: data.notes || null,
        updated_at: new Date()
      },
      include: {
        client: true,
        mode_paiement: true,
        feuille_route: {
          include: {
            chauffeur: {
              include: { utilisateur: true }
            },
            vehicule: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: course,
      message: 'Course mise à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la course:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'Course non trouvée',
        timestamp: new Date().toISOString()
      });
    }
    res.status(500).json({
      error: 'Erreur lors de la mise à jour de la course',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Récupérer les interventions d'un chauffeur
router.get('/chauffeurs/:id/interventions',
  authenticateToken,
  validateParams(paramValidation.id),
  async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, type } = req.query;

    // Vérifier que l'utilisateur a accès à ce chauffeur
    if (req.user.role !== 'admin' && req.user.chauffeurId !== parseInt(id)) {
      return res.status(403).json({
        error: 'Accès non autorisé',
        timestamp: new Date().toISOString()
      });
    }

    // Construire les filtres
    const where = {
      chauffeur_id: parseInt(id)
    };

    if (startDate || endDate) {
      where.feuille_route = {
        date: {}
      };
      if (startDate) where.feuille_route.date.gte = new Date(startDate);
      if (endDate) where.feuille_route.date.lte = new Date(endDate);
    }

    if (type) {
      where.type = type;
    }

    // Essayer de récupérer depuis la table intervention
    let interventions = [];
    try {
      interventions = await prisma.intervention.findMany({
        where,
        include: {
          feuille_route: {
            include: {
              vehicule: true
            }
          }
        },
        orderBy: { date_heure: 'desc' }
      });
    } catch (error) {
      // Si la table intervention n'existe pas, récupérer depuis les notes des feuilles de route
      const feuillesRoute = await prisma.feuille_route.findMany({
        where: {
          chauffeur_id: parseInt(id),
          ...(startDate || endDate ? {
            date: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) })
            }
          } : {})
        },
        select: {
          id: true,
          date: true,
          notes: true,
          vehicule: {
            select: {
              plaque_immatriculation: true,
              marque: true,
              modele: true
            }
          }
        },
        orderBy: { date: 'desc' }
      });

      // Parser les interventions depuis les notes
      interventions = [];
      feuillesRoute.forEach(fe => {
        if (fe.notes && fe.notes.includes('INTERVENTION')) {
          const lines = fe.notes.split('\n');
          lines.forEach(line => {
            if (line.startsWith('INTERVENTION')) {
              const parts = line.split(' - ');
              if (parts.length >= 3) {
                interventions.push({
                  id: `note-${fe.id}-${interventions.length}`,
                  type: parts[1],
                  date_heure: new Date(parts[2]),
                  lieu: parts[3] || 'Non spécifié',
                  motif: parts[4] || null,
                  feuille_route: {
                    id: fe.id,
                    date: fe.date,
                    vehicule: fe.vehicule
                  },
                  stored_as_note: true
                });
              }
            }
          });
        }
      });
    }

    res.json({
      success: true,
      data: interventions,
      count: interventions.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des interventions:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des interventions',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Créer une intervention (contrôle police/SP)
router.post('/interventions',
  authenticateToken,
  requireRole('chauffeur'),
  async (req, res) => {
  try {
    const data = req.body;

    // Validation de l'intervention
    const interventionSchema = Joi.object({
      feuille_route_id: Joi.number().integer().required(),
      type_intervention: Joi.string().valid('Police', 'SP', 'Gendarmerie', 'Douane').required(),
      date_heure: Joi.date().required(),
      lieu: Joi.string().trim().required(),
      motif: Joi.string().trim().optional(),
      observations: Joi.string().trim().optional(),
      duree_minutes: Joi.number().integer().min(0).optional(),
      suite_donnee: Joi.string().trim().optional()
    });

    const { error } = interventionSchema.validate(data, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        error: 'Données de validation invalides',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        })),
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier que la feuille de route appartient au chauffeur connecté
    const feuilleRoute = await prisma.feuille_route.findUnique({
      where: { id: data.feuille_route_id },
      include: { chauffeur: true }
    });

    if (!feuilleRoute) {
      return res.status(404).json({
        error: 'Feuille de route non trouvée',
        timestamp: new Date().toISOString()
      });
    }

    if (feuilleRoute.chauffeur_id !== req.user.chauffeurId) {
      return res.status(403).json({
        error: 'Accès non autorisé à cette feuille de route',
        timestamp: new Date().toISOString()
      });
    }

    // Créer l'intervention (on peut utiliser une table dédiée ou stocker dans les notes)
    // Pour l'instant, on va créer une entrée dans une table intervention si elle existe,
    // sinon on ajoute une note spéciale à la feuille de route
    const interventionData = {
      type: data.type_intervention,
      date_heure: new Date(data.date_heure),
      lieu: data.lieu,
      motif: data.motif || null,
      observations: data.observations || null,
      duree_minutes: data.duree_minutes || null,
      suite_donnee: data.suite_donnee || null,
      created_by: req.user.chauffeurId
    };

    // Essayer d'insérer dans une table intervention si elle existe
    let intervention;
    try {
      intervention = await prisma.intervention.create({
        data: {
          feuille_route_id: data.feuille_route_id,
          ...interventionData
        }
      });
    } catch (error) {
      // Si la table intervention n'existe pas, ajouter aux notes de la feuille de route
      const noteIntervention = `INTERVENTION ${data.type_intervention} - ${data.date_heure.toISOString()} - ${data.lieu}`;
      const notesExistantes = feuilleRoute.notes || '';
      const nouvellesNotes = notesExistantes ? `${notesExistantes}\n${noteIntervention}` : noteIntervention;

      await prisma.feuille_route.update({
        where: { id: data.feuille_route_id },
        data: {
          notes: nouvellesNotes,
          updated_at: new Date()
        }
      });

      intervention = {
        id: `note-${Date.now()}`,
        feuille_route_id: data.feuille_route_id,
        ...interventionData,
        stored_as_note: true
      };
    }

    res.status(201).json({
      success: true,
      data: intervention,
      message: 'Intervention enregistrée avec succès',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'intervention:', error);
    res.status(500).json({
      error: 'Erreur lors de la création de l\'intervention',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Sauvegarde automatique d'une course (pour les chauffeurs)
router.put('/courses/:id/auto-save',
  authenticateToken,
  requireRole('chauffeur'),
  validateParams(paramValidation.id),
  async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Validation légère pour la sauvegarde automatique (champs optionnels)
    const autoSaveSchema = Joi.object({
      numero_ordre: Joi.number().integer().min(1).optional(),
      index_depart: Joi.number().integer().min(0).optional(),
      lieu_embarquement: Joi.string().trim().optional(),
      heure_embarquement: Joi.date().optional(),
      index_arrivee: Joi.number().integer().min(0).optional(),
      lieu_debarquement: Joi.string().trim().optional(),
      heure_debarquement: Joi.date().optional(),
      prix_taximetre: Joi.number().min(0).optional(),
      somme_percue: Joi.number().min(0).optional(),
      hors_creneau: Joi.boolean().optional(),
      notes: Joi.string().trim().allow('').optional()
    });

    const { error } = autoSaveSchema.validate(data, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        error: 'Données de validation invalides pour la sauvegarde automatique',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        })),
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier que la course appartient au chauffeur connecté
    const course = await prisma.course.findUnique({
      where: { id: parseInt(id) },
      include: {
        feuille_route: {
          include: {
            chauffeur: true
          }
        }
      }
    });

    if (!course) {
      return res.status(404).json({
        error: 'Course non trouvée',
        timestamp: new Date().toISOString()
      });
    }

    if (course.feuille_route.chauffeur_id !== req.user.chauffeurId) {
      return res.status(403).json({
        error: 'Accès non autorisé à cette course',
        timestamp: new Date().toISOString()
      });
    }

    // Calculer le pourboire si les données sont présentes
    const updateData = { ...data };
    if (data.somme_percue !== undefined && data.prix_taximetre !== undefined) {
      updateData.pourboire = data.somme_percue > data.prix_taximetre ? data.somme_percue - data.prix_taximetre : 0;
    }

    // Mettre à jour la course avec les données partielles
    const updatedCourse = await prisma.course.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        updated_at: new Date()
      },
      include: {
        client: true,
        mode_paiement: true,
        feuille_route: {
          include: {
            chauffeur: {
              include: { utilisateur: true }
            },
            vehicule: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedCourse,
      message: 'Course sauvegardée automatiquement',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde automatique de la course:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'Course non trouvée',
        timestamp: new Date().toISOString()
      });
    }
    res.status(500).json({
      error: 'Erreur lors de la sauvegarde automatique de la course',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Annuler une course (remplace la suppression)
router.put('/courses/:id/cancel',
  authenticateToken,
  validateParams(paramValidation.id),
  async (req, res) => {
  try {
    const { id } = req.params;
    const { motif } = req.body;

    const course = await prisma.course.update({
      where: { id: parseInt(id) },
      data: {
        statut: 'Annulee',
        somme_percue: 0,
        notes: motif ? `ANNULÉ: ${motif}` : 'ANNULÉ',
        updated_at: new Date()
      },
      include: {
        client: true,
        mode_paiement: true,
        feuille_route: {
          include: {
            chauffeur: {
              include: { utilisateur: true }
            },
            vehicule: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: course,
      message: 'Course annulée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la course:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'annulation de la course',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Suppression physique d'une course (réservé aux admins)
router.delete('/courses/:id',
  authenticateToken,
  requireRole('admin'),
  validateParams(paramValidation.id),
  async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.course.delete({
      where: { id: parseInt(id) }
    });
    res.json({
      success: true,
      message: 'Course supprimée définitivement'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la course:', error);
    res.status(500).json({
      error: 'Erreur lors de la suppression de la course',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Routes pour charges
router.get('/charges', async (req, res) => {
  try {
    const { feuilleRouteId } = req.query;
    let where = {};

    if (feuilleRouteId && feuilleRouteId !== 'undefined' && feuilleRouteId !== 'null') {
      where = { feuille_route_id: parseInt(feuilleRouteId) };
    }

    const charges = await prisma.charge.findMany({
      where,
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

// Route pour récupérer une charge par ID
router.get('/charges/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const charge = await prisma.charge.findUnique({
      where: { id: parseInt(id) },
      include: { mode_paiement: true }
    });

    if (!charge) {
      return res.status(404).json({
        error: 'Charge non trouvée',
        timestamp: new Date().toISOString()
      });
    }

    res.json(charge);
  } catch (error) {
    console.error('Erreur lors de la récupération de la charge:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération de la charge',
      timestamp: new Date().toISOString()
    });
  }
});

// Route pour mettre à jour une charge
router.put('/charges/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const charge = await prisma.charge.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        montant: updateData.montant ? parseFloat(updateData.montant) : undefined,
        date: updateData.date ? new Date(updateData.date) : undefined,
        updated_at: new Date()
      },
      include: { mode_paiement: true }
    });

    res.json({
      success: true,
      data: charge,
      message: 'Charge mise à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la charge:', error.message);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour de la charge',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Route pour supprimer une charge
router.delete('/charges/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que la charge existe
    const charge = await prisma.charge.findUnique({
      where: { id: parseInt(id) }
    });

    if (!charge) {
      return res.status(404).json({
        error: 'Charge non trouvée',
        timestamp: new Date().toISOString()
      });
    }

    await prisma.charge.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Charge supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la charge:', error.message);
    res.status(500).json({
      error: 'Erreur lors de la suppression de la charge',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Routes pour utilisateurs
router.get('/utilisateurs', async (req, res) => {
  try {
    const { page = 1, limit = 50, search, type_utilisateur, actif = 'true' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      actif: actif === 'true',
      ...(type_utilisateur && { type_utilisateur }),
      ...(search && {
        OR: [
          { nom: { contains: search, mode: 'insensitive' } },
          { prenom: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [utilisateurs, total] = await Promise.all([
      prisma.utilisateur.findMany({
        where,
        orderBy: { nom: 'asc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.utilisateur.count({ where })
    ]);

    res.json({
      data: utilisateurs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des utilisateurs',
      timestamp: new Date().toISOString()
    });
  }
});

router.get('/utilisateurs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: parseInt(id) }
    });

    if (!utilisateur) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        timestamp: new Date().toISOString()
      });
    }

    res.json(utilisateur);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération de l\'utilisateur',
      timestamp: new Date().toISOString()
    });
  }
});

router.post('/utilisateurs', async (req, res) => {
  try {
    const userData = req.body;

    // Validation des données requises
    if (!userData.type_utilisateur || !userData.nom || !userData.email || !userData.mot_de_passe) {
      return res.status(400).json({
        error: 'Données manquantes',
        message: 'type_utilisateur, nom, email et mot_de_passe sont requis',
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier que l'email est unique
    const existingUser = await prisma.utilisateur.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'Email déjà utilisé',
        message: 'Un utilisateur avec cet email existe déjà',
        timestamp: new Date().toISOString()
      });
    }

    const utilisateur = await prisma.utilisateur.create({
      data: {
        type_utilisateur: userData.type_utilisateur,
        nom: userData.nom,
        prenom: userData.prenom || null,
        telephone: userData.telephone,
        email: userData.email,
        mot_de_passe: userData.mot_de_passe, // Note: devrait être hashé en production
        adresse: userData.adresse || null,
        ville: userData.ville || null,
        code_postal: userData.code_postal || null,
        pays: userData.pays || 'Belgique',
        num_bce: userData.num_bce || null,
        num_tva: userData.num_tva || null,
        tva_applicable: userData.tva_applicable !== undefined ? userData.tva_applicable : true,
        tva_percent: userData.tva_percent ? parseFloat(userData.tva_percent) : 21.00,
        actif: userData.actif !== undefined ? userData.actif : true
      }
    });

    res.status(201).json({
      success: true,
      data: utilisateur,
      message: 'Utilisateur créé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error.message);
    res.status(500).json({
      error: 'Erreur lors de la création de l\'utilisateur',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

router.put('/utilisateurs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const utilisateur = await prisma.utilisateur.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        updated_at: new Date()
      }
    });

    res.json({
      success: true,
      data: utilisateur,
      message: 'Utilisateur mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error.message);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour de l\'utilisateur',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

router.delete('/utilisateurs/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que l'utilisateur existe
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: parseInt(id) },
      include: {
        chauffeur: true
      }
    });

    if (!utilisateur) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier qu'il n'a pas de chauffeur associé
    if (utilisateur.chauffeur) {
      return res.status(400).json({
        error: 'Suppression impossible',
        message: 'L\'utilisateur a un chauffeur associé',
        timestamp: new Date().toISOString()
      });
    }

    // Désactiver l'utilisateur au lieu de le supprimer
    await prisma.utilisateur.update({
      where: { id: parseInt(id) },
      data: {
        actif: false,
        updated_at: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Utilisateur désactivé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error.message);
    res.status(500).json({
      error: 'Erreur lors de la suppression de l\'utilisateur',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Routes pour alertes
router.get('/alertes', async (req, res) => {
  try {
    const { page = 1, limit = 50, resolu, type_alerte } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(resolu !== undefined && { resolu: resolu === 'true' }),
      ...(type_alerte && { type_alerte })
    };

    const [alertes, total] = await Promise.all([
      prisma.alerte.findMany({
        where,
        include: {
          course: true,
          feuille_route: true,
          utilisateur: {
            select: {
              id: true,
              nom: true,
              prenom: true
            }
          }
        },
        orderBy: { date_alerte: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.alerte.count({ where })
    ]);

    res.json({
      data: alertes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des alertes:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des alertes',
      timestamp: new Date().toISOString()
    });
  }
});

router.get('/alertes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const alerte = await prisma.alerte.findUnique({
      where: { id: parseInt(id) },
      include: {
        course: true,
        feuille_route: true,
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true
          }
        }
      }
    });

    if (!alerte) {
      return res.status(404).json({
        error: 'Alerte non trouvée',
        timestamp: new Date().toISOString()
      });
    }

    res.json(alerte);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'alerte:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération de l\'alerte',
      timestamp: new Date().toISOString()
    });
  }
});

router.post('/alertes', async (req, res) => {
  try {
    const alerteData = req.body;

    // Validation des données requises
    if (!alerteData.type_alerte || !alerteData.message) {
      return res.status(400).json({
        error: 'Données manquantes',
        message: 'type_alerte et message sont requis',
        timestamp: new Date().toISOString()
      });
    }

    const alerte = await prisma.alerte.create({
      data: {
        feuille_route_id: alerteData.feuille_route_id || null,
        course_id: alerteData.course_id || null,
        type_alerte: alerteData.type_alerte,
        severite: alerteData.severite || 'Moyenne',
        message: alerteData.message,
        resolu: alerteData.resolu || false,
        resolu_par: alerteData.resolu_par || null
      },
      include: {
        course: true,
        feuille_route: true,
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: alerte,
      message: 'Alerte créée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'alerte:', error.message);
    res.status(500).json({
      error: 'Erreur lors de la création de l\'alerte',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

router.put('/alertes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const alerte = await prisma.alerte.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        date_resolution: updateData.resolu ? new Date() : undefined,
        updated_at: new Date()
      },
      include: {
        course: true,
        feuille_route: true,
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: alerte,
      message: 'Alerte mise à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'alerte:', error.message);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour de l\'alerte',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Routes pour factures
router.get('/factures', async (req, res) => {
  try {
    const { page = 1, limit = 50, statut, client_id } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(statut && { statut }),
      ...(client_id && { client_id: parseInt(client_id) })
    };

    const [factures, total] = await Promise.all([
      prisma.facture.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              nom: true,
              prenom: true
            }
          },
          facture_course: {
            include: {
              course: true
            }
          }
        },
        orderBy: { date_emission: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.facture.count({ where })
    ]);

    res.json({
      data: factures,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des factures:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des factures',
      timestamp: new Date().toISOString()
    });
  }
});

router.get('/factures/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const facture = await prisma.facture.findUnique({
      where: { id: parseInt(id) },
      include: {
        client: true,
        facture_course: {
          include: {
            course: {
              include: {
                feuille_route: {
                  include: {
                    chauffeur: { include: { utilisateur: true } },
                    vehicule: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!facture) {
      return res.status(404).json({
        error: 'Facture non trouvée',
        timestamp: new Date().toISOString()
      });
    }

    res.json(facture);
  } catch (error) {
    console.error('Erreur lors de la récupération de la facture:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération de la facture',
      timestamp: new Date().toISOString()
    });
  }
});

router.post('/factures', async (req, res) => {
  try {
    const factureData = req.body;

    // Validation des données requises
    if (!factureData.client_id || !factureData.montant_ht) {
      return res.status(400).json({
        error: 'Données manquantes',
        message: 'client_id et montant_ht sont requis',
        timestamp: new Date().toISOString()
      });
    }

    const facture = await prisma.facture.create({
      data: {
        numero_facture: factureData.numero_facture || `F${Date.now()}`,
        client_id: factureData.client_id,
        date_emission: factureData.date_emission ? new Date(factureData.date_emission) : new Date(),
        date_echeance: factureData.date_echeance ? new Date(factureData.date_echeance) : null,
        montant_ht: parseFloat(factureData.montant_ht),
        tva_percent: factureData.tva_percent ? parseFloat(factureData.tva_percent) : 21.00,
        statut: factureData.statut || 'En attente',
        mode_paiement: factureData.mode_paiement || null,
        notes: factureData.notes || null
      },
      include: {
        client: {
          select: {
            id: true,
            nom: true,
            prenom: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: facture,
      message: 'Facture créée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création de la facture:', error.message);
    res.status(500).json({
      error: 'Erreur lors de la création de la facture',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

router.put('/factures/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const facture = await prisma.facture.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        montant_ht: updateData.montant_ht ? parseFloat(updateData.montant_ht) : undefined,
        tva_percent: updateData.tva_percent ? parseFloat(updateData.tva_percent) : undefined,
        date_emission: updateData.date_emission ? new Date(updateData.date_emission) : undefined,
        date_echeance: updateData.date_echeance ? new Date(updateData.date_echeance) : undefined,
        date_paiement: updateData.date_paiement ? new Date(updateData.date_paiement) : undefined,
        updated_at: new Date()
      },
      include: {
        client: {
          select: {
            id: true,
            nom: true,
            prenom: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: facture,
      message: 'Facture mise à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la facture:', error.message);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour de la facture',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Routes pour paiements de salaire
router.get('/paiements-salaire', async (req, res) => {
  try {
    const { page = 1, limit = 50, chauffeur_id, statut } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(chauffeur_id && { chauffeur_id: parseInt(chauffeur_id) }),
      ...(statut && { statut })
    };

    const [paiements, total] = await Promise.all([
      prisma.paiement_salaire.findMany({
        where,
        include: {
          chauffeur: { include: { utilisateur: true } },
          feuille_route: true,
          mode_paiement: true
        },
        orderBy: { date_paiement: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.paiement_salaire.count({ where })
    ]);

    res.json({
      data: paiements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des paiements de salaire:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des paiements de salaire',
      timestamp: new Date().toISOString()
    });
  }
});

router.get('/paiements-salaire/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const paiement = await prisma.paiement_salaire.findUnique({
      where: { id: parseInt(id) },
      include: {
        chauffeur: { include: { utilisateur: true } },
        feuille_route: true,
        mode_paiement: true
      }
    });

    if (!paiement) {
      return res.status(404).json({
        error: 'Paiement de salaire non trouvé',
        timestamp: new Date().toISOString()
      });
    }

    res.json(paiement);
  } catch (error) {
    console.error('Erreur lors de la récupération du paiement de salaire:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération du paiement de salaire',
      timestamp: new Date().toISOString()
    });
  }
});

router.post('/paiements-salaire', async (req, res) => {
  try {
    const paiementData = req.body;

    // Validation des données requises
    if (!paiementData.chauffeur_id || !paiementData.periode_debut || !paiementData.periode_fin || !paiementData.montant_total) {
      return res.status(400).json({
        error: 'Données manquantes',
        message: 'chauffeur_id, periode_debut, periode_fin et montant_total sont requis',
        timestamp: new Date().toISOString()
      });
    }

    const paiement = await prisma.paiement_salaire.create({
      data: {
        chauffeur_id: paiementData.chauffeur_id,
        feuille_route_id: paiementData.feuille_route_id || null,
        periode_debut: new Date(paiementData.periode_debut),
        periode_fin: new Date(paiementData.periode_fin),
        montant_total: parseFloat(paiementData.montant_total),
        montant_fixe: paiementData.montant_fixe ? parseFloat(paiementData.montant_fixe) : 0.00,
        montant_variable: paiementData.montant_variable ? parseFloat(paiementData.montant_variable) : 0.00,
        montant_paye: parseFloat(paiementData.montant_total),
        mode_paiement_id: paiementData.mode_paiement_id || null,
        statut: paiementData.statut || 'Payé',
        notes: paiementData.notes || null
      },
      include: {
        chauffeur: { include: { utilisateur: true } },
        feuille_route: true,
        mode_paiement: true
      }
    });

    res.status(201).json({
      success: true,
      data: paiement,
      message: 'Paiement de salaire créé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création du paiement de salaire:', error.message);
    res.status(500).json({
      error: 'Erreur lors de la création du paiement de salaire',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Routes pour paramètres système
router.get('/parametres-systeme', async (req, res) => {
  try {
    const { categorie } = req.query;

    const where = categorie ? { categorie } : {};

    const parametres = await prisma.parametres_systeme.findMany({
      where,
      orderBy: { categorie: 'asc' }
    });

    res.json(parametres);
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres système:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des paramètres système',
      timestamp: new Date().toISOString()
    });
  }
});

router.get('/parametres-systeme/:cle', async (req, res) => {
  try {
    const { cle } = req.params;
    const parametre = await prisma.parametres_systeme.findUnique({
      where: { cle }
    });

    if (!parametre) {
      return res.status(404).json({
        error: 'Paramètre système non trouvé',
        timestamp: new Date().toISOString()
      });
    }

    res.json(parametre);
  } catch (error) {
    console.error('Erreur lors de la récupération du paramètre système:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération du paramètre système',
      timestamp: new Date().toISOString()
    });
  }
});

router.put('/parametres-systeme/:cle', async (req, res) => {
  try {
    const { cle } = req.params;
    const { valeur } = req.body;

    const parametre = await prisma.parametres_systeme.upsert({
      where: { cle },
      update: {
        valeur,
        updated_at: new Date()
      },
      create: {
        cle,
        valeur,
        description: `Paramètre ${cle}`,
        categorie: 'general'
      }
    });

    res.json({
      success: true,
      data: parametre,
      message: 'Paramètre système mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du paramètre système:', error.message);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour du paramètre système',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Routes pour performances chauffeur
router.get('/performances-chauffeur', async (req, res) => {
  try {
    const { chauffeur_id, date_debut, date_fin } = req.query;

    const where = {
      ...(chauffeur_id && { chauffeur_id: parseInt(chauffeur_id) }),
      ...(date_debut && { date_debut: { gte: new Date(date_debut) } }),
      ...(date_fin && { date_fin: { lte: new Date(date_fin) } })
    };

    const performances = await prisma.performance_chauffeur.findMany({
      where,
      include: {
        chauffeur: { include: { utilisateur: true } }
      },
      orderBy: { date_debut: 'desc' }
    });

    res.json(performances);
  } catch (error) {
    console.error('Erreur lors de la récupération des performances chauffeur:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des performances chauffeur',
      timestamp: new Date().toISOString()
    });
  }
});

router.post('/performances-chauffeur', async (req, res) => {
  try {
    const performanceData = req.body;

    // Validation des données requises
    if (!performanceData.chauffeur_id || !performanceData.date_debut || !performanceData.date_fin) {
      return res.status(400).json({
        error: 'Données manquantes',
        message: 'chauffeur_id, date_debut et date_fin sont requis',
        timestamp: new Date().toISOString()
      });
    }

    const performance = await prisma.performance_chauffeur.create({
      data: {
        chauffeur_id: performanceData.chauffeur_id,
        date_debut: new Date(performanceData.date_debut),
        date_fin: new Date(performanceData.date_fin),
        nombre_courses: performanceData.nombre_courses || 0,
        km_parcourus: performanceData.km_parcourus || 0,
        recette_totale: performanceData.recette_totale ? parseFloat(performanceData.recette_totale) : 0.00,
        salaire_total: performanceData.salaire_total ? parseFloat(performanceData.salaire_total) : 0.00,
        charges_total: performanceData.charges_total ? parseFloat(performanceData.charges_total) : 0.00
      },
      include: {
        chauffeur: { include: { utilisateur: true } }
      }
    });

    res.status(201).json({
      success: true,
      data: performance,
      message: 'Performance chauffeur créée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création de la performance chauffeur:', error.message);
    res.status(500).json({
      error: 'Erreur lors de la création de la performance chauffeur',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Routes pour associations chauffeur-véhicule
router.get('/chauffeur-vehicule', async (req, res) => {
  try {
    const { chauffeur_id, vehicule_id, actif = 'true' } = req.query;

    const where = {
      actif: actif === 'true',
      ...(chauffeur_id && { chauffeur_id: parseInt(chauffeur_id) }),
      ...(vehicule_id && { vehicule_id: parseInt(vehicule_id) })
    };

    const associations = await prisma.chauffeur_vehicule.findMany({
      where,
      include: {
        chauffeur: { include: { utilisateur: true } },
        vehicule: true
      },
      orderBy: { date_assignation: 'desc' }
    });

    res.json(associations);
  } catch (error) {
    console.error('Erreur lors de la récupération des associations chauffeur-véhicule:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des associations chauffeur-véhicule',
      timestamp: new Date().toISOString()
    });
  }
});

router.post('/chauffeur-vehicule', async (req, res) => {
  try {
    const associationData = req.body;

    // Validation des données requises
    if (!associationData.chauffeur_id || !associationData.vehicule_id) {
      return res.status(400).json({
        error: 'Données manquantes',
        message: 'chauffeur_id et vehicule_id sont requis',
        timestamp: new Date().toISOString()
      });
    }

    // Vérifier que l'association n'existe pas déjà
    const existingAssociation = await prisma.chauffeur_vehicule.findUnique({
      where: {
        chauffeur_id_vehicule_id: {
          chauffeur_id: associationData.chauffeur_id,
          vehicule_id: associationData.vehicule_id
        }
      }
    });

    if (existingAssociation) {
      return res.status(400).json({
        error: 'Association déjà existante',
        message: 'Ce chauffeur est déjà associé à ce véhicule',
        timestamp: new Date().toISOString()
      });
    }

    const association = await prisma.chauffeur_vehicule.create({
      data: {
        chauffeur_id: associationData.chauffeur_id,
        vehicule_id: associationData.vehicule_id,
        actif: associationData.actif !== undefined ? associationData.actif : true,
        notes: associationData.notes || null
      },
      include: {
        chauffeur: { include: { utilisateur: true } },
        vehicule: true
      }
    });

    res.status(201).json({
      success: true,
      data: association,
      message: 'Association chauffeur-véhicule créée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'association chauffeur-véhicule:', error.message);
    res.status(500).json({
      error: 'Erreur lors de la création de l\'association chauffeur-véhicule',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

router.put('/chauffeur-vehicule/:chauffeur_id/:vehicule_id', async (req, res) => {
  try {
    const { chauffeur_id, vehicule_id } = req.params;
    const updateData = req.body;

    const association = await prisma.chauffeur_vehicule.update({
      where: {
        chauffeur_id_vehicule_id: {
          chauffeur_id: parseInt(chauffeur_id),
          vehicule_id: parseInt(vehicule_id)
        }
      },
      data: {
        ...updateData,
        updated_at: new Date()
      },
      include: {
        chauffeur: { include: { utilisateur: true } },
        vehicule: true
      }
    });

    res.json({
      success: true,
      data: association,
      message: 'Association chauffeur-véhicule mise à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'association chauffeur-véhicule:', error.message);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour de l\'association chauffeur-véhicule',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

router.delete('/chauffeur-vehicule/:chauffeur_id/:vehicule_id', async (req, res) => {
  try {
    const { chauffeur_id, vehicule_id } = req.params;

    await prisma.chauffeur_vehicule.delete({
      where: {
        chauffeur_id_vehicule_id: {
          chauffeur_id: parseInt(chauffeur_id),
          vehicule_id: parseInt(vehicule_id)
        }
      }
    });

    res.json({
      success: true,
      message: 'Association chauffeur-véhicule supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'association chauffeur-véhicule:', error.message);
    res.status(500).json({
      error: 'Erreur lors de la suppression de l\'association chauffeur-véhicule',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

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
          case 'trips-count': {
            // Nombre de courses par jour
            const tripsQuery = `
              SELECT
                DATE(created_at) as date,
                COUNT(*) as count
              FROM course
              WHERE 1=1 ${dateFrom ? 'AND created_at >= $1' : ''} ${dateTo ? `AND created_at <= $${dateFrom ? '2' : '1'}` : ''}
              GROUP BY DATE(created_at)
              ORDER BY DATE(created_at)
            `;
            const tripsParams = [];
            if (dateFrom) tripsParams.push(new Date(dateFrom));
            if (dateTo) tripsParams.push(new Date(dateTo));
            data = await prisma.$queryRawUnsafe(tripsQuery, ...tripsParams);
            break;
          }

          case 'daily-revenue': {
            // Revenus par jour
            const revenueQuery = `
              SELECT
                DATE(created_at) as date,
                SUM(somme_percue) as revenue
              FROM course
              WHERE 1=1 ${dateFrom ? 'AND created_at >= $1' : ''} ${dateTo ? `AND created_at <= $${dateFrom ? '2' : '1'}` : ''}
              GROUP BY DATE(created_at)
              ORDER BY DATE(created_at)
            `;
            const revenueParams = [];
            if (dateFrom) revenueParams.push(new Date(dateFrom));
            if (dateTo) revenueParams.push(new Date(dateTo));
            data = await prisma.$queryRawUnsafe(revenueQuery, ...revenueParams);
            break;
          }

          case 'driver-performance': {
            // Performance des chauffeurs - utiliser une requête raw pour agréger correctement
            const driverQuery = `
              SELECT
                c.id as chauffeur_id,
                COUNT(DISTINCT fr.id) as trips_count,
                SUM(co.somme_percue) as total_revenue,
                AVG(co.somme_percue) as avg_revenue,
                u.nom,
                u.prenom
              FROM feuille_route fr
              JOIN course co ON fr.id = co.feuille_route_id
              JOIN chauffeur c ON fr.chauffeur_id = c.id
              JOIN utilisateur u ON c.utilisateur_id = u.id
              WHERE 1=1 ${dateFrom ? 'AND co.created_at >= $1' : ''} ${dateTo ? `AND co.created_at <= $${dateFrom ? '2' : '1'}` : ''}
              GROUP BY c.id, u.nom, u.prenom
              ORDER BY total_revenue DESC
            `;
            const driverParams = [];
            if (dateFrom) driverParams.push(new Date(dateFrom));
            if (dateTo) driverParams.push(new Date(dateTo));
            data = await prisma.$queryRawUnsafe(driverQuery, ...driverParams);
            break;
          }

          case 'payment-methods': {
            // Répartition des modes de paiement
            const paymentQuery = `
              SELECT
                mp.libelle as mode,
                COUNT(c.id) as count,
                COALESCE(SUM(c.somme_percue), 0) as total
              FROM course c
              LEFT JOIN mode_paiement mp ON c.mode_paiement_id = mp.id
              WHERE 1=1 ${dateFrom ? 'AND c.created_at >= $1' : ''} ${dateTo ? `AND c.created_at <= $${dateFrom ? '2' : '1'}` : ''}
              GROUP BY mp.libelle
              ORDER BY total DESC
            `;
            const paymentParams = [];
            if (dateFrom) paymentParams.push(new Date(dateFrom));
            if (dateTo) paymentParams.push(new Date(dateTo));
            data = await prisma.$queryRawUnsafe(paymentQuery, ...paymentParams);
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

    // Monter les nouvelles routes Prisma sur /api
    app.use('/api', prismaRoutes);

    // Garder les anciennes routes pour compatibilité temporaire
    // TODO: Supprimer les anciennes routes une fois la migration terminée
    app.use('/api', router);

    // Middleware de logging des requêtes
    app.use(requestLogger);

    // Middleware pour les routes non trouvées
    app.use(notFoundHandler);

    // Middleware de gestion globale des erreurs (doit être le dernier)
    app.use(errorHandler);

    // Fonction de démarrage du serveur
    const startServer = async () => {
      try {
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

startServer().catch((error) => {
  console.error('❌ Erreur fatale lors du démarrage du serveur:', error);
  process.exit(1);
});

export default app;

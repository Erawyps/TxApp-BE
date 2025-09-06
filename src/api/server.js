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
    : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
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
      res.status(400).json({ error: 'JSON invalide' });
      throw new Error('JSON invalide');
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de gestion d'erreurs global
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

    const [chauffeurs, total] = await Promise.all([
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
          regle_salaire: true
        },
        orderBy: { numero_badge: 'asc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.chauffeur.count({ where })
    ]);

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
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Initialisation du serveur avec test de connexion DB
const startServer = async () => {
  try {
    // Test de la connexion à la base de données au démarrage
    console.log('🔄 Test de connexion à la base de données...');
    const dbConnected = await testDatabaseConnection();

    if (!dbConnected) {
      console.error('❌ Impossible de se connecter à la base de données');
      process.exit(1);
    }

    const PORT = process.env.PORT || 3001;
    const HOST = process.env.HOST || '0.0.0.0';

    app.listen(PORT, HOST, () => {
      console.log(`✅ Serveur API démarré sur ${HOST}:${PORT}`);
      console.log(`🌍 Environnement: ${process.env.NODE_ENV}`);
      console.log(`📊 Health check: http://${HOST}:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

startServer();

export default app;

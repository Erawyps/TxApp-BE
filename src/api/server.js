import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { compress } from 'hono/compress';
import { serve } from '@hono/node-server';
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

const app = new Hono();

// Démarrer le monitoring en production
if (process.env.NODE_ENV === 'production') {
  monitor.start();
}

// Compression middleware pour optimiser les réponses
app.use('*', compress());

// Logging middleware conditionnel
if (process.env.NODE_ENV === 'production') {
  app.use('*', logger());
} else {
  app.use('*', logger((str, ...rest) => {
    console.log(str, ...rest);
  }));
}

// Middleware de monitoring pour toutes les requêtes
app.use('*', monitoringMiddleware);

// CORS configuration pour production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.CORS_ORIGIN, 'https://www.txapp.be']
    : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174', 'http://localhost:3000', 'https://txapp.be', 'https://www.txapp.be'],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use('*', cors(corsOptions));

// Rate limiting (simplifié pour Hono)
app.use('*', async (c, next) => {
  // Rate limiting basique - à améliorer avec un vrai rate limiter pour Hono
  const clientIP = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';
  // Pour l'instant, pas de rate limiting complexe, juste un check basique
  await next();
});

// Body parsing avec validation
app.use('*', async (c, next) => {
  if (c.req.method === 'POST' || c.req.method === 'PUT' || c.req.method === 'PATCH') {
    try {
      const contentType = c.req.header('content-type');
      if (contentType && contentType.includes('application/json')) {
        const body = await c.req.json();
        c.set('parsedBody', body);
      }
    } catch (e) {
      console.error('Erreur de parsing JSON:', e.message);
      return c.json({ error: 'JSON invalide' }, 400);
    }
  }
  await next();
});

// Health check endpoints améliorés
app.get('/health', async (c) => {
  try {
    const dbHealth = await getDatabaseHealth();
    const monitorStatus = monitor.getStatus();

    const response = {
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
    };

    return c.json(response, dbHealth.status === 'healthy' ? 200 : 503);
  } catch (error) {
    console.error('Erreur lors du health check:', error.message);
    return c.json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    }, 503);
  }
});

// Endpoint de monitoring détaillé (accès restreint)
app.get('/api/monitoring/status', async (c) => {
  try {
    // Vérification d'autorisation basique (à améliorer avec votre système d'auth)
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Token d\'autorisation requis' }, 401);
    }

    const monitorStatus = monitor.getStatus();
    return c.json(monitorStatus);
  } catch (error) {
    console.error('Erreur lors de la récupération du statut:', error.message);
    return c.json({ error: 'Erreur lors de la récupération du statut' }, 500);
  }
});

// Middleware de validation de connexion DB pour les routes API
app.use('/api/*', async (c, next) => {
  try {
    // Test rapide de la connexion DB
    await prisma.$queryRaw`SELECT 1`;
    await next();
  } catch (error) {
    console.error('Erreur de connexion DB:', error);
    return c.json({
      error: 'Service temporairement indisponible',
      message: 'Problème de connexion à la base de données'
    }, 503);
  }
});

// Monter les routes Prisma sur /api
app.route('/api', prismaRoutes);

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


// Middleware de logging des requêtes
app.use('*', requestLogger);

// Middleware pour les routes non trouvées
app.notFound((c) => {
  return c.json({ error: 'Route non trouvée' }, 404);
});

// Middleware de gestion globale des erreurs (doit être le dernier)
app.onError((err, c) => {
  console.error('Erreur serveur:', err.stack);

  if (process.env.NODE_ENV === 'production') {
    return c.json({
      error: 'Erreur interne du serveur',
      timestamp: new Date().toISOString()
    }, 500);
  } else {
    return c.json({
      error: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Fonction de démarrage du serveur
const startServer = async () => {
  try {
    const PORT = process.env.PORT || 3001;
    const HOST = process.env.HOST || '0.0.0.0';
    console.log(`🌐 Configuration: ${HOST}:${PORT}`);

    serve({
      fetch: app.fetch,
      port: PORT,
      hostname: HOST
    });

    console.log(`✅ Serveur Hono démarré sur ${HOST}:${PORT}`);
    console.log(`🌍 Environnement: ${process.env.NODE_ENV}`);
    console.log(`📊 Health check: http://${HOST}:${PORT}/health`);

    // Gestion des signaux d'arrêt
    process.on('SIGINT', () => {
      console.log('\n🛑 Arrêt du serveur...');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Arrêt du serveur...');
      process.exit(0);
    });

    return app;
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

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

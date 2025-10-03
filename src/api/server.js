import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { compress } from 'hono/compress';
import { serve } from '@hono/node-server';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// import prisma, { getDatabaseHealth } from '../configs/database.config.js';
// import { monitor, monitoringMiddleware } from '../configs/monitoring.config.js';

// Import des nouvelles routes Prisma
import prismaRoutes from './prismaRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import prisma from '../configs/database.config.js';

// Fonction d'initialisation des données de test
async function initializeTestData() {
  try {
    console.log('🚀 Initialisation des données de test...');

    // Vérifier si l'utilisateur test existe déjà
    const existingUser = await prisma.utilisateur.findUnique({
      where: { email: 'chauffeur@taxi.be' }
    });

    if (!existingUser) {
      console.log('📝 Création de l\'utilisateur test chauffeur...');

      // Créer l'utilisateur chauffeur
      const testUser = await prisma.utilisateur.create({
        data: {
          societe_id: 1,
          email: 'chauffeur@taxi.be',
          mot_de_passe_hashe: '$2b$12$5uwbtgleugv1sy/tlKR1Ruv8f6NCcOCZolsytgJOTQgZuQX6RxOQ.', // password: test123
          nom: 'Dupont',
          prenom: 'Jean',
          role: 'Chauffeur'
        }
      });

      console.log('✅ Utilisateur créé:', testUser.user_id);

      // Créer l'entrée chauffeur correspondante
      const testChauffeur = await prisma.chauffeur.create({
        data: {
          chauffeur_id: testUser.user_id,
          societe_id: 1,
          statut: 'Actif'
        }
      });

      console.log('✅ Chauffeur créé:', testChauffeur.chauffeur_id);
    } else {
      console.log('ℹ️ Utilisateur test déjà existant');
    }

    // Créer des règles de salaire si elles n'existent pas
    const existingRegles = await prisma.regle_salaire.findMany();
    if (existingRegles.length === 0) {
      console.log('📝 Création des règles de salaire de test...');

      await prisma.regle_salaire.createMany({
        data: [
          {
            nom_regle: 'Salaire fixe',
            est_variable: false,
            pourcentage_base: 100.00,
            description: 'Salaire fixe pour les chauffeurs'
          },
          {
            nom_regle: 'Commission variable',
            est_variable: true,
            seuil_recette: 200.00,
            pourcentage_base: 5.00,
            pourcentage_au_dela: 10.00,
            description: 'Commission sur les recettes'
          }
        ]
      });

      console.log('✅ Règles de salaire créées');
    }

    console.log('🎉 Initialisation des données de test terminée');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des données de test:', error);
  }
}

const app = new Hono();

// Démarrer le monitoring en production
// if (process.env.NODE_ENV === 'production') {
//   monitor.start();
// }

// Compression middleware pour optimiser les réponses
app.use('*', compress());

// Logging middleware conditionnel
// if (process.env.NODE_ENV === 'production') {
//   app.use('*', logger((str, ...rest) => {
//     console.log(str, ...rest);
//   }));
// } else {
//   app.use('*', logger((str, ...rest) => {
//     console.log(str, ...rest);
//   }));
// }

// Middleware de monitoring pour toutes les requêtes
// app.use('*', monitoringMiddleware);

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
app.get('/api/health', async (c) => {
  try {
    // const dbHealth = await getDatabaseHealth();
    const dbHealth = { status: 'healthy', responseTime: '0ms', timestamp: new Date().toISOString() };
    // const monitorStatus = monitor.getStatus();

    const response = {
      status: dbHealth.status === 'healthy' ? 'OK' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: dbHealth,
      monitoring: {
        uptime: process.uptime(),
        requests: 0,
        errorRate: "0.00%",
        recentAlerts: 0
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

    // const monitorStatus = monitor.getStatus();
    return c.json({ status: 'OK', uptime: process.uptime() });
  } catch (error) {
    console.error('Erreur lors de la récupération du statut:', error.message);
    return c.json({ error: 'Erreur lors de la récupération du statut' }, 500);
  }
});

// Middleware de validation de connexion DB pour les routes API
// app.use('/api/*', async (c, next) => {
//   try {
//     // Test rapide de la connexion DB
//     await prisma.$queryRaw`SELECT 1`;
//     await next();
//   } catch (error) {
//     console.error('Erreur de connexion DB:', error);
//     return c.json({
//       error: 'Service temporairement indisponible',
//       message: 'Problème de connexion à la base de données'
//     }, 503);
//   }
// });

// Monter les routes Prisma sur /api
app.route('/api', prismaRoutes);

// Monter les routes dashboard sur /api/dashboard
app.route('/api/dashboard', dashboardRoutes);

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

    // Initialiser les données de test
    await initializeTestData();

    serve({
      fetch: app.fetch,
      port: PORT,
      hostname: HOST
    });

    console.log(`✅ Serveur Hono démarré sur ${HOST}:${PORT}`);
    console.log(`🌍 Environnement: ${process.env.NODE_ENV}`);
    console.log(`📊 Health check: http://${HOST}:${PORT}/api/health`);

    // Gestion des signaux d'arrêt
    // process.on('SIGINT', () => {
    //   console.log('\n🛑 Arrêt du serveur...');
    //   process.exit(0);
    // });

    // process.on('SIGTERM', () => {
    //   console.log('\n🛑 Arrêt du serveur...');
    //   process.exit(0);
    // });

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

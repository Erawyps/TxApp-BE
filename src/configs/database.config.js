import { PrismaClient } from '@prisma/client';

// Configuration de pool de connexions pour la production
const getDatabaseConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    // Configuration Prisma optimisée pour la production
    log: isProduction
      ? ['error', 'warn']
      : ['query', 'info', 'warn', 'error'],

    // Configuration de timeout et retry
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }

    // Supprimé la configuration datasourceUrl qui causait des problèmes
  };
};

// Instance Prisma singleton pour éviter les connexions multiples
let prisma;

const createPrismaClient = () => {
  if (!prisma) {
    const config = getDatabaseConfig();
    prisma = new PrismaClient(config);

    // Gestion gracieuse des déconnexions (désactivée en développement)
    if (process.env.NODE_ENV !== 'development') {
      process.on('beforeExit', async () => {
        console.log('Fermeture des connexions à la base de données...');
        await prisma.$disconnect();
      });

      // Ne pas gérer SIGINT/SIGTERM ici - laisser le serveur les gérer
      // pour éviter les conflits et permettre un arrêt propre
    } else {
      // En développement, on ferme seulement la connexion sans arrêter le processus
      process.on('beforeExit', async () => {
        console.log('Fermeture des connexions à la base de données...');
        await prisma.$disconnect();
      });
    }
  }

  return prisma;
};

// Fonction de test de connexion
export const testDatabaseConnection = async () => {
  try {
    const client = createPrismaClient();
    await client.$queryRaw`SELECT 1`;
    console.log('✅ Connexion à la base de données réussie');
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error.message);
    return false;
  }
};

// Fonction de health check pour la DB
export const getDatabaseHealth = async () => {
  try {
    const client = createPrismaClient();
    const startTime = Date.now();
    await client.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - startTime;

    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

export { createPrismaClient };
export default createPrismaClient();

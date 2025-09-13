import { PrismaClient } from '@prisma/client';

// Configuration de pool de connexions pour la production
const getDatabaseConfig = () => {
  const isProduction = typeof process !== 'undefined' && process?.env?.NODE_ENV === 'production' && (typeof window === 'undefined' || typeof window === 'object' && window === null);

  return {
    // Configuration Prisma optimisée pour la production
    log: isProduction
      ? ['error', 'warn']
      : ['query', 'info', 'warn', 'error'],

    // Configuration de timeout et retry
    datasources: {
      db: {
        url: (typeof process !== 'undefined' && process?.env?.DATABASE_URL) ? process.env.DATABASE_URL : ''
      }
    }
  };
};

// Instance Prisma singleton pour éviter les connexions multiples
let prisma;

const createPrismaClient = () => {
  if (!prisma) {
    const config = getDatabaseConfig();
    prisma = new PrismaClient(config);

    // Gestion gracieuse des déconnexions
    process.on('beforeExit', async () => {
      console.log('Fermeture des connexions à la base de données...');
      await prisma.$disconnect();
    });

    process.on('SIGINT', async () => {
      console.log('Interruption détectée, fermeture de la base de données...');
      await prisma.$disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('Terminaison détectée, fermeture de la base de données...');
      await prisma.$disconnect();
      process.exit(0);
    });
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

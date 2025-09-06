#!/usr/bin/env node

/**
 * Script de test pour valider la configuration de production de TxApp
 * Ce script vérifie tous les aspects critiques avant le déploiement
 */

import { testDatabaseConnection, getDatabaseHealth } from '../src/configs/database.config.js';
import { monitor } from '../src/configs/monitoring.config.js';

console.log('🧪 Test de configuration de production TxApp\n');

// Fonction pour afficher les résultats de test
const displayResult = (testName, success, message = '') => {
  const status = success ? '✅' : '❌';
  console.log(`${status} ${testName}${message ? ': ' + message : ''}`);
};

// Test des variables d'environnement critiques
const testEnvironmentVariables = () => {
  console.log('📋 Vérification des variables d\'environnement...');

  const requiredVars = [
    'DATABASE_URL',
    'DIRECT_URL',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'JWT_SECRET',
    'SESSION_SECRET',
    'CORS_ORIGIN',
    'NODE_ENV'
  ];

  let allPresent = true;

  requiredVars.forEach(varName => {
    const exists = process.env[varName] !== undefined;
    displayResult(`Variable ${varName}`, exists);
    if (!exists) allPresent = false;
  });

  // Test de la qualité des secrets
  if (process.env.JWT_SECRET === 'your-super-secure-jwt-secret-for-production-change-this') {
    displayResult('JWT_SECRET sécurisé', false, 'Utilise encore la valeur par défaut');
    allPresent = false;
  }

  if (process.env.SESSION_SECRET === 'your-super-secure-session-secret-for-production-change-this') {
    displayResult('SESSION_SECRET sécurisé', false, 'Utilise encore la valeur par défaut');
    allPresent = false;
  }

  return allPresent;
};

// Test de la connexion à la base de données
const testDatabase = async () => {
  console.log('\n🗄️ Test de connexion à la base de données...');

  try {
    const connected = await testDatabaseConnection();
    displayResult('Connexion de base', connected);

    if (connected) {
      const health = await getDatabaseHealth();
      displayResult('Health check DB', health.status === 'healthy', health.responseTime);

      // Test d'une requête simple
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      try {
        await prisma.utilisateur.count();
        displayResult('Accès aux tables', true);
      } catch (error) {
        displayResult('Accès aux tables', false, error.message);
      } finally {
        await prisma.$disconnect();
      }
    }

    return connected;
  } catch (error) {
    displayResult('Connexion DB', false, error.message);
    return false;
  }
};

// Test du système de monitoring
const testMonitoring = () => {
  console.log('\n📊 Test du système de monitoring...');

  try {
    const status = monitor.getStatus();
    displayResult('Instance de monitoring', true);
    displayResult('Métriques disponibles', status.requests !== undefined);

    return true;
  } catch (error) {
    displayResult('Système de monitoring', false, error.message);
    return false;
  }
};

// Test de la configuration Prisma
const testPrismaGeneration = async () => {
  console.log('\n⚙️ Test de la génération Prisma...');

  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    displayResult('Client Prisma importé', true);

    // Test de validation du schéma
    try {
      await prisma.$connect();
      displayResult('Connexion Prisma', true);
      await prisma.$disconnect();
    } catch (error) {
      displayResult('Connexion Prisma', false, error.message);
      return false;
    }

    return true;
  } catch (error) {
    displayResult('Client Prisma', false, 'Client non généré ou invalide');
    return false;
  }
};

// Test de sécurité basique
const testSecurity = () => {
  console.log('\n🔒 Vérifications de sécurité...');

  const nodeEnv = process.env.NODE_ENV;
  displayResult('Mode production', nodeEnv === 'production');

  const corsOrigin = process.env.CORS_ORIGIN;
  displayResult('CORS configuré', corsOrigin && corsOrigin !== '*');

  return nodeEnv === 'production' && corsOrigin && corsOrigin !== '*';
};

// Test de performance basique
const testPerformance = () => {
  console.log('\n⚡ Test de performance basique...');

  const memoryUsage = process.memoryUsage();
  const memoryMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);

  displayResult('Utilisation mémoire', memoryMB < 100, `${memoryMB}MB`);

  const startTime = process.hrtime();
  // Simulation d'une opération
  for (let i = 0; i < 100000; i++) {
    Math.random();
  }
  const [seconds, nanoseconds] = process.hrtime(startTime);
  const duration = seconds * 1000 + nanoseconds / 1000000;

  displayResult('Performance CPU', duration < 100, `${duration.toFixed(2)}ms`);

  return true;
};

// Fonction principale de test
const runTests = async () => {
  const startTime = Date.now();

  const results = {
    environment: testEnvironmentVariables(),
    database: await testDatabase(),
    monitoring: testMonitoring(),
    prisma: await testPrismaGeneration(),
    security: testSecurity(),
    performance: testPerformance()
  };

  const duration = Date.now() - startTime;
  const allPassed = Object.values(results).every(Boolean);

  console.log('\n📈 Résultats des tests:');
  console.log('─'.repeat(40));

  Object.entries(results).forEach(([test, passed]) => {
    displayResult(test.charAt(0).toUpperCase() + test.slice(1), passed);
  });

  console.log('─'.repeat(40));
  console.log(`⏱️ Durée totale: ${duration}ms`);

  if (allPassed) {
    console.log('\n🎉 Tous les tests sont passés ! Prêt pour la production.');
    process.exit(0);
  } else {
    console.log('\n⚠️ Certains tests ont échoué. Veuillez corriger avant le déploiement.');
    process.exit(1);
  }
};

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Erreur non gérée:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Exception non capturée:', error);
  process.exit(1);
});

// Exécution des tests
runTests().catch(error => {
  console.error('❌ Erreur lors de l\'exécution des tests:', error);
  process.exit(1);
});

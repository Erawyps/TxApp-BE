#!/usr/bin/env node

/**
 * Test de configuration de production simplifié pour TxApp
 * Ce script vérifie les aspects critiques sans dépendances complexes
 */

console.log('🧪 Test de configuration de production TxApp (version simplifiée)\n');

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
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.includes('your-super-secure')) {
    displayResult('JWT_SECRET sécurisé', false, 'Utilise encore une valeur faible');
    allPresent = false;
  } else if (process.env.JWT_SECRET) {
    displayResult('JWT_SECRET s��curisé', true);
  }

  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.includes('your-super-secure')) {
    displayResult('SESSION_SECRET sécurisé', false, 'Utilise encore une valeur faible');
    allPresent = false;
  } else if (process.env.SESSION_SECRET) {
    displayResult('SESSION_SECRET sécurisé', true);
  }

  return allPresent;
};

// Test de la connexion à la base de données
const testDatabase = async () => {
  console.log('\n🗄️ Test de connexion à la base de données...');

  try {
    // Test basique de l'URL de database
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      displayResult('URL de base de données', false, 'DATABASE_URL manquante');
      return false;
    }

    displayResult('URL de base de données', true);

    // Test d'import et de connexion Prisma
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      displayResult('Client Prisma importé', true);

      // Test de connexion simple
      await prisma.$queryRaw`SELECT 1`;
      displayResult('Connexion DB active', true);

      // Test d'accès aux tables
      await prisma.utilisateur.count();
      displayResult('Accès aux tables', true);

      await prisma.$disconnect();
      return true;
    } catch (error) {
      displayResult('Connexion Prisma', false, error.message.substring(0, 50) + '...');
      return false;
    }
  } catch (error) {
    displayResult('Test de base de données', false, error.message);
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

  const jwtSecret = process.env.JWT_SECRET;
  displayResult('JWT Secret défini', jwtSecret && jwtSecret.length > 20);

  return nodeEnv === 'production' && corsOrigin && corsOrigin !== '*' && jwtSecret && jwtSecret.length > 20;
};

// Test de configuration des fichiers
const testFileConfiguration = async () => {
  console.log('\n📁 Vérification des fichiers de configuration...');

  try {
    const fs = await import('fs');

    // Vérifier l'existence des fichiers critiques
    const criticalFiles = [
      'package.json',
      'prisma/schema.prisma',
      'wrangler.jsonc',
      'src/api/server.js',
      'src/configs/auth.config.js',
      'src/services/auth.service.js',
      'worker.js'
    ];

    let allExist = true;

    criticalFiles.forEach(file => {
      const exists = fs.default.existsSync(file);
      displayResult(`Fichier ${file}`, exists);
      if (!exists) allExist = false;
    });

    return allExist;
  } catch (error) {
    displayResult('Vérification des fichiers', false, error.message);
    return false;
  }
};

// Test de l'authentification
const testAuthentication = () => {
  console.log('\n🔐 Vérification de l\'authentification...');

  try {
    // Vérifier la configuration Auth
    const authConfigExists = require('fs').existsSync('src/configs/auth.config.js');
    displayResult('Configuration Auth', authConfigExists);

    // Vérifier le service Auth
    const authServiceExists = require('fs').existsSync('src/services/auth.service.js');
    displayResult('Service Auth', authServiceExists);

    // Vérifier les variables d'environnement JWT
    const jwtSecret = process.env.JWT_SECRET;
    displayResult('JWT Secret configuré', jwtSecret && jwtSecret.length > 30);

    // Vérifier que le JWT secret n'est pas la valeur par défaut
    const isSecureJWT = jwtSecret && !jwtSecret.includes('change') && !jwtSecret.includes('your-');
    displayResult('JWT Secret sécurisé', isSecureJWT);

    return authConfigExists && authServiceExists && jwtSecret && isSecureJWT;
  } catch (error) {
    displayResult('Vérification Auth', false, error.message);
    return false;
  }
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
    files: await testFileConfiguration(),
    database: await testDatabase(),
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
    console.log('\n📋 Prochaines étapes recommandées:');
    console.log('1. npm run db:generate (générer le client Prisma)');
    console.log('2. npm run build (construire l\'application)');
    console.log('3. npm run deploy:production (déployer vers Cloudflare)');
    process.exit(0);
  } else {
    console.log('\n⚠️ Certains tests ont échoué. Veuillez corriger avant le déploiement.');
    console.log('\n🔧 Actions recommandées:');
    if (!results.environment) console.log('- Vérifier les variables d\'environnement dans .env');
    if (!results.database) console.log('- Vérifier la connexion à la base de données');
    if (!results.security) console.log('- Configurer NODE_ENV=production et CORS');
    if (!results.files) console.log('- Vérifier la présence des fichiers de configuration');
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

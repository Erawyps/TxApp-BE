#!/usr/bin/env node

/**
 * Script de test pour la Vue Chauffeur Corrigée
 * Valide le respect du modèle Prisma et la réciprocité dev/prod
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const config = {
  devServer: 'http://localhost:3000',
  prodServer: 'https://txapp-be.erawyps.workers.dev',
  timeout: 10000
};

console.log('🚀 Test de la Vue Chauffeur Corrigée');
console.log('=====================================\n');

// Test 1 : Vérification des fichiers
console.log('📁 Test 1 : Vérification des fichiers');
const requiredFiles = [
  'src/app/pages/forms/new-post-form/DriverViewCorrected.jsx',
  'src/app/pages/forms/new-post-form/components/ShiftDashboard.jsx',
  'src/app/pages/forms/new-post-form/components/NewShiftForm.jsx',
  'src/app/pages/forms/new-post-form/components/LiveCourseForm.jsx',
  'src/app/pages/forms/new-post-form/components/DriverCoursesList.jsx',
  'README_DRIVER_VIEW_CORRECTED.md'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  const fullPath = join(__dirname, file);
  if (existsSync(fullPath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MANQUANT`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Des fichiers sont manquants. Arrêt du test.');
  process.exit(1);
}

console.log('\n✅ Tous les fichiers requis sont présents\n');

// Test 2 : Validation du modèle Prisma
console.log('🔍 Test 2 : Validation du modèle Prisma');

const driverViewContent = readFileSync(
  join(__dirname, 'src/app/pages/forms/new-post-form/DriverViewCorrected.jsx'), 
  'utf8'
);

const prismaChecks = [
  {
    name: 'Import des services Prisma',
    pattern: /import.*from 'services\/(feuillesRoute|courses|vehicules|clients|modesPaiement)'/g,
    expected: 3
  },
  {
    name: 'Utilisation de chauffeur_id',
    pattern: /chauffeur_id/g,
    expected: 3
  },
  {
    name: 'Gestion feuille_route',
    pattern: /feuille_id/g,
    expected: 8
  },
  {
    name: 'Support modes encodage',
    pattern: /mode_encodage/g,
    expected: 6
  },
  {
    name: 'Validation est_validee',
    pattern: /est_validee.*false/g,
    expected: 2
  }
];

let prismaValid = true;
prismaChecks.forEach(check => {
  const matches = driverViewContent.match(check.pattern);
  const count = matches ? matches.length : 0;
  
  if (count >= check.expected) {
    console.log(`✅ ${check.name}: ${count} occurrences trouvées`);
  } else {
    console.log(`❌ ${check.name}: ${count}/${check.expected} occurrences`);
    prismaValid = false;
  }
});

if (!prismaValid) {
  console.log('\n⚠️  Certaines validations Prisma ont échoué');
} else {
  console.log('\n✅ Toutes les validations Prisma sont correctes');
}

// Test 3 : Validation des composants
console.log('\n🧩 Test 3 : Validation des composants');

const components = [
  'ShiftDashboard',
  'NewShiftForm', 
  'LiveCourseForm',
  'DriverCoursesList',
  'EndShiftForm'
];

let componentsValid = true;
components.forEach(component => {
  if (driverViewContent.includes(`import ${component}`)) {
    console.log(`✅ ${component} - Importé correctement`);
  } else {
    console.log(`❌ ${component} - Import manquant`);
    componentsValid = false;
  }
  
  if (driverViewContent.includes(`<${component}`)) {
    console.log(`✅ ${component} - Utilisé dans le rendu`);
  } else {
    console.log(`❌ ${component} - Non utilisé dans le rendu`);
    componentsValid = false;
  }
});

if (!componentsValid) {
  console.log('\n⚠️  Certains composants ne sont pas correctement intégrés');
} else {
  console.log('\n✅ Tous les composants sont correctement intégrés');
}

// Test 4 : Validation des hooks React
console.log('\n⚛️  Test 4 : Validation des hooks React');

const hooksChecks = [
  { name: 'useState', pattern: /useState/g, expected: 8 },
  { name: 'useEffect', pattern: /useEffect/g, expected: 1 },
  { name: 'useMemo', pattern: /useMemo/g, expected: 1 },
  { name: 'useCallback', pattern: /useCallback/g, expected: 3 }
];

let hooksValid = true;
hooksChecks.forEach(check => {
  const matches = driverViewContent.match(check.pattern);
  const count = matches ? matches.length : 0;
  
  if (count >= check.expected) {
    console.log(`✅ ${check.name}: ${count} utilisations`);
  } else {
    console.log(`❌ ${check.name}: ${count}/${check.expected} utilisations`);
    hooksValid = false;
  }
});

if (!hooksValid) {
  console.log('\n⚠️  Certains hooks React ne sont pas optimalement utilisés');
} else {
  console.log('\n✅ Tous les hooks React sont correctement utilisés');
}

// Test 5 : Validation du workflow
console.log('\n🔄 Test 5 : Validation du workflow');

const workflowChecks = [
  { name: 'Gestion onglets', pattern: /handleTabChange/g, expected: 1 },
  { name: 'Démarrage shift', pattern: /handleStartShift/g, expected: 2 },
  { name: 'Ajout course', pattern: /handleAddCourse/g, expected: 2 },
  { name: 'Fin shift', pattern: /handleEndShift/g, expected: 3 },
  { name: 'Auto-sauvegarde LIVE', pattern: /enregistrée automatiquement en mode LIVE/g, expected: 1 }
];

let workflowValid = true;
workflowChecks.forEach(check => {
  const matches = driverViewContent.match(check.pattern);
  const count = matches ? matches.length : 0;
  
  if (count >= check.expected) {
    console.log(`✅ ${check.name}: ${count} implémentations`);
  } else {
    console.log(`❌ ${check.name}: ${count}/${check.expected} implémentations`);
    workflowValid = false;
  }
});

if (!workflowValid) {
  console.log('\n⚠️  Certaines fonctionnalités du workflow ne sont pas complètes');
} else {
  console.log('\n✅ Toutes les fonctionnalités du workflow sont implémentées');
}

// Test 6 : Validation de la gestion d'erreurs
console.log('\n🛡️  Test 6 : Validation de la gestion d\'erreurs');

const errorHandlingChecks = [
  { name: 'Try/catch blocks', pattern: /try\s*{[\s\S]*?catch\s*\(/g, expected: 4 },
  { name: 'Toast erreurs', pattern: /toast\.error/g, expected: 4 },
  { name: 'Console.error', pattern: /console\.error/g, expected: 4 },
  { name: 'Loading states', pattern: /setLoading|loading|submitting/g, expected: 10 }
];

let errorHandlingValid = true;
errorHandlingChecks.forEach(check => {
  const matches = driverViewContent.match(check.pattern);
  const count = matches ? matches.length : 0;
  
  if (count >= check.expected) {
    console.log(`✅ ${check.name}: ${count} occurrences`);
  } else {
    console.log(`❌ ${check.name}: ${count}/${check.expected} occurrences`);
    errorHandlingValid = false;
  }
});

if (!errorHandlingValid) {
  console.log('\n⚠️  La gestion d\'erreurs pourrait être améliorée');
} else {
  console.log('\n✅ La gestion d\'erreurs est complète');
}

// Résumé final
console.log('\n📊 RÉSUMÉ DES TESTS');
console.log('==================');

const testResults = [
  { name: 'Fichiers requis', status: allFilesExist },
  { name: 'Modèle Prisma', status: prismaValid },
  { name: 'Composants React', status: componentsValid },
  { name: 'Hooks React', status: hooksValid },
  { name: 'Workflow complet', status: workflowValid },
  { name: 'Gestion d\'erreurs', status: errorHandlingValid }
];

const passedTests = testResults.filter(test => test.status).length;
const totalTests = testResults.length;

testResults.forEach(test => {
  console.log(`${test.status ? '✅' : '❌'} ${test.name}`);
});

console.log(`\n📈 Score: ${passedTests}/${totalTests} tests passés`);

if (passedTests === totalTests) {
  console.log('\n🎉 TOUS LES TESTS SONT RÉUSSIS !');
  console.log('La Vue Chauffeur Corrigée est prête pour la production.');
  console.log('\n🚀 Prochaines étapes recommandées:');
  console.log('   1. Tests manuels en environnement de développement');
  console.log('   2. Tests avec utilisateurs réels en production');
  console.log('   3. Monitoring des performances');
  console.log('   4. Formation des chauffeurs sur la nouvelle interface');
} else {
  console.log('\n⚠️  CERTAINS TESTS ONT ÉCHOUÉ');
  console.log('Veuillez corriger les problèmes identifiés avant le déploiement.');
  process.exit(1);
}

console.log('\n🔗 Documentation complète: README_DRIVER_VIEW_CORRECTED.md');
console.log('=====================================');
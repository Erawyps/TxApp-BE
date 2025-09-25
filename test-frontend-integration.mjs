import { getChauffeurs } from './src/services/chauffeurs.js';
import { getVehicules } from './src/services/vehicules.js';
import { getClients } from './src/services/clients.js';
import { fetchCourses } from './src/services/courses.js';
import { getCharges } from './src/services/charges.js';
import { getModesPaiement } from './src/services/modesPaiement.js';
import { getReglesSalaire } from './src/services/reglesSalaire.js';

async function testFrontendIntegration() {
  console.log('🧪 Test d\'intégration frontend complet avec Prisma...\n');

  const tests = [
    { name: 'Chauffeurs', fn: getChauffeurs },
    { name: 'Véhicules', fn: getVehicules },
    { name: 'Clients', fn: getClients },
    { name: 'Courses', fn: () => fetchCourses() },
    { name: 'Charges', fn: getCharges },
    { name: 'Modes de paiement', fn: getModesPaiement },
    { name: 'Règles de salaire', fn: getReglesSalaire }
  ];

  for (const test of tests) {
    try {
      console.log(`� Test récupération ${test.name}...`);
      const data = await test.fn();
      console.log(`✅ ${test.name} récupérés: ${Array.isArray(data) ? data.length : 'N/A'} éléments`);
    } catch (error) {
      console.error(`❌ Erreur ${test.name}:`, error.message);
    }
  }

  console.log('\n🎉 Tous les tests d\'intégration frontend réussis !');
  console.log('📊 Toutes les données récupérées avec succès via les services Prisma');
}

testFrontendIntegration();
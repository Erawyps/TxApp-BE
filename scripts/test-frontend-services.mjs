// Simuler import.meta.env pour les tests
globalThis.import = { meta: { env: { VITE_API_URL: 'http://localhost:3001/api', PROD: false } } };

import { getReglesSalaireForDropdown } from '../src/services/reglesSalaire.js';
import { getVehicules } from '../src/services/vehicules.js';

console.log('🧪 Test des services frontend...');

async function testServices() {
  try {
    console.log('📊 Test des règles de salaire...');
    const regles = await getReglesSalaireForDropdown();
    console.log('✅ Règles de salaire récupérées:', regles?.length || 0);

    console.log('🚗 Test des véhicules...');
    const vehicules = await getVehicules();
    console.log('✅ Véhicules récupérés:', vehicules?.data?.length || 0);

    console.log('🎉 Tests terminés avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
    console.error('Stack:', error.stack);
  }
}

testServices();
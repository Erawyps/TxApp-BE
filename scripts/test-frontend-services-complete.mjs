// Simuler l'environnement Vite pour les tests
globalThis.import = { meta: { env: { VITE_API_URL: 'http://localhost:3001/api', PROD: false } } };

// Simuler fetch pour les tests
globalThis.fetch = (await import('node-fetch')).default;

import { getReglesSalaireForDropdown } from '../src/services/reglesSalaire.js';
import { getVehicules } from '../src/services/vehicules.js';

console.log('🧪 Test des services frontend avec simulation complète...');

async function testFrontendServices() {
  try {
    console.log('📊 Test des règles de salaire...');
    const regles = await getReglesSalaireForDropdown();
    console.log('✅ Règles de salaire récupérées:', regles?.length || 0);
    if (regles && regles.length > 0) {
      console.log('📋 Échantillon:', regles.slice(0, 2));
    }

    console.log('🚗 Test des véhicules...');
    const vehiculesResponse = await getVehicules();
    const vehicules = vehiculesResponse?.data || [];
    console.log('✅ Véhicules récupérés:', vehicules?.length || 0);
    if (vehicules && vehicules.length > 0) {
      console.log('📋 Échantillon:', vehicules.slice(0, 2).map(v => ({ id: v.id, plaque: v.plaque_immatriculation, marque: v.marque })));
    }

    console.log('🎉 Tests terminés avec succès !');

    // Test des formats attendus par les composants
    console.log('\n🔍 Test des formats pour les composants:');

    // Format pour ShiftForm (véhicules)
    const vehicleOptions = vehicules.length > 0
      ? vehicules.map(v => ({
          value: v.id,
          label: `${v.plaque_immatriculation} - ${v.marque} ${v.modele}`
        }))
      : [];
    console.log('🚗 Options véhicules pour ShiftForm:', vehicleOptions.length);

    // Format pour les règles de salaire
    const remunerationOptions = regles.length > 0
      ? [{ value: '', label: 'Sélectionner un type de rémunération' }, ...regles]
      : [{ value: '', label: 'Chargement des types...' }];
    console.log('💰 Options rémunération pour ShiftForm:', remunerationOptions.length);

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
    console.error('Stack:', error.stack);
  }
}

testFrontendServices();
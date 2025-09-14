import fetch from 'node-fetch';

console.log('🧪 Test direct des endpoints depuis le frontend...');

async function testFrontendAPICalls() {
  const baseUrl = 'http://localhost:3001/api';

  try {
    console.log('📊 Test des règles de salaire...');
    const reglesResponse = await fetch(`${baseUrl}/regles-salaire?actif=true&limit=100`);
    if (!reglesResponse.ok) {
      throw new Error(`HTTP ${reglesResponse.status}: ${reglesResponse.statusText}`);
    }
    const reglesData = await reglesResponse.json();
    console.log('✅ Règles de salaire récupérées:', reglesData.data?.length || 0);

    console.log('🚗 Test des véhicules...');
    const vehiculesResponse = await fetch(`${baseUrl}/vehicules`);
    if (!vehiculesResponse.ok) {
      throw new Error(`HTTP ${vehiculesResponse.status}: ${vehiculesResponse.statusText}`);
    }
    const vehiculesData = await vehiculesResponse.json();
    console.log('✅ Véhicules récupérés:', vehiculesData.data?.length || 0);

    console.log('🎉 Tests terminés avec succès !');

    // Simuler le formatage pour les composants
    console.log('\n🔍 Formatage pour les composants:');

    // Format pour ShiftForm (véhicules)
    const vehicles = vehiculesData.data || [];
    const vehicleOptions = vehicles.length > 0
      ? vehicles.map(v => ({
          value: v.id,
          label: `${v.plaque_immatriculation} - ${v.marque} ${v.modele}`
        }))
      : [];
    console.log('🚗 Options véhicules pour ShiftForm:', vehicleOptions.length);
    if (vehicleOptions.length > 0) {
      console.log('📋 Exemples:', vehicleOptions.slice(0, 2));
    }

    // Format pour les règles de salaire
    const regles = reglesData.data || [];
    const remunerationOptions = regles.length > 0
      ? [{ value: '', label: 'Sélectionner un type de rémunération' }, ...regles]
      : [{ value: '', label: 'Chargement des types...' }];
    console.log('💰 Options rémunération:', remunerationOptions.length);
    if (regles.length > 0) {
      console.log('📋 Exemples:', regles.slice(0, 2));
    }

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
  }
}

testFrontendAPICalls();
console.log('🧪 Test direct des endpoints API...');

async function testEndpoints() {
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
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
  }
}

testEndpoints();
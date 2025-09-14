import fetch from 'node-fetch';

async function testAPI() {
  try {
    console.log('🧪 Test des endpoints API...');

    // Test GET /api/chauffeurs/15
    console.log('\n📋 Test GET /api/chauffeurs/15');
    const response = await fetch('http://localhost:3001/api/chauffeurs/15');
    const data = await response.json();

    if (response.ok) {
      console.log('✅ Requête réussie');
      console.log('Données reçues:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Erreur:', response.status, data);
    }

  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
  }
}

testAPI();
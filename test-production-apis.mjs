import axios from 'axios';

const BASE_URL = 'https://txapp.be/api';

const testEndpoints = [
  { name: 'chauffeurs', endpoint: '/chauffeurs' },
  { name: 'vehicules', endpoint: '/vehicules' },
  { name: 'clients', endpoint: '/clients' },
  { name: 'courses', endpoint: '/courses' },
  { name: 'charges', endpoint: '/charges' },
  { name: 'modes-paiement', endpoint: '/modes-paiement' },
  { name: 'regles-salaire', endpoint: '/regles-salaire' }
];

async function testProductionAPI() {
  console.log('🧪 Test des APIs en production...\n');

  for (const test of testEndpoints) {
    try {
      console.log(`Testing ${test.name}...`);
      const response = await axios.get(`${BASE_URL}${test.endpoint}`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        const data = response.data;
        if (Array.isArray(data)) {
          console.log(`✅ ${test.name}: ${data.length} éléments retournés`);
        } else {
          console.log(`✅ ${test.name}: Réponse valide`);
        }
      } else {
        console.log(`❌ ${test.name}: Status ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: Erreur - ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Data: ${JSON.stringify(error.response.data)}`);
      }
    }
    console.log('');
  }

  console.log('🏁 Tests terminés');
}

testProductionAPI().catch(console.error);
import axios from 'axios';

// Configuration de test pour production
const BASE_URL = 'https://api.txapp.be';
const API_KEY = 'TxApp-API-Key-2025'; // Clé API pour bypass Cloudflare

// Headers pour bypass Cloudflare
const headers = {
  'User-Agent': 'TxApp-Testing/1.0',
  'X-API-Key': API_KEY,
  'X-Requested-With': 'XMLHttpRequest',
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache'
};

// Fonction pour obtenir un token d'authentification
async function getAuthToken() {
  try {
    console.log('🔐 Obtention du token d\'authentification...');
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'admin@txapp.com',
      password: 'TxApp@Admin2024!'
    }, { headers, timeout: 10000 });

    if (response.data.token) {
      console.log('✅ Token obtenu avec succès');
      return response.data.token;
    } else {
      console.log('❌ Échec de l\'obtention du token');
      return null;
    }
  } catch (error) {
    console.log('❌ Erreur lors de l\'obtention du token:', error.message);
    return null;
  }
}

const testEndpoints = [
  { name: 'chauffeurs', endpoint: '/api/test/chauffeurs' },
  { name: 'vehicules', endpoint: '/api/test/vehicules' },
  { name: 'clients', endpoint: '/api/test/clients' },
  { name: 'courses', endpoint: '/api/test/courses' },
  { name: 'charges', endpoint: '/api/test/charges' },
  { name: 'modes-paiement', endpoint: '/api/test/modes-paiement' },
  { name: 'regles-salaire', endpoint: '/api/test/regles-salaire' }
];

async function testProductionAPI() {
  console.log('🧪 Test des APIs en production (routes de test sans auth)...\n');

  for (const test of testEndpoints) {
    try {
      console.log(`Testing ${test.name}...`);
      const response = await axios.get(`${BASE_URL}${test.endpoint}`, {
        timeout: 10000,
        headers: headers
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
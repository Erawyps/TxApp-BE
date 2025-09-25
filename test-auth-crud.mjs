import axios from 'axios';

// Configuration
const BASE_URL = 'https://api.txapp.be';
const API_KEY = 'TxApp-2025-API-Key-Super-Secure';

// Headers pour bypass Cloudflare
const headers = {
  'X-API-Key': API_KEY,
  'Content-Type': 'application/json'
};

console.log('🔐 Test d\'authentification et CRUD complet...\n');

// Test de login
async function testLogin() {
  try {
    console.log('Testing login...');
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'jean.dupont@txapp.be',
      password: 'admin123'
    }, { headers });

    console.log('✅ Login successful');
    console.log('Token:', response.data.token ? 'Present' : 'Missing');
    return response.data.token;
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data || error.message);
    return null;
  }
}

// Test des routes authentifiées
async function testAuthenticatedRoutes(token) {
  const authHeaders = {
    ...headers,
    'Authorization': `Bearer ${token}`
  };

  console.log('\n🔒 Testing authenticated routes...\n');

  // Test GET chauffeurs
  try {
    console.log('Testing GET /api/chauffeurs...');
    const response = await axios.get(`${BASE_URL}/api/chauffeurs`, { headers: authHeaders });
    console.log('✅ GET chauffeurs: OK');
  } catch (error) {
    console.log('❌ GET chauffeurs failed:', error.response?.data || error.message);
  }

  // Test POST chauffeur
  try {
    console.log('Testing POST /api/chauffeurs...');
    const timestamp = Date.now();
    const newChauffeur = {
      nom: 'Test Chauffeur',
      prenom: 'API',
      email: `test.api.${timestamp}@txapp.be`,
      telephone: '+32412345678',
      statut: 'Actif'
    };
    const response = await axios.post(`${BASE_URL}/api/chauffeurs`, newChauffeur, { headers: authHeaders });
    console.log('✅ POST chauffeurs: OK');
    console.log('Created chauffeur ID:', response.data.id);
    return response.data.id;
  } catch (error) {
    console.log('❌ POST chauffeurs failed:', error.response?.data || error.message);
    return null;
  }
}

// Test CRUD véhicules
async function testVehiculesCRUD(token) {
  const authHeaders = {
    ...headers,
    'Authorization': `Bearer ${token}`
  };

  console.log('\n🚗 Testing véhicules CRUD...\n');

  // Test GET véhicules
  try {
    console.log('Testing GET /api/vehicules...');
    const response = await axios.get(`${BASE_URL}/api/vehicules`, { headers: authHeaders });
    console.log('✅ GET vehicules: OK');
  } catch (error) {
    console.log('❌ GET vehicules failed:', error.response?.data || error.message);
  }

  // Test POST véhicule
  let vehiculeId = null;
  try {
    console.log('Testing POST /api/vehicules...');
    const timestamp = Date.now();
    const newVehicule = {
      plaque_immatriculation: `TEST${timestamp.toString().slice(-4)}`,
      num_identification: `VIN${timestamp}`,
      marque: 'Test Brand',
      modele: 'Test Model',
      annee: 2023,
      est_actif: true
    };
    const response = await axios.post(`${BASE_URL}/api/vehicules`, newVehicule, { headers: authHeaders });
    console.log('✅ POST vehicules: OK');
    console.log('Created vehicule ID:', response.data.id);
    vehiculeId = response.data.id;
  } catch (error) {
    console.log('❌ POST vehicules failed:', error.response?.data || error.message);
  }

  // Test PUT véhicule
  if (vehiculeId) {
    try {
      console.log('Testing PUT /api/vehicules...');
      const updateData = {
        marque: 'Updated Brand',
        modele: 'Updated Model'
      };
      await axios.put(`${BASE_URL}/api/vehicules/${vehiculeId}`, updateData, { headers: authHeaders });
      console.log('✅ PUT vehicules: OK');
    } catch (error) {
      console.log('❌ PUT vehicules failed:', error.response?.data || error.message);
    }

    // Test DELETE véhicule
    try {
      console.log('Testing DELETE /api/vehicules...');
      await axios.delete(`${BASE_URL}/api/vehicules/${vehiculeId}`, { headers: authHeaders });
      console.log('✅ DELETE vehicules: OK');
    } catch (error) {
      console.log('❌ DELETE vehicules failed:', error.response?.data || error.message);
    }
  }
}

// Test CRUD clients
async function testClientsCRUD(token) {
  const authHeaders = {
    ...headers,
    'Authorization': `Bearer ${token}`
  };

  console.log('\n👥 Testing clients CRUD...\n');

  // Test GET clients
  try {
    console.log('Testing GET /api/clients...');
    const response = await axios.get(`${BASE_URL}/api/clients`, { headers: authHeaders });
    console.log('✅ GET clients: OK');
  } catch (error) {
    console.log('❌ GET clients failed:', error.response?.data || error.message);
  }

  // Test POST client
  let clientId = null;
  try {
    console.log('Testing POST /api/clients...');
    const timestamp = Date.now();
    const newClient = {
      nom_societe: `Test Company ${timestamp}`,
      num_tva: `BE012345678${timestamp.toString().slice(-1)}`,
      adresse: '123 Test Street',
      telephone: '+32412345678',
      email: `contact${timestamp}@testcompany.be`,
      est_actif: true
    };
    const response = await axios.post(`${BASE_URL}/api/clients`, newClient, { headers: authHeaders });
    console.log('✅ POST clients: OK');
    console.log('Created client ID:', response.data.id);
    clientId = response.data.id;
  } catch (error) {
    console.log('❌ POST clients failed:', error.response?.data || error.message);
  }

  // Test PUT client
  if (clientId) {
    try {
      console.log('Testing PUT /api/clients...');
      const updateData = {
        nom_societe: 'Updated Test Company',
        adresse: '456 Updated Street'
      };
      await axios.put(`${BASE_URL}/api/clients/${clientId}`, updateData, { headers: authHeaders });
      console.log('✅ PUT clients: OK');
    } catch (error) {
      console.log('❌ PUT clients failed:', error.response?.data || error.message);
    }

    // Test DELETE client
    try {
      console.log('Testing DELETE /api/clients...');
      await axios.delete(`${BASE_URL}/api/clients/${clientId}`, { headers: authHeaders });
      console.log('✅ DELETE clients: OK');
    } catch (error) {
      console.log('❌ DELETE clients failed:', error.response?.data || error.message);
    }
  }
}

// Test CRUD modes de paiement
async function testModesPaiementCRUD(token) {
  const authHeaders = {
    ...headers,
    'Authorization': `Bearer ${token}`
  };

  console.log('\n💳 Testing modes-paiement CRUD...\n');

  // Test GET modes-paiement
  try {
    console.log('Testing GET /api/modes-paiement...');
    const response = await axios.get(`${BASE_URL}/api/modes-paiement`, { headers: authHeaders });
    console.log('✅ GET modes-paiement: OK');
  } catch (error) {
    console.log('❌ GET modes-paiement failed:', error.response?.data || error.message);
  }

  // Test POST mode de paiement
  let modeId = null;
  try {
    console.log('Testing POST /api/modes-paiement...');
    const timestamp = Date.now();
    const newMode = {
      code: `TEST${timestamp.toString().slice(-4)}`,
      libelle: 'Test Payment Method',
      type: 'Cash',
      est_actif: true
    };
    const response = await axios.post(`${BASE_URL}/api/modes-paiement`, newMode, { headers: authHeaders });
    console.log('✅ POST modes-paiement: OK');
    console.log('Created mode ID:', response.data.id);
    modeId = response.data.id;
  } catch (error) {
    console.log('❌ POST modes-paiement failed:', error.response?.data || error.message);
  }

  // Test PUT mode de paiement
  if (modeId) {
    try {
      console.log('Testing PUT /api/modes-paiement...');
      const updateData = {
        libelle: 'Updated Test Payment Method',
        type: 'Bancontact'
      };
      await axios.put(`${BASE_URL}/api/modes-paiement/${modeId}`, updateData, { headers: authHeaders });
      console.log('✅ PUT modes-paiement: OK');
    } catch (error) {
      console.log('❌ PUT modes-paiement failed:', error.response?.data || error.message);
    }

    // Test DELETE mode de paiement
    try {
      console.log('Testing DELETE /api/modes-paiement...');
      await axios.delete(`${BASE_URL}/api/modes-paiement/${modeId}`, { headers: authHeaders });
      console.log('✅ DELETE modes-paiement: OK');
    } catch (error) {
      console.log('❌ DELETE modes-paiement failed:', error.response?.data || error.message);
    }
  }
}

// Test CRUD règles de salaire
async function testReglesSalaireCRUD(token) {
  const authHeaders = {
    ...headers,
    'Authorization': `Bearer ${token}`
  };

  console.log('\n💰 Testing regles-salaire CRUD...\n');

  // Test GET regles-salaire
  try {
    console.log('Testing GET /api/regles-salaire...');
    const response = await axios.get(`${BASE_URL}/api/regles-salaire`, { headers: authHeaders });
    console.log('✅ GET regles-salaire: OK');
  } catch (error) {
    console.log('❌ GET regles-salaire failed:', error.response?.data || error.message);
  }

  // Test POST règle de salaire
  let regleId = null;
  try {
    console.log('Testing POST /api/regles-salaire...');
    const timestamp = Date.now();
    const newRegle = {
      nom_regle: `Test Rule ${timestamp}`,
      est_variable: true,
      seuil_recette: 100.00,
      pourcentage_base: 5.00,
      pourcentage_au_dela: 10.00,
      description: 'Test salary rule'
    };
    const response = await axios.post(`${BASE_URL}/api/regles-salaire`, newRegle, { headers: authHeaders });
    console.log('✅ POST regles-salaire: OK');
    console.log('Created regle ID:', response.data.id);
    regleId = response.data.id;
  } catch (error) {
    console.log('❌ POST regles-salaire failed:', error.response?.data || error.message);
  }

  // Test PUT règle de salaire
  if (regleId) {
    try {
      console.log('Testing PUT /api/regles-salaire...');
      const updateData = {
        nom_regle: 'Updated Test Rule',
        seuil_recette: 150.00
      };
      await axios.put(`${BASE_URL}/api/regles-salaire/${regleId}`, updateData, { headers: authHeaders });
      console.log('✅ PUT regles-salaire: OK');
    } catch (error) {
      console.log('❌ PUT regles-salaire failed:', error.response?.data || error.message);
    }

    // Test DELETE règle de salaire
    try {
      console.log('Testing DELETE /api/regles-salaire...');
      await axios.delete(`${BASE_URL}/api/regles-salaire/${regleId}`, { headers: authHeaders });
      console.log('✅ DELETE regles-salaire: OK');
    } catch (error) {
      console.log('❌ DELETE regles-salaire failed:', error.response?.data || error.message);
    }
  }
}

// Test PUT et DELETE
async function testUpdateAndDelete(token, chauffeurId) {
  const authHeaders = {
    ...headers,
    'Authorization': `Bearer ${token}`
  };

  // Test PUT chauffeur
  try {
    console.log('Testing PUT /api/chauffeurs...');
    const updateData = {
      nom: 'Test Chauffeur Updated',
      prenom: 'API Updated'
    };
    await axios.put(`${BASE_URL}/api/chauffeurs/${chauffeurId}`, updateData, { headers: authHeaders });
    console.log('✅ PUT chauffeurs: OK');
  } catch (error) {
    console.log('❌ PUT chauffeurs failed:', error.response?.data || error.message);
  }

  // Test DELETE chauffeur
  try {
    console.log('Testing DELETE /api/chauffeurs...');
    await axios.delete(`${BASE_URL}/api/chauffeurs/${chauffeurId}`, { headers: authHeaders });
    console.log('✅ DELETE chauffeurs: OK');
  } catch (error) {
    console.log('❌ DELETE chauffeurs failed:', error.response?.data || error.message);
  }
}

// Fonction principale
async function main() {
  const token = await testLogin();

  if (!token) {
    console.log('\n❌ Cannot proceed without authentication token');
    return;
  }

  const chauffeurId = await testAuthenticatedRoutes(token);

  if (chauffeurId) {
    await testUpdateAndDelete(token, chauffeurId);
  }

  // Test CRUD pour toutes les entités
  await testVehiculesCRUD(token);
  await testClientsCRUD(token);
  await testModesPaiementCRUD(token);
  await testReglesSalaireCRUD(token);

  console.log('\n🏁 All tests completed');
}

// Exécuter les tests
main().catch(console.error);
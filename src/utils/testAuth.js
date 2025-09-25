/**
 * Script de test pour vérifier la connexion à la base de données
 * et le bon fonctionnement des services d'authentification via l'API backend
 */

// Configuration de l'API
const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env) 
  ? import.meta.env.VITE_API_URL || ''
  : process.env.VITE_API_URL || 'http://localhost:3001';

// Préfixes pour les endpoints (toujours /api car tous les endpoints sont sous /api)
const API_PREFIX = '/api';

// Test de connexion à l'API backend
export const testAPIConnection = async () => {
  console.log("🔍 Test de connexion à l'API backend...");

  try {
    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status === 'OK') {
      console.log("✅ Connexion API backend réussie");
      return true;
    } else {
      throw new Error(`Statut invalide: ${data.status}`);
    }
  } catch (error) {
    console.error("❌ Erreur lors du test de connexion:", error);
    return false;
  }
};

// Test de structure de la base de données via l'API
export const testDatabaseStructure = async () => {
  console.log("🔍 Test de la structure de la base de données...");

  try {
    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status === 'OK') {
      console.log("✅ Structure de la base de données valide");
      return true;
    } else {
      throw new Error(`Statut invalide: ${data.status}`);
    }
  } catch (error) {
    console.error("❌ Erreur lors du test de structure:", error);
    return false;
  }
};

// Test d'authentification
export const testAuthentication = async () => {
  console.log("🔍 Test d'authentification...");

  try {
    // Test de login avec des credentials de test
    const loginResponse = await fetch(`${API_BASE_URL}${API_PREFIX}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'marie.martin@txapp.be',
        password: 'admin456'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: HTTP ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();

    if (loginData.token) {
      console.log("✅ Authentification réussie");

      // Test de vérification du token
      const verifyResponse = await fetch(`${API_BASE_URL}${API_PREFIX}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: loginData.token
        })
      });

      if (verifyResponse.ok) {
        console.log("✅ Vérification du token réussie");
        return true;
      } else {
        console.log("❌ Vérification du token échouée");
        return false;
      }
    } else {
      throw new Error("Token non reçu");
    }
  } catch (error) {
    console.error("❌ Erreur lors du test d'authentification:", error);
    return false;
  }
};

// Test de récupération d'utilisateurs via l'API
export const testGetUsers = async () => {
  console.log("🔍 Test de récupération d'utilisateurs...");

  try {
    // D'abord s'authentifier pour obtenir un token
    const loginResponse = await fetch(`${API_BASE_URL}${API_PREFIX}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'marie.martin@txapp.be',
        password: 'admin456'
      })
    });

    if (!loginResponse.ok) {
      throw new Error("Authentication failed for user retrieval test");
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;

    // Test de récupération des utilisateurs
    const usersResponse = await fetch(`${API_BASE_URL}${API_PREFIX}/utilisateurs`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!usersResponse.ok) {
      throw new Error(`HTTP ${usersResponse.status}: ${usersResponse.statusText}`);
    }

    const usersData = await usersResponse.json();

    if (Array.isArray(usersData) && usersData.length > 0) {
      console.log(`✅ Récupération réussie: ${usersData.length} utilisateur(s) trouvé(s)`);
      return true;
    } else {
      console.log("⚠️ Aucun utilisateur trouvé ou format invalide");
      return false;
    }
  } catch (error) {
    console.error("❌ Erreur lors du test de récupération:", error);
    return false;
  }
};

// Test complet du système
export const runAllTests = async () => {
  console.log("🚀 Démarrage des tests du système d'authentification...\n");

  const tests = [
    { name: "Connexion API Backend", fn: testAPIConnection },
    { name: "Structure base de données", fn: testDatabaseStructure },
    { name: "Authentification", fn: testAuthentication },
    { name: "Récupération utilisateurs", fn: testGetUsers }
  ];

  const results = [];

  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, success: result });
    } catch (error) {
      console.error(`❌ Erreur dans le test ${test.name}:`, error);
      results.push({ name: test.name, success: false, error: error.message });
    }
    console.log(""); // Ligne vide pour la lisibilité
  }

  // Résumé des résultats
  console.log("📊 RÉSUMÉ DES TESTS:");
  console.log("==================");

  const passed = results.filter(r => r.success).length;
  const total = results.length;

  results.forEach(result => {
    const status = result.success ? "✅ PASSÉ" : "❌ ÉCHEC";
    console.log(`${status} - ${result.name}`);
    if (result.error) {
      console.log(`   Erreur: ${result.error}`);
    }
  });

  console.log(`\n🎯 Résultat global: ${passed}/${total} tests réussis`);

  if (passed === total) {
    console.log("🎉 Tous les tests sont passés ! Le système est opérationnel.");
  } else {
    console.log("⚠️ Certains tests ont échoué. Vérifiez la configuration.");
  }

  return { passed, total, results };
};

#!/usr/bin/env node

/**
 * Script de test des nouvelles fonctionnalités chauffeur
 * Teste les endpoints: statistiques, sauvegarde automatique, interventions
 */

const axios = require('axios');

// Configuration
const API_BASE = process.env.API_BASE || 'http://localhost:3000/api';
const TEST_CHAUFFEUR_ID = process.env.TEST_CHAUFFEUR_ID || 1;
const AUTH_TOKEN = process.env.AUTH_TOKEN; // Token JWT d'un chauffeur

// Fonction utilitaire pour les requêtes API
async function apiRequest(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      ...(data && { data })
    };

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

// Tests des fonctionnalités
async function runTests() {
  console.log('🧪 Démarrage des tests des fonctionnalités chauffeur...\n');

  if (!AUTH_TOKEN) {
    console.log('⚠️  AUTH_TOKEN non défini. Certains tests nécessitent une authentification.');
  }

  let passed = 0;
  let failed = 0;

  // Test 1: Récupération des statistiques chauffeur
  console.log('📊 Test 1: Statistiques chauffeur');
  const statsResult = await apiRequest('GET', `/chauffeurs/${TEST_CHAUFFEUR_ID}/stats`);
  if (statsResult.success) {
    console.log('✅ Statistiques récupérées avec succès');
    if (statsResult.data.data?.metriques?.ratio_euro_par_km !== undefined) {
      console.log(`   📈 Ratio €/km: ${statsResult.data.data.metriques.ratio_euro_par_km}`);
      passed++;
    } else {
      console.log('❌ Ratio €/km manquant dans la réponse');
      failed++;
    }
  } else {
    console.log('❌ Échec récupération statistiques:', statsResult.error);
    failed++;
  }

  // Test 2: Statistiques avec période
  console.log('\n📅 Test 2: Statistiques avec période');
  const today = new Date().toISOString().split('T')[0];
  const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const statsPeriodResult = await apiRequest('GET', `/chauffeurs/${TEST_CHAUFFEUR_ID}/stats?startDate=${lastMonth}&endDate=${today}`);
  if (statsPeriodResult.success) {
    console.log('✅ Statistiques périodiques récupérées');
    passed++;
  } else {
    console.log('❌ Échec statistiques périodiques:', statsPeriodResult.error);
    failed++;
  }

  // Test 3: Création d'une intervention (nécessite auth chauffeur)
  if (AUTH_TOKEN) {
    console.log('\n🚔 Test 3: Création d\'intervention');
    const interventionData = {
      feuille_route_id: 1, // À adapter selon vos données de test
      type_intervention: 'Police',
      date_heure: new Date().toISOString(),
      lieu: 'Test Location',
      motif: 'Contrôle de routine',
      observations: 'Test automatique'
    };

    const interventionResult = await apiRequest('POST', '/interventions', interventionData, AUTH_TOKEN);
    if (interventionResult.success) {
      console.log('✅ Intervention créée avec succès');
      passed++;
    } else {
      console.log('❌ Échec création intervention:', interventionResult.error);
      failed++;
    }

    // Test 4: Récupération des interventions
    console.log('\n📋 Test 4: Récupération des interventions');
    const interventionsResult = await apiRequest('GET', `/chauffeurs/${TEST_CHAUFFEUR_ID}/interventions`, null, AUTH_TOKEN);
    if (interventionsResult.success) {
      console.log(`✅ Interventions récupérées: ${interventionsResult.data.count} trouvées`);
      passed++;
    } else {
      console.log('❌ Échec récupération interventions:', interventionsResult.error);
      failed++;
    }

    // Test 5: Sauvegarde automatique d'une course
    console.log('\n💾 Test 5: Sauvegarde automatique');
    const autoSaveData = {
      numero_ordre: 1,
      index_depart: 1000,
      lieu_embarquement: 'Test Start',
      prix_taximetre: 15.50,
      somme_percue: 18.00
    };

    const autoSaveResult = await apiRequest('PUT', '/courses/1/auto-save', autoSaveData, AUTH_TOKEN); // ID à adapter
    if (autoSaveResult.success) {
      console.log('✅ Sauvegarde automatique réussie');
      passed++;
    } else {
      console.log('❌ Échec sauvegarde automatique:', autoSaveResult.error);
      failed++;
    }
  } else {
    console.log('\n⏭️  Tests d\'authentification ignorés (AUTH_TOKEN non défini)');
    failed += 3; // On compte comme échoués les tests nécessitant auth
  }

  // Test 6: Validation des calculs de pourboires
  console.log('\n🧮 Test 6: Validation calculs pourboires');
  // Ce test nécessiterait de créer/modifier une course et vérifier le calcul
  console.log('ℹ️  Test manuel requis: créer une course et vérifier que pourboire = somme_percue - prix_taximetre');

  // Résumé
  console.log('\n' + '='.repeat(50));
  console.log('📊 RÉSULTATS DES TESTS');
  console.log('='.repeat(50));
  console.log(`✅ Tests réussis: ${passed}`);
  console.log(`❌ Tests échoués: ${failed}`);
  console.log(`📈 Taux de réussite: ${passed + failed > 0 ? Math.round((passed / (passed + failed)) * 100) : 0}%`);

  if (failed === 0) {
    console.log('\n🎉 Tous les tests sont passés! Les fonctionnalités chauffeur sont opérationnelles.');
  } else {
    console.log('\n⚠️  Certains tests ont échoué. Vérifiez les logs ci-dessus.');
  }

  console.log('\n💡 Pour exécuter ce script:');
  console.log('   AUTH_TOKEN=your_jwt_token TEST_CHAUFFEUR_ID=1 node scripts/test-chauffeur-features.js');
}

// Exécution des tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
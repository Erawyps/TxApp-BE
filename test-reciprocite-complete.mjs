#!/usr/bin/env node

/**
 * 🔄 TEST COMPLET RÉCIPROCITÉ DEV/PROD
 * Validation complète de la cohérence entre développement et production
 */

const BASE_URL_DEV = 'http://localhost:3001/api';
const BASE_URL_PROD = 'https://api.txapp.be/api';
const CHAUFFEUR_ID = 5;

console.log('🔄 TEST COMPLET RÉCIPROCITÉ DEV/PROD');
console.log('⏰', new Date().toLocaleString());
console.log('');

let testResults = {
  dev: { shiftId: null, success: 0, failed: 0, details: [] },
  prod: { shiftId: null, success: 0, failed: 0, details: [] }
};

// Utilitaire pour faire des requêtes avec gestion d'erreur
async function makeRequest(url, method = 'GET', data = null, env = 'dev') {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  if (env === 'prod') {
    headers['X-API-Key'] = 'TxApp-API-Key-2025';
  }
  
  const options = { method, headers };
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    
    if (response.ok) {
      testResults[env].success++;
      return { success: true, status: response.status, data: result };
    } else {
      console.log(`❌ ${env.toUpperCase()} - Échec (${response.status}): ${result.error || result.message}`);
      testResults[env].failed++;
      return { success: false, status: response.status, data: result };
    }
  } catch (error) {
    console.log(`💥 ${env.toUpperCase()} - Erreur réseau: ${error.message}`);
    testResults[env].failed++;
    return { success: false, error: error.message };
  }
}

// Test 1: Health Check
async function testHealthCheck() {
  console.log('🎯 TEST 1: Health Check');
  console.log('─'.repeat(50));
  
  const devHealth = await makeRequest(`${BASE_URL_DEV}/health`, 'GET', null, 'dev');
  const prodHealth = await makeRequest(`${BASE_URL_PROD}/health`, 'GET', null, 'prod');
  
  console.log(`  DEV:  ${devHealth.success ? '✅' : '❌'} ${devHealth.data?.env || 'error'}`);
  console.log(`  PROD: ${prodHealth.success ? '✅' : '❌'} ${prodHealth.data?.env || 'error'}`);
  console.log('');
  
  return { dev: devHealth.success, prod: prodHealth.success };
}

// Test 2: Création de shift avec mêmes données
async function testShiftCreation() {
  console.log('🎯 TEST 2: Création de Shift');
  console.log('─'.repeat(50));
  
  const shiftData = {
    chauffeur_id: CHAUFFEUR_ID,
    vehicule_id: 2,
    date_service: "2024-10-12", // Date unique
    mode_encodage: "LIVE",
    index_km_debut_tdb: 90000,
    heure_debut: "06:30"
  };
  
  console.log('📦 Données:', JSON.stringify(shiftData, null, 2));
  console.log('');
  
  // DEV: utilise /api/dashboard/feuilles-route car il fonctionne mieux
  const devResult = await makeRequest(
    `${BASE_URL_DEV}/dashboard/feuilles-route`, 
    'POST', 
    shiftData, 
    'dev'
  );
  
  // PROD: utilise /api/dashboard/feuilles-route
  const prodResult = await makeRequest(
    `${BASE_URL_PROD}/dashboard/feuilles-route`, 
    'POST', 
    shiftData, 
    'prod'
  );
  
  if (devResult.success) {
    testResults.dev.shiftId = devResult.data.feuille_id;
    console.log(`  DEV:  ✅ Shift créé - ID ${devResult.data.feuille_id}`);
    testResults.dev.details.push(`Shift ${devResult.data.feuille_id} créé`);
  } else {
    console.log(`  DEV:  ❌ Échec création shift`);
  }
  
  if (prodResult.success) {
    testResults.prod.shiftId = prodResult.data.feuille_id;
    console.log(`  PROD: ✅ Shift créé - ID ${prodResult.data.feuille_id}`);
    testResults.prod.details.push(`Shift ${prodResult.data.feuille_id} créé`);
  } else {
    console.log(`  PROD: ❌ Échec création shift`);
  }
  
  console.log('');
  return { dev: devResult.success, prod: prodResult.success };
}

// Test 3: Ajout de courses
async function testCourses() {
  console.log('🎯 TEST 3: Ajout de Courses');
  console.log('─'.repeat(50));
  
  if (!testResults.dev.shiftId && !testResults.prod.shiftId) {
    console.log('❌ Aucun shift disponible pour tester les courses');
    console.log('');
    return { dev: false, prod: false };
  }
  
  const courseData = {
    num_ordre: 1,
    index_depart: 90000,
    index_embarquement: 90005,
    lieu_embarquement: "Brussels Airport T1",
    heure_embarquement: "07:00",
    index_debarquement: 90030,
    lieu_debarquement: "Brussels Central Station",
    heure_debarquement: "07:45",
    prix_taximetre: 52.75,
    sommes_percues: 55.00,
    mode_paiement_id: 1
  };
  
  let devSuccess = false, prodSuccess = false;
  
  // Test DEV
  if (testResults.dev.shiftId) {
    const devCourseData = { ...courseData, feuille_id: testResults.dev.shiftId };
    const devResult = await makeRequest(`${BASE_URL_DEV}/courses`, 'POST', devCourseData, 'dev');
    if (devResult.success) {
      console.log(`  DEV:  ✅ Course ajoutée - ID ${devResult.data.course_id}`);
      testResults.dev.details.push(`Course ${devResult.data.course_id} ajoutée`);
      devSuccess = true;
    }
  }
  
  // Test PROD
  if (testResults.prod.shiftId) {
    const prodCourseData = { ...courseData, feuille_id: testResults.prod.shiftId };
    const prodResult = await makeRequest(`${BASE_URL_PROD}/courses`, 'POST', prodCourseData, 'prod');
    if (prodResult.success) {
      console.log(`  PROD: ✅ Course ajoutée - ID ${prodResult.data.course_id}`);
      testResults.prod.details.push(`Course ${prodResult.data.course_id} ajoutée`);
      prodSuccess = true;
    }
  }
  
  console.log('');
  return { dev: devSuccess, prod: prodSuccess };
}

// Test 4: Ajout de charges
async function testCharges() {
  console.log('🎯 TEST 4: Ajout de Charges');
  console.log('─'.repeat(50));
  
  if (!testResults.dev.shiftId && !testResults.prod.shiftId) {
    console.log('❌ Aucun shift disponible pour tester les charges');
    console.log('');
    return { dev: false, prod: false };
  }
  
  const chargeData = {
    chauffeur_id: CHAUFFEUR_ID,
    vehicule_id: 2,
    description: "Test Réciprocité - Carburant Total",
    montant: 89.75,
    mode_paiement_charge: 1,
    date_charge: "2024-10-12"
  };
  
  let devSuccess = false, prodSuccess = false;
  
  // Test DEV
  if (testResults.dev.shiftId) {
    const devChargeData = { ...chargeData, feuille_id: testResults.dev.shiftId };
    const devResult = await makeRequest(`${BASE_URL_DEV}/charges`, 'POST', devChargeData, 'dev');
    if (devResult.success) {
      console.log(`  DEV:  ✅ Charge ajoutée - ID ${devResult.data.charge_id}`);
      testResults.dev.details.push(`Charge ${devResult.data.charge_id} ajoutée`);
      devSuccess = true;
    }
  }
  
  // Test PROD
  if (testResults.prod.shiftId) {
    const prodChargeData = { ...chargeData, feuille_id: testResults.prod.shiftId };
    const prodResult = await makeRequest(`${BASE_URL_PROD}/charges`, 'POST', prodChargeData, 'prod');
    if (prodResult.success) {
      console.log(`  PROD: ✅ Charge ajoutée - ID ${prodResult.data.charge_id}`);
      testResults.prod.details.push(`Charge ${prodResult.data.charge_id} ajoutée`);
      prodSuccess = true;
    }
  }
  
  console.log('');
  return { dev: devSuccess, prod: prodSuccess };
}

// Test 5: Terminaison de shift et vérification logique active
async function testShiftTermination() {
  console.log('🎯 TEST 5: Terminaison et Logique Active');
  console.log('─'.repeat(50));
  
  if (!testResults.dev.shiftId && !testResults.prod.shiftId) {
    console.log('❌ Aucun shift disponible pour tester la terminaison');
    console.log('');
    return { dev: false, prod: false };
  }
  
  const endData = {
    heure_fin: "15:30",
    index_km_fin_tdb: 90030,
    interruptions: "Test réciprocité dev/prod",
    montant_salaire_cash_declare: 55.00,
    signature_chauffeur: "TEST_RECIPROCITE_FINAL",
    est_validee: true
  };
  
  let devSuccess = false, prodSuccess = false;
  
  // Test DEV - Terminaison
  if (testResults.dev.shiftId) {
    const devResult = await makeRequest(
      `${BASE_URL_DEV}/feuilles-route/${testResults.dev.shiftId}`, 
      'PUT', 
      endData, 
      'dev'
    );
    if (devResult.success) {
      console.log(`  DEV:  ✅ Shift ${testResults.dev.shiftId} terminé`);
      
      // Vérifier logique active
      const activeResult = await makeRequest(`${BASE_URL_DEV}/feuilles-route/active/${CHAUFFEUR_ID}`, 'GET', null, 'dev');
      if (activeResult.success) {
        const isActive = activeResult.data !== null;
        console.log(`  DEV:  ${isActive ? '⚠️' : '✅'} Shift actif: ${isActive ? 'OUI (problème)' : 'NON (OK)'}`);
        devSuccess = !isActive; // Succès si pas de shift actif
        testResults.dev.details.push(`Shift terminé, logique active: ${isActive ? 'KO' : 'OK'}`);
      }
    }
  }
  
  // Test PROD - Terminaison
  if (testResults.prod.shiftId) {
    const prodResult = await makeRequest(
      `${BASE_URL_PROD}/dashboard/feuilles-route/${testResults.prod.shiftId}`, 
      'PUT', 
      endData, 
      'prod'
    );
    if (prodResult.success) {
      console.log(`  PROD: ✅ Shift ${testResults.prod.shiftId} terminé`);
      
      // Vérifier logique active
      const activeResult = await makeRequest(`${BASE_URL_PROD}/dashboard/feuilles-route/active/${CHAUFFEUR_ID}`, 'GET', null, 'prod');
      if (activeResult.success) {
        const isActive = activeResult.data !== null;
        console.log(`  PROD: ${isActive ? '⚠️' : '✅'} Shift actif: ${isActive ? 'OUI (problème)' : 'NON (OK)'}`);
        prodSuccess = !isActive; // Succès si pas de shift actif
        testResults.prod.details.push(`Shift terminé, logique active: ${isActive ? 'KO' : 'OK'}`);
      }
    }
  }
  
  console.log('');
  return { dev: devSuccess, prod: prodSuccess };
}

// Test 6: Validation finale des données
async function testDataValidation() {
  console.log('🎯 TEST 6: Validation Finale des Données');
  console.log('─'.repeat(50));
  
  if (!testResults.dev.shiftId && !testResults.prod.shiftId) {
    console.log('❌ Aucun shift disponible pour validation');
    console.log('');
    return { dev: false, prod: false };
  }
  
  let devSuccess = false, prodSuccess = false;
  
  // Validation DEV
  if (testResults.dev.shiftId) {
    const devResult = await makeRequest(`${BASE_URL_DEV}/feuilles-route/${testResults.dev.shiftId}`, 'GET', null, 'dev');
    if (devResult.success && devResult.data) {
      const shift = devResult.data;
      console.log(`  DEV:  📋 Shift ${shift.feuille_id}:`);
      console.log(`        • Courses: ${shift.course?.length || 0}`);
      console.log(`        • Charges: ${shift.charge?.length || 0}`);
      console.log(`        • Validé: ${shift.est_validee ? 'Oui' : 'Non'}`);
      console.log(`        • Signature: ${shift.signature_chauffeur ? 'Oui' : 'Non'}`);
      devSuccess = true;
      testResults.dev.details.push(`Validation: ${shift.course?.length || 0} courses, ${shift.charge?.length || 0} charges`);
    }
  }
  
  // Validation PROD
  if (testResults.prod.shiftId) {
    const prodResult = await makeRequest(`${BASE_URL_PROD}/feuilles-route/${testResults.prod.shiftId}`, 'GET', null, 'prod');
    if (prodResult.success && prodResult.data) {
      const shift = prodResult.data;
      console.log(`  PROD: 📋 Shift ${shift.feuille_id}:`);
      console.log(`        • Courses: ${shift.course?.length || 0}`);
      console.log(`        • Charges: ${shift.charge?.length || 0}`);
      console.log(`        • Validé: ${shift.est_validee ? 'Oui' : 'Non'}`);
      console.log(`        • Signature: ${shift.signature_chauffeur ? 'Oui' : 'Non'}`);
      prodSuccess = true;
      testResults.prod.details.push(`Validation: ${shift.course?.length || 0} courses, ${shift.charge?.length || 0} charges`);
    }
  }
  
  console.log('');
  return { dev: devSuccess, prod: prodSuccess };
}

// Affichage du rapport final
function generateFinalReport() {
  console.log('📊 RAPPORT FINAL RÉCIPROCITÉ DEV/PROD');
  console.log('='.repeat(60));
  
  for (const [env, results] of Object.entries(testResults)) {
    const total = results.success + results.failed;
    const percentage = total > 0 ? Math.round((results.success / total) * 100) : 0;
    
    console.log(`\n🎯 ${env.toUpperCase()}:`);
    console.log(`   📋 Shift ID: ${results.shiftId || 'Non créé'}`);
    console.log(`   ✅ Succès: ${results.success}/${total} (${percentage}%)`);
    console.log(`   ❌ Échecs: ${results.failed}`);
    console.log(`   📝 Détails: ${results.details.join(', ')}`);
  }
  
  const devTotal = testResults.dev.success + testResults.dev.failed;
  const prodTotal = testResults.prod.success + testResults.prod.failed;
  const globalSuccess = testResults.dev.success + testResults.prod.success;
  const globalTotal = devTotal + prodTotal;
  
  console.log(`\n🎯 BILAN GLOBAL:`);
  console.log(`   ✅ Succès total: ${globalSuccess}/${globalTotal}`);
  console.log(`   📈 Taux de réussite: ${globalTotal > 0 ? Math.round((globalSuccess / globalTotal) * 100) : 0}%`);
  
  // Évaluation de la réciprocité
  const devSuccess = testResults.dev.success > 0;
  const prodSuccess = testResults.prod.success > 0;
  
  console.log(`\n🔄 RÉCIPROCITÉ:`);
  if (devSuccess && prodSuccess) {
    console.log(`   ✅ EXCELLENTE - Les deux environnements fonctionnent`);
  } else if (devSuccess || prodSuccess) {
    console.log(`   ⚠️  PARTIELLE - Un seul environnement fonctionne`);
  } else {
    console.log(`   ❌ DÉFAILLANTE - Aucun environnement ne fonctionne`);
  }
}

// Exécution principale
async function main() {
  try {
    await testHealthCheck();
    await testShiftCreation();
    await testCourses();
    await testCharges();
    await testShiftTermination();
    await testDataValidation();
    
    generateFinalReport();
    
    console.log('\n🎉 TEST COMPLET RÉCIPROCITÉ TERMINÉ');
  } catch (error) {
    console.error('💥 Erreur fatale:', error);
  }
}

main().catch(console.error);
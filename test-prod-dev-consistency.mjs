#!/usr/bin/env node

/**
 * Test de cohérence dev/prod pour les endpoints de shift
 * Vérifie que les endpoints fonctionnent de manière identique
 */

const BASE_URL_DEV = 'http://localhost:3001/api';
const BASE_URL_PROD = 'https://api.txapp.be/api';  
const CHAUFFEUR_ID = 5;

console.log('🧪 TEST COHÉRENCE DEV/PROD - Endpoints Shift');
console.log('⏰', new Date().toLocaleString());
console.log('');

async function testEndpoint(url, description) {
  try {
    console.log(`🌐 Test: ${description}`);
    console.log(`🔗 URL: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'X-API-Key': 'TxApp-API-Key-2025'
      }
    });
    
    const data = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📦 Réponse:`, data ? (typeof data === 'object' ? JSON.stringify(data, null, 2) : data) : 'null');
    console.log('');
    
    return { status: response.status, data };
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`);
    console.log('');
    return { error: error.message };
  }
}

async function testShiftEndpoints() {
  console.log('🎯 TEST 1: Endpoint Active Shift');
  console.log('─'.repeat(50));
  
  // Test endpoint active dev
  await testEndpoint(
    `${BASE_URL_DEV}/feuilles-route/active/${CHAUFFEUR_ID}`, 
    'DEV - Active Shift'
  );
  
  // Test endpoint active prod 
  await testEndpoint(
    `${BASE_URL_PROD}/dashboard/feuilles-route/active/${CHAUFFEUR_ID}`,
    'PROD - Active Shift'
  );
  
  // Test endpoint health dev
  console.log('🎯 TEST 2: Health Check');
  console.log('─'.repeat(50));
  
  await testEndpoint(
    `${BASE_URL_DEV}/health`,
    'DEV - Health Check'
  );
  
  await testEndpoint(
    `${BASE_URL_PROD}/health`,
    'PROD - Health Check'
  );
}

// Test PUT endpoint avec les mêmes données
async function testPutEndpoint() {
  console.log('🎯 TEST 3: PUT Endpoint (simulation)');
  console.log('─'.repeat(50));
  
  const testData = {
    heure_fin: "17:30",
    index_km_fin_tdb: 50100,
    est_validee: true
  };
  
  console.log('📦 Données de test:', JSON.stringify(testData, null, 2));
  console.log('');
  console.log('🔧 DEV Endpoint: PUT /api/feuilles-route/:id');
  console.log('🔧 PROD Endpoint: PUT /api/dashboard/feuilles-route/:id');
  console.log('⚠️  Tests PUT non exécutés pour éviter modifications involontaires');
  console.log('');
}

async function main() {
  await testShiftEndpoints();
  await testPutEndpoint();
  
  console.log('✅ Tests de cohérence terminés');
}

main().catch(console.error);
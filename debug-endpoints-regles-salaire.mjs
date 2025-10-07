#!/usr/bin/env node

/**
 * 🔍 DEBUG ENDPOINTS RÈGLES SALAIRE
 * Test de tous les endpoints possibles pour règles de salaire
 */

console.log('🔍 DEBUG ENDPOINTS RÈGLES SALAIRE');
console.log('⏰', new Date().toLocaleString());
console.log('');

const BASE_URL = 'http://localhost:3001';

const endpointsToTest = [
  '/api/regles-salaire',
  '/api/dashboard/regles-salaire', 
  '/dashboard/regles-salaire',
  '/api/regle-salaire',
  '/api/dashboard/regle-salaire',
  '/api/remuneration',
  '/api/dashboard/remuneration',
  '/api/types-remuneration',
  '/api/dashboard/types-remuneration'
];

async function testEndpoint(endpoint) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    const data = await response.json();
    
    if (response.ok) {
      if (Array.isArray(data)) {
        console.log(`✅ ${endpoint}: ${data.length} éléments`);
        
        // Afficher un échantillon des données
        if (data.length > 0) {
          const sample = data[0];
          const keys = Object.keys(sample).slice(0, 3);
          console.log(`   📋 Structure: {${keys.join(', ')}...}`);
        }
      } else {
        console.log(`✅ ${endpoint}: Objet retourné`);
      }
      return true;
    } else {
      console.log(`❌ ${endpoint}: ${response.status} - ${data.message || data.error || 'Erreur'}`);
      return false;
    }
  } catch (error) {
    console.log(`💥 ${endpoint}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🧪 Test de tous les endpoints possibles...\n');
  
  let workingEndpoints = [];
  
  for (const endpoint of endpointsToTest) {
    const works = await testEndpoint(endpoint);
    if (works) {
      workingEndpoints.push(endpoint);
    }
  }
  
  console.log('\n📊 RÉSUMÉ:');
  console.log(`✅ ${workingEndpoints.length} endpoints fonctionnels sur ${endpointsToTest.length}`);
  
  if (workingEndpoints.length > 0) {
    console.log('\n🔗 ENDPOINTS DISPONIBLES:');
    workingEndpoints.forEach(endpoint => {
      console.log(`   ${endpoint}`);
    });
    
    console.log('\n💡 RECOMMANDATIONS:');
    console.log('   1. Vérifier quel endpoint le frontend utilise exactement');
    console.log('   2. S\'assurer que le frontend pointe vers le bon endpoint');
    console.log('   3. Vérifier les logs du serveur dev lors des appels frontend');
  }
  
  // Test spécifique avec logs détaillés
  console.log('\n🔍 TEST DÉTAILLÉ ENDPOINT PRINCIPAL:');
  const mainEndpoint = '/api/dashboard/regles-salaire';
  
  try {
    console.log(`📡 Appel: GET ${BASE_URL}${mainEndpoint}`);
    const response = await fetch(`${BASE_URL}${mainEndpoint}`);
    const data = await response.json();
    
    console.log(`📤 Status: ${response.status}`);
    console.log(`📤 Headers: ${JSON.stringify(Object.fromEntries(response.headers))}`);
    console.log(`📤 Data type: ${Array.isArray(data) ? 'Array' : typeof data}`);
    
    if (Array.isArray(data)) {
      console.log(`📤 Count: ${data.length}`);
      console.log('📤 Sample:', JSON.stringify(data[0], null, 2));
    }
    
  } catch (error) {
    console.log(`💥 Erreur détaillée: ${error}`);
  }
}

main().catch(console.error);
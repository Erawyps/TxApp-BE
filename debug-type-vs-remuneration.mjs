#!/usr/bin/env node

/**
 * 🔍 DEBUG SPÉCIFIQUE - TYPE VS RÉMUNÉRATION CHAUFFEUR
 * Comparaison entre les endpoints qui marchent vs ceux qui ne marchent pas
 */

console.log('🔍 DEBUG SPÉCIFIQUE - TYPE VS RÉMUNÉRATION CHAUFFEUR');
console.log('⏰', new Date().toLocaleString());
console.log('');

const BASE_URL = 'http://localhost:3001';

// Endpoints pour "Type de rémunération" (qui marchent)
const typeRemunerationEndpoints = [
  '/api/types-remuneration',
  '/api/dashboard/types-remuneration'
];

// Endpoints pour "Rémunération chauffeur" (qui ne marchent pas)
const remunerationChauffeurEndpoints = [
  '/api/remuneration',
  '/api/dashboard/remuneration', 
  '/api/remuneration-chauffeur',
  '/api/dashboard/remuneration-chauffeur',
  '/api/courses/remuneration',
  '/api/dashboard/courses/remuneration'
];

// Tous les endpoints possibles
const allPossibleEndpoints = [
  ...typeRemunerationEndpoints,
  ...remunerationChauffeurEndpoints,
  '/api/regles-salaire',
  '/api/dashboard/regles-salaire'
];

async function testEndpointDetailed(endpoint) {
  try {
    console.log(`🔍 Test: ${endpoint}`);
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    const text = await response.text();
    let data;
    
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.log(`   ❌ Réponse non-JSON: ${text.substring(0, 100)}...`);
      return { success: false, error: 'Invalid JSON', rawText: text };
    }
    
    if (response.ok) {
      if (Array.isArray(data)) {
        console.log(`   ✅ Status: ${response.status}, Count: ${data.length}`);
        console.log(`   📋 Headers: ${JSON.stringify(Object.fromEntries(response.headers))}`);
        
        if (data.length > 0) {
          const sample = data[0];
          console.log(`   📊 Premier élément: {${Object.keys(sample).slice(0, 3).join(', ')}...}`);
          console.log(`   🎯 ID: ${sample.regle_id}, Nom: ${sample.nom_regle}`);
        }
        
        return { success: true, count: data.length, data, status: response.status };
      } else {
        console.log(`   ✅ Status: ${response.status}, Type: ${typeof data}`);
        return { success: true, data, status: response.status };
      }
    } else {
      console.log(`   ❌ Status: ${response.status}, Error: ${data.message || data.error || 'Unknown'}`);
      return { success: false, status: response.status, error: data.message || data.error };
    }
  } catch (error) {
    console.log(`   💥 Exception: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🧪 COMPARAISON DÉTAILLÉE DES ENDPOINTS\n');
  
  // Test des endpoints "Type de rémunération" (qui marchent)
  console.log('✅ ENDPOINTS "TYPE DE RÉMUNÉRATION" (qui fonctionnent):');
  console.log('='.repeat(60));
  
  const workingResults = {};
  for (const endpoint of typeRemunerationEndpoints) {
    const result = await testEndpointDetailed(endpoint);
    workingResults[endpoint] = result;
  }
  
  console.log('\n');
  
  // Test des endpoints "Rémunération chauffeur" (qui ne marchent pas)
  console.log('❓ ENDPOINTS "RÉMUNÉRATION CHAUFFEUR" (problématiques):');
  console.log('='.repeat(60));
  
  const problematicResults = {};
  for (const endpoint of remunerationChauffeurEndpoints) {
    const result = await testEndpointDetailed(endpoint);
    problematicResults[endpoint] = result;
  }
  
  console.log('\n');
  
  // Analyse comparative
  console.log('📊 ANALYSE COMPARATIVE:');
  console.log('='.repeat(60));
  
  // Vérifier si tous retournent les mêmes données
  const workingData = Object.values(workingResults).find(r => r.success)?.data;
  
  console.log('\n🔍 COMPARAISON DES DONNÉES:');
  
  if (workingData) {
    console.log(`📋 Référence (Type rémunération): ${workingData.length} règles`);
    
    // Comparer avec chaque endpoint problématique
    for (const [endpoint, result] of Object.entries(problematicResults)) {
      if (result.success && result.data) {
        const isSame = JSON.stringify(workingData) === JSON.stringify(result.data);
        console.log(`${isSame ? '✅' : '❌'} ${endpoint}: ${result.count} règles ${isSame ? '(identique)' : '(différent)'}`);
        
        if (!isSame && result.data.length > 0) {
          console.log(`     🔍 Différence détectée dans la structure ou contenu`);
        }
      } else {
        console.log(`❌ ${endpoint}: ${result.error || 'Échec'}`);
      }
    }
  }
  
  // Suggestions de solutions
  console.log('\n💡 SUGGESTIONS DE SOLUTION:');
  console.log('='.repeat(60));
  
  const workingEndpoints = Object.entries(workingResults).filter(([_, r]) => r.success).map(([ep, _]) => ep);
  const failingEndpoints = Object.entries(problematicResults).filter(([_, r]) => !r.success).map(([ep, _]) => ep);
  
  if (workingEndpoints.length > 0) {
    console.log(`✅ Endpoints fonctionnels trouvés: ${workingEndpoints.length}`);
    workingEndpoints.forEach(ep => console.log(`   • ${ep}`));
    
    console.log('\n🎯 RECOMMANDATIONS:');
    console.log('   1. Le frontend doit utiliser un des endpoints fonctionnels');
    console.log('   2. Vérifier la configuration du frontend pour "Rémunération chauffeur"');
    console.log('   3. S\'assurer que l\'URL appelée correspond exactement');
    
    if (failingEndpoints.length > 0) {
      console.log('\n⚠️  Endpoints à corriger:');
      failingEndpoints.forEach(ep => console.log(`   • ${ep}`));
    }
  }
  
  // Test final avec curl simulation
  console.log('\n🧪 TEST CURL SIMULATION:');
  console.log('='.repeat(60));
  
  if (workingEndpoints.length > 0) {
    const testEndpoint = workingEndpoints[0];
    console.log(`📡 Test avec: ${testEndpoint}`);
    console.log(`🔗 Commande: curl -s "${BASE_URL}${testEndpoint}"`);
    
    const finalTest = await testEndpointDetailed(testEndpoint);
    if (finalTest.success) {
      console.log('✅ Confirmation: Endpoint accessible et données valides');
      console.log(`📊 ${finalTest.count} règles retournées`);
    }
  }
}

main().catch(console.error);
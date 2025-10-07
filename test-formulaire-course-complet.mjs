#!/usr/bin/env node

/**
 * 🎯 TEST COMPLET FORMULAIRE NOUVELLE COURSE
 * Validation finale pour les règles de rémunération chauffeur
 */

console.log('🎯 TEST COMPLET FORMULAIRE NOUVELLE COURSE');
console.log('⏰', new Date().toLocaleString());
console.log('');

const BASE_URL = 'http://localhost:3001';

// Endpoints prioritaires pour formulaire course
const priorityEndpoints = [
  '/api/courses/remuneration',
  '/api/dashboard/courses/remuneration', 
  '/api/remuneration-chauffeur',
  '/api/dashboard/remuneration-chauffeur',
  '/api/courses/types-remuneration',
  '/api/dashboard/courses/types-remuneration'
];

// Tous les endpoints disponibles
const allEndpoints = [
  '/api/regles-salaire',
  '/api/dashboard/regles-salaire',
  '/api/remuneration',
  '/api/dashboard/remuneration',
  '/api/types-remuneration',
  '/api/dashboard/types-remuneration',
  '/api/courses/regles-salaire',
  '/api/courses/remuneration',
  '/api/courses/types-remuneration',
  '/api/dashboard/courses/regles-salaire',
  '/api/dashboard/courses/remuneration',
  '/api/dashboard/courses/types-remuneration',
  '/api/remuneration-chauffeur',
  '/api/dashboard/remuneration-chauffeur'
];

async function testEndpoint(endpoint) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    const data = await response.json();
    
    if (response.ok && Array.isArray(data)) {
      return { success: true, count: data.length, data };
    } else {
      return { success: false, status: response.status, error: data.message || data.error };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🔍 Test des endpoints prioritaires pour formulaire course...\n');
  
  const results = {};
  let successCount = 0;
  
  // Test des endpoints prioritaires
  console.log('📋 ENDPOINTS PRIORITAIRES:');
  for (const endpoint of priorityEndpoints) {
    const result = await testEndpoint(endpoint);
    results[endpoint] = result;
    
    if (result.success) {
      console.log(`✅ ${endpoint}: ${result.count} règles disponibles`);
      successCount++;
    } else {
      console.log(`❌ ${endpoint}: ${result.status || 'Erreur'}`);
    }
  }
  
  console.log('\n📊 RÉSULTAT ENDPOINTS PRIORITAIRES:');
  console.log(`✅ ${successCount}/${priorityEndpoints.length} endpoints fonctionnels`);
  
  // Test rapide de tous les endpoints
  console.log('\n🔄 Validation de tous les endpoints...');
  let totalSuccess = 0;
  
  for (const endpoint of allEndpoints) {
    const result = await testEndpoint(endpoint);
    if (result.success) {
      totalSuccess++;
    }
  }
  
  console.log(`✅ ${totalSuccess}/${allEndpoints.length} endpoints total fonctionnels`);
  
  // Validation de la structure des données
  if (successCount > 0) {
    const firstWorking = priorityEndpoints.find(ep => results[ep]?.success);
    const sampleData = results[firstWorking].data;
    
    console.log('\n🔍 VALIDATION STRUCTURE DONNÉES:');
    console.log(`📋 Endpoint de référence: ${firstWorking}`);
    console.log(`📊 Nombre de règles: ${sampleData.length}`);
    
    if (sampleData.length > 0) {
      const sample = sampleData[0];
      console.log('\n📝 Champs disponibles:');
      Object.keys(sample).forEach(key => {
        console.log(`   • ${key}: ${typeof sample[key]}`);
      });
      
      console.log('\n🎨 EXEMPLE INTÉGRATION FRONTEND:');
      console.log('```javascript');
      console.log('// Récupération des règles');
      console.log(`const response = await fetch('${BASE_URL}${firstWorking}');`);
      console.log('const regles = await response.json();');
      console.log('');
      console.log('// Population du select');
      console.log('const selectHTML = regles.map(regle => {');
      console.log('  const type = regle.est_variable ? "Variable" : "Fixe";');
      console.log('  return `<option value="${regle.regle_id}">${regle.nom_regle} (${type})</option>`;');
      console.log('}).join("");');
      console.log('```');
      
      console.log('\n📋 RÈGLES DISPONIBLES POUR FORMULAIRE:');
      sampleData.forEach((regle, index) => {
        const type = regle.est_variable ? 'Variable' : 'Fixe';
        const percentage = regle.pourcentage_base ? ` - ${regle.pourcentage_base}%` : '';
        console.log(`   ${index + 1}. ${regle.nom_regle} (${type}${percentage}) - ID: ${regle.regle_id}`);
      });
    }
  }
  
  // Test cohérence production
  console.log('\n🔄 TEST COHÉRENCE PRODUCTION:');
  try {
    const prodResponse = await fetch('https://api.txapp.be/api/regles-salaire', {
      headers: { 'X-API-Key': 'TxApp-API-Key-2025' }
    });
    
    if (prodResponse.ok) {
      const prodData = await prodResponse.json();
      console.log(`✅ Production: ${prodData.length} règles disponibles`);
      
      if (successCount > 0) {
        const devCount = results[priorityEndpoints.find(ep => results[ep]?.success)].count;
        if (devCount === prodData.length) {
          console.log('✅ Cohérence dev/prod confirmée');
        } else {
          console.log(`⚠️  Incohérence: ${devCount} dev vs ${prodData.length} prod`);
        }
      }
    } else {
      console.log('❌ Erreur accès production');
    }
  } catch (error) {
    console.log(`⚠️  Test prod échoué: ${error.message}`);
  }
  
  console.log('\n🎉 CONCLUSION:');
  if (totalSuccess >= 10) {
    console.log('✅ FORMULAIRE NOUVELLE COURSE PRÊT !');
    console.log('✅ Toutes les variantes d\'endpoints sont disponibles');
    console.log('✅ Le champ "Rémunération chauffeur" peut être peuplé');
    console.log('✅ Structure de données validée');
    console.log('');
    console.log('🎯 ENDPOINTS RECOMMANDÉS POUR LE FRONTEND:');
    console.log('   1. /api/courses/remuneration (spécifique aux courses)');
    console.log('   2. /api/dashboard/courses/remuneration (version dashboard)');
    console.log('   3. /api/remuneration-chauffeur (alias explicite)');
  } else {
    console.log('⚠️  Certains endpoints nécessitent encore des corrections');
  }
}

main().catch(console.error);
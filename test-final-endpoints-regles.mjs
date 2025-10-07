#!/usr/bin/env node

/**
 * 🎯 TEST FINAL RÈGLES SALAIRE - TOUS ENDPOINTS
 * Validation que tous les endpoints retournent les mêmes données
 */

console.log('🎯 TEST FINAL RÈGLES SALAIRE - TOUS ENDPOINTS');
console.log('⏰', new Date().toLocaleString());
console.log('');

const BASE_URL = 'http://localhost:3001';

const workingEndpoints = [
  '/api/regles-salaire',
  '/api/dashboard/regles-salaire',
  '/api/remuneration',
  '/api/dashboard/remuneration',
  '/api/types-remuneration',
  '/api/dashboard/types-remuneration'
];

async function fetchData(endpoint) {
  const response = await fetch(`${BASE_URL}${endpoint}`);
  const data = await response.json();
  return data;
}

async function main() {
  console.log('🔄 Test cohérence de tous les endpoints...\n');
  
  const allData = {};
  const errors = [];
  
  // Récupérer les données de tous les endpoints
  for (const endpoint of workingEndpoints) {
    try {
      const data = await fetchData(endpoint);
      allData[endpoint] = data;
      console.log(`✅ ${endpoint}: ${data.length} règles`);
    } catch (error) {
      errors.push(`❌ ${endpoint}: ${error.message}`);
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }
  
  console.log('');
  
  if (errors.length > 0) {
    console.log('⚠️  ERREURS DÉTECTÉES:');
    errors.forEach(error => console.log(`   ${error}`));
    return;
  }
  
  // Vérifier la cohérence des données
  const referenceData = allData[workingEndpoints[0]];
  let allConsistent = true;
  
  console.log('🔍 VÉRIFICATION COHÉRENCE:');
  
  for (const endpoint of workingEndpoints.slice(1)) {
    const currentData = allData[endpoint];
    
    if (currentData.length !== referenceData.length) {
      console.log(`❌ ${endpoint}: ${currentData.length} vs ${referenceData.length} (référence)`);
      allConsistent = false;
    } else {
      // Vérifier que les IDs sont identiques
      const refIds = referenceData.map(r => r.regle_id).sort();
      const currIds = currentData.map(r => r.regle_id).sort();
      
      if (JSON.stringify(refIds) === JSON.stringify(currIds)) {
        console.log(`✅ ${endpoint}: Données cohérentes`);
      } else {
        console.log(`❌ ${endpoint}: IDs différents`);
        allConsistent = false;
      }
    }
  }
  
  console.log('');
  
  if (allConsistent) {
    console.log('🎉 TOUTES LES DONNÉES SONT COHÉRENTES !');
    console.log('');
    
    console.log('📋 RÈGLES DISPONIBLES:');
    referenceData.forEach((regle, index) => {
      const type = regle.est_variable ? 'Variable' : 'Fixe';
      console.log(`   ${index + 1}. ${regle.nom_regle} (${type}) - ID: ${regle.regle_id}`);
    });
    
    console.log('');
    console.log('🎯 ENDPOINTS PRÊTS POUR FRONTEND:');
    console.log('   🔗 Pour "Rémunération chauffeur":');
    console.log('      - /api/remuneration');
    console.log('      - /api/dashboard/remuneration');
    console.log('   🔗 Pour "Type de rémunération":');
    console.log('      - /api/types-remuneration');
    console.log('      - /api/dashboard/types-remuneration');
    console.log('   🔗 Endpoints classiques:');
    console.log('      - /api/regles-salaire');
    console.log('      - /api/dashboard/regles-salaire');
    
    console.log('');
    console.log('✅ LE FRONTEND PEUT MAINTENANT UTILISER N\'IMPORTE LEQUEL DE CES ENDPOINTS');
    
  } else {
    console.log('❌ INCOHÉRENCES DÉTECTÉES ENTRE LES ENDPOINTS');
  }
}

main().catch(console.error);
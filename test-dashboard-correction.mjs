#!/usr/bin/env node

/**
 * 🔧 TEST CORRECTION ROUTES DASHBOARD
 * Vérification que toutes les routes dashboard fonctionnent
 */

console.log('🔧 TEST CORRECTION ROUTES DASHBOARD');
console.log('⏰', new Date().toLocaleString());
console.log('');

const routes = [
  '/api/dashboard/chauffeurs',
  '/api/dashboard/vehicules', 
  '/api/dashboard/clients',
  '/api/dashboard/modes-paiement',
  '/api/dashboard/regles-salaire'
];

async function testRoute(route) {
  try {
    const response = await fetch(`http://localhost:3001${route}`);
    const data = await response.json();
    
    if (response.ok && Array.isArray(data)) {
      console.log(`✅ ${route}: ${data.length} éléments`);
      return true;
    } else {
      console.log(`❌ ${route}: ${response.status} - ${data.message || data.error || 'Erreur inconnue'}`);
      return false;
    }
  } catch (error) {
    console.log(`💥 ${route}: ${error.message}`);
    return false;
  }
}

async function main() {
  let success = 0;
  
  for (const route of routes) {
    const result = await testRoute(route);
    if (result) success++;
  }
  
  console.log('');
  console.log('📊 RÉSULTAT:');
  console.log(`   ✅ ${success}/${routes.length} routes fonctionnelles`);
  
  if (success === routes.length) {
    console.log('   🎉 Toutes les routes dashboard sont opérationnelles !');
    console.log('   🚀 Le frontend devrait maintenant recevoir les données correctement');
  } else {
    console.log('   ⚠️  Certaines routes nécessitent encore des corrections');
  }
}

main().catch(console.error);
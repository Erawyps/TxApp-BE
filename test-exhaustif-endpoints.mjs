#!/usr/bin/env node

/**
 * 🎯 TEST EXHAUSTIF - TOUS ENDPOINTS POSSIBLES
 * Test de TOUS les endpoints possibles pour trouver celui que le frontend utilise
 */

console.log('🎯 TEST EXHAUSTIF - TOUS ENDPOINTS POSSIBLES');
console.log('⏰', new Date().toLocaleString());
console.log('');

const BASE_URL = 'http://localhost:3001';

// TOUS les endpoints possibles (absolument tous)
const allPossibleEndpoints = [
  // Endpoints classiques
  '/api/regles-salaire',
  '/api/dashboard/regles-salaire',
  
  // Variantes avec tirets
  '/api/regle-salaire',
  '/api/dashboard/regle-salaire',
  '/api/salaire-regles',
  '/api/dashboard/salaire-regles',
  
  // Variantes avec underscores
  '/api/regles_salaire',
  '/api/dashboard/regles_salaire',
  '/api/regle_salaire',
  '/api/dashboard/regle_salaire',
  '/api/salaire_regles',
  '/api/dashboard/salaire_regles',
  
  // Types de rémunération (qui marchent)
  '/api/types-remuneration',
  '/api/dashboard/types-remuneration',
  '/api/types_remuneration',
  '/api/dashboard/types_remuneration',
  
  // Rémunération simple
  '/api/remuneration',
  '/api/dashboard/remuneration',
  
  // Rémunération chauffeur
  '/api/remuneration-chauffeur',
  '/api/dashboard/remuneration-chauffeur',
  '/api/remuneration_chauffeur',
  '/api/dashboard/remuneration_chauffeur',
  
  // Contexte courses
  '/api/courses/regles-salaire',
  '/api/courses/remuneration',
  '/api/courses/types-remuneration',
  '/api/dashboard/courses/regles-salaire',
  '/api/dashboard/courses/remuneration',
  '/api/dashboard/courses/types-remuneration',
  '/api/courses/regles_salaire',
  '/api/courses/types_remuneration',
  '/api/courses/remuneration_chauffeur',
  
  // Variantes françaises
  '/api/remunerations',
  '/api/dashboard/remunerations',
  '/api/types-remunerations',
  '/api/dashboard/types-remunerations',
  
  // Variantes courtes
  '/api/salaire',
  '/api/dashboard/salaire',
  '/api/salaires',
  '/api/dashboard/salaires',
  
  // Autres variantes possibles
  '/api/driver-remuneration',
  '/api/dashboard/driver-remuneration',
  '/api/chauffeur-remuneration',
  '/api/dashboard/chauffeur-remuneration'
];

async function testEndpoint(endpoint) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Origin': 'http://localhost:5173',
        'User-Agent': 'TxAppFrontendTest/1.0'
      }
    });
    
    const data = await response.json();
    
    if (response.ok && Array.isArray(data)) {
      return { success: true, count: data.length, status: response.status };
    } else {
      return { success: false, status: response.status, error: data.message || data.error };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log(`🧪 Test de ${allPossibleEndpoints.length} endpoints possibles...\n`);
  
  const results = [];
  let workingCount = 0;
  let failingCount = 0;
  
  console.log('📊 RÉSULTATS PAR ENDPOINT:');
  console.log('='.repeat(80));
  
  for (const endpoint of allPossibleEndpoints) {
    const result = await testEndpoint(endpoint);
    results.push({ endpoint, ...result });
    
    if (result.success) {
      console.log(`✅ ${endpoint.padEnd(50)} → ${result.count} règles (${result.status})`);
      workingCount++;
    } else {
      console.log(`❌ ${endpoint.padEnd(50)} → ${result.error || 'Échec'} (${result.status || 'N/A'})`);
      failingCount++;
    }
  }
  
  console.log('\n📈 STATISTIQUES GLOBALES:');
  console.log('='.repeat(80));
  console.log(`✅ Endpoints fonctionnels: ${workingCount}/${allPossibleEndpoints.length} (${Math.round((workingCount/allPossibleEndpoints.length)*100)}%)`);
  console.log(`❌ Endpoints en échec: ${failingCount}/${allPossibleEndpoints.length} (${Math.round((failingCount/allPossibleEndpoints.length)*100)}%)`);
  
  const workingEndpoints = results.filter(r => r.success);
  
  if (workingEndpoints.length > 0) {
    console.log('\n🎯 ENDPOINTS DISPONIBLES POUR FRONTEND:');
    console.log('='.repeat(80));
    
    // Grouper par catégorie
    const categories = {
      'Classiques': workingEndpoints.filter(e => e.endpoint.match(/^\/api\/(regles-salaire|dashboard\/regles-salaire)$/)),
      'Types Rémunération': workingEndpoints.filter(e => e.endpoint.includes('types-remuneration') || e.endpoint.includes('types_remuneration')),
      'Rémunération Simple': workingEndpoints.filter(e => e.endpoint.match(/^\/api\/(dashboard\/)?remuneration$/)),
      'Rémunération Chauffeur': workingEndpoints.filter(e => e.endpoint.includes('remuneration-chauffeur') || e.endpoint.includes('remuneration_chauffeur')),
      'Contexte Courses': workingEndpoints.filter(e => e.endpoint.includes('/courses/')),
      'Autres': workingEndpoints.filter(e => !e.endpoint.includes('regles-salaire') && !e.endpoint.includes('types-remuneration') && !e.endpoint.includes('remuneration'))
    };
    
    Object.entries(categories).forEach(([category, endpoints]) => {
      if (endpoints.length > 0) {
        console.log(`\n📋 ${category} (${endpoints.length}):`);
        endpoints.forEach(({ endpoint, count }) => {
          console.log(`   • ${endpoint} (${count} règles)`);
        });
      }
    });
    
    console.log('\n💡 RECOMMANDATIONS POUR RÉSOUDRE LE PROBLÈME:');
    console.log('='.repeat(80));
    console.log('1. 📝 Vérifier les logs du serveur dev quand le frontend charge');
    console.log('2. 🔍 Inspecter les appels réseau dans les DevTools du navigateur');
    console.log('3. 🎯 Comparer les endpoints utilisés pour "Type de rémunération" vs "Rémunération chauffeur"');
    console.log('4. 🐛 Vérifier s\'il y a des erreurs JavaScript côté frontend');
    console.log('5. ⏰ Vérifier l\'ordre de chargement des données');
    
    console.log('\n🔧 ENDPOINTS PRIORITAIRES À TESTER CÔTÉ FRONTEND:');
    const priorityEndpoints = [
      '/api/types-remuneration', // Celui qui marche
      '/api/dashboard/types-remuneration', // Celui qui marche
      '/api/remuneration',
      '/api/dashboard/remuneration',
      '/api/courses/remuneration',
      '/api/dashboard/courses/remuneration'
    ];
    
    priorityEndpoints.forEach(endpoint => {
      const result = workingEndpoints.find(e => e.endpoint === endpoint);
      if (result) {
        console.log(`   ✅ ${endpoint} → ${result.count} règles`);
      } else {
        console.log(`   ❌ ${endpoint} → Non fonctionnel`);
      }
    });
    
  } else {
    console.log('\n❌ AUCUN ENDPOINT FONCTIONNEL TROUVÉ !');
    console.log('⚠️  Problème majeur avec le serveur backend');
  }
  
  console.log('\n🎉 CONCLUSION:');
  console.log('='.repeat(80));
  if (workingCount > 20) {
    console.log('✅ Backend parfaitement configuré avec de nombreux endpoints');
    console.log('✅ Le problème est très probablement côté frontend');
    console.log('🎯 Action requise: Déboguer le code JavaScript frontend');
  } else if (workingCount > 5) {
    console.log('✅ Backend bien configuré');
    console.log('⚠️  Quelques endpoints manquants');
  } else {
    console.log('❌ Backend insuffisamment configuré');
    console.log('🔧 Action requise: Ajouter plus d\'endpoints');
  }
}

main().catch(console.error);
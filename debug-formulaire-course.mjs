#!/usr/bin/env node

/**
 * 🔍 DEBUG FORMULAIRE NOUVELLE COURSE
 * Test des endpoints pour règles de rémunération dans le contexte des courses
 */

console.log('🔍 DEBUG FORMULAIRE NOUVELLE COURSE');
console.log('⏰', new Date().toLocaleString());
console.log('');

const BASE_URL = 'http://localhost:3001';

// Endpoints possibles que le formulaire cours pourrait utiliser
const endpointsToTest = [
  // Endpoints règles de salaire classiques
  '/api/regles-salaire',
  '/api/dashboard/regles-salaire',
  '/api/remuneration',
  '/api/dashboard/remuneration',
  '/api/types-remuneration', 
  '/api/dashboard/types-remuneration',
  
  // Endpoints possibles spécifiques aux courses
  '/api/courses/regles-salaire',
  '/api/courses/remuneration',
  '/api/courses/types-remuneration',
  '/api/dashboard/courses/regles-salaire',
  '/api/dashboard/courses/remuneration',
  '/api/dashboard/courses/types-remuneration',
  
  // Endpoints possibles avec d'autres noms
  '/api/remuneration-chauffeur',
  '/api/dashboard/remuneration-chauffeur',
  '/api/types-remuneration-chauffeur',
  '/api/dashboard/types-remuneration-chauffeur'
];

async function testEndpoint(endpoint) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    const data = await response.json();
    
    if (response.ok) {
      if (Array.isArray(data)) {
        console.log(`✅ ${endpoint}: ${data.length} éléments`);
        return { success: true, count: data.length, data };
      } else {
        console.log(`✅ ${endpoint}: Objet retourné`);
        return { success: true, data };
      }
    } else {
      console.log(`❌ ${endpoint}: ${response.status} - ${data.message || data.error || 'Erreur'}`);
      return { success: false, status: response.status, error: data.message || data.error };
    }
  } catch (error) {
    console.log(`💥 ${endpoint}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🧪 Test de tous les endpoints possibles pour formulaire course...\n');
  
  const workingEndpoints = [];
  const failedEndpoints = [];
  
  for (const endpoint of endpointsToTest) {
    const result = await testEndpoint(endpoint);
    if (result.success) {
      workingEndpoints.push({ endpoint, ...result });
    } else {
      failedEndpoints.push({ endpoint, ...result });
    }
  }
  
  console.log('\n📊 RÉSUMÉ:');
  console.log(`✅ ${workingEndpoints.length} endpoints fonctionnels`);
  console.log(`❌ ${failedEndpoints.length} endpoints en échec`);
  
  if (workingEndpoints.length > 0) {
    console.log('\n🔗 ENDPOINTS DISPONIBLES POUR FORMULAIRE COURSE:');
    workingEndpoints.forEach(({ endpoint, count }) => {
      console.log(`   ${endpoint} (${count || '?'} éléments)`);
    });
    
    console.log('\n💡 RECOMMANDATIONS POUR FRONTEND:');
    console.log('   1. Utiliser un de ces endpoints pour "Rémunération chauffeur"');
    console.log('   2. Vérifier que le frontend pointe vers le bon endpoint');
    console.log('   3. S\'assurer que les données sont bien parsées');
    
    // Test avec l'endpoint principal pour voir la structure
    if (workingEndpoints.length > 0) {
      const mainEndpoint = workingEndpoints[0];
      console.log('\n🔍 STRUCTURE DES DONNÉES:');
      
      if (mainEndpoint.data && Array.isArray(mainEndpoint.data) && mainEndpoint.data.length > 0) {
        const sample = mainEndpoint.data[0];
        console.log('📋 Exemple de règle:');
        console.log(JSON.stringify(sample, null, 2));
        
        console.log('\n🎨 FORMAT POUR SELECT HTML:');
        console.log('<select name="regle_remuneration_id">');
        console.log('  <option value="">Sélectionner une rémunération</option>');
        mainEndpoint.data.forEach(regle => {
          const type = regle.est_variable ? 'Variable' : 'Fixe';
          console.log(`  <option value="${regle.regle_id}">${regle.nom_regle} (${type})</option>`);
        });
        console.log('</select>');
      }
    }
  }
  
  // Vérifier la cohérence avec la production
  console.log('\n🔄 TEST COHÉRENCE PRODUCTION:');
  try {
    const prodResponse = await fetch('https://api.txapp.be/api/regles-salaire', {
      headers: { 'X-API-Key': 'TxApp-API-Key-2025' }
    });
    
    if (prodResponse.ok) {
      const prodData = await prodResponse.json();
      console.log(`✅ Production: ${prodData.length} règles disponibles`);
      
      if (workingEndpoints.length > 0) {
        const devCount = workingEndpoints[0].count;
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
  
  console.log('\n🎯 SOLUTION POUR FORMULAIRE NOUVELLE COURSE:');
  console.log('   Le formulaire doit utiliser un des endpoints suivants:');
  workingEndpoints.slice(0, 3).forEach(({ endpoint }) => {
    console.log(`   • ${endpoint}`);
  });
}

main().catch(console.error);
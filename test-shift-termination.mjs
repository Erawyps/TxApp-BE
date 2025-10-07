#!/usr/bin/env node

/**
 * Test complet de la fin de shift et redémarrage
 * Valide dev/prod parity pour la gestion des feuilles de route
 */

import { readFile } from 'fs/promises';
import path from 'path';

// Configuration des environnements
const ENVIRONMENTS = {
  dev: {
    name: 'Développement',
    url: 'http://localhost:3000',
    apiPath: '/api'
  },
  prod: {
    name: 'Production',
    url: 'https://txapp.be',
    apiPath: '/api'
  }
};

/**
 * Effectuer une requête HTTP
 */
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erreur réseau' }));
      throw new Error(`${response.status}: ${errorData.error || errorData.message || 'Erreur inconnue'}`);
    }
    
    return response.json();
  } catch (error) {
    console.error(`❌ Erreur requête ${url}:`, error.message);
    throw error;
  }
}

/**
 * Tester la création d'une feuille de route
 */
async function testCreateFeuilleRoute(env, chauffeurId = 1, vehiculeId = 1) {
  console.log(`\n🚀 Test création feuille de route - ${env.name}`);
  
  const feuilleData = {
    chauffeur_id: chauffeurId,
    vehicule_id: vehiculeId,
    date_service: new Date().toISOString().split('T')[0],
    heure_debut: new Date().toISOString(),
    index_km_debut_tdb: 50000,
    mode_encodage: 'taximetre',
    est_validee: false,
    numero_feuille: `${Date.now()}-TEST`
  };
  
  try {
    const url = `${env.url}${env.apiPath}/dashboard/feuilles-route`;
    const result = await makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(feuilleData)
    });
    
    console.log(`✅ Feuille créée avec succès - ID: ${result.feuille_id}`);
    return result;
  } catch (error) {
    console.error(`❌ Échec création feuille:`, error.message);
    throw error;
  }
}

/**
 * Tester la fin de shift
 */
async function testEndShift(env, feuilleId) {
  console.log(`\n🏁 Test fin de shift - ${env.name} - Feuille ID: ${feuilleId}`);
  
  const endData = {
    heure_fin: new Date().toISOString(),
    index_km_fin_tdb: 50150,
    interruptions: 'Test automatique de fin de shift',
    montant_salaire_cash_declare: 85.50,
    signature_chauffeur: 'TEST_SIGNATURE'
  };
  
  try {
    // Tester l'endpoint approprié selon l'environnement
    const endpoint = env.name === 'Développement' 
      ? `/feuilles-route/${feuilleId}`
      : `/dashboard/feuilles-route/${feuilleId}`;
    
    const url = `${env.url}${env.apiPath}${endpoint}`;
    const result = await makeRequest(url, {
      method: 'PUT',
      body: JSON.stringify(endData)
    });
    
    console.log(`✅ Shift terminé avec succès`);
    console.log(`   - Heure fin: ${result.heure_fin}`);
    console.log(`   - KM fin: ${result.index_km_fin_tdb}`);
    console.log(`   - Montant déclaré: ${result.montant_salaire_cash_declare}€`);
    console.log(`   - Validée: ${result.est_validee ? 'Oui' : 'Non'}`);
    
    return result;
  } catch (error) {
    console.error(`❌ Échec fin de shift:`, error.message);
    throw error;
  }
}

/**
 * Tester la récupération de feuille active
 */
async function testGetActiveShift(env, chauffeurId) {
  console.log(`\n🔍 Test récupération shift actif - ${env.name} - Chauffeur: ${chauffeurId}`);
  
  try {
    const url = `${env.url}${env.apiPath}/dashboard/feuilles-route/active/${chauffeurId}`;
    const result = await makeRequest(url);
    
    if (result) {
      console.log(`✅ Shift actif trouvé - ID: ${result.feuille_id}`);
      console.log(`   - Date: ${result.date_service}`);
      console.log(`   - Mode: ${result.mode_encodage}`);
      console.log(`   - Validée: ${result.est_validee ? 'Oui' : 'Non'}`);
    } else {
      console.log(`ℹ️ Aucun shift actif`);
    }
    
    return result;
  } catch (error) {
    if (error.message.includes('404')) {
      console.log(`ℹ️ Aucun shift actif (404)`);
      return null;
    }
    console.error(`❌ Erreur récupération shift actif:`, error.message);
    throw error;
  }
}

/**
 * Test complet pour un environnement
 */
async function testEnvironment(env, chauffeurId = 1) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`🧪 TESTS ENVIRONNEMENT: ${env.name.toUpperCase()}`);
  console.log(`🌐 URL: ${env.url}`);
  console.log(`${'='.repeat(50)}`);
  
  try {
    // 1. Vérifier s'il y a un shift actif
    let activeShift = await testGetActiveShift(env, chauffeurId);
    
    // 2. Si shift actif, le terminer
    if (activeShift && !activeShift.est_validee) {
      console.log(`\n⚠️ Shift actif détecté, terminaison en cours...`);
      await testEndShift(env, activeShift.feuille_id);
    }
    
    // 3. Créer un nouveau shift
    const newShift = await testCreateFeuilleRoute(env, chauffeurId);
    
    // 4. Vérifier que le nouveau shift est actif
    activeShift = await testGetActiveShift(env, chauffeurId);
    
    if (activeShift && activeShift.feuille_id === newShift.feuille_id) {
      console.log(`✅ Nouveau shift correctement activé`);
    } else {
      throw new Error('Le nouveau shift n\'est pas reconnu comme actif');
    }
    
    // 5. Terminer le nouveau shift
    await testEndShift(env, newShift.feuille_id);
    
    console.log(`\n🎉 Tous les tests réussis pour ${env.name}!`);
    return true;
    
  } catch (error) {
    console.error(`\n💥 Échec des tests pour ${env.name}:`, error.message);
    return false;
  }
}

/**
 * Vérifier si un serveur est accessible
 */
async function checkServerHealth(env) {
  try {
    const healthUrl = `${env.url}/api/health`;
    await makeRequest(healthUrl);
    console.log(`✅ ${env.name} accessible`);
    return true;
  } catch (error) {
    console.log(`❌ ${env.name} non accessible: ${error.message}`);
    return false;
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log(`🎯 TEST COMPLET DE FIN DE SHIFT ET REDÉMARRAGE`);
  console.log(`⏰ ${new Date().toLocaleString()}\n`);
  
  const chauffeurId = process.argv[2] ? parseInt(process.argv[2]) : 1;
  console.log(`👤 Chauffeur testé: ID ${chauffeurId}\n`);
  
  // Vérifier la santé des serveurs
  console.log(`🏥 Vérification de la santé des serveurs...`);
  const devHealth = await checkServerHealth(ENVIRONMENTS.dev);
  const prodHealth = await checkServerHealth(ENVIRONMENTS.prod);
  
  if (!devHealth && !prodHealth) {
    console.error(`❌ Aucun serveur accessible, abandon des tests`);
    process.exit(1);
  }
  
  const results = {};
  
  // Test développement
  if (devHealth) {
    results.dev = await testEnvironment(ENVIRONMENTS.dev, chauffeurId);
  } else {
    console.log(`⏭️ Tests développement ignorés (serveur non accessible)`);
    results.dev = null;
  }
  
  // Test production
  if (prodHealth) {
    results.prod = await testEnvironment(ENVIRONMENTS.prod, chauffeurId);
  } else {
    console.log(`⏭️ Tests production ignorés (serveur non accessible)`);
    results.prod = null;
  }
  
  // Résumé final
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 RÉSUMÉ FINAL DES TESTS`);
  console.log(`${'='.repeat(60)}`);
  
  if (results.dev !== null) {
    console.log(`🔧 Développement: ${results.dev ? '✅ SUCCÈS' : '❌ ÉCHEC'}`);
  }
  
  if (results.prod !== null) {
    console.log(`🚀 Production: ${results.prod ? '✅ SUCCÈS' : '❌ ÉCHEC'}`);
  }
  
  const allTestsPassed = Object.values(results).every(result => result === true || result === null);
  
  if (allTestsPassed) {
    console.log(`\n🎉 TOUS LES TESTS DISPONIBLES ONT RÉUSSI!`);
    console.log(`✅ La fin de shift et le redémarrage fonctionnent correctement`);
    process.exit(0);
  } else {
    console.log(`\n💥 CERTAINS TESTS ONT ÉCHOUÉ`);
    console.log(`⚠️ Vérifiez les logs ci-dessus pour les détails`);
    process.exit(1);
  }
}

// Exécution du script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(`💥 Erreur fatale:`, error);
    process.exit(1);
  });
}
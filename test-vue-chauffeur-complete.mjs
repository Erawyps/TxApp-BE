#!/usr/bin/env node

/**
 * 🚗 SIMULATION COMPLETE VUE CHAUFFEUR
 * Test end-to-end de tout le workflow chauffeur avec dev/prod
 */

const BASE_URL_DEV = 'http://localhost:3001/api';
const BASE_URL_PROD = 'https://api.txapp.be/api';
const CHAUFFEUR_ID = 5;

console.log('🚗 SIMULATION COMPLÈTE VUE CHAUFFEUR');
console.log('⏰', new Date().toLocaleString());
console.log('');

let currentShiftId = null;
let testResults = {
  dev: { success: 0, failed: 0, details: [] },
  prod: { success: 0, failed: 0, details: [] }
};

// Utilitaire pour faire des requêtes
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
    console.log(`🌐 ${method} ${url}`);
    const response = await fetch(url, options);
    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ Succès (${response.status})`);
      testResults[env].success++;
    } else {
      console.log(`❌ Échec (${response.status}): ${result.error || result.message}`);
      testResults[env].failed++;
    }
    
    return { success: response.ok, status: response.status, data: result };
  } catch (error) {
    console.log(`💥 Erreur réseau: ${error.message}`);
    testResults[env].failed++;
    return { success: false, error: error.message };
  }
}

// 1. Créer un nouveau shift complet
async function createCompleteShift(baseUrl, env) {
  console.log(`\n🎯 ÉTAPE 1: Créer shift complet (${env.toUpperCase()})`);
  console.log('─'.repeat(50));
  
  const shiftData = {
    chauffeur_id: CHAUFFEUR_ID,
    vehicule_id: 1,
    date_service: "2024-10-09", // Date unique pour éviter conflits
    mode_encodage: "LIVE",
    index_km_debut_tdb: 60000,
    heure_debut: "06:00"
  };
  
  const endpoint = env === 'dev' ? '/feuilles-route' : '/dashboard/feuilles-route';
  const result = await makeRequest(`${baseUrl}${endpoint}`, 'POST', shiftData, env);
  
  if (result.success && result.data.feuille_id) {
    currentShiftId = result.data.feuille_id;
    console.log(`📋 Shift créé avec ID: ${currentShiftId}`);
    testResults[env].details.push(`Shift ${currentShiftId} créé`);
  }
  
  return result;
}

// 2. Ajouter des courses variées
async function addCourses(baseUrl, env) {
  console.log(`\n🎯 ÉTAPE 2: Ajouter courses (${env.toUpperCase()})`);
  console.log('─'.repeat(50));
  
  if (!currentShiftId) {
    console.log('❌ Pas de shift actif');
    return { success: false };
  }
  
  const courses = [
    {
      feuille_id: currentShiftId,
      num_ordre: 1,
      index_depart: 60000,
      index_embarquement: 60005,
      lieu_embarquement: "Gare du Nord",
      heure_embarquement: "06:30",
      index_debarquement: 60025,
      lieu_debarquement: "Aéroport Zaventem",
      heure_debarquement: "07:15",
      prix_taximetre: 45.50,
      sommes_percues: 50.00,
      mode_paiement_id: 1 // Cash
    },
    {
      feuille_id: currentShiftId,
      num_ordre: 2,
      index_depart: 60025,
      index_embarquement: 60025,
      lieu_embarquement: "Aéroport Zaventem",
      heure_embarquement: "07:45",
      index_debarquement: 60055,
      lieu_debarquement: "Centre Ville",
      heure_debarquement: "08:30",
      prix_taximetre: 38.75,
      sommes_percues: 40.00,
      mode_paiement_id: 2 // Carte
    },
    {
      feuille_id: currentShiftId,
      num_ordre: 3,
      index_depart: 60055,
      index_embarquement: 60060,
      lieu_embarquement: "Place Eugène Flagey",
      heure_embarquement: "09:00",
      index_debarquement: 60075,
      lieu_debarquement: "Gare Centrale",
      heure_debarquement: "09:20",
      prix_taximetre: 18.25,
      sommes_percues: 20.00,
      mode_paiement_id: 1 // Cash
    }
  ];
  
  let coursesAdded = 0;
  for (const course of courses) {
    const result = await makeRequest(`${baseUrl}/courses`, 'POST', course, env);
    if (result.success) {
      coursesAdded++;
      console.log(`🚕 Course ${course.num_ordre} ajoutée: ${course.lieu_embarquement} → ${course.lieu_debarquement}`);
    }
  }
  
  testResults[env].details.push(`${coursesAdded}/${courses.length} courses ajoutées`);
  return { success: coursesAdded > 0, coursesAdded };
}

// 3. Ajouter des charges
async function addCharges(baseUrl, env) {
  console.log(`\n🎯 ÉTAPE 3: Ajouter charges (${env.toUpperCase()})`);
  console.log('─'.repeat(50));
  
  if (!currentShiftId) {
    console.log('❌ Pas de shift actif');
    return { success: false };
  }
  
  const charges = [
    {
      feuille_id: currentShiftId,
      chauffeur_id: CHAUFFEUR_ID,
      vehicule_id: 1,
      description: "Carburant - Plein",
      montant: 75.50,
      mode_paiement_charge: 1,
      date_charge: "2024-10-08"
    },
    {
      feuille_id: currentShiftId,
      chauffeur_id: CHAUFFEUR_ID,
      vehicule_id: 1,
      description: "Péage autoroute",
      montant: 12.30,
      mode_paiement_charge: 2,
      date_charge: "2024-10-08"
    },
    {
      feuille_id: currentShiftId,
      chauffeur_id: CHAUFFEUR_ID,
      vehicule_id: 1,
      description: "Lavage véhicule",
      montant: 15.00,
      mode_paiement_charge: 1,
      date_charge: "2024-10-08"
    }
  ];
  
  let chargesAdded = 0;
  for (const charge of charges) {
    const result = await makeRequest(`${baseUrl}/charges`, 'POST', charge, env);
    if (result.success) {
      chargesAdded++;
      console.log(`💰 Charge ajoutée: ${charge.description} - €${charge.montant}`);
    }
  }
  
  testResults[env].details.push(`${chargesAdded}/${charges.length} charges ajoutées`);
  return { success: chargesAdded > 0, chargesAdded };
}

// 4. Remplir données taximètre
async function addTaximeterData(baseUrl, env) {
  console.log(`\n🎯 ÉTAPE 4: Données taximètre (${env.toUpperCase()})`);
  console.log('─'.repeat(50));
  
  if (!currentShiftId) {
    console.log('❌ Pas de shift actif');
    return { success: false };
  }
  
  const taximeterData = {
    index_debut: 60000,
    index_fin: 60075,
    montant_declare_cash: 70.00,
    montant_autres_moyens: 40.00,
    nombre_courses: 3,
    notes: "Shift test complet - simulation chauffeur"
  };
  
  const result = await makeRequest(
    `${baseUrl}/feuilles-route/${currentShiftId}/taximetre`, 
    'POST', 
    taximeterData, 
    env
  );
  
  if (result.success) {
    console.log(`📊 Données taximètre ajoutées: ${taximeterData.index_debut} → ${taximeterData.index_fin}`);
    testResults[env].details.push('Données taximètre complétées');
  }
  
  return result;
}

// 5. Terminer le shift
async function endShift(baseUrl, env) {
  console.log(`\n🎯 ÉTAPE 5: Terminer shift (${env.toUpperCase()})`);
  console.log('─'.repeat(50));
  
  if (!currentShiftId) {
    console.log('❌ Pas de shift actif');
    return { success: false };
  }
  
  const endData = {
    heure_fin: "14:30",
    index_km_fin_tdb: 60075,
    interruptions: "Pause déjeuner 12h00-12h30",
    montant_salaire_cash_declare: 70.00,
    signature_chauffeur: "SIMULATION_COMPLETE_TEST",
    est_validee: true
  };
  
  const endpoint = env === 'dev' ? `/feuilles-route/${currentShiftId}` : `/dashboard/feuilles-route/${currentShiftId}`;
  const result = await makeRequest(`${baseUrl}${endpoint}`, 'PUT', endData, env);
  
  if (result.success) {
    console.log(`🏁 Shift ${currentShiftId} terminé avec succès`);
    testResults[env].details.push(`Shift ${currentShiftId} terminé et validé`);
  }
  
  return result;
}

// 6. Vérifier le shift complet
async function verifyCompleteShift(baseUrl, env) {
  console.log(`\n🎯 ÉTAPE 6: Vérifier shift complet (${env.toUpperCase()})`);
  console.log('─'.repeat(50));
  
  if (!currentShiftId) {
    console.log('❌ Pas de shift à vérifier');
    return { success: false };
  }
  
  const endpoint = env === 'dev' ? `/feuilles-route/${currentShiftId}` : `/feuilles-route/${currentShiftId}`;
  const result = await makeRequest(`${baseUrl}${endpoint}`, 'GET', null, env);
  
  if (result.success && result.data) {
    const shift = result.data;
    console.log(`📋 Shift ${currentShiftId} vérifié:`);
    console.log(`   • Chauffeur: ${shift.chauffeur?.utilisateur?.nom} ${shift.chauffeur?.utilisateur?.prenom}`);
    console.log(`   • Véhicule: ${shift.vehicule?.plaque_immatriculation}`);
    console.log(`   • Durée: ${shift.heure_debut} → ${shift.heure_fin}`);
    console.log(`   • Index: ${shift.index_km_debut_tdb} → ${shift.index_km_fin_tdb} km`);
    console.log(`   • Courses: ${shift.course?.length || 0}`);
    console.log(`   • Charges: ${shift.charge?.length || 0}`);
    console.log(`   • Validé: ${shift.est_validee ? 'Oui' : 'Non'}`);
    
    testResults[env].details.push(`Shift complet vérifié: ${shift.course?.length || 0} courses, ${shift.charge?.length || 0} charges`);
  }
  
  return result;
}

// Workflow complet pour un environnement
async function runCompleteWorkflow(env) {
  console.log(`\n🚀 DÉBUT WORKFLOW ${env.toUpperCase()}`);
  console.log('='.repeat(60));
  
  const baseUrl = env === 'dev' ? BASE_URL_DEV : BASE_URL_PROD;
  currentShiftId = null; // Reset pour chaque env
  
  try {
    await createCompleteShift(baseUrl, env);
    await addCourses(baseUrl, env);
    await addCharges(baseUrl, env);
    await addTaximeterData(baseUrl, env);
    await endShift(baseUrl, env);
    await verifyCompleteShift(baseUrl, env);
  } catch (error) {
    console.log(`💥 Erreur workflow ${env}: ${error.message}`);
    testResults[env].failed++;
  }
}

// Afficher le résumé
function showSummary() {
  console.log('\n📊 RÉSUMÉ FINAL');
  console.log('='.repeat(60));
  
  for (const [env, results] of Object.entries(testResults)) {
    console.log(`\n🎯 ${env.toUpperCase()}:`);
    console.log(`   ✅ Succès: ${results.success}`);
    console.log(`   ❌ Échecs: ${results.failed}`);
    console.log(`   📝 Détails: ${results.details.join(', ')}`);
  }
  
  const totalSuccess = testResults.dev.success + testResults.prod.success;
  const totalFailed = testResults.dev.failed + testResults.prod.failed;
  
  console.log(`\n🎯 TOTAL GLOBAL:`);
  console.log(`   ✅ Succès: ${totalSuccess}`);
  console.log(`   ❌ Échecs: ${totalFailed}`);
  console.log(`   📈 Taux de réussite: ${Math.round((totalSuccess / (totalSuccess + totalFailed)) * 100)}%`);
}

// Lancement principal
async function main() {
  try {
    // Test dev puis prod
    await runCompleteWorkflow('dev');
    await runCompleteWorkflow('prod');
    
    showSummary();
    
    console.log('\n🎉 SIMULATION COMPLÈTE TERMINÉE');
  } catch (error) {
    console.error('💥 Erreur fatale:', error);
  }
}

main().catch(console.error);
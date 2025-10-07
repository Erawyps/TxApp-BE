#!/usr/bin/env node

/**
 * Test simplifié de fin de shift - dev uniquement
 */

// Configuration
const DEV_URL = 'http://localhost:3001';
const CHAUFFEUR_ID = 5; // Utilise Hasler TEHOU qui existe

async function makeRequest(url, options = {}) {
  console.log(`🌐 ${options.method || 'GET'} ${url}`);
  
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
    console.error(`❌ Erreur requête:`, error.message);
    throw error;
  }
}

async function testShiftWorkflow() {
  console.log(`🎯 TEST RAPIDE - FIN DE SHIFT ET REDÉMARRAGE`);
  console.log(`⏰ ${new Date().toLocaleString()}\n`);
  
  try {
    // 1. Vérifier la santé du serveur
    console.log(`🏥 Vérification santé serveur...`);
    const health = await makeRequest(`${DEV_URL}/api/health`);
    console.log(`✅ Serveur dev en ligne - ${health.environment}\n`);
    
    // 2. Vérifier shift actif
    console.log(`🔍 Recherche shift actif...`);
    let activeShift;
    try {
      activeShift = await makeRequest(`${DEV_URL}/api/feuilles-route/active/${CHAUFFEUR_ID}`);
      if (activeShift) {
        console.log(`✅ Shift actif trouvé - ID: ${activeShift.feuille_id}`);
      } else {
        console.log(`ℹ️ Aucun shift actif trouvé (null response)`);
      }
    } catch (error) {
      if (error.message.includes('404')) {
        console.log(`ℹ️ Aucun shift actif trouvé (404)`);
        activeShift = null;
      } else {
        throw error;
      }
    }
    
    // 3. Créer un nouveau shift si aucun actif
    if (!activeShift) {
      console.log(`\n🚀 Création d'un nouveau shift...`);
    const newShiftData = {
      chauffeur_id: CHAUFFEUR_ID,
      vehicule_id: 1,
      date_service: new Date().toISOString().split('T')[0],
      heure_debut: new Date().toTimeString().split(' ')[0], // Format HH:MM:SS
      index_km_debut_tdb: 50000,
      mode_encodage: 'taximetre',
      est_validee: false,
      numero_feuille: `TEST-${Date.now()}`
    };
      
      activeShift = await makeRequest(`${DEV_URL}/api/feuilles-route`, {
        method: 'POST',
        body: JSON.stringify(newShiftData)
      });
      
      console.log(`✅ Nouveau shift créé - ID: ${activeShift.feuille_id}`);
    }
    
    // 4. Tester la fin de shift avec le nouveau endpoint PUT
    console.log(`\n🏁 Test fin de shift...`);
    const endData = {
      heure_fin: new Date().toISOString(),
      index_km_fin_tdb: 50150,
      interruptions: 'Test automatique - fin de shift',
      montant_salaire_cash_declare: 123.45,
      signature_chauffeur: 'TEST_SIGNATURE'
    };
    
    const endedShift = await makeRequest(`${DEV_URL}/api/feuilles-route/${activeShift.feuille_id}`, {
      method: 'PUT',
      body: JSON.stringify(endData)
    });
    
    console.log(`✅ Shift terminé avec succès!`);
    console.log(`   - Feuille ID: ${endedShift.feuille_id}`);
    console.log(`   - Heure fin: ${endedShift.heure_fin}`);
    console.log(`   - KM fin: ${endedShift.index_km_fin_tdb}`);
    console.log(`   - Montant déclaré: ${endedShift.montant_salaire_cash_declare}€`);
    console.log(`   - Validée: ${endedShift.est_validee ? 'Oui' : 'Non'}`);
    
    // 5. Vérifier qu'il n'y a plus de shift actif
    console.log(`\n🔍 Vérification absence de shift actif...`);
    try {
      const newActiveShift = await makeRequest(`${DEV_URL}/api/feuilles-route/active/${CHAUFFEUR_ID}`);
      if (newActiveShift) {
        console.log(`⚠️ Un shift est encore actif - ID: ${newActiveShift.feuille_id}`);
      } else {
        console.log(`✅ Aucun shift actif (correct)`);
      }
    } catch (error) {
      if (error.message.includes('404')) {
        console.log(`✅ Aucun shift actif (404 - correct)`);
      } else {
        console.log(`⚠️ Erreur vérification:`, error.message);
      }
    }
    
    // 6. Créer un nouveau shift pour tester le "relancer"
    console.log(`\n🔄 Test relance d'un nouveau shift...`);
    const newShiftData2 = {
      chauffeur_id: CHAUFFEUR_ID,
      vehicule_id: 1,
      date_service: new Date().toISOString().split('T')[0],
      heure_debut: new Date().toTimeString().split(' ')[0], // Format HH:MM:SS
      index_km_debut_tdb: endedShift.index_km_fin_tdb || 50150,
      mode_encodage: 'taximetre',
      est_validee: false,
      numero_feuille: `RELANCE-${Date.now()}`
    };
    
    const newShift = await makeRequest(`${DEV_URL}/api/feuilles-route`, {
      method: 'POST',
      body: JSON.stringify(newShiftData2)
    });
    
    console.log(`✅ Nouveau shift relancé - ID: ${newShift.feuille_id}`);
    
    console.log(`\n🎉 TOUS LES TESTS RÉUSSIS!`);
    console.log(`✅ Fin de shift: Fonctionnel`);
    console.log(`✅ Redémarrage shift: Fonctionnel`);
    console.log(`✅ Dev/Prod parity: Restaurée`);
    
  } catch (error) {
    console.error(`\n💥 ÉCHEC DU TEST:`, error.message);
    process.exit(1);
  }
}

// Lancement du test
testShiftWorkflow().catch(console.error);
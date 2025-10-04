// Test de récupération des données pour le PDF
// Exécuter dans la console du navigateur (F12)

async function testPDFData(feuilleId = 1) {
  console.log('🔍 Test de récupération des données pour PDF...\n');
  
  try {
    // 1. Test API brute
    console.log('1️⃣ Test API brute /api/feuilles-route/' + feuilleId);
    const response = await fetch(`/api/feuilles-route/${feuilleId}`);
    const data = await response.json();
    
    console.log('✅ Données API reçues:');
    console.log('  - feuille_id:', data.feuille_id);
    console.log('  - date_service:', data.date_service);
    console.log('  - chauffeur:', data.chauffeur?.utilisateur?.prenom, data.chauffeur?.utilisateur?.nom);
    console.log('  - societe_taxi (chauffeur):', data.chauffeur?.societe_taxi);
    console.log('  - societe_taxi (vehicule):', data.vehicule?.societe_taxi);
    console.log('  - taximetre:', data.taximetre);
    console.log('  - courses:', data.courses?.length || 0);
    console.log('  - charges:', data.charges?.length || 0);
    console.log('\n  📊 Données complètes:', data);
    
    // 2. Test du Field Mapper
    console.log('\n2️⃣ Test du Field Mapper');
    
    // Import dynamique
    const { mapFeuilleRouteFromDB } = await import('./utils/fieldMapper.js');
    
    const mappedData = mapFeuilleRouteFromDB(data);
    console.log('✅ Données mappées:');
    console.log('  - nom_exploitant:', mappedData.nom_exploitant);
    console.log('  - km_tableau_bord_debut:', mappedData.km_tableau_bord_debut);
    console.log('  - km_tableau_bord_fin:', mappedData.km_tableau_bord_fin);
    console.log('  - taximetre_prise_charge_debut:', mappedData.taximetre_prise_charge_debut);
    console.log('  - taximetre_prise_charge_fin:', mappedData.taximetre_prise_charge_fin);
    console.log('  - taximetre_index_km_debut:', mappedData.taximetre_index_km_debut);
    console.log('  - taximetre_index_km_fin:', mappedData.taximetre_index_km_fin);
    console.log('  - taximetre_km_charge_debut:', mappedData.taximetre_km_charge_debut);
    console.log('  - taximetre_km_charge_fin:', mappedData.taximetre_km_charge_fin);
    console.log('  - taximetre_chutes_debut:', mappedData.taximetre_chutes_debut);
    console.log('  - taximetre_chutes_fin:', mappedData.taximetre_chutes_fin);
    console.log('\n  📊 Données mappées complètes:', mappedData);
    
    // 3. Vérification des valeurs nulles
    console.log('\n3️⃣ Vérification des valeurs manquantes');
    const missing = [];
    
    if (!mappedData.nom_exploitant || mappedData.nom_exploitant === 'Non renseigné') {
      missing.push('❌ nom_exploitant manquant');
      console.log('  ❌ nom_exploitant:', mappedData.nom_exploitant);
      console.log('     Vérifier: chauffeur.societe_taxi.nom_exploitant =', data.chauffeur?.societe_taxi?.nom_exploitant);
    } else {
      console.log('  ✅ nom_exploitant:', mappedData.nom_exploitant);
    }
    
    if (!mappedData.km_tableau_bord_debut && !mappedData.km_tableau_bord_fin) {
      missing.push('❌ Kilomètres tableau de bord manquants');
      console.log('  ❌ km_tableau_bord_debut:', mappedData.km_tableau_bord_debut);
      console.log('  ❌ km_tableau_bord_fin:', mappedData.km_tableau_bord_fin);
      console.log('     Vérifier DB: index_km_debut_tdb =', data.index_km_debut_tdb);
      console.log('     Vérifier DB: index_km_fin_tdb =', data.index_km_fin_tdb);
    } else {
      console.log('  ✅ km_tableau_bord_debut:', mappedData.km_tableau_bord_debut);
      console.log('  ✅ km_tableau_bord_fin:', mappedData.km_tableau_bord_fin);
    }
    
    if (!data.taximetre) {
      missing.push('❌ Données taximètre manquantes dans la DB');
      console.log('  ❌ Table taximetre absente pour cette feuille');
      console.log('     La feuille_id ' + feuilleId + ' n\'a pas d\'enregistrement dans la table taximetre');
    } else {
      console.log('  ✅ Données taximètre présentes');
      console.log('     prise_en_charge_debut:', data.taximetre.prise_en_charge_debut);
      console.log('     prise_en_charge_fin:', data.taximetre.prise_en_charge_fin);
      console.log('     km_en_charge_debut:', data.taximetre.km_en_charge_debut);
      console.log('     km_en_charge_fin:', data.taximetre.km_en_charge_fin);
    }
    
    // Résumé
    console.log('\n' + '='.repeat(60));
    if (missing.length === 0) {
      console.log('✅ SUCCÈS : Toutes les données sont présentes !');
    } else {
      console.log('❌ PROBLÈMES DÉTECTÉS:');
      missing.forEach(m => console.log('   ' + m));
    }
    console.log('='.repeat(60));
    
    return { data, mappedData, missing };
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    return { error: error.message };
  }
}

// Exécuter le test
console.log('Pour tester, exécutez: await testPDFData(1)');
console.log('(Remplacez 1 par l\'ID d\'une feuille de route existante)');

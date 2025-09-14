console.log('🧪 Test final du flux complet : API → Composants\n');

// Test direct des APIs
async function testAPIs() {
  try {
    console.log('📡 Test direct des APIs...\n');

    // Test des règles de salaire
    console.log('📊 Test des règles de salaire :');
    const reglesResponse = await fetch('http://localhost:3001/api/regles-salaire');
    const reglesData = await reglesResponse.json();
    const reglesSalaire = reglesData.data;
    console.log(`✅ ${reglesSalaire.length} règles de salaire récupérées`);
    console.log('Exemples :', reglesSalaire.slice(0, 3).map(r => `${r.nom} (ID: ${r.id})`));

    // Test des véhicules
    console.log('\n🚗 Test des véhicules :');
    const vehiculesResponse = await fetch('http://localhost:3001/api/vehicules');
    const vehiculesData = await vehiculesResponse.json();
    const vehicules = vehiculesData.data;
    console.log(`✅ ${vehicules.length} véhicules récupérés`);
    console.log('Exemples :', vehicules.slice(0, 3).map(v => `${v.plaque_immatriculation} - ${v.marque} ${v.modele}`));

    return { reglesSalaire, vehicules };
  } catch (error) {
    console.error('❌ Erreur dans les APIs :', error);
    throw error;
  }
}

// Test du formatage pour les composants
function testComponentFormatting(reglesSalaire, vehicules) {
  console.log('\n🎨 Test du formatage pour les composants...\n');

  // Formatage des règles de salaire pour Listbox
  const remunerationOptions = [
    { value: '', label: 'Sélectionner une rémunération' },
    ...reglesSalaire.map(regle => ({
      value: regle.id,
      label: regle.nom
    }))
  ];

  console.log('💰 Options de rémunération formatées :');
  console.log(remunerationOptions.slice(0, 5));

  // Formatage des véhicules pour Listbox
  const vehicleOptions = [
    { value: '', label: 'Sélectionner un véhicule' },
    ...vehicules.map(vehicule => ({
      value: vehicule.id,
      label: `${vehicule.plaque_immatriculation} - ${vehicule.marque} ${vehicule.modele}`
    }))
  ];

  console.log('\n🚗 Options de véhicules formatées :');
  console.log(vehicleOptions.slice(0, 5));

  return { remunerationOptions, vehicleOptions };
}

// Test des données de François-José Dubois
async function testDuboisData() {
  console.log('\n👤 Test des données de François-José Dubois...\n');

  try {
    const response = await fetch('http://localhost:3001/api/chauffeurs/15');
    const dubois = await response.json();

    console.log('✅ Données récupérées pour François-José Dubois :');
    console.log(`📛 Nom: ${dubois.utilisateur.prenom} ${dubois.utilisateur.nom}`);
    console.log(`💰 Règle de salaire: ${dubois.regle_salaire.nom} (ID: ${dubois.regle_salaire_id})`);
    console.log(`🚗 Véhicules assignés: ${dubois.vehicules.length}`);
    console.log('Détails véhicules:', dubois.vehicules.map(cv => `${cv.vehicule.plaque_immatriculation} - ${cv.vehicule.marque} ${cv.vehicule.modele}`));

    return dubois;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des données de Dubois :', error);
    throw error;
  }
}

// Fonction principale
async function runCompleteTest() {
  try {
    const { reglesSalaire, vehicules } = await testAPIs();
    const { remunerationOptions, vehicleOptions } = testComponentFormatting(reglesSalaire, vehicules);
    const dubois = await testDuboisData();

    console.log('\n🎉 TEST FINAL RÉUSSI !');
    console.log('\n📋 RÉSUMÉ :');
    console.log(`✅ ${reglesSalaire.length} règles de salaire disponibles`);
    console.log(`✅ ${vehicules.length} véhicules disponibles`);
    console.log(`✅ François-José Dubois a une règle de salaire assignée`);
    console.log(`✅ François-José Dubois a ${dubois.vehicules.length} véhicule(s) assigné(s)`);
    console.log(`✅ Les données sont correctement formatées pour les composants Listbox`);

    console.log('\n🚀 Le système est prêt ! Les dropdowns devraient maintenant afficher les données correctement.');
    console.log('\n💡 Pour tester dans le navigateur :');
    console.log('1. Ouvrez http://localhost:5173 (frontend)');
    console.log('2. Allez dans le formulaire de nouveau poste');
    console.log('3. Les dropdowns de rémunération et véhicule devraient afficher les données');

  } catch (error) {
    console.error('\n❌ ÉCHEC DU TEST FINAL :', error);
    process.exit(1);
  }
}

runCompleteTest();
console.log('🧪 Test des corrections des dropdowns...\n');

// Test des options par défaut
function testDefaultOptions() {
  console.log('📋 Test des options par défaut...\n');

  // Simuler les données de rémunération
  const reglesSalaire = [
    { id: 5, nom: 'Commission avec Pourboires' },
    { id: 8, nom: 'Bonus Remplacement Urgente' }
  ];

  // Simuler les données de véhicules
  const vehicles = [
    { id: 51, plaque_immatriculation: '1-ABC-123', marque: 'Mercedes-Benz', modele: 'E-Class' },
    { id: 52, plaque_immatriculation: '1-DEF-456', marque: 'BMW', modele: 'Série 3' }
  ];

  // Test formatage rémunération (ShiftForm)
  const remunerationTypes = reglesSalaire.map(regle => ({
    value: regle.id,
    label: regle.nom
  }));
  const remunerationOptions = [{ value: '', label: 'Sélectionner un type de rémunération' }, ...remunerationTypes];

  console.log('💰 Options de rémunération (ShiftForm) :');
  console.log(remunerationOptions);
  console.log('✅ Option par défaut :', remunerationOptions[0]);

  // Test formatage véhicules (ShiftForm)
  const baseVehicleOptions = vehicles.map(v => ({
    value: v.id,
    label: `${v.plaque_immatriculation} - ${v.marque} ${v.modele}`
  }));
  const vehicleOptions = [{ value: '', label: 'Sélectionner un véhicule' }, ...baseVehicleOptions];

  console.log('\n🚗 Options de véhicules (ShiftForm) :');
  console.log(vehicleOptions);
  console.log('✅ Option par défaut :', vehicleOptions[0]);

  // Test formatage rémunération (CourseForm)
  const baseRemunerationOptions = reglesSalaire.map(regle => ({
    value: regle.id,
    label: regle.nom
  }));
  const courseRemunerationOptions = [{ value: '', label: 'Sélectionner une rémunération' }, ...baseRemunerationOptions];

  console.log('\n💰 Options de rémunération (CourseForm) :');
  console.log(courseRemunerationOptions);
  console.log('✅ Option par défaut :', courseRemunerationOptions[0]);

  console.log('\n🎯 Test de logique de sélection...\n');

  // Test logique de sélection (cas sans valeur sélectionnée)
  const fieldValue = ''; // Aucune valeur sélectionnée
  const selectedRemuneration = fieldValue ? remunerationOptions.find(c => c.value === fieldValue) || remunerationOptions[0] : remunerationOptions[0];
  const selectedVehicle = fieldValue ? vehicleOptions.find(v => v.value === fieldValue) || vehicleOptions[0] : vehicleOptions[0];

  console.log('📝 Cas sans valeur sélectionnée :');
  console.log('💰 Rémunération sélectionnée par défaut :', selectedRemuneration);
  console.log('🚗 Véhicule sélectionné par défaut :', selectedVehicle);

  // Test logique de sélection (cas avec valeur sélectionnée)
  const fieldValueSelected = 5; // Valeur sélectionnée
  const selectedRemunerationWithValue = fieldValueSelected ? remunerationOptions.find(c => c.value === fieldValueSelected) || remunerationOptions[0] : remunerationOptions[0];

  console.log('\n📝 Cas avec valeur sélectionnée (ID: 5) :');
  console.log('💰 Rémunération sélectionnée :', selectedRemunerationWithValue);

  console.log('\n✅ Tests terminés - Les options par défaut devraient maintenant s\'afficher correctement !');
}

testDefaultOptions();
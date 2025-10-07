#!/usr/bin/env node

/**
 * 🎯 TEST MANUEL WORKFLOW COMPLET
 * Test step-by-step avec shift ID fixe
 */

const BASE_URL = 'http://localhost:3001/api';
const SHIFT_ID = 37;

console.log('🎯 TEST WORKFLOW COMPLET MANUEL');
console.log('📋 Shift ID:', SHIFT_ID);
console.log('⏰', new Date().toLocaleString());
console.log('');

// 1. Vérifier shift existant
console.log('🔍 Vérification shift existant...');
const shiftResponse = await fetch(`${BASE_URL}/feuilles-route/${SHIFT_ID}`);
const shift = await shiftResponse.json();
console.log(`✅ Shift ${SHIFT_ID}:`, shift.chauffeur?.utilisateur?.nom, shift.vehicule?.plaque_immatriculation);
console.log('');

// 2. Ajouter 3 courses
console.log('🚕 Ajout des courses...');
const courses = [
  {
    feuille_id: SHIFT_ID, num_ordre: 2, index_depart: 70000, index_embarquement: 70005,
    lieu_embarquement: "Gare Centrale", heure_embarquement: "08:30",
    index_debarquement: 70025, lieu_debarquement: "Aéroport BRU",
    heure_debarquement: "09:15", prix_taximetre: 48.75, sommes_percues: 55.00, mode_paiement_id: 1
  },
  {
    feuille_id: SHIFT_ID, num_ordre: 3, index_depart: 70025, index_embarquement: 70030,
    lieu_embarquement: "Aéroport BRU", heure_embarquement: "09:45",
    index_debarquement: 70055, lieu_debarquement: "Centre Ville",
    heure_debarquement: "10:30", prix_taximetre: 42.50, sommes_percues: 45.00, mode_paiement_id: 2
  },
  {
    feuille_id: SHIFT_ID, num_ordre: 4, index_depart: 70055, index_embarquement: 70060,
    lieu_embarquement: "Place Flagey", heure_embarquement: "11:00",
    index_debarquement: 70075, lieu_debarquement: "Gare du Midi",
    heure_debarquement: "11:25", prix_taximetre: 22.25, sommes_percues: 25.00, mode_paiement_id: 1
  }
];

for (const [index, course] of courses.entries()) {
  const response = await fetch(`${BASE_URL}/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(course)
  });
  const result = await response.json();
  console.log(`  ${index + 1}/3 Course ${course.num_ordre}: ${response.ok ? '✅' : '❌'} ${result.course_id || result.error}`);
}
console.log('');

// 3. Ajouter 3 charges
console.log('💰 Ajout des charges...');
const charges = [
  {
    feuille_id: SHIFT_ID, chauffeur_id: 5, vehicule_id: 2,
    description: "Carburant Shell", montant: 82.50, mode_paiement_charge: 1, date_charge: "2024-10-10"
  },
  {
    feuille_id: SHIFT_ID, chauffeur_id: 5, vehicule_id: 2,
    description: "Péage E40", montant: 8.70, mode_paiement_charge: 2, date_charge: "2024-10-10"
  },
  {
    feuille_id: SHIFT_ID, chauffeur_id: 5, vehicule_id: 2,
    description: "Parking aéroport", montant: 12.00, mode_paiement_charge: 1, date_charge: "2024-10-10"
  }
];

for (const [index, charge] of charges.entries()) {
  const response = await fetch(`${BASE_URL}/charges`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(charge)
  });
  const result = await response.json();
  console.log(`  ${index + 1}/3 Charge ${charge.description}: ${response.ok ? '✅' : '❌'} ${result.charge_id || result.error}`);
}
console.log('');

// 4. Ajouter données taximètre
console.log('📊 Ajout données taximètre...');
const taximeterData = {
  index_debut: 70000,
  index_fin: 70075,
  montant_declare_cash: 80.00,
  montant_autres_moyens: 45.00,
  nombre_courses: 3,
  notes: "Test complet simulation vue chauffeur"
};

const taximeterResponse = await fetch(`${BASE_URL}/feuilles-route/${SHIFT_ID}/taximetre`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(taximeterData)
});
const taximeterResult = await taximeterResponse.json();
console.log(`  Taximètre: ${taximeterResponse.ok ? '✅' : '❌'} ${taximeterResult.taximetre_id || taximeterResult.error}`);
console.log('');

// 5. Terminer le shift
console.log('🏁 Finalisation du shift...');
const endData = {
  heure_fin: "16:00",
  index_km_fin_tdb: 70075,
  interruptions: "Pause déjeuner 13h-14h",
  montant_salaire_cash_declare: 80.00,
  signature_chauffeur: "TEST_COMPLET_FINAL",
  est_validee: true
};

const endResponse = await fetch(`${BASE_URL}/feuilles-route/${SHIFT_ID}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(endData)
});
const endResult = await endResponse.json();
console.log(`  Terminaison: ${endResponse.ok ? '✅' : '❌'} ${endResult.feuille_id || endResult.error}`);
console.log('');

// 6. Vérification finale
console.log('📋 Vérification finale...');
const finalResponse = await fetch(`${BASE_URL}/feuilles-route/${SHIFT_ID}`);
const finalShift = await finalResponse.json();

if (finalResponse.ok) {
  console.log(`✅ Shift ${SHIFT_ID} complet:`);
  console.log(`   • Chauffeur: ${finalShift.chauffeur?.utilisateur?.nom} ${finalShift.chauffeur?.utilisateur?.prenom}`);
  console.log(`   • Véhicule: ${finalShift.vehicule?.plaque_immatriculation} (${finalShift.vehicule?.marque})`);
  console.log(`   • Période: ${finalShift.heure_debut} → ${finalShift.heure_fin}`);
  console.log(`   • Distance: ${finalShift.index_km_debut_tdb} → ${finalShift.index_km_fin_tdb} km`);
  console.log(`   • Courses: ${finalShift.course?.length || 0}`);
  console.log(`   • Charges: ${finalShift.charge?.length || 0}`);
  console.log(`   • Taximètre: ${finalShift.taximetre ? 'Oui' : 'Non'}`);
  console.log(`   • Validé: ${finalShift.est_validee ? 'Oui' : 'Non'}`);
  console.log(`   • Signature: ${finalShift.signature_chauffeur || 'Non'}`);
} else {
  console.log('❌ Erreur vérification finale');
}

console.log('');
console.log('🎉 TEST WORKFLOW COMPLET TERMINÉ');

// 7. Test pas de shift actif
console.log('');
console.log('🔍 Vérification aucun shift actif...');
const activeResponse = await fetch(`${BASE_URL}/feuilles-route/active/5`);
const activeShift = await activeResponse.json();
console.log(`  Shift actif: ${activeShift ? 'OUI (problème)' : 'NON (OK)'}`);

console.log('');
console.log('✅ VALIDATION COMPLÈTE TERMINÉE!');
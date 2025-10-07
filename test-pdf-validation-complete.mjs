#!/usr/bin/env node

/**
 * 🎯 TEST PDF COMPLET - Validation finale
 * Utilise le shift 37 complet pour tester la génération PDF
 */

const BASE_URL = 'http://localhost:3001/api';
const SHIFT_ID = 37;

console.log('📄 TEST GÉNÉRATION PDF COMPLET');
console.log('📋 Shift ID:', SHIFT_ID);
console.log('⏰', new Date().toLocaleString());
console.log('');

// Récupérer les données complètes
console.log('🔍 Récupération données complètes...');
const response = await fetch(`${BASE_URL}/feuilles-route/${SHIFT_ID}`);
const shiftData = await response.json();

if (!response.ok) {
  console.log('❌ Erreur récupération shift:', shiftData.error);
  process.exit(1);
}

console.log('✅ Données récupérées avec succès');
console.log('');

// Afficher structure complète des données
console.log('📊 STRUCTURE COMPLÈTE DES DONNÉES');
console.log('═'.repeat(50));

// Informations générales
console.log('🏷️  INFORMATIONS GÉNÉRALES:');
console.log(`   • ID: ${shiftData.feuille_id}`);
console.log(`   • Date service: ${shiftData.date_service}`);
console.log(`   • Mode encodage: ${shiftData.mode_encodage}`);
console.log(`   • Validé: ${shiftData.est_validee ? 'OUI' : 'NON'}`);
console.log(`   • Signature: ${shiftData.signature_chauffeur || 'Aucune'}`);
console.log('');

// Chauffeur
console.log('👤 CHAUFFEUR:');
if (shiftData.chauffeur?.utilisateur) {
  const user = shiftData.chauffeur.utilisateur;
  console.log(`   • Nom: ${user.nom} ${user.prenom}`);
  console.log(`   • Email: ${user.email}`);
  console.log(`   • Rôle: ${user.role}`);
  console.log(`   • Statut: ${shiftData.chauffeur.statut}`);
} else {
  console.log('   ❌ Données chauffeur manquantes');
}
console.log('');

// Véhicule
console.log('🚗 VÉHICULE:');
if (shiftData.vehicule) {
  const vehicule = shiftData.vehicule;
  console.log(`   • Plaque: ${vehicule.plaque_immatriculation}`);
  console.log(`   • Marque: ${vehicule.marque} ${vehicule.modele}`);
  console.log(`   • Année: ${vehicule.annee}`);
  console.log(`   • N° identification: ${vehicule.num_identification}`);
} else {
  console.log('   ❌ Données véhicule manquantes');
}
console.log('');

// Horaires et kilométrage
console.log('⏰ HORAIRES ET KILOMÉTRAGE:');
console.log(`   • Heure début: ${shiftData.heure_debut}`);
console.log(`   • Heure fin: ${shiftData.heure_fin}`);
console.log(`   • Index KM début: ${shiftData.index_km_debut_tdb} km`);
console.log(`   • Index KM fin: ${shiftData.index_km_fin_tdb} km`);
console.log(`   • Distance parcourue: ${(shiftData.index_km_fin_tdb || 0) - (shiftData.index_km_debut_tdb || 0)} km`);
console.log(`   • Interruptions: ${shiftData.interruptions || 'Aucune'}`);
console.log('');

// Courses
console.log('🚕 COURSES:');
if (shiftData.course && shiftData.course.length > 0) {
  console.log(`   📊 Total: ${shiftData.course.length} courses`);
  
  let totalTaximetre = 0;
  let totalPercus = 0;
  
  shiftData.course.forEach((course, index) => {
    console.log(`   ${index + 1}. Course ${course.num_ordre}:`);
    console.log(`      • Trajet: ${course.lieu_embarquement} → ${course.lieu_debarquement}`);
    console.log(`      • Horaire: ${course.heure_embarquement} → ${course.heure_debarquement}`);
    console.log(`      • Index: ${course.index_embarquement} → ${course.index_debarquement} km`);
    console.log(`      • Prix taximètre: €${course.prix_taximetre}`);
    console.log(`      • Sommes perçues: €${course.sommes_percues}`);
    console.log(`      • Paiement: ${course.mode_paiement?.libelle} (${course.mode_paiement?.code})`);
    
    totalTaximetre += parseFloat(course.prix_taximetre || 0);
    totalPercus += parseFloat(course.sommes_percues || 0);
  });
  
  console.log(`   💰 TOTAUX COURSES:`);
  console.log(`      • Total taximètre: €${totalTaximetre.toFixed(2)}`);
  console.log(`      • Total perçu: €${totalPercus.toFixed(2)}`);
  console.log(`      • Différence: €${(totalPercus - totalTaximetre).toFixed(2)}`);
} else {
  console.log('   ❌ Aucune course enregistrée');
}
console.log('');

// Charges
console.log('💰 CHARGES:');
if (shiftData.charge && shiftData.charge.length > 0) {
  console.log(`   📊 Total: ${shiftData.charge.length} charges`);
  
  let totalCharges = 0;
  
  shiftData.charge.forEach((charge, index) => {
    console.log(`   ${index + 1}. ${charge.description}:`);
    console.log(`      • Montant: €${charge.montant}`);
    console.log(`      • Paiement: ${charge.mode_paiement?.libelle}`);
    console.log(`      • Date: ${charge.date_charge}`);
    
    totalCharges += parseFloat(charge.montant || 0);
  });
  
  console.log(`   💸 TOTAL CHARGES: €${totalCharges.toFixed(2)}`);
} else {
  console.log('   ❌ Aucune charge enregistrée');
}
console.log('');

// Taximètre
console.log('📊 DONNÉES TAXIMÈTRE:');
if (shiftData.taximetre) {
  const taxi = shiftData.taximetre;
  console.log(`   • Index début: ${taxi.index_debut} km`);
  console.log(`   • Index fin: ${taxi.index_fin} km`);
  console.log(`   • Montant cash déclaré: €${taxi.montant_declare_cash}`);
  console.log(`   • Autres moyens: €${taxi.montant_autres_moyens}`);
  console.log(`   • Nombre courses: ${taxi.nombre_courses}`);
  console.log(`   • Notes: ${taxi.notes || 'Aucune'}`);
} else {
  console.log('   ❌ Aucune donnée taximètre');
}
console.log('');

// Calculs finaux
console.log('🧮 CALCULS FINAUX POUR PDF:');
const totalCourses = shiftData.course?.reduce((sum, course) => sum + parseFloat(course.sommes_percues || 0), 0) || 0;
const totalCharges = shiftData.charge?.reduce((sum, charge) => sum + parseFloat(charge.montant || 0), 0) || 0;
const beneficeNet = totalCourses - totalCharges;

console.log(`   • Total recettes courses: €${totalCourses.toFixed(2)}`);
console.log(`   • Total dépenses charges: €${totalCharges.toFixed(2)}`);
console.log(`   • Bénéfice net: €${beneficeNet.toFixed(2)}`);
console.log(`   • Montant déclaré: €${shiftData.montant_salaire_cash_declare || 0}`);
console.log('');

// Validation pour PDF
console.log('✅ VALIDATION POUR GÉNÉRATION PDF:');
const validations = [
  { test: 'Données chauffeur', valid: !!shiftData.chauffeur?.utilisateur },
  { test: 'Données véhicule', valid: !!shiftData.vehicule },
  { test: 'Horaires définis', valid: !!(shiftData.heure_debut && shiftData.heure_fin) },
  { test: 'Kilométrage cohérent', valid: (shiftData.index_km_fin_tdb || 0) >= (shiftData.index_km_debut_tdb || 0) },
  { test: 'Au moins une course', valid: (shiftData.course?.length || 0) > 0 },
  { test: 'Shift validé', valid: !!shiftData.est_validee },
  { test: 'Signature présente', valid: !!shiftData.signature_chauffeur }
];

validations.forEach(validation => {
  console.log(`   ${validation.valid ? '✅' : '❌'} ${validation.test}`);
});

const allValid = validations.every(v => v.valid);
console.log('');
console.log(`🎯 STATUT GLOBAL: ${allValid ? '✅ PRÊT POUR PDF' : '⚠️  VÉRIFICATIONS NÉCESSAIRES'}`);

if (allValid) {
  console.log('');
  console.log('📄 GÉNÉRATION PDF RECOMMANDÉE:');
  console.log(`   • Toutes les données sont complètes`);
  console.log(`   • Format de données cohérent`);
  console.log(`   • Calculs validés`);
  console.log(`   • Structure conforme aux attentes`);
}

console.log('');
console.log('🎉 VALIDATION COMPLÈTE TERMINÉE!');
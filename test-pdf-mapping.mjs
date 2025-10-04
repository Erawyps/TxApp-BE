import { mapFeuilleRouteFromDB, mapCourseFromDB } from './src/utils/fieldMapper.js';

// Simuler les données de l'API
const apiData = {
  feuille_id: 1,
  date_service: "2024-09-22T00:00:00.000Z",
  heure_debut: "1970-01-01T06:00:00.000Z",
  heure_fin: "1970-01-01T14:00:00.000Z",
  interruptions: null,
  index_km_debut_tdb: 3433,
  index_km_fin_tdb: null,
  chauffeur: {
    chauffeur_id: 1,
    utilisateur: {
      prenom: "Hasler",
      nom: "TEHOU"
    },
    societe_taxi: {
      nom_exploitant: "Taxi Express Brussels"
    }
  },
  vehicule: {
    plaque_immatriculation: "TXAA-751",
    numero_identification: "VH001"
  },
  course: [
    {
      course_id: 1,
      num_ordre: 1,
      index_depart: 125000,
      index_embarquement: 125005,
      lieu_embarquement: "Gare Centrale",
      heure_embarquement: "1970-01-01T06:15:00.000Z",
      index_debarquement: 125018,
      lieu_debarquement: "Brussels Airport",
      heure_debarquement: "1970-01-01T06:45:00.000Z",
      prix_taximetre: "45.2",
      sommes_percues: "45.2",
      mode_paiement_id: 1,
      client_id: 2
    }
  ],
  charge: [],
  taximetre: {
    pc_debut_tax: "2.4",
    pc_fin_tax: "2.4",
    index_km_debut_tax: 125000,
    index_km_fin_tax: 125180,
    km_charge_debut: "15642.5",
    km_charge_fin: "15722.8",
    chutes_debut_tax: "1254.6",
    chutes_fin_tax: "1389.2"
  }
};

console.log('=== TEST DU FIELD MAPPER POUR PDF ===\n');

// Mapper les données
const mappedShift = mapFeuilleRouteFromDB(apiData);
const mappedCourse = mapCourseFromDB(apiData.course[0]);

console.log('📋 DONNÉES MAPPÉES - SHIFT:');
console.log('  date:', mappedShift.date);
console.log('  heure_debut:', mappedShift.heure_debut);
console.log('  heure_fin:', mappedShift.heure_fin);
console.log('  nom_exploitant:', mappedShift.nom_exploitant);
console.log('  km_tableau_bord_debut:', mappedShift.km_tableau_bord_debut);
console.log('  km_tableau_bord_fin:', mappedShift.km_tableau_bord_fin);
console.log('  taximetre_prise_charge_debut:', mappedShift.taximetre_prise_charge_debut);
console.log('  taximetre_prise_charge_fin:', mappedShift.taximetre_prise_charge_fin);
console.log('  taximetre_index_km_debut:', mappedShift.taximetre_index_km_debut);
console.log('  taximetre_index_km_fin:', mappedShift.taximetre_index_km_fin);
console.log('  taximetre_km_charge_debut:', mappedShift.taximetre_km_charge_debut);
console.log('  taximetre_km_charge_fin:', mappedShift.taximetre_km_charge_fin);
console.log('  taximetre_chutes_debut:', mappedShift.taximetre_chutes_debut);
console.log('  taximetre_chutes_fin:', mappedShift.taximetre_chutes_fin);
console.log('  courses (array):', mappedShift.courses);
console.log('  charges (array):', mappedShift.charges);

console.log('\n🚗 DONNÉES MAPPÉES - COURSE:');
console.log('  num_ordre:', mappedCourse.num_ordre);
console.log('  index_depart:', mappedCourse.index_depart);
console.log('  index_embarquement:', mappedCourse.index_embarquement);
console.log('  lieu_embarquement:', mappedCourse.lieu_embarquement);
console.log('  heure_embarquement:', mappedCourse.heure_embarquement);
console.log('  index_debarquement:', mappedCourse.index_debarquement);
console.log('  lieu_debarquement:', mappedCourse.lieu_debarquement);
console.log('  heure_debarquement:', mappedCourse.heure_debarquement);
console.log('  prix_taximetre:', mappedCourse.prix_taximetre);
console.log('  sommes_percues:', mappedCourse.sommes_percues);

console.log('\n🔍 VÉRIFICATION DES PROBLÈMES:');

// Vérifier les heures
const formatTime = (time) => {
  if (!time) return 'VIDE';
  const timeStr = time.toString();
  // Extraire HH:MM depuis ISO string
  if (timeStr.includes('T')) {
    const timePart = timeStr.split('T')[1];
    return timePart.substring(0, 5);
  }
  return timeStr.substring(0, 5);
};

console.log('  Heure début formatée:', formatTime(mappedShift.heure_debut));
console.log('  Heure fin formatée:', formatTime(mappedShift.heure_fin));
console.log('  Heure embarquement formatée:', formatTime(mappedCourse.heure_embarquement));

// Vérifier les courses
console.log('\n  Nombre de courses mappées:', mappedShift.courses?.length || 0);
console.log('  Type de courses:', Array.isArray(mappedShift.courses) ? 'Array' : typeof mappedShift.courses);

if (!mappedShift.courses || mappedShift.courses.length === 0) {
  console.log('  ❌ PROBLÈME: Aucune course mappée !');
  console.log('  apiData.course:', apiData.course);
} else {
  console.log('  ✅ Courses correctement mappées');
}

// Vérifier le taximètre
if (!mappedShift.taximetre_prise_charge_debut) {
  console.log('  ❌ PROBLÈME: taximetre_prise_charge_debut vide');
} else {
  console.log('  ✅ Taximètre prise en charge OK');
}

if (!mappedShift.km_tableau_bord_debut) {
  console.log('  ❌ PROBLÈME: km_tableau_bord_debut vide');
} else {
  console.log('  ✅ KM tableau de bord début OK:', mappedShift.km_tableau_bord_debut);
}

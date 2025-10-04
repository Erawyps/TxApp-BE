#!/usr/bin/env node

/**
 * Script de test pour vérifier le mapping des données taximètre
 */

import { mapFeuilleRouteFromDB } from './src/utils/fieldMapper.js';

// Simuler les données brutes de l'API (feuille_id = 1)
const rawData = {
  feuille_id: 1,
  date: '2024-06-15T00:00:00.000Z',
  heure_debut: '1970-01-01T06:00:00.000Z',
  heure_fin: '1970-01-01T14:00:00.000Z',
  interruptions: '',
  index_km_debut_tdb: 125000,
  index_km_fin_tdb: 125180,
  montant_salaire_cash_declare: '150',
  statut: 'validated',
  
  // Données taximètre
  taximetre: {
    taximetre_id: 1,
    feuille_id: 1,
    pc_debut_tax: '2.4',
    pc_fin_tax: '2.4',
    index_km_debut_tax: 125000,
    index_km_fin_tax: 125180,
    km_charge_debut: '15642.5',
    km_charge_fin: '15722.8',
    chutes_debut_tax: '1254.6',
    chutes_fin_tax: '1389.2',
    created_at: '2024-06-15T06:00:00.000Z',
    updated_at: '2024-06-15T14:00:00.000Z'
  },
  
  // Relations
  chauffeur: {
    prenom: 'Hasler',
    nom: 'TEHOU',
    societe_taxi: {
      nom_exploitant: 'TAXI PARISIEN'
    }
  },
  vehicule: {
    plaque_immatriculation: 'AB-123-CD',
    numero_identification: 'VH001'
  },
  course: [],
  charge: []
};

console.log('📋 TEST FIELD MAPPER - DONNÉES TAXIMÈTRE');
console.log('=' .repeat(60));
console.log('\n1️⃣  DONNÉES BRUTES (rawData.taximetre):');
console.log(JSON.stringify(rawData.taximetre, null, 2));

console.log('\n2️⃣  MAPPING EN COURS...\n');
const mappedData = mapFeuilleRouteFromDB(rawData);

console.log('3️⃣  DONNÉES MAPPÉES (mappedData):');
console.log('   taximetre_prise_charge_debut:', mappedData.taximetre_prise_charge_debut);
console.log('   taximetre_prise_charge_fin:', mappedData.taximetre_prise_charge_fin);
console.log('   taximetre_index_km_debut:', mappedData.taximetre_index_km_debut);
console.log('   taximetre_index_km_fin:', mappedData.taximetre_index_km_fin);
console.log('   taximetre_km_charge_debut:', mappedData.taximetre_km_charge_debut);
console.log('   taximetre_km_charge_fin:', mappedData.taximetre_km_charge_fin);
console.log('   taximetre_chutes_debut:', mappedData.taximetre_chutes_debut);
console.log('   taximetre_chutes_fin:', mappedData.taximetre_chutes_fin);

console.log('\n4️⃣  OBJET TAXIMETRE COMPLET:');
console.log(JSON.stringify(mappedData.taximetre, null, 2));

console.log('\n✅ Si les valeurs ci-dessus sont définies, le mapping fonctionne!');
console.log('❌ Si undefined/null, le Field Mapper a un problème de mapping.\n');

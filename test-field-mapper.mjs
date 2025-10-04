/**
 * Test du Field Mapper pour vérifier la transformation des données
 */

import { PrismaClient } from '@prisma/client';
import { mapFeuilleRouteFromDB } from './src/utils/fieldMapper.js';

const prisma = new PrismaClient();

async function testFieldMapper() {
  try {
    console.log('🧪 Test du Field Mapper\n');
    
    // 1. Récupérer les données brutes de la DB
    const feuilleDB = await prisma.feuille_route.findUnique({
      where: { feuille_id: 1 },
      include: {
        chauffeur: {
          include: {
            utilisateur: true,
            societe_taxi: true
          }
        },
        vehicule: {
          include: {
            societe_taxi: true
          }
        },
        course: {
          include: {
            client: true,
            mode_paiement: true
          }
        },
        charge: {
          include: {
            mode_paiement: true
          }
        },
        taximetre: true
      }
    });
    
    console.log('✅ Données brutes récupérées\n');
    
    // 2. Appliquer le Field Mapper
    const mapped = mapFeuilleRouteFromDB(feuilleDB);
    
    console.log('✅ Field Mapper appliqué\n');
    
    // 3. Vérifier les champs critiques
    console.log('━'.repeat(80));
    console.log('VÉRIFICATION DES CHAMPS MAPPÉS');
    console.log('━'.repeat(80));
    
    console.log('\n📋 Nom exploitant:');
    console.log(`  DB brut: ${feuilleDB.chauffeur?.societe_taxi?.nom_exploitant}`);
    console.log(`  Mappé: ${mapped.nom_exploitant}`);
    console.log(`  Status: ${mapped.nom_exploitant !== 'Non renseigné' ? '✅' : '❌'}`);
    
    console.log('\n⏰ Heures:');
    console.log(`  DB heure_debut: ${feuilleDB.heure_debut}`);
    console.log(`  Mappé heure_debut: ${mapped.heure_debut}`);
    console.log(`  DB heure_fin: ${feuilleDB.heure_fin}`);
    console.log(`  Mappé heure_fin: ${mapped.heure_fin}`);
    
    console.log('\n📏 Index KM (Tableau de bord):');
    console.log(`  DB index_km_debut_tdb: ${feuilleDB.index_km_debut_tdb}`);
    console.log(`  Mappé km_tableau_bord_debut: ${mapped.km_tableau_bord_debut}`);
    console.log(`  Mappé index_km_debut_tdb: ${mapped.index_km_debut_tdb}`);
    console.log(`  DB index_km_fin_tdb: ${feuilleDB.index_km_fin_tdb}`);
    console.log(`  Mappé km_tableau_bord_fin: ${mapped.km_tableau_bord_fin}`);
    console.log(`  Mappé index_km_fin_tdb: ${mapped.index_km_fin_tdb}`);
    
    console.log('\n🚖 Taximètre:');
    console.log(`  DB taximetre existe: ${!!feuilleDB.taximetre}`);
    console.log(`  DB pc_debut_tax: ${feuilleDB.taximetre?.pc_debut_tax}`);
    console.log(`  Mappé taximetre_prise_charge_debut: ${mapped.taximetre_prise_charge_debut}`);
    console.log(`  Mappé taximetre_prise_charge_fin: ${mapped.taximetre_prise_charge_fin}`);
    console.log(`  Mappé taximetre_index_km_debut: ${mapped.taximetre_index_km_debut}`);
    console.log(`  Mappé taximetre_index_km_fin: ${mapped.taximetre_index_km_fin}`);
    console.log(`  Mappé taximetre_km_charge_debut: ${mapped.taximetre_km_charge_debut}`);
    console.log(`  Mappé taximetre_km_charge_fin: ${mapped.taximetre_km_charge_fin}`);
    console.log(`  Mappé taximetre_chutes_debut: ${mapped.taximetre_chutes_debut}`);
    console.log(`  Mappé taximetre_chutes_fin: ${mapped.taximetre_chutes_fin}`);
    
    console.log('\n👤 Chauffeur:');
    console.log(`  DB chauffeur.utilisateur.prenom: ${feuilleDB.chauffeur?.utilisateur?.prenom}`);
    console.log(`  DB chauffeur.utilisateur.nom: ${feuilleDB.chauffeur?.utilisateur?.nom}`);
    console.log(`  Mappé chauffeur: ${mapped.chauffeur ? 'Présent' : 'Absent'}`);
    
    console.log('\n📊 Courses et Charges:');
    console.log(`  DB course (array): ${Array.isArray(feuilleDB.course)} (${feuilleDB.course?.length || 0} éléments)`);
    console.log(`  Mappé courses (array): ${Array.isArray(mapped.courses)} (${mapped.courses?.length || 0} éléments)`);
    console.log(`  DB charge (array): ${Array.isArray(feuilleDB.charge)} (${feuilleDB.charge?.length || 0} éléments)`);
    console.log(`  Mappé charges (array): ${Array.isArray(mapped.charges)} (${mapped.charges?.length || 0} éléments)`);
    
    console.log('\n' + '━'.repeat(80));
    console.log('RÉSULTAT');
    console.log('━'.repeat(80));
    
    const problemes = [];
    
    if (mapped.nom_exploitant === 'Non renseigné') {
      problemes.push('❌ Nom exploitant = "Non renseigné"');
    }
    
    if (!mapped.heure_debut || !mapped.heure_fin) {
      problemes.push('❌ Heures manquantes');
    }
    
    if (!mapped.km_tableau_bord_debut && !mapped.index_km_debut_tdb) {
      problemes.push('❌ Index km début manquant');
    }
    
    if (!mapped.km_tableau_bord_fin && !mapped.index_km_fin_tdb) {
      problemes.push('❌ Index km fin manquant');
    }
    
    if (!mapped.taximetre_prise_charge_debut && !mapped.taximetre_prise_charge_fin) {
      problemes.push('❌ Prise en charge taximètre manquante');
    }
    
    if (!mapped.taximetre_index_km_debut && !mapped.taximetre_index_km_fin) {
      problemes.push('❌ Index km taximètre manquant');
    }
    
    if (problemes.length === 0) {
      console.log('\n✅ Tous les champs sont correctement mappés !');
      console.log('\n➡️  Le Field Mapper fonctionne correctement.');
      console.log('    Le problème vient probablement de l\'utilisation des données dans le PDF.');
    } else {
      console.log('\n❌ Problèmes détectés:');
      problemes.forEach(p => console.log(`  ${p}`));
    }
    
    console.log('\n');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFieldMapper();

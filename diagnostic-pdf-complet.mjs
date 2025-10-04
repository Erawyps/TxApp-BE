#!/usr/bin/env node
/**
 * Script de diagnostic complet pour identifier pourquoi le PDF affiche "Non renseigné"
 * 
 * Usage: node diagnostic-pdf-complet.mjs <feuille_id>
 * Exemple: node diagnostic-pdf-complet.mjs 1
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const feuilleId = process.argv[2] || 1;

console.log('━'.repeat(80));
console.log('🔍 DIAGNOSTIC COMPLET - DONNÉES PDF');
console.log('━'.repeat(80));
console.log(`\n📋 Feuille de route ID: ${feuilleId}\n`);

async function diagnosticComplet() {
  try {
    // 1. Récupérer la feuille de route avec TOUTES les relations
    console.log('1️⃣  Récupération de la feuille de route...\n');
    
    const feuille = await prisma.feuille_route.findUnique({
      where: { feuille_id: parseInt(feuilleId) },
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
        course: { // ✅ SINGULIER - le schéma Prisma utilise 'course' pas 'courses'
          include: {
            client: true,
            mode_paiement: true
          },
          orderBy: { num_ordre: 'asc' }
        },
        charge: { // ✅ SINGULIER - le schéma Prisma utilise 'charge' pas 'charges'
          include: {
            vehicule: true,
            mode_paiement: true
          }
        },
        taximetre: true
      }
    });

    if (!feuille) {
      console.error(`❌ Aucune feuille de route trouvée avec l'ID ${feuilleId}`);
      return;
    }

    console.log('✅ Feuille de route trouvée\n');
    
    // 2. Vérifier les données de base
    console.log('━'.repeat(80));
    console.log('2️⃣  DONNÉES DE BASE');
    console.log('━'.repeat(80));
    console.log(`Date: ${feuille.date_service}`);
    console.log(`Heure début: ${feuille.heure_debut || '❌ VIDE'}`);
    console.log(`Heure fin: ${feuille.heure_fin || '❌ VIDE'}`);
    console.log(`Statut: ${feuille.statut}`);
    
    // 3. Vérifier le nom de l'exploitant
    console.log('\n' + '━'.repeat(80));
    console.log('3️⃣  NOM DE L\'EXPLOITANT');
    console.log('━'.repeat(80));
    
    console.log('\n📦 Via Chauffeur:');
    console.log(`  - Chauffeur ID: ${feuille.chauffeur_id}`);
    console.log(`  - Chauffeur existe: ${feuille.chauffeur ? '✅' : '❌'}`);
    
    if (feuille.chauffeur) {
      console.log(`  - Société ID (chauffeur): ${feuille.chauffeur.societe_id || '❌ NULL'}`);
      console.log(`  - Société chargée: ${feuille.chauffeur.societe_taxi ? '✅' : '❌'}`);
      
      if (feuille.chauffeur.societe_taxi) {
        console.log(`  - Nom exploitant: "${feuille.chauffeur.societe_taxi.nom_exploitant || '❌ VIDE'}"`);
      } else if (feuille.chauffeur.societe_id) {
        // Vérifier si la société existe mais n'a pas été chargée
        const societe = await prisma.societe_taxi.findUnique({
          where: { societe_id: feuille.chauffeur.societe_id }
        });
        console.log(`  - Société existe en DB: ${societe ? '✅' : '❌'}`);
        if (societe) {
          console.log(`  - Nom exploitant (DB): "${societe.nom_exploitant || '❌ VIDE'}"`);
        }
      }
    }
    
    console.log('\n📦 Via Véhicule:');
    console.log(`  - Véhicule ID: ${feuille.vehicule_id}`);
    console.log(`  - Véhicule existe: ${feuille.vehicule ? '✅' : '❌'}`);
    
    if (feuille.vehicule) {
      console.log(`  - Société ID (véhicule): ${feuille.vehicule.societe_id || '❌ NULL'}`);
      console.log(`  - Société chargée: ${feuille.vehicule.societe_taxi ? '✅' : '❌'}`);
      
      if (feuille.vehicule.societe_taxi) {
        console.log(`  - Nom exploitant: "${feuille.vehicule.societe_taxi.nom_exploitant || '❌ VIDE'}"`);
      } else if (feuille.vehicule.societe_id) {
        const societe = await prisma.societe_taxi.findUnique({
          where: { societe_id: feuille.vehicule.societe_id }
        });
        console.log(`  - Société existe en DB: ${societe ? '✅' : '❌'}`);
        if (societe) {
          console.log(`  - Nom exploitant (DB): "${societe.nom_exploitant || '❌ VIDE'}"`);
        }
      }
    }
    
    // 4. Vérifier les heures
    console.log('\n' + '━'.repeat(80));
    console.log('4️⃣  HEURES DES PRESTATIONS');
    console.log('━'.repeat(80));
    console.log(`Heure début: ${feuille.heure_debut || '❌ VIDE'}`);
    console.log(`Heure fin: ${feuille.heure_fin || '❌ VIDE'}`);
    
    if (feuille.heure_debut && feuille.heure_fin) {
      try {
        // Les heures peuvent être des objets Date ou des strings
        const formatHeure = (h) => {
          if (h instanceof Date) {
            return `${h.getHours().toString().padStart(2, '0')}:${h.getMinutes().toString().padStart(2, '0')}`;
          }
          return h.toString();
        };
        
        const debutStr = formatHeure(feuille.heure_debut);
        const finStr = formatHeure(feuille.heure_fin);
        
        const debut = debutStr.split(':').map(Number);
        const fin = finStr.split(':').map(Number);
        const debutMinutes = debut[0] * 60 + debut[1];
        const finMinutes = fin[0] * 60 + fin[1];
        const totalMinutes = finMinutes - debutMinutes;
        const heures = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        console.log(`Total calculé: ${heures}h${minutes.toString().padStart(2, '0')}`);
      } catch (err) {
        console.log(`⚠️  Impossible de calculer le total: ${err.message}`);
      }
    } else {
      console.log('❌ Impossible de calculer le total (données manquantes)');
    }
    
    // 5. Vérifier Index km (Tableau de bord)
    console.log('\n' + '━'.repeat(80));
    console.log('5️⃣  INDEX KM - TABLEAU DE BORD');
    console.log('━'.repeat(80));
    console.log(`Début: ${feuille.index_km_debut_tdb || '❌ VIDE'}`);
    console.log(`Fin: ${feuille.index_km_fin_tdb || '❌ VIDE'}`);
    
    if (feuille.index_km_debut_tdb && feuille.index_km_fin_tdb) {
      const total = feuille.index_km_fin_tdb - feuille.index_km_debut_tdb;
      console.log(`Total calculé: ${total} km`);
    } else {
      console.log('❌ Impossible de calculer le total (données manquantes)');
    }
    
    // 6. Vérifier les données du taximètre
    console.log('\n' + '━'.repeat(80));
    console.log('6️⃣  DONNÉES TAXIMÈTRE');
    console.log('━'.repeat(80));
    
    if (!feuille.taximetre) {
      console.log('❌ AUCUNE DONNÉE TAXIMÈTRE DANS LA BASE!');
      console.log('\n💡 Solution SQL:');
      console.log(`INSERT INTO taximetre (feuille_id, pc_debut_tax, pc_fin_tax, index_km_debut_tax, index_km_fin_tax, km_charge_debut, km_charge_fin, chutes_debut_tax, chutes_fin_tax)`);
      console.log(`VALUES (${feuilleId}, 2.40, 2.40, 125000, 125180, 15642.5, 15722.8, 1254.60, 1389.20);`);
    } else {
      console.log('✅ Enregistrement taximètre trouvé\n');
      
      console.log('📊 Prise en charge:');
      console.log(`  - Début: ${feuille.taximetre.pc_debut_tax ?? '❌ NULL'}`);
      console.log(`  - Fin: ${feuille.taximetre.pc_fin_tax ?? '❌ NULL'}`);
      
      console.log('\n📊 Index Km (Km totaux):');
      console.log(`  - Début: ${feuille.taximetre.index_km_debut_tax ?? '❌ NULL'}`);
      console.log(`  - Fin: ${feuille.taximetre.index_km_fin_tax ?? '❌ NULL'}`);
      if (feuille.taximetre.index_km_debut_tax && feuille.taximetre.index_km_fin_tax) {
        console.log(`  - Total: ${feuille.taximetre.index_km_fin_tax - feuille.taximetre.index_km_debut_tax} km`);
      }
      
      console.log('\n📊 Km en charge:');
      console.log(`  - Début: ${feuille.taximetre.km_charge_debut ?? '❌ NULL'}`);
      console.log(`  - Fin: ${feuille.taximetre.km_charge_fin ?? '❌ NULL'}`);
      if (feuille.taximetre.km_charge_debut && feuille.taximetre.km_charge_fin) {
        console.log(`  - Total: ${(feuille.taximetre.km_charge_fin - feuille.taximetre.km_charge_debut).toFixed(1)} km`);
      }
      
      console.log('\n📊 Chutes (€):');
      console.log(`  - Début: ${feuille.taximetre.chutes_debut_tax ?? '❌ NULL'}`);
      console.log(`  - Fin: ${feuille.taximetre.chutes_fin_tax ?? '❌ NULL'}`);
      if (feuille.taximetre.chutes_debut_tax && feuille.taximetre.chutes_fin_tax) {
        console.log(`  - Total: ${(feuille.taximetre.chutes_fin_tax - feuille.taximetre.chutes_debut_tax).toFixed(2)} €`);
      }
    }
    
    // 7. Vérifier les courses
    console.log('\n' + '━'.repeat(80));
    console.log('7️⃣  COURSES');
    console.log('━'.repeat(80));
    console.log(`Nombre de courses: ${feuille.course?.length || 0}`); // ✅ SINGULIER
    if (feuille.course && feuille.course.length > 0) {
      const totalRecettes = feuille.course.reduce((sum, c) => sum + (Number(c.sommes_percues) || 0), 0);
      console.log(`Total recettes: ${totalRecettes.toFixed(2)} €`);
    }
    
    // 8. Vérifier les charges
    console.log('\n' + '━'.repeat(80));
    console.log('8️⃣  CHARGES (DÉPENSES)');
    console.log('━'.repeat(80));
    console.log(`Nombre de charges: ${feuille.charge?.length || 0}`); // ✅ SINGULIER
    if (feuille.charge && feuille.charge.length > 0) {
      const totalCharges = feuille.charge.reduce((sum, c) => sum + (Number(c.montant) || 0), 0);
      console.log(`Total charges: ${totalCharges.toFixed(2)} €`);
    }
    
    // 9. Résumé des problèmes
    console.log('\n' + '━'.repeat(80));
    console.log('9️⃣  RÉSUMÉ DES PROBLÈMES DÉTECTÉS');
    console.log('━'.repeat(80));
    
    const problemes = [];
    
    if (!feuille.chauffeur?.societe_taxi?.nom_exploitant && !feuille.vehicule?.societe_taxi?.nom_exploitant) {
      problemes.push('❌ Nom exploitant manquant (chauffeur ET véhicule)');
    }
    
    if (!feuille.heure_debut || !feuille.heure_fin) {
      problemes.push('❌ Heures de prestation manquantes');
    }
    
    if (!feuille.index_km_debut_tdb || !feuille.index_km_fin_tdb) {
      problemes.push('❌ Index km tableau de bord manquants');
    }
    
    if (!feuille.taximetre) {
      problemes.push('❌ Données taximètre complètement absentes');
    } else {
      if (feuille.taximetre.pc_debut_tax === null || feuille.taximetre.pc_fin_tax === null) {
        problemes.push('⚠️  Prise en charge taximètre incomplète');
      }
      if (feuille.taximetre.index_km_debut_tax === null || feuille.taximetre.index_km_fin_tax === null) {
        problemes.push('⚠️  Index km taximètre incomplet');
      }
      if (feuille.taximetre.km_charge_debut === null || feuille.taximetre.km_charge_fin === null) {
        problemes.push('⚠️  Km en charge incomplet');
      }
      if (feuille.taximetre.chutes_debut_tax === null || feuille.taximetre.chutes_fin_tax === null) {
        problemes.push('⚠️  Chutes incomplètes');
      }
    }
    
    if (problemes.length === 0) {
      console.log('✅ Aucun problème détecté ! Toutes les données sont présentes.');
    } else {
      console.log(`\n${problemes.length} problème(s) détecté(s):\n`);
      problemes.forEach(p => console.log(`  ${p}`));
      
      console.log('\n💡 SOLUTIONS:');
      console.log('\nConsultez le fichier README-DEBUG-PDF.md pour les requêtes SQL de correction.');
    }
    
    console.log('\n' + '━'.repeat(80));
    
  } catch (error) {
    console.error('\n❌ Erreur lors du diagnostic:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnosticComplet();

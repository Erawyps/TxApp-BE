import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixDuboisData() {
  try {
    console.log('🔧 Correction des données de François-José Dubois...');

    // 1. Récupérer l'ID de la règle de salaire "Commission avec Pourboires"
    const salaireRule = await prisma.regle_salaire.findFirst({
      where: {
        nom: 'Commission avec Pourboires'
      }
    });

    if (!salaireRule) {
      console.error('❌ Règle de salaire "Commission avec Pourboires" non trouvée');
      return;
    }

    console.log(`✅ Règle de salaire trouvée: ${salaireRule.nom} (ID: ${salaireRule.id})`);

    // 2. Mettre à jour le chauffeur François-José Dubois avec la règle de salaire
    const chauffeur = await prisma.chauffeur.update({
      where: {
        id: 15
      },
      data: {
        regle_salaire_id: salaireRule.id
      }
    });

    console.log(`✅ Chauffeur mis à jour: ${chauffeur.prenom} ${chauffeur.nom}`);

    // 3. Récupérer l'ID du véhicule "1-ABC-123 Mercedes-Benz E-Class"
    const vehicule = await prisma.vehicule.findFirst({
      where: {
        immatriculation: '1-ABC-123'
      }
    });

    if (!vehicule) {
      console.error('❌ Véhicule "1-ABC-123" non trouvé');
      return;
    }

    console.log(`✅ Véhicule trouvé: ${vehicule.immatriculation} ${vehicule.marque} ${vehicule.modele}`);

    // 4. Créer la relation chauffeur-véhicule
    const existingRelation = await prisma.chauffeur_vehicule.findFirst({
      where: {
        chauffeur_id: 15,
        vehicule_id: vehicule.id
      }
    });

    if (existingRelation) {
      console.log('ℹ️ La relation chauffeur-véhicule existe déjà');
    } else {
      const relation = await prisma.chauffeur_vehicule.create({
        data: {
          chauffeur_id: 15,
          vehicule_id: vehicule.id,
          date_assignation: new Date()
        }
      });
      console.log(`✅ Relation chauffeur-véhicule créée: ${relation.id}`);
    }

    // 5. Vérifier les données finales
    const finalChauffeur = await prisma.chauffeur.findUnique({
      where: { id: 15 },
      include: {
        regle_salaire: true,
        chauffeur_vehicule: {
          include: {
            vehicule: true
          }
        }
      }
    });

    console.log('\n📊 Données finales de François-José Dubois:');
    console.log(`- Nom: ${finalChauffeur.prenom} ${finalChauffeur.nom}`);
    console.log(`- Règle de salaire: ${finalChauffeur.regle_salaire?.nom || 'Non assignée'}`);
    console.log(`- Véhicules assignés: ${finalChauffeur.chauffeur_vehicule.length}`);
    finalChauffeur.chauffeur_vehicule.forEach(cv => {
      console.log(`  - ${cv.vehicule.immatriculation} ${cv.vehicule.marque} ${cv.vehicule.modele}`);
    });

    console.log('\n🎉 Correction terminée avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDuboisData();
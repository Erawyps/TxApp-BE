import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixChauffeurData() {
  try {
    console.log('🔧 Correction des données chauffeur...');

    // 1. Assigner une règle de salaire à François-José Dubois
    const regleSalaire = await prisma.regle_salaire.findFirst({
      where: {
        nom: 'Commission avec Pourboires',
        actif: true
      }
    });

    if (regleSalaire) {
      await prisma.chauffeur.update({
        where: { id: 15 },
        data: {
          regle_salaire_id: regleSalaire.id
        }
      });
      console.log('✅ Règle de salaire assignée à François-José Dubois');
    }

    // 2. Créer la relation many-to-many chauffeur-véhicule pour François-José
    try {
      await prisma.chauffeur_vehicule.create({
        data: {
          chauffeur_id: 15,
          vehicule_id: 51, // 1-ABC-123
          date_assignation: new Date('2023-01-15'),
          actif: true
        }
      });
      console.log('✅ Véhicule assigné à François-José Dubois');
    } catch (error) {
      console.log('ℹ️ Relation déjà existante ou erreur:', error.message);
    }

    console.log('🎉 Correction terminée avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors de la correction des données:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixChauffeurData();
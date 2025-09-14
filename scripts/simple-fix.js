import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function fixData() {
  try {
    console.log('🔧 Correction des données...');

    // 1. Vérifier et corriger la règle de salaire de François-José Dubois
    const dubois = await prisma.chauffeur.findUnique({
      where: { id: 15 },
      include: { regle_salaire: true, utilisateur: true }
    });

    console.log('François-José Dubois actuel:', {
      id: dubois?.id,
      nom: dubois?.utilisateur?.nom,
      prenom: dubois?.utilisateur?.prenom,
      regle_salaire_id: dubois?.regle_salaire_id,
      regle_salaire_nom: dubois?.regle_salaire?.nom
    });

    // Assigner la règle de salaire si elle n'existe pas
    if (!dubois?.regle_salaire_id) {
      const regleSalaire = await prisma.regle_salaire.findFirst({
        where: { nom: 'Commission avec Pourboires', actif: true }
      });

      if (regleSalaire) {
        await prisma.chauffeur.update({
          where: { id: 15 },
          data: { regle_salaire_id: regleSalaire.id }
        });
        console.log('✅ Règle de salaire assignée à François-José Dubois');
      }
    }

    // 2. Créer la relation véhicule directement dans la table chauffeur_vehicule
    try {
      const vehicule = await prisma.vehicule.findFirst({
        where: { plaque_immatriculation: '1-ABC-123' }
      });

      if (vehicule) {
        await prisma.chauffeur_vehicule.upsert({
          where: {
            chauffeur_id_vehicule_id: {
              chauffeur_id: 15,
              vehicule_id: vehicule.id
            }
          },
          update: { actif: true },
          create: {
            chauffeur_id: 15,
            vehicule_id: vehicule.id,
            date_assignation: new Date('2023-01-15'),
            actif: true
          }
        });
        console.log('✅ Véhicule assigné à François-José Dubois');
      }
    } catch (error) {
      console.log('ℹ️ Erreur relation véhicule:', error.message);
    }

    // 3. Vérifier le résultat final
    const duboisFinal = await prisma.chauffeur.findUnique({
      where: { id: 15 },
      include: { regle_salaire: true, utilisateur: true }
    });

    console.log('François-José Dubois final:', {
      id: duboisFinal?.id,
      regle_salaire: duboisFinal?.regle_salaire?.nom,
      taux: duboisFinal?.regle_salaire?.taux_variable
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixData();
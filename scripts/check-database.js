import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Vérification de la base de données...');

    // Vérifier François-José Dubois
    const dubois = await prisma.chauffeur.findUnique({
      where: { id: 15 },
      include: {
        regle_salaire: true,
        utilisateur: true,
        vehicules: {
          include: {
            vehicule: true
          }
        }
      }
    });

    console.log('François-José Dubois:', {
      id: dubois?.id,
      nom: dubois?.utilisateur?.nom,
      prenom: dubois?.utilisateur?.prenom,
      regle_salaire: dubois?.regle_salaire?.nom,
      nb_vehicules_assignes: dubois?.vehicules?.length || 0,
      vehicules: dubois?.vehicules?.map(v => v.vehicule?.plaque_immatriculation) || []
    });

    // Lister les règles de salaire disponibles
    const reglesSalaire = await prisma.regle_salaire.findMany({
      where: { actif: true }
    });

    console.log('Règles de salaire disponibles:', reglesSalaire.map(r => `${r.id}: ${r.nom} (${r.taux_variable}%)`));

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixAssignmentDate() {
  try {
    console.log('🔧 Correction de la date d\'assignation...');

    // Trouver François-José Dubois
    const dubois = await prisma.utilisateur.findFirst({
      where: {
        nom: 'Dubois',
        prenom: 'François-José'
      },
      include: {
        chauffeur: true
      }
    });

    if (!dubois?.chauffeur) {
      console.log('❌ Chauffeur non trouvé');
      return;
    }

    // Trouver le véhicule
    const vehicle = await prisma.vehicule.findFirst({
      where: {
        plaque_immatriculation: '1-ABC-123'
      }
    });

    if (!vehicle) {
      console.log('❌ Véhicule non trouvé');
      return;
    }

    // Mettre à jour la date d'assignation pour refléter la première utilisation
    await prisma.$executeRaw`
      UPDATE chauffeur_vehicule
      SET date_assignation = '2025-09-05'::date
      WHERE chauffeur_id = ${dubois.chauffeur.id} AND vehicule_id = ${vehicle.id}
    `;

    console.log('✅ Date d\'assignation corrigée: 2025-09-05');

    // Vérifier le résultat
    const updated = await prisma.$queryRaw`
      SELECT date_assignation FROM chauffeur_vehicule
      WHERE chauffeur_id = ${dubois.chauffeur.id} AND vehicule_id = ${vehicle.id}
    `;

    console.log(`📅 Nouvelle date d'assignation: ${updated[0].date_assignation.toISOString().split('T')[0]}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAssignmentDate();
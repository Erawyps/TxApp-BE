// Script pour vérifier les types d'utilisateur autorisés
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkConstraints() {
  try {
    // Interroger directement la base pour voir les contraintes
    const result = await prisma.$queryRaw`
      SELECT consrc 
      FROM pg_constraint 
      WHERE conname = 'utilisateur_type_utilisateur_check'
    `;

    console.log('Contrainte sur type_utilisateur:', result);

    // Essayer de voir les types existants
    const existingUsers = await prisma.utilisateur.findMany({
      select: {
        type_utilisateur: true
      },
      distinct: ['type_utilisateur']
    });

    console.log('Types d\'utilisateur existants:', existingUsers);

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkConstraints();

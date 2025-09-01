// Script pour vérifier les types d'utilisateur autorisés
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkConstraints() {
  try {
    console.log('🔍 Vérification des contraintes de base de données...');

    // Essayer de voir les types existants dans la base
    const existingUsers = await prisma.utilisateur.findMany({
      select: {
        type_utilisateur: true
      },
      distinct: ['type_utilisateur']
    });

    console.log('Types d\'utilisateur existants:', existingUsers);

    // Essayer avec différents types pour voir lesquels sont acceptés
    const typesToTest = ['chauffeur', 'gestionnaire', 'admin', 'superviseur', 'dispatcher'];

    console.log('\n🧪 Test des types autorisés...');
    for (const typeUser of typesToTest) {
      try {
        // Test de validation uniquement (on n'insère pas vraiment)
        await prisma.utilisateur.findFirst({
          where: {
            type_utilisateur: typeUser
          }
        });
        console.log(`✅ "${typeUser}" - Type potentiellement valide`);
      } catch (error) {
        console.log(`❌ "${typeUser}" - Erreur:`, error.message);
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkConstraints();

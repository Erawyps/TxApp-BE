import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRelation() {
  try {
    const chauffeurs = await prisma.chauffeur.findMany({
      include: {
        utilisateur: {
          select: { user_id: true, email: true, nom: true, prenom: true }
        }
      }
    });

    console.log('Relations chauffeur-utilisateur:');
    chauffeurs.forEach(c => {
      console.log(`Chauffeur ID: ${c.chauffeur_id}`);
      console.log(`  Utilisateur ID: ${c.utilisateur?.user_id}`);
      console.log(`  Email: ${c.utilisateur?.email}`);
      console.log(`  Nom: ${c.utilisateur?.nom} ${c.utilisateur?.prenom}`);
      console.log('');
    });

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRelation();
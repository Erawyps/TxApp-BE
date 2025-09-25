import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Vérification des utilisateurs...\n');

    const users = await prisma.utilisateur.findMany({
      select: {
        user_id: true,
        email: true,
        role: true,
        nom: true,
        prenom: true,
        mot_de_passe_hashe: true,
        chauffeur: {
          select: {
            chauffeur_id: true,
            statut: true
          }
        }
      }
    });

    console.log(`📋 Utilisateurs trouvés: ${users.length}\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   ID: ${user.user_id}`);
      console.log(`   Nom: ${user.nom} ${user.prenom}`);
      console.log(`   Rôle: ${user.role}`);
      console.log(`   Mot de passe hashé: ${user.mot_de_passe_hashe ? 'Oui' : 'Non'}`);
      console.log(`   Chauffeur associé: ${user.chauffeur ? `ID ${user.chauffeur.chauffeur_id} (${user.chauffeur.statut})` : 'Non'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
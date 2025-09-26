const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  try {
    console.log('🔍 Vérification de l\'utilisateur Ismail DRISSI...');

    // Chercher l'utilisateur par email
    const user = await prisma.utilisateur.findUnique({
      where: { email: 'ismail.drissi@txapp.be' },
      include: {
        chauffeur: true
      }
    });

    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }

    console.log('👤 Utilisateur trouvé:');
    console.log(`  ID: ${user.user_id}`);
    console.log(`  Nom: ${user.nom} ${user.prenom}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Rôle: ${user.role}`);
    console.log(`  A un profil chauffeur: ${user.chauffeur ? '✅ Oui' : '❌ Non'}`);

    if (user.chauffeur) {
      console.log('🚗 Détails chauffeur:');
      console.log(`    Chauffeur ID: ${user.chauffeur.chauffeur_id}`);
      console.log(`    Statut: ${user.chauffeur.statut}`);
      console.log(`    Société ID: ${user.chauffeur.societe_id}`);
    } else {
      console.log('⚠️  L\'utilisateur n\'a pas de profil chauffeur. Création nécessaire...');

      // Créer un profil chauffeur pour cet utilisateur
      const newChauffeur = await prisma.chauffeur.create({
        data: {
          chauffeur_id: user.user_id,
          societe_id: user.societe_id,
          statut: 'Actif'
        }
      });

      console.log('✅ Profil chauffeur créé:');
      console.log(`    Chauffeur ID: ${newChauffeur.chauffeur_id}`);
      console.log(`    Statut: ${newChauffeur.statut}`);
    }

    // Vérifier tous les chauffeurs
    const allChauffeurs = await prisma.chauffeur.findMany({
      include: {
        utilisateur: {
          select: { nom: true, prenom: true, email: true, role: true }
        }
      }
    });

    console.log(`\n📋 Total chauffeurs dans la DB: ${allChauffeurs.length}`);
    allChauffeurs.forEach((c, i) => {
      console.log(`${i+1}. ${c.utilisateur.prenom} ${c.utilisateur.nom} (${c.utilisateur.email}) - Rôle: ${c.utilisateur.role}`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
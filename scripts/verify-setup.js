import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function verifySetup() {
  console.log('🔍 Vérification complète du système...\n');

  try {
    // 1. Test de connexion
    await prisma.$connect();
    console.log('✅ Connexion à la base de données: OK');

    // 2. Compter tous les éléments
    const counts = {
      utilisateurs: await prisma.utilisateur.count(),
      chauffeurs: await prisma.chauffeur.count(),
      vehicules: await prisma.vehicule.count(),
      clients: await prisma.client.count(),
      modesPaiement: await prisma.mode_paiement.count(),
      reglesalaire: await prisma.regle_salaire.count(),
      parametres: await prisma.parametres_systeme.count()
    };

    console.log('\n📊 État de la base de données:');
    console.log(`   👤 Utilisateurs: ${counts.utilisateurs}`);
    console.log(`   🚗 Chauffeurs: ${counts.chauffeurs}`);
    console.log(`   🚙 Véhicules: ${counts.vehicules}`);
    console.log(`   🏢 Clients: ${counts.clients}`);
    console.log(`   💳 Modes de paiement: ${counts.modesPaiement}`);
    console.log(`   💰 Règles de salaire: ${counts.reglesalaire}`);
    console.log(`   ⚙️  Paramètres: ${counts.parametres}`);

    // 3. Tester les utilisateurs d'authentification
    console.log('\n🔐 Test des comptes utilisateurs:');

    const testUsers = [
      { email: 'admin@taxi.be', password: 'admin123', role: 'ADMIN' },
      { email: 'pierre.martin@taxi.be', password: 'chauffeur123', role: 'CHAUFFEUR' },
      { email: 'marie.dupuis@taxi.be', password: 'chauffeur123', role: 'CHAUFFEUR' },
      { email: 'dispatcher@taxi.be', password: 'dispatcher123', role: 'DISPATCHER' }
    ];

    for (const testUser of testUsers) {
      const user = await prisma.utilisateur.findUnique({
        where: { email: testUser.email }
      });

      if (user) {
        const passwordValid = await bcrypt.compare(testUser.password, user.mot_de_passe);
        const status = passwordValid ? '✅' : '❌';
        console.log(`   ${status} ${testUser.email} (${testUser.role})`);
      } else {
        console.log(`   ❌ ${testUser.email} - Utilisateur non trouvé`);
      }
    }

    // 4. Vérifier les chauffeurs avec leurs utilisateurs
    const chauffeurs = await prisma.chauffeur.findMany({
      include: {
        utilisateur: {
          select: { nom: true, prenom: true, email: true }
        }
      }
    });

    console.log('\n👨‍💼 Chauffeurs configurés:');
    chauffeurs.forEach(chauffeur => {
      console.log(`   🎫 Badge ${chauffeur.numero_badge}: ${chauffeur.utilisateur?.prenom} ${chauffeur.utilisateur?.nom}`);
    });

    // 5. Vérifier les véhicules
    const vehicules = await prisma.vehicule.findMany();
    console.log('\n🚗 Véhicules disponibles:');
    vehicules.forEach(vehicule => {
      console.log(`   🚙 ${vehicule.plaque_immatriculation}: ${vehicule.marque} ${vehicule.modele} (${vehicule.etat})`);
    });

    // 6. Résumé final
    console.log('\n🎯 Résumé de configuration:');
    const isReady = counts.utilisateurs > 0 && counts.chauffeurs > 0 && counts.vehicules > 0;
    console.log(`   Système prêt pour utilisation: ${isReady ? '✅ OUI' : '❌ NON'}`);

    if (isReady) {
      console.log('\n🚀 Le système est prêt! Vous pouvez maintenant:');
      console.log('   • Vous connecter avec admin@taxi.be / admin123');
      console.log('   • Tester l\'interface d\'authentification');
      console.log('   • Créer des feuilles de route et des courses');
      console.log('   • Gérer les chauffeurs et véhicules');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifySetup();

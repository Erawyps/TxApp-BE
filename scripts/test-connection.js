import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testConnection() {
  console.log('Test de connexion à la base de données...');

  try {
    // Test de base - compter les utilisateurs
    const userCount = await prisma.utilisateur.count();
    console.log(`✅ Connexion réussie! Nombre d'utilisateurs: ${userCount}`);

    // Vérifier les modes de paiement
    const paymentMethods = await prisma.mode_paiement.findMany();
    console.log(`📦 Modes de paiement trouvés: ${paymentMethods.length}`);

    if (paymentMethods.length > 0) {
      console.log('Types de paiement disponibles:', paymentMethods.map(p => p.type_paiement));
    }

    // Vérifier l'utilisateur admin
    const adminUser = await prisma.utilisateur.findUnique({
      where: { email: 'admin@taxi.be' }
    });

    if (adminUser) {
      console.log('✅ Utilisateur admin trouvé:', adminUser.email);

      // Tester la connexion avec le mot de passe
      const isValidPassword = await bcrypt.compare('admin123', adminUser.mot_de_passe);
      console.log('🔐 Test mot de passe admin:', isValidPassword ? '✅ Correct' : '❌ Incorrect');
    } else {
      console.log('⚠️  Utilisateur admin non trouvé - création nécessaire');

      // Créer l'utilisateur admin
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const newAdmin = await prisma.utilisateur.create({
        data: {
          type_utilisateur: 'ADMIN',
          nom: 'Administrateur',
          prenom: 'Test',
          telephone: '+32123456789',
          email: 'admin@taxi.be',
          mot_de_passe: hashedPassword,
          adresse: 'Rue de Test 123',
          ville: 'Bruxelles',
          code_postal: '1000',
          pays: 'Belgique',
          actif: true
        }
      });
      console.log('✅ Utilisateur admin créé:', newAdmin.email);
    }

    // Afficher un résumé des données
    const counts = await Promise.all([
      prisma.utilisateur.count(),
      prisma.chauffeur.count(),
      prisma.vehicule.count(),
      prisma.client.count(),
      prisma.mode_paiement.count()
    ]);

    console.log('\n📊 Résumé de la base de données:');
    console.log(`   Utilisateurs: ${counts[0]}`);
    console.log(`   Chauffeurs: ${counts[1]}`);
    console.log(`   Véhicules: ${counts[2]}`);
    console.log(`   Clients: ${counts[3]}`);
    console.log(`   Modes de paiement: ${counts[4]}`);

  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    if (error.code) {
      console.error('Code erreur:', error.code);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

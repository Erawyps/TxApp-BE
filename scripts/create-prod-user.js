import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Utiliser la configuration PostgreSQL de production
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.jfrhzwtkfotsrjkacrns:rKcnNJbacyLF3TQd@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
    }
  }
});

async function createProdUsers() {
  try {
    console.log('🚀 Création d\'utilisateurs en production PostgreSQL...');

    // Vérifier si l'utilisateur admin existe déjà
    const existingAdmin = await prisma.utilisateur.findUnique({
      where: { email: 'admin@txapp.com' }
    });

    if (existingAdmin) {
      console.log('✅ L\'utilisateur admin existe déjà:', existingAdmin.email);
    } else {
      // Hasher le mot de passe admin
      const hashedPasswordAdmin = await bcrypt.hash('TxApp@Admin2024!', 12);

      // Créer l'utilisateur admin
      const admin = await prisma.utilisateur.create({
        data: {
          email: 'admin@txapp.com',
          mot_de_passe: hashedPasswordAdmin,
          nom: 'Admin',
          prenom: 'TxApp',
          telephone: '+32123456789',
          type_utilisateur: 'admin',
          adresse: '123 Rue de l\'Admin',
          ville: 'Bruxelles',
          code_postal: '1000',
          pays: 'Belgique',
          actif: true,
          date_creation: new Date()
        }
      });

      console.log('✅ Utilisateur admin créé:', admin.email);
    }

    // Vérifier si l'utilisateur manager existe déjà
    const existingManager = await prisma.utilisateur.findUnique({
      where: { email: 'manager@txapp.com' }
    });

    if (existingManager) {
      console.log('✅ L\'utilisateur manager existe déjà:', existingManager.email);
    } else {
      // Créer un utilisateur manager
      const managerPassword = await bcrypt.hash('TxApp@Manager2024!', 12);
      const managerUser = await prisma.utilisateur.create({
        data: {
          email: 'manager@txapp.com',
          mot_de_passe: managerPassword,
          nom: 'Martin',
          prenom: 'Sophie',
          telephone: '+32111222333',
          type_utilisateur: 'manager',
          adresse: '789 Boulevard du Manager',
          ville: 'Antwerp',
          code_postal: '2000',
          pays: 'Belgique',
          actif: true,
          date_creation: new Date()
        }
      });

      console.log('✅ Utilisateur manager créé:', managerUser.email);
    }

    // Vérifier si l'utilisateur chauffeur existe déjà
    const existingChauffeur = await prisma.utilisateur.findUnique({
      where: { email: 'chauffeur@txapp.com' }
    });

    if (existingChauffeur) {
      console.log('✅ L\'utilisateur chauffeur existe déjà:', existingChauffeur.email);
    } else {
      // Créer un utilisateur chauffeur
      const chauffeurPassword = await bcrypt.hash('TxApp@Chauffeur2024!', 12);
      const chauffeurUser = await prisma.utilisateur.create({
        data: {
          email: 'chauffeur@txapp.com',
          mot_de_passe: chauffeurPassword,
          nom: 'Dupont',
          prenom: 'Jean',
          telephone: '+32987654321',
          type_utilisateur: 'chauffeur',
          adresse: '456 Avenue du Chauffeur',
          ville: 'Liège',
          code_postal: '4000',
          pays: 'Belgique',
          actif: true,
          date_creation: new Date()
        }
      });

      console.log('✅ Utilisateur chauffeur créé:', chauffeurUser.email);

      // Créer le profil chauffeur associé
      const chauffeur = await prisma.chauffeur.create({
        data: {
          utilisateur_id: chauffeurUser.id,
          numero_badge: 'CH001',
          date_embauche: new Date('2024-01-01'),
          type_contrat: 'CDI',
          taux_commission: 15.0,
          salaire_base: 2500.0,
          actif: true,
          created_at: new Date()
        }
      });

      console.log('✅ Profil chauffeur créé:', chauffeur.numero_badge);
    }

    console.log('\n🎉 Utilisateurs de production créés avec succès!');
    console.log('\n📋 Informations de connexion PRODUCTION:');
    console.log('Admin: admin@txapp.com / TxApp@Admin2024!');
    console.log('Manager: manager@txapp.com / TxApp@Manager2024!');
    console.log('Chauffeur: chauffeur@txapp.com / TxApp@Chauffeur2024!');

  } catch (error) {
    console.error('❌ Erreur lors de la création des utilisateurs en production:', error);
    console.error('Détails:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
createProdUsers();

export default createProdUsers;

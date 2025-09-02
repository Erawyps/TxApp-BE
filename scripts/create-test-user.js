import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('🚀 Création d\'utilisateurs de test...');

    // Vérifier si l'utilisateur admin existe déjà
    const existingAdmin = await prisma.utilisateur.findUnique({
      where: { email: 'admin@txapp.com' }
    });

    if (existingAdmin) {
      console.log('✅ L\'utilisateur admin existe déjà:', existingAdmin.email);
    } else {
      // Hasher le mot de passe admin
      const hashedPasswordAdmin = await bcrypt.hash('password123', 12);

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

    // Vérifier si l'utilisateur chauffeur existe déjà
    const existingChauffeur = await prisma.utilisateur.findUnique({
      where: { email: 'chauffeur@txapp.com' }
    });

    if (existingChauffeur) {
      console.log('✅ L\'utilisateur chauffeur existe déjà:', existingChauffeur.email);
    } else {
      // Créer un utilisateur chauffeur
      const chauffeurPassword = await bcrypt.hash('chauffeur123', 12);
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

    console.log('\n🎉 Utilisateurs de test créés avec succès!');
    console.log('\n📋 Informations de connexion:');
    console.log('Admin: admin@txapp.com / password123');
    console.log('Chauffeur: chauffeur@txapp.com / chauffeur123');

  } catch (error) {
    console.error('❌ Erreur lors de la création des utilisateurs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
createTestUser();

export default createTestUser;

// Script pour créer un utilisateur de test
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('👤 Création d\'un utilisateur de test...');

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Créer l'utilisateur admin
    const user = await prisma.utilisateur.create({
      data: {
        email: 'admin@taxi.be',
        mot_de_passe: hashedPassword,
        nom: 'Admin',
        prenom: 'Test',
        telephone: '+32470123456',
        type_utilisateur: 'admin',
        actif: true,
      },
    });

    console.log('✅ Utilisateur admin créé avec succès:', {
      id: user.id,
      email: user.email,
      nom: user.nom,
      type: user.type_utilisateur
    });

    // Créer aussi un chauffeur de test
    const chauffeurUser = await prisma.utilisateur.create({
      data: {
        email: 'chauffeur@taxi.be',
        mot_de_passe: hashedPassword,
        nom: 'Dupont',
        prenom: 'Jean',
        telephone: '+32470123457',
        type_utilisateur: 'chauffeur',
        actif: true,
      },
    });

    console.log('✅ Utilisateur chauffeur créé avec succès:', {
      id: chauffeurUser.id,
      email: chauffeurUser.email,
      nom: chauffeurUser.nom,
      type: chauffeurUser.type_utilisateur
    });

  } catch (error) {
    if (error.code === 'P2002') {
      console.log('ℹ️ Les utilisateurs existent déjà');
    } else {
      console.error('❌ Erreur lors de la création:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();

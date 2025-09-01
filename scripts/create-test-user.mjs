// Script pour créer un utilisateur de test
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('Création d\'un utilisateur de test...');

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Créer l'utilisateur avec un type valide (probablement "chauffeur" ou "gestionnaire")
    const user = await prisma.utilisateur.create({
      data: {
        email: 'admin@taxi.be',
        mot_de_passe: hashedPassword,
        nom: 'Admin',
        prenom: 'Test',
        telephone: '+32470123456',
        type_utilisateur: 'gestionnaire', // Essayer avec "gestionnaire" au lieu de "admin"
        actif: true,
      },
    });

    console.log('Utilisateur créé avec succès:', {
      id: user.id,
      email: user.email,
      nom: user.nom,
      type: user.type_utilisateur
    });

  } catch (error) {
    if (error.code === 'P2002') {
      console.log('L\'utilisateur existe déjà');
    } else {
      console.error('Erreur lors de la création:', error);
      console.log('Essayons avec type_utilisateur = "chauffeur"...');

      // Essayer avec "chauffeur" si "gestionnaire" ne fonctionne pas
      try {
        const hashedPassword = await bcrypt.hash('password123', 12);
        const user = await prisma.utilisateur.create({
          data: {
            email: 'chauffeur@taxi.be',
            mot_de_passe: hashedPassword,
            nom: 'Chauffeur',
            prenom: 'Test',
            telephone: '+32470123457',
            type_utilisateur: 'chauffeur',
            actif: true,
          },
        });

        console.log('Utilisateur chauffeur créé avec succès:', {
          id: user.id,
          email: user.email,
          nom: user.nom,
          type: user.type_utilisateur
        });
      } catch (secondError) {
        console.error('Erreur avec chauffeur aussi:', secondError);
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();

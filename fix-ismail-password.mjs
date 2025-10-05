import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fonction de hashage (même que dans worker.js)
const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'TxApp-Salt-2025'); // Ajouter un sel fixe
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

async function fixIsmailPassword() {
  try {
    console.log('🔧 Correction du mot de passe pour ismail.drissi@txapp.be...\n');

    const email = 'ismail.drissi@txapp.be';
    const correctPassword = 'ismail2024';

    // Générer le nouveau hash
    const newHash = await hashPassword(correctPassword);
    console.log(`🔐 Nouveau hash généré pour "${correctPassword}"`);

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.utilisateur.update({
      where: { email: email },
      data: { mot_de_passe_hashe: newHash },
      select: {
        user_id: true,
        email: true,
        nom: true,
        prenom: true
      }
    });

    console.log(`✅ Mot de passe mis à jour pour ${updatedUser.nom} ${updatedUser.prenom} (${updatedUser.email})`);
    console.log(`📋 Nouveau mot de passe: "${correctPassword}"`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixIsmailPassword();
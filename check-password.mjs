import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fonction de hashage identique à celle du worker
const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'TxApp-Salt-2025');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

async function checkPassword() {
  try {
    console.log('🔍 Vérification du mot de passe...\n');

    const user = await prisma.utilisateur.findFirst({
      where: { email: 'jean.dupont@txapp.be' },
      select: {
        user_id: true,
        email: true,
        mot_de_passe_hashe: true
      }
    });

    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }

    console.log('Utilisateur trouvé:', user.email);
    console.log('Hash en base:', user.mot_de_passe_hashe);

    // Tester le hash du mot de passe "admin123"
    const hashedInput = await hashPassword('admin123');
    console.log('Hash calculé pour "admin123":', hashedInput);

    console.log('Correspondance:', user.mot_de_passe_hashe === hashedInput ? '✅ OUI' : '❌ NON');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPassword();
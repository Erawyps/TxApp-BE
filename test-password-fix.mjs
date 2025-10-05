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

// Fonction de vérification (même que dans worker.js)
const verifyPassword = async (password, hashedPassword) => {
  // Essayer d'abord avec SHA-256 (nouveau système)
  const hashedInput = await hashPassword(password);
  if (hashedInput === hashedPassword) {
    console.log('✅ Password verified with SHA-256');
    return true;
  }

  // Si ça ne marche pas, vérifier si c'est un mot de passe en clair (migration)
  if (password === hashedPassword) {
    console.log('⚠️ Password verified as plain text (migration needed)');
    return true;
  }

  console.log('❌ Password verification failed');
  return false;
};

async function testPasswordsAndFix() {
  try {
    console.log('🔧 Test et correction des mots de passe...\n');

    // Tests avec différents utilisateurs et mots de passe possibles
    const testCases = [
      { email: 'ismail.drissi@txapp.be', passwords: ['test123', 'default123', '123456', 'password'] },
      { email: 'jean.dupont@txapp.be', passwords: ['default123', 'test123', '123456', 'password'] },
      { email: 'marie.martin@txapp.be', passwords: ['default123', 'test123', '123456', 'password'] }
    ];

    for (const testCase of testCases) {
      console.log(`\n🔍 Test de ${testCase.email}:`);
      
      const user = await prisma.utilisateur.findUnique({
        where: { email: testCase.email },
        select: { 
          user_id: true, 
          email: true, 
          mot_de_passe_hashe: true,
          nom: true,
          prenom: true 
        }
      });

      if (!user) {
        console.log(`❌ Utilisateur ${testCase.email} non trouvé`);
        continue;
      }

      console.log(`📋 Hash actuel: ${user.mot_de_passe_hashe.substring(0, 20)}...`);

      let passwordFound = false;

      for (const password of testCase.passwords) {
        console.log(`  Teste: "${password}"`);
        const isValid = await verifyPassword(password, user.mot_de_passe_hashe);
        
        if (isValid) {
          console.log(`  ✅ Mot de passe trouvé: "${password}"`);
          passwordFound = true;
          break;
        }
      }

      if (!passwordFound) {
        console.log(`  ❌ Aucun mot de passe ne fonctionne`);
        // Corriger avec un mot de passe par défaut
        const defaultPassword = 'default123';
        const newHash = await hashPassword(defaultPassword);
        
        await prisma.utilisateur.update({
          where: { user_id: user.user_id },
          data: { mot_de_passe_hashe: newHash }
        });
        
        console.log(`  🔧 Mot de passe réinitialisé à "${defaultPassword}"`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPasswordsAndFix();
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function testUserAuth() {
  try {
    console.log('🔍 Test de connexion à la base de données...');
    
    // Recherche de l'utilisateur par email
    const user = await prisma.utilisateur.findUnique({
      where: { email: 'ismail.drissi@txapp.be' },
      include: {
        chauffeur: {
          include: {
            societe_taxi: true
          }
        }
      }
    });

    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }

    console.log('✅ Utilisateur trouvé:', {
      id: user.user_id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      type: user.type_utilisateur,
      chauffeur_id: user.chauffeur_id,
      // Ne pas afficher le mot de passe hashé
      hasPassword: !!user.mot_de_passe_hashe
    });

    const password = 'ismail2024';

    // Test du mot de passe avec bcrypt
    const isValidBcrypt = await bcrypt.compare(password, user.mot_de_passe_hashe);
    console.log('🔐 Test mot de passe bcrypt:', isValidBcrypt ? '✅ Correct' : '❌ Incorrect');

    // Test du mot de passe avec SHA-256 simple
    const sha256Hash = crypto.createHash('sha256').update(password).digest('hex');
    const isValidSha256 = (sha256Hash === user.mot_de_passe_hashe);
    console.log('🔐 Test mot de passe SHA-256 simple:', isValidSha256 ? '✅ Correct' : '❌ Incorrect');
    
    // Test du mot de passe avec SHA-256 + salt TxApp (comme dans worker.js)
    const saltedPassword = password + 'TxApp-Salt-2025';
    const sha256SaltedHash = crypto.createHash('sha256').update(saltedPassword).digest('hex');
    const isValidSha256Salted = (sha256SaltedHash === user.mot_de_passe_hashe);
    console.log('🔐 Test mot de passe SHA-256 + salt:', isValidSha256Salted ? '✅ Correct' : '❌ Incorrect');
    
    console.log('🔧 Hash actuel dans la base:', user.mot_de_passe_hashe);
    console.log('🔧 Hash SHA-256 simple:', sha256Hash);
    console.log('🔧 Hash SHA-256 + salt:', sha256SaltedHash);

    if (!isValidBcrypt && !isValidSha256) {
      // Générer un nouveau hash bcrypt pour comparaison
      const newHash = await bcrypt.hash(password, 10);
      console.log('🔧 Hash bcrypt qui devrait être:', newHash);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserAuth();
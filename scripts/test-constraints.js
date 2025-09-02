import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAndFixConstraints() {
  console.log('Test de connexion et diagnostic des contraintes...');

  try {
    // Test de connexion
    await prisma.$connect();
    console.log('✅ Connexion à la base de données réussie');

    // Test simple: essayer d'insérer un mode de paiement avec différentes valeurs
    const testValues = ['CASH', 'cash', 'Cash', 'ESPECES', 'especes'];

    for (const value of testValues) {
      try {
        console.log(`Test avec type_paiement: "${value}"`);

        // Supprimer les données existantes pour éviter les conflits
        await prisma.mode_paiement.deleteMany({
          where: { code: 'TEST' }
        });

        await prisma.mode_paiement.create({
          data: {
            code: 'TEST',
            libelle: 'Test',
            type_paiement: value
          }
        });

        console.log(`✅ Valeur "${value}" acceptée!`);

        // Nettoyer après le test
        await prisma.mode_paiement.deleteMany({
          where: { code: 'TEST' }
        });

        break; // Sortir de la boucle si on trouve une valeur qui marche

      } catch (error) {
        console.log(`❌ Valeur "${value}" rejetée:`, error.message.substring(0, 100));
      }
    }

    // Vérifier les données existantes
    const existingModes = await prisma.mode_paiement.findMany();
    console.log('\nModes de paiement existants:', existingModes);

  } catch (error) {
    console.error('Erreur de connexion ou autre:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAndFixConstraints();

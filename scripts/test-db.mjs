import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PrismaClient } = require('./../prisma/node_modules/.prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔄 Test de connexion à la base de données...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Connexion réussie');

    // Test des règles de salaire
    const regles = await prisma.regle_salaire.findMany({
      where: { actif: true },
      take: 5
    });
    console.log('📊 Règles de salaire trouvées:', regles.length);
    regles.forEach(r => console.log(`  - ${r.nom}`));

    // Test des véhicules
    const vehicules = await prisma.vehicule.findMany({
      take: 5
    });
    console.log('🚗 Véhicules trouvés:', vehicules.length);
    vehicules.forEach(v => console.log(`  - ${v.plaque_immatriculation} ${v.marque}`));

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
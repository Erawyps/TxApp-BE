import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testLocalDatabase() {
  console.log('🧪 Test de la base de données locale...\n');

  const tests = [
    { name: 'Chauffeurs', query: () => prisma.chauffeur.count() },
    { name: 'Véhicules', query: () => prisma.vehicule.count() },
    { name: 'Clients', query: () => prisma.client.count() },
    { name: 'Courses', query: () => prisma.course.count() },
    { name: 'Charges', query: () => prisma.charge.count() },
    { name: 'Modes de paiement', query: () => prisma.mode_paiement.count() },
    { name: 'Règles de salaire', query: () => prisma.regle_salaire.count() }
  ];

  for (const test of tests) {
    try {
      console.log(`Testing ${test.name}...`);
      const count = await test.query();
      console.log(`✅ ${test.name}: ${count} éléments`);
    } catch (error) {
      console.log(`❌ ${test.name}: Erreur - ${error.message}`);
    }
    console.log('');
  }

  await prisma.$disconnect();
  console.log('🏁 Tests terminés');
}

testLocalDatabase().catch(console.error);
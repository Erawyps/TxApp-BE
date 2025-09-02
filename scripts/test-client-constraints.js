import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testClientConstraints() {
  console.log('Test des contraintes clients...');

  try {
    // Test des valeurs pour mode_facturation
    const modeFacturationValues = ['DETAILLE', 'detaille', 'Detaille', 'SIMPLE', 'simple', 'Simple', 'GROUPEE', 'groupee', 'Groupee'];

    console.log('\n📄 Test des valeurs de mode_facturation:');
    for (const value of modeFacturationValues) {
      try {
        await prisma.client.deleteMany({ where: { telephone: 'TEST-123' } });

        await prisma.client.create({
          data: {
            type_client: 'ENTREPRISE',
            nom: 'Test Corp',
            telephone: 'TEST-123',
            mode_facturation: value
          }
        });

        console.log(`✅ Mode facturation "${value}" accepté!`);
        await prisma.client.deleteMany({ where: { telephone: 'TEST-123' } });

        // Tester aussi periode_facturation pendant qu'on y est
        const periodeValues = ['MENSUELLE', 'mensuelle', 'Mensuelle', 'HEBDOMADAIRE', 'hebdomadaire', 'Hebdomadaire'];
        for (const periode of periodeValues) {
          try {
            await prisma.client.create({
              data: {
                type_client: 'PARTICULIER',
                nom: 'Test Particulier',
                telephone: 'TEST-456',
                periode_facturation: periode
              }
            });
            console.log(`✅ Période facturation "${periode}" acceptée!`);
            await prisma.client.deleteMany({ where: { telephone: 'TEST-456' } });
            break;
          } catch (error) {
            console.log(`❌ Période facturation "${periode}" rejetée`);
          }
        }

        break;

      } catch (error) {
        console.log(`❌ Mode facturation "${value}" rejeté`);
      }
    }

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testClientConstraints();

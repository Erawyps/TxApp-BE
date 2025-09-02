import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testVehiculeConstraints() {
  console.log('Test des contraintes véhicules...');

  try {
    // Test des valeurs pour carburant
    const carburantValues = ['DIESEL', 'diesel', 'Diesel', 'ESSENCE', 'essence', 'GASOIL', 'ELECTRIQUE'];

    console.log('\n🚗 Test des valeurs de carburant:');
    for (const value of carburantValues) {
      try {
        await prisma.vehicule.deleteMany({ where: { plaque_immatriculation: 'TEST-123' } });

        await prisma.vehicule.create({
          data: {
            plaque_immatriculation: 'TEST-123',
            numero_identification: 'TEST123',
            marque: 'Test',
            modele: 'Test',
            annee: 2020,
            date_mise_circulation: new Date('2020-01-15'),
            carburant: value
          }
        });

        console.log(`✅ Carburant "${value}" accepté!`);
        await prisma.vehicule.deleteMany({ where: { plaque_immatriculation: 'TEST-123' } });
        break;

      } catch (error) {
        console.log(`❌ Carburant "${value}" rejeté`);
      }
    }

    // Test des valeurs pour etat
    const etatValues = ['DISPONIBLE', 'disponible', 'Disponible', 'EN_SERVICE', 'LIBRE', 'OCCUPE'];

    console.log('\n🔧 Test des valeurs d\'état:');
    for (const value of etatValues) {
      try {
        await prisma.vehicule.deleteMany({ where: { plaque_immatriculation: 'TEST-456' } });

        await prisma.vehicule.create({
          data: {
            plaque_immatriculation: 'TEST-456',
            numero_identification: 'TEST456',
            marque: 'Test',
            modele: 'Test',
            annee: 2020,
            date_mise_circulation: new Date('2020-01-15'),
            etat: value
          }
        });

        console.log(`✅ État "${value}" accepté!`);
        await prisma.vehicule.deleteMany({ where: { plaque_immatriculation: 'TEST-456' } });
        break;

      } catch (error) {
        console.log(`❌ État "${value}" rejeté`);
      }
    }

    // Vérifier les véhicules existants
    const existingVehicules = await prisma.vehicule.findMany();
    console.log('\n🚙 Véhicules existants:', existingVehicules);

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testVehiculeConstraints();

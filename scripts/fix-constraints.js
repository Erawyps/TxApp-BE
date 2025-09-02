import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixConstraints() {
  console.log('Correction des contraintes CHECK...');

  try {
    // Supprimer la contrainte CHECK problématique et la recréer
    await prisma.$executeRaw`
      ALTER TABLE mode_paiement DROP CONSTRAINT IF EXISTS mode_paiement_type_paiement_check;
    `;

    await prisma.$executeRaw`
      ALTER TABLE mode_paiement ADD CONSTRAINT mode_paiement_type_paiement_check 
      CHECK (type_paiement IN ('ESPECES', 'CARTE', 'CHEQUE', 'VIREMENT'));
    `;

    // Faire de même pour les autres contraintes si nécessaire
    await prisma.$executeRaw`
      ALTER TABLE regle_salaire DROP CONSTRAINT IF EXISTS regle_salaire_type_regle_check;
    `;

    await prisma.$executeRaw`
      ALTER TABLE regle_salaire ADD CONSTRAINT regle_salaire_type_regle_check 
      CHECK (type_regle IN ('FIXE', 'VARIABLE', 'MIXTE'));
    `;

    await prisma.$executeRaw`
      ALTER TABLE client DROP CONSTRAINT IF EXISTS client_type_client_check;
    `;

    await prisma.$executeRaw`
      ALTER TABLE client ADD CONSTRAINT client_type_client_check 
      CHECK (type_client IN ('PARTICULIER', 'ENTREPRISE'));
    `;

    await prisma.$executeRaw`
      ALTER TABLE vehicule DROP CONSTRAINT IF EXISTS vehicule_type_vehicule_check;
    `;

    await prisma.$executeRaw`
      ALTER TABLE vehicule ADD CONSTRAINT vehicule_type_vehicule_check 
      CHECK (type_vehicule IN ('BERLINE', 'BREAK', 'MONOSPACE', 'UTILITAIRE'));
    `;

    await prisma.$executeRaw`
      ALTER TABLE utilisateur DROP CONSTRAINT IF EXISTS utilisateur_type_utilisateur_check;
    `;

    await prisma.$executeRaw`
      ALTER TABLE utilisateur ADD CONSTRAINT utilisateur_type_utilisateur_check 
      CHECK (type_utilisateur IN ('ADMIN', 'CHAUFFEUR', 'DISPATCHER', 'COMPTABLE'));
    `;

    console.log('Contraintes CHECK corrigées avec succès!');
  } catch (error) {
    console.error('Erreur lors de la correction des contraintes:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixConstraints()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

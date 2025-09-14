import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createChauffeurVehiculeTable() {
  try {
    console.log('🔧 Création de la table chauffeur_vehicule...');

    // Créer la table manuellement si elle n'existe pas
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS chauffeur_vehicule (
        id SERIAL PRIMARY KEY,
        chauffeur_id INTEGER NOT NULL,
        vehicule_id INTEGER NOT NULL,
        date_assignation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actif BOOLEAN DEFAULT TRUE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(chauffeur_id, vehicule_id),
        FOREIGN KEY (chauffeur_id) REFERENCES chauffeur(id) ON DELETE CASCADE,
        FOREIGN KEY (vehicule_id) REFERENCES vehicule(id) ON DELETE CASCADE
      );
    `;

    // Créer les index
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_chauffeur_vehicule_chauffeur ON chauffeur_vehicule(chauffeur_id);
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_chauffeur_vehicule_vehicule ON chauffeur_vehicule(vehicule_id);
    `;

    console.log('✅ Table chauffeur_vehicule créée avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors de la création de la table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la création
createChauffeurVehiculeTable();
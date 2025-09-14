import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addDuboisVehicle() {
  try {
    console.log('🚗 Ajout du véhicule de François-José Dubois...');

    // Trouver François-José Dubois
    const dubois = await prisma.utilisateur.findFirst({
      where: {
        nom: 'Dubois',
        prenom: 'François-José'
      },
      include: {
        chauffeur: true
      }
    });

    if (!dubois || !dubois.chauffeur) {
      console.log('❌ François-José Dubois ou son profil chauffeur non trouvé');
      return;
    }

    // Trouver le véhicule 1-ABC-123
    const vehicle = await prisma.vehicule.findFirst({
      where: {
        plaque_immatriculation: '1-ABC-123'
      }
    });

    if (!vehicle) {
      console.log('❌ Véhicule 1-ABC-123 non trouvé');
      return;
    }

    // Ajouter la relation chauffeur-véhicule
    const result = await prisma.$executeRaw`
      INSERT INTO chauffeur_vehicule (chauffeur_id, vehicule_id, actif, notes, created_at, updated_at)
      VALUES (${dubois.chauffeur.id}, ${vehicle.id}, true, 'Véhicule principal de François-José Dubois', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (chauffeur_id, vehicule_id) DO NOTHING;
    `;

    if (result > 0) {
      console.log(`✅ Véhicule ajouté: ${dubois.prenom} ${dubois.nom} ↔ ${vehicle.plaque_immatriculation} (${vehicle.marque} ${vehicle.modele})`);
    } else {
      console.log(`⏭️ Relation existe déjà: ${dubois.prenom} ${dubois.nom} ↔ ${vehicle.plaque_immatriculation}`);
    }

    // Vérifier le résultat final
    const finalVehicles = await prisma.$queryRaw`
      SELECT
        v.plaque_immatriculation,
        v.marque,
        v.modele,
        cv.actif,
        cv.date_assignation
      FROM chauffeur_vehicule cv
      JOIN chauffeur c ON cv.chauffeur_id = c.id
      JOIN utilisateur u ON c.utilisateur_id = u.id
      JOIN vehicule v ON cv.vehicule_id = v.id
      WHERE u.nom = 'Dubois' AND u.prenom = 'François-José' AND cv.actif = true
      ORDER BY v.plaque_immatriculation;
    `;

    console.log(`\n🎯 Véhicules finaux assignés à François-José Dubois:`);
    if (finalVehicles.length > 0) {
      finalVehicles.forEach(vehicle => {
        console.log(`- ${vehicle.plaque_immatriculation} (${vehicle.marque} ${vehicle.modele})`);
      });
    } else {
      console.log('Aucun véhicule assigné');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addDuboisVehicle();
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function populateChauffeurVehicule() {
  try {
    console.log('🔍 Analyse des relations chauffeur-véhicule existantes...');

    // 1. Récupérer toutes les relations uniques de feuille_route
    const relations = await prisma.$queryRaw`
      SELECT DISTINCT
        fr.chauffeur_id,
        fr.vehicule_id,
        u.prenom,
        u.nom,
        v.plaque_immatriculation,
        v.marque,
        v.modele
      FROM feuille_route fr
      JOIN utilisateur u ON fr.chauffeur_id = u.id
      JOIN vehicule v ON fr.vehicule_id = v.id
      ORDER BY u.nom, u.prenom, v.plaque_immatriculation;
    `;

    console.log(`\n📊 ${relations.length} relations uniques trouvées dans feuille_route:`);
    relations.forEach(rel => {
      console.log(`- ${rel.prenom} ${rel.nom} ↔ ${rel.plaque_immatriculation} (${rel.marque} ${rel.modele})`);
    });

    // 2. Insérer les relations dans chauffeur_vehicule (seulement celles qui n'existent pas)
    console.log('\n⚡ Création des enregistrements chauffeur_vehicule...');

    let insertedCount = 0;
    for (const relation of relations) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO chauffeur_vehicule (chauffeur_id, vehicule_id, actif, notes, created_at, updated_at)
          VALUES (${relation.chauffeur_id}, ${relation.vehicule_id}, true, 'Créé automatiquement depuis feuille_route', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT (chauffeur_id, vehicule_id) DO NOTHING;
        `;

        if (result > 0) {
          insertedCount++;
          console.log(`✅ Inséré: ${relation.prenom} ${relation.nom} ↔ ${relation.plaque_immatriculation}`);
        } else {
          console.log(`⏭️ Existe déjà: ${relation.prenom} ${relation.nom} ↔ ${relation.plaque_immatriculation}`);
        }
      } catch (error) {
        console.log(`❌ Erreur pour ${relation.prenom} ${relation.nom}: ${error.message}`);
      }
    }

    console.log(`\n🎉 ${insertedCount} nouvelles relations créées!`);

    // 3. Vérifier les véhicules de François-José Dubois
    console.log('\n👤 Recherche des véhicules de François-José Dubois...');

    const duboisVehicles = await prisma.$queryRaw`
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

    console.log(`\n🚗 Véhicules assignés à François-José Dubois:`);
    if (duboisVehicles.length > 0) {
      duboisVehicles.forEach(vehicle => {
        console.log(`- ${vehicle.plaque_immatriculation} (${vehicle.marque} ${vehicle.modele}) - Assigné le ${vehicle.date_assignation.toISOString().split('T')[0]}`);
      });
    } else {
      console.log('Aucun véhicule assigné');
    }

    // 4. Statistiques finales
    const totalRelations = await prisma.$queryRaw`
      SELECT COUNT(*) as total FROM chauffeur_vehicule WHERE actif = true;
    `;

    console.log(`\n📈 Statistiques finales:`);
    console.log(`- Total des relations chauffeur-véhicule actives: ${totalRelations[0].total}`);

  } catch (error) {
    console.error('❌ Erreur lors du traitement:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
populateChauffeurVehicule();
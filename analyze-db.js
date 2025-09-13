import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeAndPopulateChauffeurVehicule() {
  try {
    console.log('🔍 Analyse de la base de données...\n');

    // 1. Vérifier la structure des tables
    console.log('📋 Vérification des tables existantes...');

    // Vérifier si la table chauffeur_vehicule existe
    const chauffeurVehiculeExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'chauffeur_vehicule'
      );
    `;

    console.log(`✅ Table chauffeur_vehicule existe: ${chauffeurVehiculeExists[0].exists ? 'Oui' : 'Non'}`);

    // 2. Compter les enregistrements dans chaque table
    console.log('\n📊 Comptage des enregistrements...');

    const chauffeurCount = await prisma.chauffeur.count();
    const vehiculeCount = await prisma.vehicule.count();
    const feuilleRouteCount = await prisma.feuille_route.count();
    const chauffeurVehiculeCount = await prisma.chauffeur_vehicule.count();

    console.log(`👥 Chauffeurs: ${chauffeurCount}`);
    console.log(`🚗 Véhicules: ${vehiculeCount}`);
    console.log(`📄 Feuilles de route: ${feuilleRouteCount}`);
    console.log(`🔗 Relations chauffeur-véhicule: ${chauffeurVehiculeCount}`);

    // 3. Analyser les relations actuelles via feuille_route
    console.log('\n🔍 Analyse des relations actuelles via feuille_route...');

    const relationsFromFeuilleRoute = await prisma.$queryRaw`
      SELECT
        fr.chauffeur_id,
        fr.vehicule_id,
        c.nom as chauffeur_nom,
        c.prenom as chauffeur_prenom,
        v.marque,
        v.modele,
        v.plaque_immatriculation,
        COUNT(*) as nombre_feuilles,
        MIN(fr.date) as premiere_date,
        MAX(fr.date) as derniere_date
      FROM feuille_route fr
      JOIN chauffeur c ON fr.chauffeur_id = c.id
      JOIN vehicule v ON fr.vehicule_id = v.id
      GROUP BY fr.chauffeur_id, fr.vehicule_id, c.nom, c.prenom, v.marque, v.modele, v.plaque_immatriculation
      ORDER BY fr.chauffeur_id, fr.vehicule_id;
    `;

    console.log(`📈 Relations trouvées via feuille_route: ${relationsFromFeuilleRoute.length}`);

    // 4. Vérifier les relations existantes dans chauffeur_vehicule
    console.log('\n🔍 Vérification des relations existantes dans chauffeur_vehicule...');

    const existingRelations = await prisma.chauffeur_vehicule.findMany({
      include: {
        chauffeur: {
          select: { id: true, nom: true, prenom: true }
        },
        vehicule: {
          select: { id: true, marque: true, modele: true, plaque_immatriculation: true }
        }
      }
    });

    console.log(`📋 Relations existantes dans chauffeur_vehicule: ${existingRelations.length}`);

    // 5. Identifier les relations manquantes
    console.log('\n⚡ Identification des relations à créer...');

    const relationsToCreate = [];

    for (const relation of relationsFromFeuilleRoute) {
      const exists = existingRelations.some(existing =>
        existing.chauffeur_id === relation.chauffeur_id &&
        existing.vehicule_id === relation.vehicule_id
      );

      if (!exists) {
        relationsToCreate.push({
          chauffeur_id: relation.chauffeur_id,
          vehicule_id: relation.vehicule_id,
          chauffeur_nom: `${relation.chauffeur_prenom} ${relation.chauffeur_nom}`,
          vehicule_info: `${relation.marque} ${relation.modele} (${relation.plaque_immatriculation})`,
          nombre_feuilles: relation.nombre_feuilles,
          premiere_date: relation.premiere_date,
          derniere_date: relation.derniere_date
        });
      }
    }

    console.log(`➕ Relations à créer: ${relationsToCreate.length}`);

    // 6. Créer les relations manquantes
    if (relationsToCreate.length > 0) {
      console.log('\n🚀 Création des relations manquantes...');

      for (const relation of relationsToCreate) {
        try {
          await prisma.chauffeur_vehicule.create({
            data: {
              chauffeur_id: relation.chauffeur_id,
              vehicule_id: relation.vehicule_id,
              notes: `Créé automatiquement - ${relation.nombre_feuilles} feuilles de route (${relation.premiere_date.toISOString().split('T')[0]} à ${relation.derniere_date.toISOString().split('T')[0]})`
            }
          });
          console.log(`✅ Créé: ${relation.chauffeur_nom} → ${relation.vehicule_info}`);
        } catch (error) {
          console.log(`❌ Erreur pour ${relation.chauffeur_nom} → ${relation.vehicule_info}: ${error.message}`);
        }
      }
    }

    // 7. Vérification finale
    console.log('\n🎯 Vérification finale...');

    const finalCount = await prisma.chauffeur_vehicule.count();
    console.log(`📊 Total des relations chauffeur-véhicule: ${finalCount}`);

    // 8. Afficher les véhicules de François-José Dubois
    console.log('\n👤 Recherche de François-José Dubois...');

    const dubois = await prisma.chauffeur.findFirst({
      where: {
        nom: 'Dubois',
        prenom: 'François-José'
      },
      include: {
        vehicules: {
          include: {
            vehicule: true
          }
        }
      }
    });

    if (dubois) {
      console.log(`\n🚗 Véhicules assignés à ${dubois.prenom} ${dubois.nom}:`);
      if (dubois.vehicules.length > 0) {
        dubois.vehicules.forEach((assignment, index) => {
          const vehicule = assignment.vehicule;
          console.log(`${index + 1}. ${vehicule.marque} ${vehicule.modele} (${vehicule.plaque_immatriculation}) - ${assignment.actif ? 'Actif' : 'Inactif'}`);
        });
      } else {
        console.log('Aucun véhicule assigné');
      }
    } else {
      console.log('François-José Dubois non trouvé');
    }

    console.log('\n✅ Analyse et population terminées avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la fonction
analyzeAndPopulateChauffeurVehicule();
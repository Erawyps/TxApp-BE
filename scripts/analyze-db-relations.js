import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeAndPopulateChauffeurVehicule() {
  try {
    console.log('🔍 Analyse de la base de données...');

    // 1. Vérifier les tables existantes
    console.log('\n📋 Tables disponibles:');
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    console.log(tables.map(t => t.table_name));

    // 2. Examiner les données existantes dans feuille_route
    console.log('\n📊 Analyse des relations chauffeur-véhicule via feuille_route:');
    const feuilleRoutes = await prisma.feuille_route.findMany({
      select: {
        id: true,
        chauffeur_id: true,
        vehicule_id: true,
        date: true,
        chauffeur: {
          select: {
            id: true,
            utilisateur: {
              select: {
                nom: true,
                prenom: true
              }
            }
          }
        },
        vehicule: {
          select: {
            id: true,
            plaque_immatriculation: true,
            marque: true,
            modele: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      },
      take: 20
    });

    console.log(`\n📈 ${feuilleRoutes.length} dernières feuilles de route trouvées:`);
    feuilleRoutes.forEach(fr => {
      console.log(`- ${fr.date.toISOString().split('T')[0]}: ${fr.chauffeur?.utilisateur?.prenom} ${fr.chauffeur?.utilisateur?.nom} → ${fr.vehicule?.plaque_immatriculation} (${fr.vehicule?.marque} ${fr.vehicule?.modele})`);
    });

    // 3. Vérifier si la table chauffeur_vehicule existe et son contenu
    console.log('\n🔗 Vérification de la table chauffeur_vehicule:');
    try {
      const existingRelations = await prisma.chauffeur_vehicule.findMany({
        include: {
          chauffeur: {
            include: {
              utilisateur: true
            }
          },
          vehicule: true
        }
      });

      console.log(`📊 ${existingRelations.length} relations chauffeur-véhicule existantes:`);
      existingRelations.forEach(rel => {
        console.log(`- ${rel.chauffeur?.utilisateur?.prenom} ${rel.chauffeur?.utilisateur?.nom} ↔ ${rel.vehicule?.plaque_immatriculation} (${rel.actif ? 'Actif' : 'Inactif'})`);
      });
    } catch (error) {
      console.log('❌ Table chauffeur_vehicule n\'existe pas encore ou est vide');
    }

    // 4. Analyser les relations uniques chauffeur-véhicule
    console.log('\n🔍 Analyse des relations uniques chauffeur-véhicule:');
    const uniqueRelations = await prisma.feuille_route.findMany({
      select: {
        chauffeur_id: true,
        vehicule_id: true,
        chauffeur: {
          select: {
            utilisateur: {
              select: {
                nom: true,
                prenom: true
              }
            }
          }
        },
        vehicule: {
          select: {
            plaque_immatriculation: true,
            marque: true,
            modele: true
          }
        }
      },
      distinct: ['chauffeur_id', 'vehicule_id'],
      orderBy: [
        { chauffeur_id: 'asc' },
        { vehicule_id: 'asc' }
      ]
    });

    console.log(`\n🎯 ${uniqueRelations.length} relations uniques chauffeur-véhicule trouvées:`);
    uniqueRelations.forEach(rel => {
      console.log(`- ${rel.chauffeur?.utilisateur?.prenom} ${rel.chauffeur?.utilisateur?.nom} ↔ ${rel.vehicule?.plaque_immatriculation} (${rel.vehicule?.marque} ${rel.vehicule?.modele})`);
    });

    // 5. Créer les enregistrements dans chauffeur_vehicule si nécessaire
    console.log('\n⚡ Création des enregistrements chauffeur_vehicule...');

    let createdCount = 0;
    for (const relation of uniqueRelations) {
      try {
        // Vérifier si la relation existe déjà
        const existing = await prisma.chauffeur_vehicule.findUnique({
          where: {
            chauffeur_id_vehicule_id: {
              chauffeur_id: relation.chauffeur_id,
              vehicule_id: relation.vehicule_id
            }
          }
        });

        if (!existing) {
          await prisma.chauffeur_vehicule.create({
            data: {
              chauffeur_id: relation.chauffeur_id,
              vehicule_id: relation.vehicule_id,
              actif: true,
              notes: 'Créé automatiquement depuis feuille_route'
            }
          });
          createdCount++;
          console.log(`✅ Créé: ${relation.chauffeur?.utilisateur?.prenom} ${relation.chauffeur?.utilisateur?.nom} ↔ ${relation.vehicule?.plaque_immatriculation}`);
        } else {
          console.log(`⏭️ Existe déjà: ${relation.chauffeur?.utilisateur?.prenom} ${relation.chauffeur?.utilisateur?.nom} ↔ ${relation.vehicule?.plaque_immatriculation}`);
        }
      } catch (createError) {
        console.log(`❌ Erreur pour ${relation.chauffeur?.utilisateur?.prenom} ${relation.chauffeur?.utilisateur?.nom}: ${createError.message}`);
      }
    }

    console.log(`\n🎉 ${createdCount} nouvelles relations chauffeur-véhicule créées!`);

    // 6. Vérifier les véhicules de François-José Dubois
    console.log('\n👤 Recherche de François-José Dubois...');
    const dubois = await prisma.utilisateur.findFirst({
      where: {
        AND: [
          { nom: 'Dubois' },
          { prenom: 'François-José' }
        ]
      },
      include: {
        chauffeur: {
          include: {
            chauffeur_vehicule: {
              include: {
                vehicule: true
              }
            }
          }
        }
      }
    });

    if (dubois && dubois.chauffeur) {
      console.log(`\n🚗 Véhicules assignés à ${dubois.prenom} ${dubois.nom}:`);
      if (dubois.chauffeur.chauffeur_vehicule.length > 0) {
        dubois.chauffeur.chauffeur_vehicule.forEach(cv => {
          if (cv.actif) {
            console.log(`- ${cv.vehicule.plaque_immatriculation} (${cv.vehicule.marque} ${cv.vehicule.modele})`);
          }
        });
      } else {
        console.log('Aucun véhicule assigné');
      }
    } else {
      console.log('François-José Dubois non trouvé');
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter l'analyse
analyzeAndPopulateChauffeurVehicule();
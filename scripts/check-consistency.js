import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDataConsistency() {
  try {
    console.log('🔍 Vérification de la cohérence des données de François-José Dubois...\n');

    // 1. Vérifier les jointures dans feuille_route
    const feuillesRoute = await prisma.feuille_route.findMany({
      where: {
        chauffeur: {
          utilisateur: {
            nom: 'Dubois',
            prenom: 'François-José'
          }
        }
      },
      include: {
        vehicule: true,
        chauffeur: {
          include: {
            utilisateur: true
          }
        }
      },
      take: 5
    });

    console.log('📋 VÉRIFICATION DES JOINTURES FEUILLE_ROUTE:');
    feuillesRoute.forEach(fr => {
      console.log(`- Date: ${fr.date.toISOString().split('T')[0]}`);
      console.log(`  Chauffeur: ${fr.chauffeur.utilisateur.prenom} ${fr.chauffeur.utilisateur.nom}`);
      console.log(`  Véhicule: ${fr.vehicule.plaque_immatriculation} (${fr.vehicule.marque} ${fr.vehicule.modele})`);
      console.log(`  KM: ${fr.km_debut} → ${fr.km_fin || 'N/A'}`);
      console.log('');
    });

    // 2. Vérifier la cohérence chauffeur_vehicule
    const chauffeurVehicules = await prisma.$queryRaw`
      SELECT
        u.prenom, u.nom,
        v.plaque_immatriculation, v.marque, v.modele,
        cv.actif, cv.date_assignation
      FROM chauffeur_vehicule cv
      JOIN chauffeur c ON cv.chauffeur_id = c.id
      JOIN utilisateur u ON c.utilisateur_id = u.id
      JOIN vehicule v ON cv.vehicule_id = v.id
      WHERE u.nom = 'Dubois' AND u.prenom = 'François-José'
    `;

    console.log('🚗 VÉRIFICATION CHAUFFEUR_VÉHICULE:');
    chauffeurVehicules.forEach(cv => {
      console.log(`- ${cv.prenom} ${cv.nom} ↔ ${cv.plaque_immatriculation} (${cv.marque} ${cv.modele})`);
      console.log(`  Actif: ${cv.actif}, Assigné: ${cv.date_assignation.toISOString().split('T')[0]}`);
    });

    // 3. Vérifier les courses
    const courses = await prisma.course.findMany({
      where: {
        feuille_route: {
          chauffeur: {
            utilisateur: {
              nom: 'Dubois',
              prenom: 'François-José'
            }
          }
        }
      },
      include: {
        feuille_route: {
          include: {
            vehicule: true
          }
        },
        client: true
      },
      take: 5
    });

    console.log('\n🛣️ VÉRIFICATION DES COURSES:');
    courses.forEach(course => {
      console.log(`- ${course.heure_embarquement.toISOString().split('T')[0]} ${course.heure_embarquement.toISOString().split('T')[1].substring(0, 5)}`);
      console.log(`  Trajet: ${course.lieu_embarquement} → ${course.lieu_debarquement}`);
      console.log(`  Prix: ${course.somme_percue}€`);
      console.log(`  Véhicule: ${course.feuille_route.vehicule.plaque_immatriculation}`);
      console.log(`  Client: ${course.client?.nom || 'N/A'}`);
      console.log('');
    });

    // 4. Vérifier la règle de salaire
    const chauffeur = await prisma.chauffeur.findFirst({
      where: {
        utilisateur: {
          nom: 'Dubois',
          prenom: 'François-José'
        }
      },
      include: {
        regle_salaire: true
      }
    });

    console.log('💰 VÉRIFICATION RÈGLE DE SALAIRE:');
    if (chauffeur?.regle_salaire) {
      console.log(`- Règle: ${chauffeur.regle_salaire.nom}`);
      console.log(`- Type: ${chauffeur.regle_salaire.type_regle}`);
      console.log(`- Description: ${chauffeur.regle_salaire.description || 'N/A'}`);
    } else {
      console.log('- Aucune règle de salaire assignée');
    }

    // 5. Résumé de cohérence
    console.log('\n✅ RÉSUMÉ DE COHÉRENCE:');
    console.log(`- Feuilles de route: ${feuillesRoute.length}`);
    console.log(`- Véhicules assignés: ${chauffeurVehicules.length}`);
    console.log(`- Courses réalisées: ${courses.length}`);
    console.log(`- Règle salaire: ${chauffeur?.regle_salaire ? 'Oui' : 'Non'}`);

    const coherenceIssues = [];

    // Vérifier si tous les véhicules des feuilles de route sont assignés
    const vehiculesFromFeuilles = [...new Set(feuillesRoute.map(fr => fr.vehicule_id))];
    const vehiculesAssigned = chauffeurVehicules.map(cv => cv.vehicule_id);

    const missingAssignments = vehiculesFromFeuilles.filter(vid => !vehiculesAssigned.includes(vid));
    if (missingAssignments.length > 0) {
      coherenceIssues.push(`${missingAssignments.length} véhicule(s) utilisé(s) sans assignation formelle`);
    }

    if (coherenceIssues.length === 0) {
      console.log('🎯 STATUT: Toutes les données sont cohérentes!');
    } else {
      console.log('⚠️ ISSUES DE COHÉRENCE:');
      coherenceIssues.forEach(issue => console.log(`- ${issue}`));
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDataConsistency();
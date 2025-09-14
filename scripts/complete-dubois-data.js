import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getCompleteDuboisData() {
  try {
    console.log('🔍 Récupération complète des données de François-José Dubois...\n');

    // 1. Informations de base de l'utilisateur
    const utilisateur = await prisma.utilisateur.findFirst({
      where: {
        nom: 'Dubois',
        prenom: 'François-José'
      }
    });

    if (!utilisateur) {
      console.log('❌ François-José Dubois non trouvé');
      return;
    }

    console.log('👤 INFORMATIONS UTILISATEUR:');
    console.log(`- ID: ${utilisateur.id}`);
    console.log(`- Nom: ${utilisateur.prenom} ${utilisateur.nom}`);
    console.log(`- Email: ${utilisateur.email}`);
    console.log(`- Téléphone: ${utilisateur.telephone}`);
    console.log(`- Type: ${utilisateur.type_utilisateur}`);
    console.log(`- Actif: ${utilisateur.actif ? 'Oui' : 'Non'}`);
    console.log(`- Date création: ${utilisateur.date_creation?.toISOString().split('T')[0] || 'N/A'}`);
    console.log(`- Dernière connexion: ${utilisateur.last_login?.toISOString().split('T')[0] || 'N/A'}`);

    // 2. Informations du chauffeur
    const chauffeur = await prisma.chauffeur.findFirst({
      where: {
        utilisateur_id: utilisateur.id
      },
      include: {
        regle_salaire: true
      }
    });

    if (chauffeur) {
      console.log('\n🚗 INFORMATIONS CHAUFFEUR:');
      console.log(`- ID chauffeur: ${chauffeur.id}`);
      console.log(`- Numéro badge: ${chauffeur.numero_badge}`);
      console.log(`- Date embauche: ${chauffeur.date_embauche.toISOString().split('T')[0]}`);
      console.log(`- Date fin contrat: ${chauffeur.date_fin_contrat?.toISOString().split('T')[0] || 'N/A'}`);
      console.log(`- Type contrat: ${chauffeur.type_contrat || 'N/A'}`);
      console.log(`- Salaire base: ${chauffeur.salaire_base || 0}€`);
      console.log(`- Taux commission: ${chauffeur.taux_commission || 0}%`);
      console.log(`- Actif: ${chauffeur.actif ? 'Oui' : 'Non'}`);

      if (chauffeur.regle_salaire) {
        console.log(`- Règle salaire: ${chauffeur.regle_salaire.nom} (${chauffeur.regle_salaire.type_regle})`);
      }
    }

    // 3. Véhicules assignés
    const vehiculesAssignees = await prisma.$queryRaw`
      SELECT
        v.id,
        v.plaque_immatriculation,
        v.marque,
        v.modele,
        v.annee,
        v.type_vehicule,
        v.etat,
        cv.actif as assignation_active,
        cv.date_assignation
      FROM chauffeur_vehicule cv
      JOIN vehicule v ON cv.vehicule_id = v.id
      WHERE cv.chauffeur_id = ${chauffeur.id} AND cv.actif = true
      ORDER BY v.plaque_immatriculation;
    `;

    console.log('\n🚙 VÉHICULES ASSIGNÉS:');
    if (vehiculesAssignees.length > 0) {
      vehiculesAssignees.forEach(vehicle => {
        console.log(`- ${vehicle.plaque_immatriculation} (${vehicle.marque} ${vehicle.modele}, ${vehicle.annee})`);
        console.log(`  État: ${vehicle.etat}, Assigné le: ${vehicle.date_assignation.toISOString().split('T')[0]}`);
      });
    } else {
      console.log('Aucun véhicule assigné');
    }

    // 4. Feuilles de route
    const feuillesRoute = await prisma.feuille_route.findMany({
      where: {
        chauffeur_id: chauffeur.id
      },
      include: {
        vehicule: true
      },
      orderBy: {
        date: 'desc'
      },
      take: 10
    });

    console.log('\n📋 FEUILLES DE ROUTE (10 dernières):');
    if (feuillesRoute.length > 0) {
      feuillesRoute.forEach(fr => {
        console.log(`- ${fr.date.toISOString().split('T')[0]}: ${fr.vehicule.plaque_immatriculation} (${fr.vehicule.marque} ${fr.modele})`);
        console.log(`  Statut: ${fr.statut}, KM: ${fr.km_debut || 0} → ${fr.km_fin || 'N/A'}`);
      });
    } else {
      console.log('Aucune feuille de route');
    }

    // 5. Courses réalisées
    const courses = await prisma.course.findMany({
      where: {
        feuille_route: {
          chauffeur_id: chauffeur.id
        }
      },
      include: {
        client: true,
        mode_paiement: true
      },
      orderBy: {
        heure_embarquement: 'desc'
      },
      take: 10
    });

    console.log('\n🛣️ COURSES RÉALISÉES (10 dernières):');
    if (courses.length > 0) {
      courses.forEach(course => {
        console.log(`- ${course.heure_embarquement.toISOString().split('T')[0]} ${course.heure_embarquement.toISOString().split('T')[1].substring(0, 5)}`);
        console.log(`  De: ${course.lieu_embarquement} → À: ${course.lieu_debarquement}`);
        console.log(`  Prix: ${course.somme_percue}€, Client: ${course.client?.nom || 'N/A'}`);
      });
    } else {
      console.log('Aucune course réalisée');
    }

    // 6. Paiements salaire
    const paiementsSalaire = await prisma.paiement_salaire.findMany({
      where: {
        chauffeur_id: chauffeur.id
      },
      include: {
        mode_paiement: true
      },
      orderBy: {
        periode_fin: 'desc'
      },
      take: 5
    });

    console.log('\n💰 PAIEMENTS SALAIRE (5 derniers):');
    if (paiementsSalaire.length > 0) {
      paiementsSalaire.forEach(paiement => {
        console.log(`- Période: ${paiement.periode_debut.toISOString().split('T')[0]} → ${paiement.periode_fin.toISOString().split('T')[0]}`);
        console.log(`  Montant: ${paiement.montant_total}€ (${paiement.statut})`);
      });
    } else {
      console.log('Aucun paiement salaire');
    }

    // 7. Performances
    const performances = await prisma.performance_chauffeur.findMany({
      where: {
        chauffeur_id: chauffeur.id
      },
      orderBy: {
        date_fin: 'desc'
      },
      take: 3
    });

    console.log('\n📊 PERFORMANCES (3 dernières périodes):');
    if (performances.length > 0) {
      performances.forEach(perf => {
        console.log(`- Période: ${perf.date_debut.toISOString().split('T')[0]} → ${perf.date_fin.toISOString().split('T')[0]}`);
        console.log(`  Courses: ${perf.nombre_courses}, KM: ${perf.km_parcourus}, Recette: ${perf.recette_totale}€`);
      });
    } else {
      console.log('Aucune donnée de performance');
    }

    // 8. Alertes
    const alertes = await prisma.alerte.findMany({
      where: {
        resolu_par: utilisateur.id
      },
      orderBy: {
        date_alerte: 'desc'
      },
      take: 5
    });

    console.log('\n🚨 ALERTES RÉSOLUES (5 dernières):');
    if (alertes.length > 0) {
      alertes.forEach(alerte => {
        console.log(`- ${alerte.date_alerte.toISOString().split('T')[0]}: ${alerte.type_alerte} (${alerte.severite})`);
        console.log(`  Message: ${alerte.message.substring(0, 50)}${alerte.message.length > 50 ? '...' : ''}`);
      });
    } else {
      console.log('Aucune alerte résolue');
    }

    // 9. Récapitulatif pour new-post-form
    console.log('\n📝 RÉCAPITULATIF POUR NEW-POST-FORM:');
    console.log(`Chauffeur: ${utilisateur.prenom} ${utilisateur.nom} (ID: ${chauffeur?.id})`);
    console.log(`Badge: ${chauffeur?.numero_badge}`);
    console.log(`Véhicules actifs: ${vehiculesAssignees.length}`);
    console.log(`Feuilles de route: ${feuillesRoute.length}`);
    console.log(`Courses totales: ${courses.length}`);
    console.log(`Statut: ${chauffeur?.actif ? 'Actif' : 'Inactif'}`);

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des données:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la fonction
getCompleteDuboisData();
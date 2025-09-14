import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Service pour récupérer toutes les données d'un chauffeur pour new-post-form
 * @param {number} chauffeurId - ID du chauffeur
 * @returns {Object} Données complètes du chauffeur
 */
export async function getChauffeurDataForNewPostForm(chauffeurId) {
  try {
    // Récupérer le profil chauffeur avec utilisateur
    const chauffeur = await prisma.chauffeur.findUnique({
      where: { id: chauffeurId },
      include: {
        utilisateur: true,
        regle_salaire: true
      }
    });

    if (!chauffeur) {
      throw new Error('Chauffeur non trouvé');
    }

    // Récupérer les véhicules assignés
    const vehiculesAssignees = await prisma.$queryRaw`
      SELECT
        v.id,
        v.plaque_immatriculation,
        v.marque,
        v.modele,
        v.annee,
        v.type_vehicule,
        v.etat,
        cv.date_assignation,
        cv.actif
      FROM chauffeur_vehicule cv
      JOIN vehicule v ON cv.vehicule_id = v.id
      WHERE cv.chauffeur_id = ${chauffeurId} AND cv.actif = true
      ORDER BY cv.date_assignation DESC;
    `;

    // Récupérer les feuilles de route récentes
    const feuillesRoute = await prisma.feuille_route.findMany({
      where: { chauffeur_id: chauffeurId },
      include: {
        vehicule: true,
        course: {
          include: {
            client: true,
            mode_paiement: true
          }
        }
      },
      orderBy: { date: 'desc' },
      take: 10
    });

    // Statistiques financières
    const courses = await prisma.course.findMany({
      where: {
        feuille_route: {
          chauffeur_id: chauffeurId
        }
      },
      select: {
        somme_percue: true,
        heure_embarquement: true
      }
    });

    const totalRecettes = courses.reduce((sum, course) => sum + Number(course.somme_percue), 0);
    const moyenneParCourse = courses.length > 0 ? totalRecettes / courses.length : 0;

    // Retourner les données formatées pour new-post-form
    return {
      profil: {
        id: chauffeur.id,
        utilisateurId: chauffeur.utilisateur.id,
        nom: chauffeur.utilisateur.prenom + ' ' + chauffeur.utilisateur.nom,
        prenom: chauffeur.utilisateur.prenom,
        nomFamille: chauffeur.utilisateur.nom,
        badge: chauffeur.numero_badge,
        email: chauffeur.utilisateur.email,
        telephone: chauffeur.utilisateur.telephone,
        actif: chauffeur.actif,
        dateEmbauche: chauffeur.date_embauche,
        typeContrat: chauffeur.type_contrat,
        salaireBase: chauffeur.salaire_base,
        tauxCommission: chauffeur.taux_commission
      },
      vehicules: vehiculesAssignees.map(v => ({
        id: v.id,
        plaque: v.plaque_immatriculation,
        marque: v.marque,
        modele: v.modele,
        annee: v.annee,
        type: v.type_vehicule,
        etat: v.etat,
        dateAssignation: v.date_assignation,
        actif: v.actif
      })),
      activiteRecente: {
        feuillesRouteCount: feuillesRoute.length,
        coursesCount: courses.length,
        dernieresFeuilles: feuillesRoute.slice(0, 5).map(fr => ({
          id: fr.id,
          date: fr.date,
          vehicule: fr.vehicule.plaque_immatriculation,
          coursesCount: fr.course.length,
          statut: fr.statut
        }))
      },
      statistiques: {
        totalCourses: courses.length,
        totalRecettes: totalRecettes,
        moyenneParCourse: moyenneParCourse
      },
      regleSalaire: chauffeur.regle_salaire ? {
        id: chauffeur.regle_salaire.id,
        nom: chauffeur.regle_salaire.nom,
        type: chauffeur.regle_salaire.type_regle,
        description: chauffeur.regle_salaire.description
      } : null,
      permissions: {
        peutCreerFeuille: chauffeur.actif,
        vehiculesDisponibles: vehiculesAssignees.length > 0,
        accesCourses: true
      }
    };

  } catch (error) {
    console.error('Erreur lors de la récupération des données chauffeur:', error);
    throw error;
  }
}

/**
 * Fonction spécifique pour François-José Dubois
 */
export async function getDuboisDataForNewPostForm() {
  const dubois = await prisma.utilisateur.findFirst({
    where: {
      nom: 'Dubois',
      prenom: 'François-José'
    },
    include: {
      chauffeur: true
    }
  });

  if (!dubois?.chauffeur) {
    throw new Error('François-José Dubois non trouvé');
  }

  return getChauffeurDataForNewPostForm(dubois.chauffeur.id);
}
import axios from '../utils/axios.js';

/**
 * Service pour gérer les courses via API HTTP
 */

// Récupérer toutes les courses d'une feuille de route
export async function fetchCourses(feuilleRouteId = null) {
  try {
    const url = feuilleRouteId 
      ? `/courses?feuille_route_id=${feuilleRouteId}`
      : '/courses';
    const response = await axios.get(url);
    return response.data.map(mapFromDb);
  } catch (error) {
    console.error('Erreur lors de la récupération des courses:', error);

    // Gestion spécifique des erreurs
    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 401:
          throw new Error('Authentification requise pour accéder aux courses');
        case 403:
          throw new Error('Accès non autorisé aux données des courses');
        case 404:
          throw new Error('Service de courses non trouvé');
        case 500:
          throw new Error('Erreur lors de la récupération des courses');
        default:
          throw new Error(`Erreur serveur (${status}) lors de la récupération des courses`);
      }
    } else if (error.request) {
      throw new Error('Erreur de connexion réseau - impossible de récupérer les courses');
    } else {
      throw new Error('Erreur inconnue lors de la récupération des données de courses');
    }
  }
}

// Récupérer les courses d'une feuille de route spécifique (utilisé par la vue chauffeur)
export async function getCoursesByFeuille(feuilleId) {
  try {
    const response = await axios.get(`/courses/${feuilleId}`);
    console.log('✅ Courses récupérées pour feuille', feuilleId, ':', response.data?.length || 0);
    return response.data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des courses par feuille:', error);
    if (error.response?.status === 404) {
      // Pas de courses pour cette feuille, retourner un tableau vide
      return [];
    }
    throw error;
  }
}

// Créer une course avec validations chauffeur
export async function createCourse(courseData) {
  try {
    const data = mapToDb(courseData);
    const response = await axios.post('/courses', data);
    return mapFromDb(response.data);
  } catch (error) {
    console.error('Erreur lors de la création de la course:', error);

    // Gestion spécifique des erreurs
    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 400:
          throw new Error('Données de course invalides ou chauffeur non disponible');
        case 401:
          throw new Error('Authentification requise pour créer une course');
        case 403:
          throw new Error('Accès non autorisé à la création de courses');
        case 404:
          throw new Error('Service de création de courses non trouvé');
        case 409:
          throw new Error('Conflit: chauffeur déjà occupé à cette heure');
        case 500:
          throw new Error('Erreur lors de la création de la course');
        default:
          throw new Error(`Erreur serveur (${status}) lors de la création de la course`);
      }
    } else if (error.request) {
      throw new Error('Erreur de connexion réseau - impossible de créer la course');
    } else {
      throw new Error('Erreur inconnue lors de la création de la course');
    }
  }
}

// Mettre à jour une course avec validations chauffeur
export async function updateCourse(courseId, courseData) {
  try {
    const data = mapToDb(courseData);
    const response = await axios.put(`/courses/${courseId}`, data);
    return mapFromDb(response.data);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la course:', error);

    // Gestion spécifique des erreurs
    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 400:
          throw new Error('Données de mise à jour invalides ou chauffeur non disponible');
        case 401:
          throw new Error('Authentification requise pour modifier une course');
        case 403:
          throw new Error('Accès non autorisé à la modification de courses');
        case 404:
          throw new Error('Course non trouvée ou service non disponible');
        case 409:
          throw new Error('Conflit: chauffeur déjà occupé à cette heure');
        case 500:
          throw new Error('Erreur lors de la mise à jour de la course');
        default:
          throw new Error(`Erreur serveur (${status}) lors de la mise à jour de la course`);
      }
    } else if (error.request) {
      throw new Error('Erreur de connexion réseau - impossible de modifier la course');
    } else {
      throw new Error('Erreur inconnue lors de la mise à jour de la course');
    }
  }
}

// Sauvegarde automatique d'une course (pour les chauffeurs)
export async function autoSaveCourse(courseId, courseData) {
  try {
    const data = mapToDb(courseData);
    const response = await axios.put(`/courses/${courseId}`, data);
    return mapFromDb(response.data);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde automatique:', error);
    throw new Error(`Erreur lors de la sauvegarde automatique: ${error.message}`);
  }
}

// Annuler une course (remplace la suppression)
export async function cancelCourse(courseId, motif = null) {
  try {
    const response = await axios.put(`/courses/${courseId}`, {
      statut: 'Annulé',
      notes: motif ? `Annulé: ${motif}` : 'Annulé'
    });
    return mapFromDb(response.data);
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la course:', error);
    throw new Error(`Erreur lors de l'annulation de la course: ${error.message}`);
  }
}

// Upsert une course (créer ou mettre à jour selon si l'ID existe)
export async function upsertCourse(courseData) {
  try {
    if (courseData.id) {
      // Mise à jour
      return await updateCourse(courseData.id, courseData);
    } else {
      // Création
      return await createCourse(courseData);
    }
  } catch (error) {
    console.error('Erreur lors de l\'upsert de la course:', error);
    throw new Error(`Erreur lors de l'opération sur la course: ${error.message}`);
  }
}

// Supprimer une course (legacy - utiliser cancelCourse à la place)
export async function deleteCourse(courseId) {
  console.warn('deleteCourse est déprécié. Utilisez cancelCourse à la place.');
  return cancelCourse(courseId, 'Supprimé via interface');
}

// Mapper depuis la base de données
function mapFromDb(row) {
  if (!row) return null;
  return {
    id: row.course_id, // Correction: utiliser course_id au lieu de id
    feuille_route_id: row.feuille_id, // Correction: utiliser feuille_id au lieu de feuille_route_id
    client_id: row.client_id,
    numero_ordre: row.num_ordre, // Correction: utiliser num_ordre au lieu de numero_ordre
    index_depart: row.index_depart,
    lieu_embarquement: row.lieu_embarquement,
    heure_embarquement: row.heure_embarquement,
    index_arrivee: row.index_debarquement, // Correction: utiliser index_debarquement au lieu de index_arrivee
    lieu_debarquement: row.lieu_debarquement,
    heure_debarquement: row.heure_debarquement,
    prix_taximetre: Number(row.prix_taximetre || 0),
    somme_percue: Number(row.sommes_percues || 0), // Correction: utiliser sommes_percues (pluriel)
    pourboire: Number(row.pourboire || 0), // Nouveau champ pourboire
    statut: row.statut || 'Active', // Nouveau champ statut
    mode_paiement: row.mode_paiement?.code || row.mode_paiement?.libelle || 'CASH',
    client: row.client ? `${row.client.prenom || ''} ${row.client.nom || ''}`.trim() : '',
    hors_creneau: row.est_hors_heures || false, // Correction: utiliser est_hors_heures
    notes: row.notes || '',
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

// Mapper vers la base de données
function mapToDb(course) {
  console.log('🔍 mapToDb - Données reçues:', course);
  
  // Helper pour parser les nombres en toute sécurité
  const safeParseInt = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const parsed = parseInt(value);
    return isNaN(parsed) ? null : parsed;
  };
  
  const safeParseFloat = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  };
  
  const mapped = {
    feuille_id: safeParseInt(course.feuille_id),
    client_id: safeParseInt(course.client_id),
    mode_paiement_id: safeParseInt(course.mode_paiement), // Le formulaire envoie 'mode_paiement'
    num_ordre: safeParseInt(course.num_ordre),
    index_depart: safeParseInt(course.index_depart),
    index_embarquement: safeParseInt(course.index_embarquement),
    lieu_embarquement: course.lieu_embarquement || null,
    heure_embarquement: course.heure_embarquement || null,
    index_debarquement: safeParseInt(course.index_debarquement),
    lieu_debarquement: course.lieu_debarquement || null,
    heure_debarquement: course.heure_debarquement || null,
    prix_taximetre: safeParseFloat(course.prix_taximetre),
    sommes_percues: safeParseFloat(course.sommes_percues),
    est_hors_heures: course.hors_creneau || false,
    notes: course.notes || null
  };
  
  console.log('🔍 mapToDb - Données mappées pour API:', mapped);
  return mapped;
}

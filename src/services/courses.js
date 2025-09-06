import { apiCall } from './api.js';

/**
 * Service pour gérer les courses via API
 */

// Récupérer toutes les courses d'une feuille de route
export async function fetchCourses(feuilleRouteId = null) {
  try {
    const queryParam = feuilleRouteId ? `?feuilleRouteId=${feuilleRouteId}` : '';
    const courses = await apiCall(`/courses${queryParam}`);
    return courses.map(mapFromDb);
  } catch (error) {
    console.error('Erreur lors de la récupération des courses:', error);
    throw error;
  }
}

// Créer ou mettre à jour une course
export async function upsertCourse(courseData) {
  try {
    const data = mapToDb(courseData);

    let course;
    if (courseData.id) {
      // Mise à jour
      course = await apiCall(`/courses/${courseData.id}`, {
        method: 'PUT',
        body: data
      });
    } else {
      // Création
      course = await apiCall('/courses', {
        method: 'POST',
        body: data
      });
    }

    return mapFromDb(course);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la course:', error);
    throw error;
  }
}

// Supprimer une course
export async function deleteCourse(courseId) {
  try {
    await apiCall(`/courses/${courseId}`, {
      method: 'DELETE'
    });
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de la course:', error);
    throw error;
  }
}

// Mapper depuis la base de données
function mapFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    feuille_route_id: row.feuille_route_id,
    client_id: row.client_id,
    numero_ordre: row.numero_ordre,
    index_embarquement: row.index_depart,
    lieu_embarquement: row.lieu_embarquement,
    heure_embarquement: row.heure_embarquement,
    index_debarquement: row.index_arrivee,
    lieu_debarquement: row.lieu_debarquement,
    heure_debarquement: row.heure_debarquement,
    prix_taximetre: Number(row.prix_taximetre || 0),
    sommes_percues: Number(row.somme_percue || 0),
    distance_km: row.distance_km,
    duree_minutes: row.duree_minutes,
    ratio_euro_km: Number(row.ratio_euro_km || 0),
    mode_paiement: row.mode_paiement?.code || 'CASH',
    client: row.client?.nom || '',
    hors_creneau: row.hors_creneau || false,
    notes: row.notes || '',
    status: 'completed', // Statut par défaut pour compatibilité avec l'interface
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

// Mapper vers la base de données
function mapToDb(course) {
  return {
    feuille_route_id: course.feuille_route_id,
    client_id: course.client_id || null,
    mode_paiement_id: course.mode_paiement_id || null,
    numero_ordre: course.numero_ordre,
    index_embarquement: course.index_embarquement,
    lieu_embarquement: course.lieu_embarquement,
    heure_embarquement: course.heure_embarquement,
    index_debarquement: course.index_debarquement,
    lieu_debarquement: course.lieu_debarquement,
    heure_debarquement: course.heure_debarquement,
    prix_taximetre: course.prix_taximetre,
    sommes_percues: course.sommes_percues,
    hors_creneau: course.hors_creneau || false,
    notes: course.notes || null
  };
}

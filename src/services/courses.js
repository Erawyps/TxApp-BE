import axios from 'axios';

/**
 * Service pour gérer les courses via API HTTP
 */

// Récupérer toutes les courses d'une feuille de route
export async function fetchCourses(feuilleRouteId = null) {
  try {
    const url = feuilleRouteId
      ? `/api/courses?feuille_route_id=${feuilleRouteId}`
      : '/api/courses';
    const response = await axios.get(url);
    return response.data.map(mapFromDb);
  } catch (error) {
    console.error('Erreur lors de la récupération des courses:', error);
    throw error;
  }
}

// Créer une course avec validations chauffeur
export async function createCourse(courseData) {
  try {
    const data = mapToDb(courseData);
    const response = await axios.post('/api/courses', data);
    return mapFromDb(response.data);
  } catch (error) {
    console.error('Erreur lors de la création de la course:', error);
    throw error;
  }
}

// Mettre à jour une course avec validations chauffeur
export async function updateCourse(courseId, courseData) {
  try {
    const data = mapToDb(courseData);
    const response = await axios.put(`/api/courses/${courseId}`, data);
    return mapFromDb(response.data);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la course:', error);
    throw error;
  }
}

// Sauvegarde automatique d'une course (pour les chauffeurs)
export async function autoSaveCourse(courseId, courseData) {
  try {
    const data = mapToDb(courseData);
    const response = await axios.put(`/api/courses/${courseId}`, data);
    return mapFromDb(response.data);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde automatique:', error);
    throw error;
  }
}

// Annuler une course (remplace la suppression)
export async function cancelCourse(courseId, motif = null) {
  try {
    const response = await axios.put(`/api/courses/${courseId}`, {
      statut: 'Annulé',
      notes: motif ? `Annulé: ${motif}` : 'Annulé'
    });
    return mapFromDb(response.data);
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la course:', error);
    throw error;
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
    throw error;
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
    id: row.id,
    feuille_route_id: row.feuille_route_id,
    client_id: row.client_id,
    numero_ordre: row.numero_ordre,
    index_depart: row.index_depart,
    lieu_embarquement: row.lieu_embarquement,
    heure_embarquement: row.heure_embarquement,
    index_arrivee: row.index_arrivee,
    lieu_debarquement: row.lieu_debarquement,
    heure_debarquement: row.heure_debarquement,
    prix_taximetre: Number(row.prix_taximetre || 0),
    somme_percue: Number(row.somme_percue || 0),
    pourboire: Number(row.pourboire || 0), // Nouveau champ pourboire
    statut: row.statut || 'Active', // Nouveau champ statut
    mode_paiement: row.mode_paiement?.code || row.mode_paiement?.libelle || 'CASH',
    client: row.client ? `${row.client.prenom || ''} ${row.client.nom || ''}`.trim() : '',
    hors_creneau: row.hors_creneau || false,
    notes: row.notes || '',
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
    index_depart: course.index_depart,
    lieu_embarquement: course.lieu_embarquement,
    heure_embarquement: course.heure_embarquement,
    index_arrivee: course.index_arrivee,
    lieu_debarquement: course.lieu_debarquement,
    heure_debarquement: course.heure_debarquement,
    prix_taximetre: course.prix_taximetre,
    somme_percue: course.somme_percue, // Correction: somme_percue au lieu de sommes_percues
    hors_creneau: course.hors_creneau || false,
    statut: course.statut || 'Active', // Nouveau champ statut
    notes: course.notes || null
  };
}

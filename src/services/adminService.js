import axios from '../utils/axios.js';

/**
 * Service pour la gestion administrative via API HTTP
 */

// ==================== GESTION DES CHAUFFEURS ====================

// Récupérer tous les chauffeurs
export async function fetchChauffeurs() {
  try {
    const response = await axios.get('/api/chauffeurs');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des chauffeurs:', error);
    throw error;
  }
}

// Récupérer un chauffeur par ID
export async function fetchChauffeurById(chauffeurId) {
  try {
    const response = await axios.get(`/api/chauffeurs/${chauffeurId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du chauffeur:', error);
    throw error;
  }
}

// Créer un chauffeur
export async function createChauffeur(chauffeurData) {
  try {
    const response = await axios.post('/api/chauffeurs', chauffeurData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création du chauffeur:', error);
    throw error;
  }
}

// Mettre à jour un chauffeur
export async function updateChauffeur(chauffeurId, chauffeurData) {
  try {
    const response = await axios.put(`/api/chauffeurs/${chauffeurId}`, chauffeurData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du chauffeur:', error);
    throw error;
  }
}

// Supprimer un chauffeur
export async function deleteChauffeur(chauffeurId) {
  try {
    await axios.delete(`/api/chauffeurs/${chauffeurId}`);
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du chauffeur:', error);
    throw error;
  }
}

// ==================== GESTION DES VÉHICULES ====================

// Récupérer tous les véhicules
export async function fetchVehicules() {
  try {
    const response = await axios.get('/api/vehicules');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des véhicules:', error);
    throw error;
  }
}

// Récupérer un véhicule par ID
export async function fetchVehiculeById(vehiculeId) {
  try {
    const response = await axios.get(`/api/vehicules/${vehiculeId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du véhicule:', error);
    throw error;
  }
}

// Créer un véhicule
export async function createVehicule(vehiculeData) {
  try {
    const response = await axios.post('/api/vehicules', vehiculeData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création du véhicule:', error);
    throw error;
  }
}

// Mettre à jour un véhicule
export async function updateVehicule(vehiculeId, vehiculeData) {
  try {
    const response = await axios.put(`/api/vehicules/${vehiculeId}`, vehiculeData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du véhicule:', error);
    throw error;
  }
}

// Supprimer un véhicule
export async function deleteVehicule(vehiculeId) {
  try {
    await axios.delete(`/api/vehicules/${vehiculeId}`);
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du véhicule:', error);
    throw error;
  }
}

// ==================== GESTION DES CLIENTS ====================

// Récupérer tous les clients
export async function fetchClients() {
  try {
    const response = await axios.get('/api/clients');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    throw error;
  }
}

// Récupérer un client par ID
export async function fetchClientById(clientId) {
  try {
    const response = await axios.get(`/api/clients/${clientId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du client:', error);
    throw error;
  }
}

// Créer un client
export async function createClient(clientData) {
  try {
    const response = await axios.post('/api/clients', clientData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création du client:', error);
    throw error;
  }
}

// Mettre à jour un client
export async function updateClient(clientId, clientData) {
  try {
    const response = await axios.put(`/api/clients/${clientId}`, clientData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du client:', error);
    throw error;
  }
}

// Supprimer un client
export async function deleteClient(clientId) {
  try {
    await axios.delete(`/api/clients/${clientId}`);
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du client:', error);
    throw error;
  }
}

// ==================== GESTION DES PARTENAIRES ====================

// Récupérer tous les partenaires
export async function fetchPartenaires() {
  try {
    const response = await axios.get('/api/partenaires');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des partenaires:', error);
    throw error;
  }
}

// Créer un partenaire
export async function createPartenaire(partenaireData) {
  try {
    const response = await axios.post('/api/partenaires', partenaireData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création du partenaire:', error);
    throw error;
  }
}

// ==================== REQUÊTES SPÉCIFIQUES ====================

// Trouver chauffeur par date
export async function findChauffeurByDate(date) {
  try {
    const response = await axios.get(`/api/chauffeurs/find-by-date/${date}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la recherche chauffeur par date:', error);
    throw error;
  }
}

// Trouver véhicule par chauffeur et date
export async function findVehiculeByChauffeurAndDate(chauffeurId, date) {
  try {
    const response = await axios.get(`/api/vehicules/find-by-chauffeur-date/${chauffeurId}/${date}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la recherche véhicule par chauffeur et date:', error);
    throw error;
  }
}

// ==================== ENCODAGE FEUILLE DE ROUTE ADMIN ====================

// Encoder une feuille de route en mode admin
export async function encodeFeuilleRouteAdmin(feuilleData) {
  try {
    const response = await axios.post('/api/feuilles-route/encode-admin', feuilleData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'encodage admin de la feuille de route:', error);
    throw error;
  }
}
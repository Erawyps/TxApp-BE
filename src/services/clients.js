import axios from '../utils/axios.js';

/**
 * Service pour gérer les clients
 */

// Récupérer tous les clients actifs
export async function getClients() {
  try {
    const response = await axios.get('/clients');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    throw error;
  }
}

// Récupérer un client par ID
export async function getClientById(id) {
  try {
    const response = await axios.get(`/clients/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du client:', error);
    throw error;
  }
}

// Créer un nouveau client
export async function createClient(clientData) {
  try {
    const response = await axios.post('/clients', clientData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création du client:', error);
    throw error;
  }
}

// Rechercher des clients par nom/téléphone
export async function searchClients(query) {
  try {
    const response = await axios.get(`/clients/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la recherche de clients:', error);
    throw error;
  }
}

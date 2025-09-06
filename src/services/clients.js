import { apiCall } from './api.js';

/**
 * Service pour gérer les clients via API
 */

// Récupérer tous les clients actifs
export async function getClients() {
  try {
    return await apiCall('/clients');
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    throw error;
  }
}

// Récupérer un client par ID
export async function getClientById(id) {
  try {
    return await apiCall(`/clients/${id}`);
  } catch (error) {
    console.error('Erreur lors de la récupération du client:', error);
    throw error;
  }
}

// Créer un nouveau client
export async function createClient(clientData) {
  try {
    return await apiCall('/clients', {
      method: 'POST',
      body: clientData
    });
  } catch (error) {
    console.error('Erreur lors de la création du client:', error);
    throw error;
  }
}

// Rechercher des clients par nom/téléphone
export async function searchClients(query) {
  try {
    const clients = await apiCall('/clients');
    return clients.filter(client =>
      client.nom.toLowerCase().includes(query.toLowerCase()) ||
      (client.prenom && client.prenom.toLowerCase().includes(query.toLowerCase())) ||
      client.telephone.includes(query) ||
      (client.email && client.email.toLowerCase().includes(query.toLowerCase()))
    ).slice(0, 10);
  } catch (error) {
    console.error('Erreur lors de la recherche de clients:', error);
    throw error;
  }
}

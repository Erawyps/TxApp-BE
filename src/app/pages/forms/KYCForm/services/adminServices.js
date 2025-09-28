// Services pour l'administration - connexion aux APIs
const API_BASE_URL = 'http://localhost:3001';

// Service Chauffeurs
export const chauffeurService = {
  async getAll() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chauffeurs`);
      if (!response.ok) throw new Error('Erreur chargement chauffeurs');
      const data = await response.json();
      return Array.isArray(data) ? data : (data.data || []);
    } catch (error) {
      console.error('Erreur API chauffeurs:', error);
      return [];
    }
  },

  async create(chauffeurData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chauffeurs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chauffeurData)
      });
      if (!response.ok) throw new Error('Erreur création chauffeur');
      return await response.json();
    } catch (error) {
      console.error('Erreur création chauffeur:', error);
      throw error;
    }
  },

  async update(id, chauffeurData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chauffeurs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chauffeurData)
      });
      if (!response.ok) throw new Error('Erreur mise à jour chauffeur');
      return await response.json();
    } catch (error) {
      console.error('Erreur mise à jour chauffeur:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chauffeurs/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erreur suppression chauffeur');
      return true;
    } catch (error) {
      console.error('Erreur suppression chauffeur:', error);
      throw error;
    }
  }
};

// Service Véhicules
export const vehiculeService = {
  async getAll() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vehicules`);
      if (!response.ok) throw new Error('Erreur chargement véhicules');
      const data = await response.json();
      return Array.isArray(data) ? data : (data.data || []);
    } catch (error) {
      console.error('Erreur API véhicules:', error);
      return [];
    }
  },

  async create(vehiculeData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vehicules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehiculeData)
      });
      if (!response.ok) throw new Error('Erreur création véhicule');
      return await response.json();
    } catch (error) {
      console.error('Erreur création véhicule:', error);
      throw error;
    }
  },

  async update(id, vehiculeData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vehicules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehiculeData)
      });
      if (!response.ok) throw new Error('Erreur mise à jour véhicule');
      return await response.json();
    } catch (error) {
      console.error('Erreur mise à jour véhicule:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vehicules/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erreur suppression véhicule');
      return true;
    } catch (error) {
      console.error('Erreur suppression véhicule:', error);
      throw error;
    }
  }
};

// Service Courses
export const courseService = {
  async getAll() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/courses`);
      if (!response.ok) throw new Error('Erreur chargement courses');
      const data = await response.json();
      return Array.isArray(data) ? data : (data.data || []);
    } catch (error) {
      console.error('Erreur API courses:', error);
      return [];
    }
  },

  async create(courseData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData)
      });
      if (!response.ok) throw new Error('Erreur création course');
      return await response.json();
    } catch (error) {
      console.error('Erreur création course:', error);
      throw error;
    }
  },

  async update(id, courseData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData)
      });
      if (!response.ok) throw new Error('Erreur mise à jour course');
      return await response.json();
    } catch (error) {
      console.error('Erreur mise à jour course:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erreur suppression course');
      return true;
    } catch (error) {
      console.error('Erreur suppression course:', error);
      throw error;
    }
  }
};

// Service Charges
export const chargeService = {
  async getAll() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/charges`);
      if (!response.ok) throw new Error('Erreur chargement charges');
      const data = await response.json();
      return Array.isArray(data) ? data : (data.data || []);
    } catch (error) {
      console.error('Erreur API charges:', error);
      return [];
    }
  },

  async create(chargeData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/charges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chargeData)
      });
      if (!response.ok) throw new Error('Erreur création charge');
      return await response.json();
    } catch (error) {
      console.error('Erreur création charge:', error);
      throw error;
    }
  },

  async update(id, chargeData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/charges/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chargeData)
      });
      if (!response.ok) throw new Error('Erreur mise à jour charge');
      return await response.json();
    } catch (error) {
      console.error('Erreur mise à jour charge:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/charges/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erreur suppression charge');
      return true;
    } catch (error) {
      console.error('Erreur suppression charge:', error);
      throw error;
    }
  }
};

// Service Feuilles de route
export const feuilleRouteService = {
  async getAll() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/feuilles-route`);
      if (!response.ok) throw new Error('Erreur chargement feuilles de route');
      const data = await response.json();
      return Array.isArray(data) ? data : (data.data || []);
    } catch (error) {
      console.error('Erreur API feuilles de route:', error);
      return [];
    }
  },

  async getActive(chauffeurId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/feuilles-route/active/${chauffeurId}`);
      if (!response.ok) throw new Error('Erreur chargement feuille de route active');
      const data = await response.json();
      return Array.isArray(data) ? data : (data.data || null);
    } catch (error) {
      console.error('Erreur API feuille de route active:', error);
      return null;
    }
  },

  async create(feuilleRouteData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/feuilles-route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feuilleRouteData)
      });
      if (!response.ok) throw new Error('Erreur création feuille de route');
      return await response.json();
    } catch (error) {
      console.error('Erreur création feuille de route:', error);
      throw error;
    }
  },

  async update(id, feuilleRouteData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/feuilles-route/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feuilleRouteData)
      });
      if (!response.ok) throw new Error('Erreur mise à jour feuille de route');
      return await response.json();
    } catch (error) {
      console.error('Erreur mise à jour feuille de route:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/feuilles-route/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erreur suppression feuille de route');
      return true;
    } catch (error) {
      console.error('Erreur suppression feuille de route:', error);
      throw error;
    }
  }
};

// Service Clients
export const clientService = {
  async getAll() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/clients`);
      if (!response.ok) throw new Error('Erreur chargement clients');
      const data = await response.json();
      return Array.isArray(data) ? data : (data.data || []);
    } catch (error) {
      console.error('Erreur API clients:', error);
      return [];
    }
  }
};

// Service Modes de paiement
export const modePaiementService = {
  async getAll() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/modes-paiement`);
      if (!response.ok) throw new Error('Erreur chargement modes de paiement');
      const data = await response.json();
      return Array.isArray(data) ? data : (data.data || []);
    } catch (error) {
      console.error('Erreur API modes de paiement:', error);
      return [];
    }
  }
};

// Service Factures
export const factureService = {
  async getAll() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/factures`);
      if (!response.ok) throw new Error('Erreur chargement factures');
      const data = await response.json();
      return Array.isArray(data) ? data : (data.data || []);
    } catch (error) {
      console.error('Erreur API factures:', error);
      return [];
    }
  },

  async create(factureData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/factures`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(factureData)
      });
      if (!response.ok) throw new Error('Erreur création facture');
      return await response.json();
    } catch (error) {
      console.error('Erreur création facture:', error);
      throw error;
    }
  },

  async update(id, factureData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/factures/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(factureData)
      });
      if (!response.ok) throw new Error('Erreur mise à jour facture');
      return await response.json();
    } catch (error) {
      console.error('Erreur mise à jour facture:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/factures/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erreur suppression facture');
      return true;
    } catch (error) {
      console.error('Erreur suppression facture:', error);
      throw error;
    }
  }
};

// Service Partenaires
export const partenaireService = {
  async getAll() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/partenaires`);
      if (!response.ok) throw new Error('Erreur chargement partenaires');
      const data = await response.json();
      return Array.isArray(data) ? data : (data.data || []);
    } catch (error) {
      console.error('Erreur API partenaires:', error);
      return [];
    }
  },

  async create(partenaireData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/partenaires`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partenaireData)
      });
      if (!response.ok) throw new Error('Erreur création partenaire');
      return await response.json();
    } catch (error) {
      console.error('Erreur création partenaire:', error);
      throw error;
    }
  },

  async update(id, partenaireData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/partenaires/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partenaireData)
      });
      if (!response.ok) throw new Error('Erreur mise à jour partenaire');
      return await response.json();
    } catch (error) {
      console.error('Erreur mise à jour partenaire:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/partenaires/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erreur suppression partenaire');
      return true;
    } catch (error) {
      console.error('Erreur suppression partenaire:', error);
      throw error;
    }
  }
};

// Service Interventions
export const interventionService = {
  async getAll() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/interventions`);
      if (!response.ok) throw new Error('Erreur chargement interventions');
      const data = await response.json();
      return Array.isArray(data) ? data : (data.data || []);
    } catch (error) {
      console.error('Erreur API interventions:', error);
      return [];
    }
  },

  async create(interventionData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/interventions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interventionData)
      });
      if (!response.ok) throw new Error('Erreur création intervention');
      return await response.json();
    } catch (error) {
      console.error('Erreur création intervention:', error);
      throw error;
    }
  },

  async update(id, interventionData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/interventions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interventionData)
      });
      if (!response.ok) throw new Error('Erreur mise à jour intervention');
      return await response.json();
    } catch (error) {
      console.error('Erreur mise à jour intervention:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/interventions/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erreur suppression intervention');
      return true;
    } catch (error) {
      console.error('Erreur suppression intervention:', error);
      throw error;
    }
  }
};

// Service Règles de salaire
export const regleSalaireService = {
  async getAll() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/regles-salaire`);
      if (!response.ok) throw new Error('Erreur chargement règles de salaire');
      const data = await response.json();
      return Array.isArray(data) ? data : (data.data || []);
    } catch (error) {
      console.error('Erreur API règles de salaire:', error);
      return [];
    }
  },

  async create(regleData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/regles-salaire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regleData)
      });
      if (!response.ok) throw new Error('Erreur création règle de salaire');
      return await response.json();
    } catch (error) {
      console.error('Erreur création règle de salaire:', error);
      throw error;
    }
  },

  async update(id, regleData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/regles-salaire/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regleData)
      });
      if (!response.ok) throw new Error('Erreur mise à jour règle de salaire');
      return await response.json();
    } catch (error) {
      console.error('Erreur mise à jour règle de salaire:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/regles-salaire/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erreur suppression règle de salaire');
      return true;
    } catch (error) {
      console.error('Erreur suppression règle de salaire:', error);
      throw error;
    }
  }
};

// Service Règles de facturation
export const regleFacturationService = {
  async getAll() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/regles-facturation`);
      if (!response.ok) throw new Error('Erreur chargement règles de facturation');
      const data = await response.json();
      return Array.isArray(data) ? data : (data.data || []);
    } catch (error) {
      console.error('Erreur API règles de facturation:', error);
      return [];
    }
  }
};

// Service Société de taxi
export const societeTaxiService = {
  async getAll() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/societes-taxi`);
      if (!response.ok) throw new Error('Erreur chargement sociétés de taxi');
      const data = await response.json();
      return Array.isArray(data) ? data : (data.data || []);
    } catch (error) {
      console.error('Erreur API sociétés de taxi:', error);
      return [];
    }
  },

  async getCurrent() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/societe-taxi/current`);
      if (!response.ok) throw new Error('Erreur chargement société actuelle');
      const data = await response.json();
      return Array.isArray(data) ? data : (data.data || null);
    } catch (error) {
      console.error('Erreur API société actuelle:', error);
      return null;
    }
  },

  async update(id, societeData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/societes-taxi/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(societeData)
      });
      if (!response.ok) throw new Error('Erreur mise à jour société de taxi');
      return await response.json();
    } catch (error) {
      console.error('Erreur mise à jour société de taxi:', error);
      throw error;
    }
  }
};
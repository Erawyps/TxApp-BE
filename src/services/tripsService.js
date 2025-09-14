// Import Dependencies
import { apiCall } from "services/api";

/**
 * Service pour récupérer les données des courses depuis la base de données
 */
export const tripsService = {
  /**
   * Récupère toutes les courses avec pagination et filtres
   */
  async getTrips(options = {}) {
    const {
      page = 1,
      limit = 50,
      search,
      status,
      dateFrom,
      dateTo,
      chauffeurId,
      clientId
    } = options;

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    if (chauffeurId) params.append('chauffeurId', chauffeurId.toString());
    if (clientId) params.append('clientId', clientId.toString());

    try {
      const response = await apiCall(`/dashboard/courses?${params.toString()}`);
      
      // Transformer les données pour correspondre au format attendu par les composants
      const transformedCourses = response.courses.map(course => ({
        ...course,
        chauffeur_nom: course.feuille_route?.chauffeur?.utilisateur?.nom || '',
        chauffeur_prenom: course.feuille_route?.chauffeur?.utilisateur?.prenom || '',
        vehicule_immatriculation: course.feuille_route?.vehicule?.plaque_immatriculation || '',
        vehicule_marque: course.feuille_route?.vehicule?.marque || '',
        vehicule_modele: course.feuille_route?.vehicule?.modele || '',
        client_nom: course.client?.nom || '',
        client_prenom: course.client?.prenom || '',
        mode_paiement_libelle: course.mode_paiement?.libelle || '',
        prix_course: course.somme_percue,
        statut: 'Terminée', // Par défaut, nous pouvons déterminer le statut basé sur les données
      }));

      return {
        ...response,
        courses: transformedCourses
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des courses:', error);
      throw error;
    }
  },

  /**
   * Récupère les statistiques des courses pour les KPIs
   */
  async getTripsStats(options = {}) {
    const { dateFrom, dateTo, chauffeurId } = options;

    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    if (chauffeurId) params.append('chauffeurId', chauffeurId.toString());

    try {
      const response = await apiCall(`/dashboard/courses/stats?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  },

  /**
   * Récupère les données pour les graphiques
   */
  async getTripsChartData(options = {}) {
    const { dateFrom, dateTo, type = 'daily' } = options;

    const params = new URLSearchParams({
      type,
    });

    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);

    try {
      const response = await apiCall(`/dashboard/courses/chart-data?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des données de graphique:', error);
      throw error;
    }
  }
};
import express from 'express';
import {
  getUtilisateurs,
  getUtilisateurById,
  createUtilisateur,
  updateUtilisateur,
  deleteUtilisateur,
  getChauffeurs,
  getChauffeurById,
  createChauffeur,
  updateChauffeur,
  deleteChauffeur,
  getVehicules,
  getVehiculeById,
  createVehicule,
  updateVehicule,
  deleteVehicule,
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getFeuillesRoute,
  getFeuilleRouteById,
  getFeuillesRouteByChauffeur,
  createFeuilleRoute,
  updateFeuilleRoute,
  deleteFeuilleRoute,
  getCourses,
  getCoursesByFeuille,
  createCourse,
  updateCourse,
  deleteCourse,
  getCharges,
  getChargesByFeuille,
  createCharge,
  updateCharge,
  deleteCharge,
  getModesPaiement,
  createModePaiement,
  getReglesSalaire,
  createRegleSalaire,
  getReglesFacturation,
  createRegleFacturation,
  getPartenaires,
  createPartenaire,
  getSocietesTaxi,
  findChauffeurByDate,
  findVehiculeByChauffeurAndDate,
  encodeFeuilleRouteAdmin,
  getInterventions,
  getInterventionsByChauffeur,
  createIntervention
} from '../services/prismaService.js';

const router = express.Router();

// ==================== UTILISATEURS ====================

router.get('/utilisateurs', async (req, res) => {
  try {
    const utilisateurs = await getUtilisateurs();
    res.json(utilisateurs);
  } catch (error) {
    console.error('Erreur API utilisateurs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

router.get('/utilisateurs/:id', async (req, res) => {
  try {
    const utilisateur = await getUtilisateurById(req.params.id);
    if (!utilisateur) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json(utilisateur);
  } catch (error) {
    console.error('Erreur API utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
  }
});

router.post('/utilisateurs', async (req, res) => {
  try {
    const utilisateur = await createUtilisateur(req.body);
    res.status(201).json(utilisateur);
  } catch (error) {
    console.error('Erreur API création utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur' });
  }
});

router.put('/utilisateurs/:id', async (req, res) => {
  try {
    const utilisateur = await updateUtilisateur(req.params.id, req.body);
    res.json(utilisateur);
  } catch (error) {
    console.error('Erreur API mise à jour utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'utilisateur' });
  }
});

router.delete('/utilisateurs/:id', async (req, res) => {
  try {
    await deleteUtilisateur(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Erreur API suppression utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur' });
  }
});

// ==================== CHAUFFEURS ====================

router.get('/chauffeurs', async (req, res) => {
  try {
    const chauffeurs = await getChauffeurs();
    res.json(chauffeurs);
  } catch (error) {
    console.error('Erreur API chauffeurs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des chauffeurs' });
  }
});

router.get('/chauffeurs/:id', async (req, res) => {
  try {
    const chauffeur = await getChauffeurById(req.params.id);
    if (!chauffeur) {
      return res.status(404).json({ error: 'Chauffeur non trouvé' });
    }
    res.json(chauffeur);
  } catch (error) {
    console.error('Erreur API chauffeur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du chauffeur' });
  }
});

router.post('/chauffeurs', async (req, res) => {
  try {
    const chauffeur = await createChauffeur(req.body);
    res.status(201).json(chauffeur);
  } catch (error) {
    console.error('Erreur API création chauffeur:', error);
    res.status(500).json({ error: 'Erreur lors de la création du chauffeur' });
  }
});

router.put('/chauffeurs/:id', async (req, res) => {
  try {
    const chauffeur = await updateChauffeur(req.params.id, req.body);
    res.json(chauffeur);
  } catch (error) {
    console.error('Erreur API mise à jour chauffeur:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du chauffeur' });
  }
});

router.delete('/chauffeurs/:id', async (req, res) => {
  try {
    await deleteChauffeur(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Erreur API suppression chauffeur:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du chauffeur' });
  }
});

// ==================== INTERVENTIONS ====================

router.get('/interventions', async (req, res) => {
  try {
    const interventions = await getInterventions();
    res.json(interventions);
  } catch (error) {
    console.error('Erreur API interventions:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des interventions' });
  }
});

router.get('/chauffeurs/:chauffeurId/interventions', async (req, res) => {
  try {
    const interventions = await getInterventionsByChauffeur(req.params.chauffeurId);
    res.json(interventions);
  } catch (error) {
    console.error('Erreur API interventions chauffeur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des interventions du chauffeur' });
  }
});

router.post('/interventions', async (req, res) => {
  try {
    const intervention = await createIntervention(req.body);
    res.status(201).json(intervention);
  } catch (error) {
    console.error('Erreur API création intervention:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'intervention' });
  }
});

// ==================== VÉHICULES ====================

router.get('/vehicules', async (req, res) => {
  try {
    const vehicules = await getVehicules();
    res.json(vehicules);
  } catch (error) {
    console.error('Erreur API véhicules:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des véhicules' });
  }
});

router.get('/vehicules/:id', async (req, res) => {
  try {
    const vehicule = await getVehiculeById(req.params.id);
    if (!vehicule) {
      return res.status(404).json({ error: 'Véhicule non trouvé' });
    }
    res.json(vehicule);
  } catch (error) {
    console.error('Erreur API véhicule:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du véhicule' });
  }
});

router.post('/vehicules', async (req, res) => {
  try {
    const vehicule = await createVehicule(req.body);
    res.status(201).json(vehicule);
  } catch (error) {
    console.error('Erreur API création véhicule:', error);
    res.status(500).json({ error: 'Erreur lors de la création du véhicule' });
  }
});

router.put('/vehicules/:id', async (req, res) => {
  try {
    const vehicule = await updateVehicule(req.params.id, req.body);
    res.json(vehicule);
  } catch (error) {
    console.error('Erreur API mise à jour véhicule:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du véhicule' });
  }
});

router.delete('/vehicules/:id', async (req, res) => {
  try {
    await deleteVehicule(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Erreur API suppression véhicule:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du véhicule' });
  }
});

// ==================== CLIENTS ====================

router.get('/clients', async (req, res) => {
  try {
    const clients = await getClients();
    res.json(clients);
  } catch (error) {
    console.error('Erreur API clients:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des clients' });
  }
});

router.get('/clients/:id', async (req, res) => {
  try {
    const client = await getClientById(req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }
    res.json(client);
  } catch (error) {
    console.error('Erreur API client:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du client' });
  }
});

router.post('/clients', async (req, res) => {
  try {
    const client = await createClient(req.body);
    res.status(201).json(client);
  } catch (error) {
    console.error('Erreur API création client:', error);
    res.status(500).json({ error: 'Erreur lors de la création du client' });
  }
});

router.put('/clients/:id', async (req, res) => {
  try {
    const client = await updateClient(req.params.id, req.body);
    res.json(client);
  } catch (error) {
    console.error('Erreur API mise à jour client:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du client' });
  }
});

router.delete('/clients/:id', async (req, res) => {
  try {
    await deleteClient(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Erreur API suppression client:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du client' });
  }
});

// ==================== FEUILLES DE ROUTE ====================

router.get('/feuilles-route', async (req, res) => {
  try {
    const feuilles = await getFeuillesRoute();
    res.json(feuilles);
  } catch (error) {
    console.error('Erreur API feuilles de route:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des feuilles de route' });
  }
});

router.get('/feuilles-route/:id', async (req, res) => {
  try {
    const feuille = await getFeuilleRouteById(req.params.id);
    if (!feuille) {
      return res.status(404).json({ error: 'Feuille de route non trouvée' });
    }
    res.json(feuille);
  } catch (error) {
    console.error('Erreur API feuille de route:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la feuille de route' });
  }
});

router.get('/chauffeurs/:chauffeurId/feuilles-route', async (req, res) => {
  try {
    const feuilles = await getFeuillesRouteByChauffeur(req.params.chauffeurId, req.query.date);
    res.json(feuilles);
  } catch (error) {
    console.error('Erreur API feuilles de route chauffeur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des feuilles de route du chauffeur' });
  }
});

router.post('/feuilles-route', async (req, res) => {
  try {
    const feuille = await createFeuilleRoute(req.body);
    res.status(201).json(feuille);
  } catch (error) {
    console.error('Erreur API création feuille de route:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la feuille de route' });
  }
});

router.put('/feuilles-route/:id', async (req, res) => {
  try {
    const feuille = await updateFeuilleRoute(req.params.id, req.body);
    res.json(feuille);
  } catch (error) {
    console.error('Erreur API mise à jour feuille de route:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la feuille de route' });
  }
});

router.delete('/feuilles-route/:id', async (req, res) => {
  try {
    await deleteFeuilleRoute(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Erreur API suppression feuille de route:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la feuille de route' });
  }
});

// ==================== COURSES ====================

router.get('/courses', async (req, res) => {
  try {
    const courses = await getCourses();
    res.json(courses);
  } catch (error) {
    console.error('Erreur API courses:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des courses' });
  }
});

router.get('/feuilles-route/:feuilleId/courses', async (req, res) => {
  try {
    const courses = await getCoursesByFeuille(req.params.feuilleId);
    res.json(courses);
  } catch (error) {
    console.error('Erreur API courses de la feuille:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des courses de la feuille' });
  }
});

router.post('/courses', async (req, res) => {
  try {
    const course = await createCourse(req.body);
    res.status(201).json(course);
  } catch (error) {
    console.error('Erreur API création course:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la course' });
  }
});

router.put('/courses/:id', async (req, res) => {
  try {
    const course = await updateCourse(req.params.id, req.body);
    res.json(course);
  } catch (error) {
    console.error('Erreur API mise à jour course:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la course' });
  }
});

router.delete('/courses/:id', async (req, res) => {
  try {
    await deleteCourse(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Erreur API suppression course:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la course' });
  }
});

// ==================== CHARGES ====================

router.get('/charges', async (req, res) => {
  try {
    const charges = await getCharges();
    res.json(charges);
  } catch (error) {
    console.error('Erreur API charges:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des charges' });
  }
});

router.get('/feuilles-route/:feuilleId/charges', async (req, res) => {
  try {
    const charges = await getChargesByFeuille(req.params.feuilleId);
    res.json(charges);
  } catch (error) {
    console.error('Erreur API charges de la feuille:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des charges de la feuille' });
  }
});

router.post('/charges', async (req, res) => {
  try {
    const charge = await createCharge(req.body);
    res.status(201).json(charge);
  } catch (error) {
    console.error('Erreur API création charge:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la charge' });
  }
});

router.put('/charges/:id', async (req, res) => {
  try {
    const charge = await updateCharge(req.params.id, req.body);
    res.json(charge);
  } catch (error) {
    console.error('Erreur API mise à jour charge:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la charge' });
  }
});

router.delete('/charges/:id', async (req, res) => {
  try {
    await deleteCharge(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Erreur API suppression charge:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la charge' });
  }
});

// ==================== MODES DE PAIEMENT ====================

router.get('/modes-paiement', async (req, res) => {
  try {
    const modes = await getModesPaiement();
    res.json(modes);
  } catch (error) {
    console.error('Erreur API modes de paiement:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des modes de paiement' });
  }
});

router.post('/modes-paiement', async (req, res) => {
  try {
    const mode = await createModePaiement(req.body);
    res.status(201).json(mode);
  } catch (error) {
    console.error('Erreur API création mode de paiement:', error);
    res.status(500).json({ error: 'Erreur lors de la création du mode de paiement' });
  }
});

// ==================== RÈGLES DE SALAIRE ====================

router.get('/regles-salaire', async (req, res) => {
  try {
    const regles = await getReglesSalaire();
    res.json(regles);
  } catch (error) {
    console.error('Erreur API règles de salaire:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des règles de salaire' });
  }
});

router.post('/regles-salaire', async (req, res) => {
  try {
    const regle = await createRegleSalaire(req.body);
    res.status(201).json(regle);
  } catch (error) {
    console.error('Erreur API création règle de salaire:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la règle de salaire' });
  }
});

// ==================== RÈGLES DE FACTURATION ====================

router.get('/regles-facturation', async (req, res) => {
  try {
    const regles = await getReglesFacturation();
    res.json(regles);
  } catch (error) {
    console.error('Erreur API règles de facturation:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des règles de facturation' });
  }
});

router.post('/regles-facturation', async (req, res) => {
  try {
    const regle = await createRegleFacturation(req.body);
    res.status(201).json(regle);
  } catch (error) {
    console.error('Erreur API création règle de facturation:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la règle de facturation' });
  }
});

// ==================== PARTENAIRES ====================

router.get('/partenaires', async (req, res) => {
  try {
    const partenaires = await getPartenaires();
    res.json(partenaires);
  } catch (error) {
    console.error('Erreur API partenaires:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des partenaires' });
  }
});

router.post('/partenaires', async (req, res) => {
  try {
    const partenaire = await createPartenaire(req.body);
    res.status(201).json(partenaire);
  } catch (error) {
    console.error('Erreur API création partenaire:', error);
    res.status(500).json({ error: 'Erreur lors de la création du partenaire' });
  }
});

// ==================== SOCIÉTÉS TAXI ====================

router.get('/societes-taxi', async (req, res) => {
  try {
    const societes = await getSocietesTaxi();
    res.json(societes);
  } catch (error) {
    console.error('Erreur API sociétés taxi:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des sociétés taxi' });
  }
});

// ==================== ADMIN - REQUÊTES SPÉCIFIQUES ====================

router.get('/admin/chauffeur-by-date', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'Date requise' });
    }
    const result = await findChauffeurByDate(date);
    res.json(result);
  } catch (error) {
    console.error('Erreur API recherche chauffeur par date:', error);
    res.status(500).json({ error: 'Erreur lors de la recherche' });
  }
});

router.get('/admin/vehicule-by-chauffeur-date', async (req, res) => {
  try {
    const { chauffeurId, date } = req.query;
    if (!chauffeurId || !date) {
      return res.status(400).json({ error: 'Chauffeur ID et date requis' });
    }
    const result = await findVehiculeByChauffeurAndDate(chauffeurId, date);
    res.json(result);
  } catch (error) {
    console.error('Erreur API recherche véhicule par chauffeur et date:', error);
    res.status(500).json({ error: 'Erreur lors de la recherche' });
  }
});

router.post('/admin/feuille-route/encode', async (req, res) => {
  try {
    const feuille = await encodeFeuilleRouteAdmin(req.body);
    res.status(201).json(feuille);
  } catch (error) {
    console.error('Erreur API encodage admin feuille de route:', error);
    res.status(500).json({ error: 'Erreur lors de l\'encodage admin' });
  }
});

export default router;
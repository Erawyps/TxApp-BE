import { Hono } from 'hono';
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

const app = new Hono();

// ==================== UTILISATEURS ====================

app.get('/utilisateurs', async (c) => {
  try {
    const utilisateurs = await getUtilisateurs();
    return c.json(utilisateurs);
  } catch (error) {
    console.error('Erreur API utilisateurs:', error);
    return c.json({ error: 'Erreur lors de la récupération des utilisateurs' }, 500);
  }
});

app.get('/utilisateurs/:id', async (c) => {
  try {
    const utilisateur = await getUtilisateurById(c.req.param('id'));
    if (!utilisateur) {
      return c.json({ error: 'Utilisateur non trouvé' }, 404);
    }
    return c.json(utilisateur);
  } catch (error) {
    console.error('Erreur API utilisateur:', error);
    return c.json({ error: 'Erreur lors de la récupération de l\'utilisateur' }, 500);
  }
});

app.post('/utilisateurs', async (c) => {
  try {
    const body = await c.req.json();
    const utilisateur = await createUtilisateur(body);
    return c.json(utilisateur, 201);
  } catch (error) {
    console.error('Erreur API création utilisateur:', error);
    return c.json({ error: 'Erreur lors de la création de l\'utilisateur' }, 500);
  }
});

app.put('/utilisateurs/:id', async (c) => {
  try {
    const body = await c.req.json();
    const utilisateur = await updateUtilisateur(c.req.param('id'), body);
    return c.json(utilisateur);
  } catch (error) {
    console.error('Erreur API mise à jour utilisateur:', error);
    return c.json({ error: 'Erreur lors de la mise à jour de l\'utilisateur' }, 500);
  }
});

app.delete('/utilisateurs/:id', async (c) => {
  try {
    await deleteUtilisateur(c.req.param('id'));
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Erreur API suppression utilisateur:', error);
    return c.json({ error: 'Erreur lors de la suppression de l\'utilisateur' }, 500);
  }
});

// ==================== CHAUFFEURS ====================

app.get('/chauffeurs', async (c) => {
  try {
    const chauffeurs = await getChauffeurs();
    return c.json(chauffeurs);
  } catch (error) {
    console.error('Erreur API chauffeurs:', error);
    return c.json({ error: 'Erreur lors de la récupération des chauffeurs' }, 500);
  }
});

app.get('/chauffeurs/:id', async (c) => {
  try {
    const chauffeur = await getChauffeurById(c.req.param('id'));
    if (!chauffeur) {
      return c.json({ error: 'Chauffeur non trouvé' }, 404);
    }
    return c.json(chauffeur);
  } catch (error) {
    console.error('Erreur API chauffeur:', error);
    return c.json({ error: 'Erreur lors de la récupération du chauffeur' }, 500);
  }
});

app.post('/chauffeurs', async (c) => {
  try {
    const body = await c.req.json();
    const chauffeur = await createChauffeur(body);
    return c.json(chauffeur, 201);
  } catch (error) {
    console.error('Erreur API création chauffeur:', error);
    return c.json({ error: 'Erreur lors de la création du chauffeur' }, 500);
  }
});

app.put('/chauffeurs/:id', async (c) => {
  try {
    const body = await c.req.json();
    const chauffeur = await updateChauffeur(c.req.param('id'), body);
    return c.json(chauffeur);
  } catch (error) {
    console.error('Erreur API mise à jour chauffeur:', error);
    return c.json({ error: 'Erreur lors de la mise à jour du chauffeur' }, 500);
  }
});

app.delete('/chauffeurs/:id', async (c) => {
  try {
    await deleteChauffeur(c.req.param('id'));
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Erreur API suppression chauffeur:', error);
    return c.json({ error: 'Erreur lors de la suppression du chauffeur' }, 500);
  }
});

// ==================== INTERVENTIONS ====================

app.get('/interventions', async (c) => {
  try {
    const interventions = await getInterventions();
    return c.json(interventions);
  } catch (error) {
    console.error('Erreur API interventions:', error);
    return c.json({ error: 'Erreur lors de la récupération des interventions' }, 500);
  }
});

app.get('/chauffeurs/:chauffeurId/interventions', async (c) => {
  try {
    const interventions = await getInterventionsByChauffeur(c.req.param('chauffeurId'));
    return c.json(interventions);
  } catch (error) {
    console.error('Erreur API interventions chauffeur:', error);
    return c.json({ error: 'Erreur lors de la récupération des interventions du chauffeur' }, 500);
  }
});

app.post('/interventions', async (c) => {
  try {
    const body = await c.req.json();
    const intervention = await createIntervention(body);
    return c.json(intervention, 201);
  } catch (error) {
    console.error('Erreur API création intervention:', error);
    return c.json({ error: 'Erreur lors de la création de l\'intervention' }, 500);
  }
});

// ==================== VÉHICULES ====================

app.get('/vehicules', async (c) => {
  try {
    const vehicules = await getVehicules();
    return c.json(vehicules);
  } catch (error) {
    console.error('Erreur API véhicules:', error);
    return c.json({ error: 'Erreur lors de la récupération des véhicules' }, 500);
  }
});

app.get('/vehicules/:id', async (c) => {
  try {
    const vehicule = await getVehiculeById(c.req.param('id'));
    if (!vehicule) {
      return c.json({ error: 'Véhicule non trouvé' }, 404);
    }
    return c.json(vehicule);
  } catch (error) {
    console.error('Erreur API véhicule:', error);
    return c.json({ error: 'Erreur lors de la récupération du véhicule' }, 500);
  }
});

app.post('/vehicules', async (c) => {
  try {
    const body = await c.req.json();
    const vehicule = await createVehicule(body);
    return c.json(vehicule, 201);
  } catch (error) {
    console.error('Erreur API création véhicule:', error);
    return c.json({ error: 'Erreur lors de la création du véhicule' }, 500);
  }
});

app.put('/vehicules/:id', async (c) => {
  try {
    const body = await c.req.json();
    const vehicule = await updateVehicule(c.req.param('id'), body);
    return c.json(vehicule);
  } catch (error) {
    console.error('Erreur API mise à jour véhicule:', error);
    return c.json({ error: 'Erreur lors de la mise à jour du véhicule' }, 500);
  }
});

app.delete('/vehicules/:id', async (c) => {
  try {
    await deleteVehicule(c.req.param('id'));
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Erreur API suppression véhicule:', error);
    return c.json({ error: 'Erreur lors de la suppression du véhicule' }, 500);
  }
});

// ==================== CLIENTS ====================

app.get('/clients', async (c) => {
  try {
    const clients = await getClients();
    return c.json(clients);
  } catch (error) {
    console.error('Erreur API clients:', error);
    return c.json({ error: 'Erreur lors de la récupération des clients' }, 500);
  }
});

app.get('/clients/:id', async (c) => {
  try {
    const client = await getClientById(c.req.param('id'));
    if (!client) {
      return c.json({ error: 'Client non trouvé' }, 404);
    }
    return c.json(client);
  } catch (error) {
    console.error('Erreur API client:', error);
    return c.json({ error: 'Erreur lors de la récupération du client' }, 500);
  }
});

app.post('/clients', async (c) => {
  try {
    const body = await c.req.json();
    const client = await createClient(body);
    return c.json(client, 201);
  } catch (error) {
    console.error('Erreur API création client:', error);
    return c.json({ error: 'Erreur lors de la création du client' }, 500);
  }
});

app.put('/clients/:id', async (c) => {
  try {
    const body = await c.req.json();
    const client = await updateClient(c.req.param('id'), body);
    return c.json(client);
  } catch (error) {
    console.error('Erreur API mise à jour client:', error);
    return c.json({ error: 'Erreur lors de la mise à jour du client' }, 500);
  }
});

app.delete('/clients/:id', async (c) => {
  try {
    await deleteClient(c.req.param('id'));
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Erreur API suppression client:', error);
    return c.json({ error: 'Erreur lors de la suppression du client' }, 500);
  }
});

// ==================== FEUILLES DE ROUTE ====================

app.get('/feuilles-route', async (c) => {
  try {
    const feuilles = await getFeuillesRoute();
    return c.json(feuilles);
  } catch (error) {
    console.error('Erreur API feuilles de route:', error);
    return c.json({ error: 'Erreur lors de la récupération des feuilles de route' }, 500);
  }
});

app.get('/feuilles-route/:id', async (c) => {
  try {
    const feuille = await getFeuilleRouteById(c.req.param('id'));
    if (!feuille) {
      return c.json({ error: 'Feuille de route non trouvée' }, 404);
    }
    return c.json(feuille);
  } catch (error) {
    console.error('Erreur API feuille de route:', error);
    return c.json({ error: 'Erreur lors de la récupération de la feuille de route' }, 500);
  }
});

app.get('/chauffeurs/:chauffeurId/feuilles-route', async (c) => {
  try {
    const feuilles = await getFeuillesRouteByChauffeur(c.req.param('chauffeurId'), c.req.query('date'));
    return c.json(feuilles);
  } catch (error) {
    console.error('Erreur API feuilles de route chauffeur:', error);
    return c.json({ error: 'Erreur lors de la récupération des feuilles de route du chauffeur' }, 500);
  }
});

app.post('/feuilles-route', async (c) => {
  try {
    const body = await c.req.json();
    const feuille = await createFeuilleRoute(body);
    return c.json(feuille, 201);
  } catch (error) {
    console.error('Erreur API création feuille de route:', error);
    return c.json({ error: 'Erreur lors de la création de la feuille de route' }, 500);
  }
});

app.put('/feuilles-route/:id', async (c) => {
  try {
    const body = await c.req.json();
    const feuille = await updateFeuilleRoute(c.req.param('id'), body);
    return c.json(feuille);
  } catch (error) {
    console.error('Erreur API mise à jour feuille de route:', error);
    return c.json({ error: 'Erreur lors de la mise à jour de la feuille de route' }, 500);
  }
});

app.delete('/feuilles-route/:id', async (c) => {
  try {
    await deleteFeuilleRoute(c.req.param('id'));
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Erreur API suppression feuille de route:', error);
    return c.json({ error: 'Erreur lors de la suppression de la feuille de route' }, 500);
  }
});

// ==================== COURSES ====================

app.get('/courses', async (c) => {
  try {
    const courses = await getCourses();
    return c.json(courses);
  } catch (error) {
    console.error('Erreur API courses:', error);
    return c.json({ error: 'Erreur lors de la récupération des courses' }, 500);
  }
});

app.get('/feuilles-route/:feuilleId/courses', async (c) => {
  try {
    const courses = await getCoursesByFeuille(c.req.param('feuilleId'));
    return c.json(courses);
  } catch (error) {
    console.error('Erreur API courses de la feuille:', error);
    return c.json({ error: 'Erreur lors de la récupération des courses de la feuille' }, 500);
  }
});

app.post('/courses', async (c) => {
  try {
    const course = await createCourse(await c.req.json());
    return c.json(course, 201);
  } catch (error) {
    console.error('Erreur API création course:', error);
    return c.json({ error: 'Erreur lors de la création de la course' }, 500);
  }
});

app.put('/courses/:id', async (c) => {
  try {
    const course = await updateCourse(c.req.param('id'), await c.req.json());
    return c.json(course);
  } catch (error) {
    console.error('Erreur API mise à jour course:', error);
    return c.json({ error: 'Erreur lors de la mise à jour de la course' }, 500);
  }
});

app.delete('/courses/:id', async (c) => {
  try {
    await deleteCourse(c.req.param('id'));
    new Response(null, { status: 204 });
  } catch (error) {
    console.error('Erreur API suppression course:', error);
    return c.json({ error: 'Erreur lors de la suppression de la course' }, 500);
  }
});

// ==================== CHARGES ====================

app.get('/charges', async (c) => {
  try {
    const charges = await getCharges();
    return c.json(charges);
  } catch (error) {
    console.error('Erreur API charges:', error);
    return c.json({ error: 'Erreur lors de la récupération des charges' }, 500);
  }
});

app.get('/feuilles-route/:feuilleId/charges', async (c) => {
  try {
    const charges = await getChargesByFeuille(c.req.param('feuilleId'));
    return c.json(charges);
  } catch (error) {
    console.error('Erreur API charges de la feuille:', error);
    return c.json({ error: 'Erreur lors de la récupération des charges de la feuille' }, 500);
  }
});

app.post('/charges', async (c) => {
  try {
    const charge = await createCharge(await c.req.json());
    return c.json(charge, 201);
  } catch (error) {
    console.error('Erreur API création charge:', error);
    return c.json({ error: 'Erreur lors de la création de la charge' }, 500);
  }
});

app.put('/charges/:id', async (c) => {
  try {
    const charge = await updateCharge(c.req.param('id'), await c.req.json());
    return c.json(charge);
  } catch (error) {
    console.error('Erreur API mise à jour charge:', error);
    return c.json({ error: 'Erreur lors de la mise à jour de la charge' }, 500);
  }
});

app.delete('/charges/:id', async (c) => {
  try {
    await deleteCharge(c.req.param('id'));
    new Response(null, { status: 204 });
  } catch (error) {
    console.error('Erreur API suppression charge:', error);
    return c.json({ error: 'Erreur lors de la suppression de la charge' }, 500);
  }
});

// ==================== MODES DE PAIEMENT ====================

app.get('/modes-paiement', async (c) => {
  try {
    const modes = await getModesPaiement();
    return c.json(modes);
  } catch (error) {
    console.error('Erreur API modes de paiement:', error);
    return c.json({ error: 'Erreur lors de la récupération des modes de paiement' }, 500);
  }
});

app.post('/modes-paiement', async (c) => {
  try {
    const mode = await createModePaiement(await c.req.json());
    return c.json(mode, 201);
  } catch (error) {
    console.error('Erreur API création mode de paiement:', error);
    return c.json({ error: 'Erreur lors de la création du mode de paiement' }, 500);
  }
});

// ==================== RÈGLES DE SALAIRE ====================

app.get('/regles-salaire', async (c) => {
  try {
    const regles = await getReglesSalaire();
    return c.json(regles);
  } catch (error) {
    console.error('Erreur API règles de salaire:', error);
    return c.json({ error: 'Erreur lors de la récupération des règles de salaire' }, 500);
  }
});

app.post('/regles-salaire', async (c) => {
  try {
    const regle = await createRegleSalaire(await c.req.json());
    return c.json(regle, 201);
  } catch (error) {
    console.error('Erreur API création règle de salaire:', error);
    return c.json({ error: 'Erreur lors de la création de la règle de salaire' }, 500);
  }
});

// ==================== RÈGLES DE FACTURATION ====================

app.get('/regles-facturation', async (c) => {
  try {
    const regles = await getReglesFacturation();
    return c.json(regles);
  } catch (error) {
    console.error('Erreur API règles de facturation:', error);
    return c.json({ error: 'Erreur lors de la récupération des règles de facturation' }, 500);
  }
});

app.post('/regles-facturation', async (c) => {
  try {
    const regle = await createRegleFacturation(await c.req.json());
    return c.json(regle, 201);
  } catch (error) {
    console.error('Erreur API création règle de facturation:', error);
    return c.json({ error: 'Erreur lors de la création de la règle de facturation' }, 500);
  }
});

// ==================== PARTENAIRES ====================

app.get('/partenaires', async (c) => {
  try {
    const partenaires = await getPartenaires();
    return c.json(partenaires);
  } catch (error) {
    console.error('Erreur API partenaires:', error);
    return c.json({ error: 'Erreur lors de la récupération des partenaires' }, 500);
  }
});

app.post('/partenaires', async (c) => {
  try {
    const partenaire = await createPartenaire(await c.req.json());
    return c.json(partenaire, 201);
  } catch (error) {
    console.error('Erreur API création partenaire:', error);
    return c.json({ error: 'Erreur lors de la création du partenaire' }, 500);
  }
});

// ==================== SOCIÉTÉS TAXI ====================

app.get('/societes-taxi', async (c) => {
  try {
    const societes = await getSocietesTaxi();
    return c.json(societes);
  } catch (error) {
    console.error('Erreur API sociétés taxi:', error);
    return c.json({ error: 'Erreur lors de la récupération des sociétés taxi' }, 500);
  }
});

// ==================== ADMIN - REQUÊTES SPÉCIFIQUES ====================

app.get('/admin/chauffeur-by-date', async (c) => {
  try {
    const { date } = c.req.query;
    if (!date) {
      return c.json({ error: 'Date requise' }, 400);
    }
    const result = await findChauffeurByDate(date);
    return c.json(result);
  } catch (error) {
    console.error('Erreur API recherche chauffeur par date:', error);
    return c.json({ error: 'Erreur lors de la recherche' }, 500);
  }
});

app.get('/admin/vehicule-by-chauffeur-date', async (c) => {
  try {
    const { chauffeurId, date } = c.req.query;
    if (!chauffeurId || !date) {
      return c.json({ error: 'Chauffeur ID et date requis' }, 400);
    }
    const result = await findVehiculeByChauffeurAndDate(chauffeurId, date);
    return c.json(result);
  } catch (error) {
    console.error('Erreur API recherche véhicule par chauffeur et date:', error);
    return c.json({ error: 'Erreur lors de la recherche' }, 500);
  }
});

app.post('/admin/feuille-route/encode', async (c) => {
  try {
    const feuille = await encodeFeuilleRouteAdmin(await c.req.json());
    return c.json(feuille, 201);
  } catch (error) {
    console.error('Erreur API encodage admin feuille de route:', error);
    return c.json({ error: 'Erreur lors de l\'encodage admin' }, 500);
  }
});

export default app;
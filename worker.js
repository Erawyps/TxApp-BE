/* eslint-disable no-unused-vars */
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { sign, verify } from '@tsndr/cloudflare-worker-jwt';
import bcrypt from 'bcryptjs';
import postgres from 'postgres';

const app = new Hono();

// CORS pour toutes les routes
app.use('*', cors({
  origin: ['https://txapp.be', 'https://www.txapp.be'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Health check
app.get('/api/health', (c) => c.json({
  ok: true,
  env: 'worker',
  timestamp: new Date().toISOString(),
  database: 'connected'
}));

// Middleware pour initialiser la connexion PostgreSQL avec Hyperdrive
const dbMiddleware = async (c, next) => {
  try {
    const connectionString = c.env.HYPERDRIVE.connectionString;
    const sql = postgres(connectionString, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    c.set('db', sql);
    await next();
    await sql.end();
  } catch (error) {
    console.error('Database connection error:', error);
    return c.json({ error: 'Database connection error' }, 500);
  }
};

// Middleware pour vérifier le token JWT (optionnel)
const authMiddleware = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (token) {
    try {
      const secret = c.env.JWT_SECRET;
      const payload = await verify(token, secret);
      c.set('user', payload);
    } catch (error) {
      console.error('JWT verification error:', error);
    }
  }

  await next();
};

// Routes pour chauffeurs
app.get('/api/chauffeurs', dbMiddleware, authMiddleware, async (c) => {
  try {
    const sql = c.get('db');

    const chauffeurs = await sql`
      SELECT 
        c.id,
        c.numero_badge,
        c.date_embauche,
        c.type_contrat,
        c.taux_commission,
        c.salaire_base,
        c.actif,
        c.utilisateur_id,
        u.nom,
        u.prenom,
        u.telephone,
        u.email
      FROM chauffeur c
      LEFT JOIN utilisateur u ON c.utilisateur_id = u.id
      WHERE c.actif = true
      ORDER BY c.numero_badge ASC
    `;

    const formattedChauffeurs = chauffeurs.map(chauffeur => ({
      id: chauffeur.id,
      numero_badge: chauffeur.numero_badge,
      date_embauche: chauffeur.date_embauche,
      type_contrat: chauffeur.type_contrat,
      taux_commission: chauffeur.taux_commission,
      salaire_base: chauffeur.salaire_base,
      actif: chauffeur.actif,
      utilisateur_id: chauffeur.utilisateur_id,
      utilisateur: {
        id: chauffeur.utilisateur_id,
        nom: chauffeur.nom,
        prenom: chauffeur.prenom,
        telephone: chauffeur.telephone,
        email: chauffeur.email
      }
    }));

    return c.json(formattedChauffeurs);
  } catch (error) {
    console.error('Error fetching chauffeurs:', error);
    return c.json({ error: 'Erreur lors de la récupération des chauffeurs' }, 500);
  }
});

// Routes pour véhicules
app.get('/api/vehicules', dbMiddleware, authMiddleware, async (c) => {
  try {
    const sql = c.get('db');

    const vehicules = await sql`
      SELECT *
      FROM vehicule
      WHERE etat IN ('Disponible', 'En service')
      ORDER BY plaque_immatriculation ASC
    `;

    return c.json(vehicules);
  } catch (error) {
    console.error('Error fetching vehicules:', error);
    return c.json({ error: 'Erreur lors de la récupération des véhicules' }, 500);
  }
});

// Routes pour clients
app.get('/api/clients', dbMiddleware, authMiddleware, async (c) => {
  try {
    const sql = c.get('db');

    const clients = await sql`
      SELECT *
      FROM client
      WHERE actif = true
      ORDER BY nom ASC
    `;

    return c.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return c.json({ error: 'Erreur lors de la récupération des clients' }, 500);
  }
});

// Routes pour modes de paiement
app.get('/api/modes-paiement', dbMiddleware, authMiddleware, async (c) => {
  try {
    const sql = c.get('db');

    const modes = await sql`
      SELECT *
      FROM mode_paiement
      WHERE actif = true
      ORDER BY libelle ASC
    `;

    return c.json(modes);
  } catch (error) {
    console.error('Error fetching modes paiement:', error);
    return c.json({ error: 'Erreur lors de la récupération des modes de paiement' }, 500);
  }
});

// Route pour feuille de route active
app.get('/api/feuilles-route/active/:chauffeurId', dbMiddleware, authMiddleware, async (c) => {
  try {
    const chauffeurId = parseInt(c.req.param('chauffeurId'));
    const sql = c.get('db');

    const feuilleRoute = await sql`
      SELECT 
        fr.*,
        v.plaque_immatriculation,
        v.marque,
        v.modele,
        c.numero_badge,
        u.nom,
        u.prenom
      FROM feuille_route fr
      LEFT JOIN vehicule v ON fr.vehicule_id = v.id
      LEFT JOIN chauffeur c ON fr.chauffeur_id = c.id
      LEFT JOIN utilisateur u ON c.utilisateur_id = u.id
      WHERE fr.chauffeur_id = ${chauffeurId} AND fr.statut = 'En cours'
      ORDER BY fr.created_at DESC
      LIMIT 1
    `;

    if (feuilleRoute.length === 0) {
      return c.json(null);
    }

    const result = feuilleRoute[0];
    
    const formattedResult = {
      ...result,
      vehicule: {
        plaque_immatriculation: result.plaque_immatriculation,
        marque: result.marque,
        modele: result.modele
      },
      chauffeur: {
        numero_badge: result.numero_badge,
        utilisateur: {
          nom: result.nom,
          prenom: result.prenom
        }
      }
    };

    return c.json(formattedResult);
  } catch (error) {
    console.error('Error fetching active feuille route:', error);
    return c.json({ error: 'Erreur lors de la récupération de la feuille de route active' }, 500);
  }
});

// Routes pour courses
app.get('/api/courses', dbMiddleware, authMiddleware, async (c) => {
  try {
    const feuilleRouteId = c.req.query('feuilleRouteId');
    const sql = c.get('db');

    let query;
    if (feuilleRouteId) {
      query = sql`
        SELECT *
        FROM course
        WHERE feuille_route_id = ${parseInt(feuilleRouteId)}
        ORDER BY numero_ordre ASC
      `;
    } else {
      query = sql`
        SELECT *
        FROM course
        ORDER BY numero_ordre ASC
      `;
    }
    
    const courses = await query;
    return c.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return c.json({ error: 'Erreur lors de la récupération des courses' }, 500);
  }
});

// Routes pour charges
app.get('/api/charges', dbMiddleware, authMiddleware, async (c) => {
  try {
    const feuilleRouteId = c.req.query('feuilleRouteId');
    const sql = c.get('db');
    
    const charges = await sql`
      SELECT c.*, mp.libelle as mode_paiement_libelle
      FROM charge c
      LEFT JOIN mode_paiement mp ON c.mode_paiement_id = mp.id
      WHERE c.feuille_route_id = ${parseInt(feuilleRouteId)}
      ORDER BY c.created_at DESC
    `;

    return c.json(charges);
  } catch (error) {
    console.error('Error fetching charges:', error);
    return c.json({ error: 'Erreur lors de la récupération des charges' }, 500);
  }
});

// Créer une nouvelle feuille de route
app.post('/api/feuilles-route', dbMiddleware, authMiddleware, async (c) => {
  try {
    const data = await c.req.json();
    const sql = c.get('db');

    const result = await sql`
      INSERT INTO feuille_route (
        chauffeur_id, vehicule_id, date, heure_debut, km_debut,
        prise_en_charge_debut, chutes_debut, statut, saisie_mode, notes
      ) VALUES (
        ${data.chauffeur_id}, ${data.vehicule_id}, ${data.date}, ${data.heure_debut}, ${data.km_debut},
        ${data.prise_en_charge_debut || null}, ${data.chutes_debut || null}, 'En cours', 'chauffeur', ${data.notes || null}
      ) RETURNING *
    `;

    return c.json(result[0]);
  } catch (error) {
    console.error('Error creating feuille route:', error);
    return c.json({ error: 'Erreur lors de la création de la feuille de route' }, 500);
  }
});

// Servir les assets statiques
app.get('*', async (c) => {
  try {
    return c.env.ASSETS.fetch(c.req.raw);
  } catch (error) {
    return new Response('Not Found', { status: 404 });
  }
});

export default app;

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

// Middleware pour hash des mots de passe
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
};

// Middleware pour vérifier les mots de passe
const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Route de connexion (login)
app.post('/api/auth/login', dbMiddleware, async (c) => {
  try {
    const { username, password } = await c.req.json();

    if (!username || !password) {
      return c.json({ error: 'Nom d\'utilisateur et mot de passe requis' }, 400);
    }

    const sql = c.get('db');

    // Rechercher l'utilisateur par email ou nom d'utilisateur
    const users = await sql`
      SELECT 
        u.id,
        u.nom,
        u.prenom,
        u.email,
        u.telephone,
        u.mot_de_passe,
        u.type_utilisateur,
        u.actif,
        u.derniere_connexion,
        c.id as chauffeur_id,
        c.numero_badge
      FROM utilisateur u
      LEFT JOIN chauffeur c ON u.id = c.utilisateur_id
      WHERE (u.email = ${username} OR u.nom_utilisateur = ${username})
      AND u.actif = true
      LIMIT 1
    `;

    if (users.length === 0) {
      return c.json({ error: 'Identifiants invalides' }, 401);
    }

    const user = users[0];

    // Vérifier le mot de passe
    const isValidPassword = await verifyPassword(password, user.mot_de_passe);

    if (!isValidPassword) {
      return c.json({ error: 'Identifiants invalides' }, 401);
    }

    // Mettre à jour la dernière connexion
    await sql`
      UPDATE utilisateur 
      SET derniere_connexion = NOW() 
      WHERE id = ${user.id}
    `;

    // Créer le token JWT
    const payload = {
      id: user.id,
      email: user.email,
      type: user.type_utilisateur,
      chauffeur_id: user.chauffeur_id,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24h
    };

    const token = await sign(payload, c.env.JWT_SECRET);

    // Retourner les données utilisateur (sans mot de passe)
    const userData = {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone,
      type_utilisateur: user.type_utilisateur,
      chauffeur_id: user.chauffeur_id,
      numero_badge: user.numero_badge,
      derniere_connexion: user.derniere_connexion
    };

    return c.json({
      success: true,
      user: userData,
      token,
      message: 'Connexion réussie'
    });

  } catch (error) {
    console.error('Error during login:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

// Route d'inscription (register)
app.post('/api/auth/register', dbMiddleware, async (c) => {
  try {
    const { nom, prenom, email, telephone, password, type_utilisateur } = await c.req.json();

    // Validation des données
    if (!nom || !prenom || !email || !password) {
      return c.json({ error: 'Tous les champs obligatoires doivent être remplis' }, 400);
    }

    // Validation du mot de passe
    if (password.length < 8) {
      return c.json({ error: 'Le mot de passe doit contenir au moins 8 caractères' }, 400);
    }

    const sql = c.get('db');

    // Vérifier si l'utilisateur existe déjà
    const existingUsers = await sql`
      SELECT id FROM utilisateur 
      WHERE email = ${email} 
      LIMIT 1
    `;

    if (existingUsers.length > 0) {
      return c.json({ error: 'Un utilisateur avec cet email existe déjà' }, 409);
    }

    // Hasher le mot de passe
    const hashedPassword = await hashPassword(password);

    // Créer l'utilisateur
    const newUsers = await sql`
      INSERT INTO utilisateur (
        nom, prenom, email, telephone, mot_de_passe, type_utilisateur, actif
      ) VALUES (
        ${nom}, ${prenom}, ${email}, ${telephone || null}, ${hashedPassword}, 
        ${type_utilisateur || 'CLIENT'}, true
      ) RETURNING id, nom, prenom, email, telephone, type_utilisateur
    `;

    const newUser = newUsers[0];

    return c.json({
      success: true,
      user: newUser,
      message: 'Inscription réussie'
    });

  } catch (error) {
    console.error('Error during registration:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

// Route de vérification du token
app.get('/api/auth/verify', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Token invalide' }, 401);
    }

    const sql = c.get('db');

    // Récupérer les données utilisateur actualisées
    const users = await sql`
      SELECT 
        u.id,
        u.nom,
        u.prenom,
        u.email,
        u.telephone,
        u.type_utilisateur,
        u.actif,
        c.id as chauffeur_id,
        c.numero_badge
      FROM utilisateur u
      LEFT JOIN chauffeur c ON u.id = c.utilisateur_id
      WHERE u.id = ${user.id} AND u.actif = true
      LIMIT 1
    `;

    if (users.length === 0) {
      return c.json({ error: 'Utilisateur non trouvé' }, 404);
    }

    const userData = users[0];

    return c.json({
      success: true,
      user: userData,
      message: 'Token valide'
    });

  } catch (error) {
    console.error('Error during token verification:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

// Route de déconnexion
app.post('/api/auth/logout', authMiddleware, async (c) => {
  try {
    // En JWT, la déconnexion côté serveur est principalement symbolique
    // Le client doit supprimer le token de son côté
    return c.json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    console.error('Error during logout:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

// Route de rafraîchissement du token
app.post('/api/auth/refresh', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Token invalide' }, 401);
    }

    // Créer un nouveau token avec une nouvelle expiration
    const payload = {
      id: user.id,
      email: user.email,
      type: user.type,
      chauffeur_id: user.chauffeur_id,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24h
    };

    const newToken = await sign(payload, c.env.JWT_SECRET);

    return c.json({
      success: true,
      token: newToken,
      message: 'Token rafraîchi'
    });

  } catch (error) {
    console.error('Error during token refresh:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

// Route de changement de mot de passe
app.post('/api/auth/change-password', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { currentPassword, newPassword } = await c.req.json();

    if (!currentPassword || !newPassword) {
      return c.json({ error: 'Mot de passe actuel et nouveau mot de passe requis' }, 400);
    }

    if (newPassword.length < 8) {
      return c.json({ error: 'Le nouveau mot de passe doit contenir au moins 8 caractères' }, 400);
    }

    const sql = c.get('db');

    // Récupérer le mot de passe actuel
    const users = await sql`
      SELECT mot_de_passe FROM utilisateur 
      WHERE id = ${user.id} AND actif = true
      LIMIT 1
    `;

    if (users.length === 0) {
      return c.json({ error: 'Utilisateur non trouvé' }, 404);
    }

    // Vérifier le mot de passe actuel
    const isValidPassword = await verifyPassword(currentPassword, users[0].mot_de_passe);

    if (!isValidPassword) {
      return c.json({ error: 'Mot de passe actuel incorrect' }, 400);
    }

    // Hasher le nouveau mot de passe
    const hashedNewPassword = await hashPassword(newPassword);

    // Mettre à jour le mot de passe
    await sql`
      UPDATE utilisateur 
      SET mot_de_passe = ${hashedNewPassword}, updated_at = NOW()
      WHERE id = ${user.id}
    `;

    return c.json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    });

  } catch (error) {
    console.error('Error during password change:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

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

// Routes pour le dashboard
app.get('/api/dashboard/courses', dbMiddleware, authMiddleware, async (c) => {
  try {
    const url = new URL(c.req.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 10;
    const offset = (page - 1) * limit;

    const sql = c.get('db');

    // Récupérer les courses avec pagination
    const courses = await sql`
      SELECT
        c.*,
        json_build_object(
          'id', cl.id,
          'nom', cl.nom,
          'prenom', cl.prenom
        ) as client,
        json_build_object(
          'id', fr.id,
          'date', fr.date,
          'heure_debut', fr.heure_debut,
          'heure_fin', fr.heure_fin,
          'chauffeur', json_build_object(
            'id', ch.id,
            'numero_badge', ch.numero_badge,
            'utilisateur', json_build_object(
              'nom', u.nom,
              'prenom', u.prenom
            )
          ),
          'vehicule', json_build_object(
            'id', v.id,
            'plaque_immatriculation', v.plaque_immatriculation,
            'marque', v.marque,
            'modele', v.modele
          )
        ) as feuille_route,
        json_build_object(
          'id', mp.id,
          'libelle', mp.libelle
        ) as mode_paiement
      FROM course c
      LEFT JOIN client cl ON c.client_id = cl.id
      LEFT JOIN feuille_route fr ON c.feuille_route_id = fr.id
      LEFT JOIN chauffeur ch ON fr.chauffeur_id = ch.id
      LEFT JOIN utilisateur u ON ch.utilisateur_id = u.id
      LEFT JOIN vehicule v ON fr.vehicule_id = v.id
      LEFT JOIN mode_paiement mp ON c.mode_paiement_id = mp.id
      ORDER BY c.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    // Compter le nombre total de courses
    const totalResult = await sql`SELECT COUNT(*) as count FROM course`;
    const total = parseInt(totalResult[0].count);

    return c.json({
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard courses:', error);
    return c.json({ error: 'Erreur lors de la récupération des courses du dashboard' }, 500);
  }
});

// Route pour les statistiques des courses
app.get('/api/dashboard/courses/stats', dbMiddleware, authMiddleware, async (c) => {
  try {
    const url = new URL(c.req.url);
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');
    const chauffeurId = url.searchParams.get('chauffeurId');

    const sql = c.get('db');

    // Construire la clause WHERE
    let whereClause = '';
    const params = [];

    if (dateFrom) {
      whereClause += ' AND c.created_at >= $' + (params.length + 1);
      params.push(dateFrom);
    }
    if (dateTo) {
      whereClause += ' AND c.created_at <= $' + (params.length + 1);
      params.push(dateTo);
    }
    if (chauffeurId) {
      whereClause += ' AND fr.chauffeur_id = $' + (params.length + 1);
      params.push(parseInt(chauffeurId));
    }

    // Nombre total de courses
    const totalCoursesResult = await sql`
      SELECT COUNT(*) as count
      FROM course c
      LEFT JOIN feuille_route fr ON c.feuille_route_id = fr.id
      WHERE 1=1 ${whereClause}
    `;

    // Revenus totaux
    const totalRevenueResult = await sql`
      SELECT COALESCE(SUM(c.somme_percue), 0) as revenue
      FROM course c
      LEFT JOIN feuille_route fr ON c.feuille_route_id = fr.id
      WHERE 1=1 ${whereClause}
    `;

    // Distance totale
    const totalDistanceResult = await sql`
      SELECT COALESCE(SUM(c.distance_km), 0) as distance
      FROM course c
      LEFT JOIN feuille_route fr ON c.feuille_route_id = fr.id
      WHERE 1=1 ${whereClause}
    `;

    // Nombre de chauffeurs actifs
    const chauffeursActifsResult = await sql`
      SELECT COUNT(DISTINCT fr.chauffeur_id) as count
      FROM course c
      LEFT JOIN feuille_route fr ON c.feuille_route_id = fr.id
      WHERE fr.chauffeur_id IS NOT NULL ${whereClause}
    `;

    // Nombre de véhicules utilisés
    const vehiculesUtilisesResult = await sql`
      SELECT COUNT(DISTINCT fr.vehicule_id) as count
      FROM course c
      LEFT JOIN feuille_route fr ON c.feuille_route_id = fr.id
      WHERE fr.vehicule_id IS NOT NULL ${whereClause}
    `;

    const totalCourses = parseInt(totalCoursesResult[0].count);
    const totalRevenue = parseFloat(totalRevenueResult[0].revenue);
    const totalDistance = parseInt(totalDistanceResult[0].distance);
    const chauffeursActifs = parseInt(chauffeursActifsResult[0].count);
    const vehiculesUtilises = parseInt(vehiculesUtilisesResult[0].count);

    // Calculer les moyennes
    const averageEarningsPerTrip = totalCourses > 0 ? totalRevenue / totalCourses : 0;
    const averageDistancePerTrip = totalCourses > 0 ? totalDistance / totalCourses : 0;

    return c.json({
      totalCourses,
      totalRevenue,
      totalDistance,
      chauffeursActifs,
      vehiculesUtilises,
      averageEarningsPerTrip: Math.round(averageEarningsPerTrip * 100) / 100,
      averageDistancePerTrip: Math.round(averageDistancePerTrip * 100) / 100
    });
  } catch (error) {
    console.error('Error fetching dashboard courses stats:', error);
    return c.json({ error: 'Erreur lors de la récupération des statistiques des courses' }, 500);
  }
});

// Route pour les données de graphique
app.get('/api/dashboard/courses/chart-data', dbMiddleware, authMiddleware, async (c) => {
  try {
    const url = new URL(c.req.url);
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');
    const type = url.searchParams.get('type');

    const sql = c.get('db');

    let data = [];
    let whereClause = '';
    const params = [];

    if (dateFrom) {
      whereClause += ' AND created_at >= $' + (params.length + 1);
      params.push(dateFrom);
    }
    if (dateTo) {
      whereClause += ' AND created_at <= $' + (params.length + 1);
      params.push(dateTo);
    }

    switch (type) {
      case 'trips-count': {
        // Nombre de courses par jour
        const tripsData = await sql`
          SELECT
            DATE(created_at) as date,
            COUNT(*) as count
          FROM course
          WHERE 1=1 ${whereClause}
          GROUP BY DATE(created_at)
          ORDER BY DATE(created_at)
        `;
        data = tripsData.map(row => ({
          date: row.date,
          count: parseInt(row.count)
        }));
        break;
      }

      case 'daily-revenue': {
        // Revenus quotidiens
        const revenueData = await sql`
          SELECT
            DATE(created_at) as date,
            COALESCE(SUM(somme_percue), 0) as revenue
          FROM course
          WHERE 1=1 ${whereClause}
          GROUP BY DATE(created_at)
          ORDER BY DATE(created_at)
        `;
        data = revenueData.map(row => ({
          date: row.date,
          revenue: parseFloat(row.revenue)
        }));
        break;
      }

      case 'payment-methods': {
        // Distribution des méthodes de paiement
        const paymentData = await sql`
          SELECT
            mp.libelle as method,
            COUNT(c.id) as count
          FROM course c
          LEFT JOIN mode_paiement mp ON c.mode_paiement_id = mp.id
          WHERE 1=1 ${whereClause}
          GROUP BY mp.libelle
          ORDER BY count DESC
        `;
        data = paymentData.map(row => ({
          method: row.method,
          count: parseInt(row.count)
        }));
        break;
      }

      case 'driver-performance': {
        // Performance des chauffeurs
        const driverData = await sql`
          SELECT
            u.nom,
            u.prenom,
            COUNT(c.id) as trips_count,
            COALESCE(SUM(c.somme_percue), 0) as total_revenue
          FROM course c
          LEFT JOIN feuille_route fr ON c.feuille_route_id = fr.id
          LEFT JOIN chauffeur ch ON fr.chauffeur_id = ch.id
          LEFT JOIN utilisateur u ON ch.utilisateur_id = u.id
          WHERE u.nom IS NOT NULL AND u.prenom IS NOT NULL ${whereClause}
          GROUP BY u.nom, u.prenom
          ORDER BY total_revenue DESC
        `;
        data = driverData.map(row => ({
          nom: row.nom,
          prenom: row.prenom,
          trips_count: parseInt(row.trips_count),
          total_revenue: parseFloat(row.total_revenue),
          avg_revenue: parseInt(row.trips_count) > 0 ? parseFloat(row.total_revenue) / parseInt(row.trips_count) : 0
        }));
        break;
      }

      default:
        return c.json({ error: 'Type de graphique non supporté' }, 400);
    }

    return c.json({ data });
  } catch (error) {
    console.error('Error fetching dashboard courses chart data:', error);
    return c.json({ error: 'Erreur lors de la récupération des données de graphique' }, 500);
  }
});

// Servir les assets statiques

export default app;

/* eslint-disable no-unused-vars */
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { sign, verify } from '@tsndr/cloudflare-worker-jwt';
import bcrypt from 'bcryptjs';
import postgres from 'postgres';

const app = new Hono();

// CORS pour les routes API
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

// Health check
app.get('/api/health', (c) => c.json({ ok: true, env: 'worker' }));

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

// Middleware pour vérifier le token JWT
const authMiddleware = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return c.json({ error: 'Token manquant' }, 401);
  }

  try {
    const secret = c.env.JWT_SECRET;
    const payload = await verify(token, secret);
    c.set('user', payload);
    await next();
  } catch {
    return c.json({ error: 'Token invalide' }, 401);
  }
};

// Route de connexion
app.post('/api/auth/login', dbMiddleware, async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email et mot de passe requis' }, 400);
    }

    const sql = c.get('db');

    const users = await sql`
      SELECT * FROM utilisateur
      WHERE email = ${email} AND actif = true
        LIMIT 1
    `;

    const user = users[0];

    if (!user) {
      return c.json({ error: 'Email ou mot de passe incorrect' }, 401);
    }

    const passwordValid = await bcrypt.compare(password, user.mot_de_passe);

    if (!passwordValid) {
      return c.json({ error: 'Email ou mot de passe incorrect' }, 401);
    }

    const secret = c.env.JWT_SECRET;
    const token = await sign(
      {
        sub: user.id.toString(),
        email: user.email,
        role: user.type_utilisateur,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
      },
      secret
    );

    const { mot_de_passe, ...userWithoutPassword } = user;

    return c.json({
      user: userWithoutPassword,
      token,
    });

  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
});

// Route d'inscription
app.post('/api/auth/register', dbMiddleware, async (c) => {
  try {
    const { email, password, nom, prenom, telephone, type_utilisateur = 'chauffeur' } = await c.req.json();

    if (!email || !password || !nom) {
      return c.json({ error: 'Email, mot de passe et nom requis' }, 400);
    }

    const sql = c.get('db');

    const existingUsers = await sql`
      SELECT id FROM utilisateur WHERE email = ${email} LIMIT 1
    `;

    if (existingUsers.length > 0) {
      return c.json({ error: 'Cet email est déjà utilisé' }, 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUsers = await sql`
      INSERT INTO utilisateur
      (email, mot_de_passe, nom, prenom, telephone, type_utilisateur, actif, created_at, updated_at)
      VALUES
        (${email}, ${hashedPassword}, ${nom}, ${prenom || ''}, ${telephone || ''}, ${type_utilisateur}, true, NOW(), NOW())
        RETURNING *
    `;

    const user = newUsers[0];

    const secret = c.env.JWT_SECRET;
    const token = await sign(
      {
        sub: user.id.toString(),
        email: user.email,
        role: user.type_utilisateur,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
      },
      secret
    );

    const { mot_de_passe, ...userWithoutPassword } = user;

    return c.json({
      user: userWithoutPassword,
      token,
    });

  } catch (error) {
    console.error('Register error:', error);
    return c.json({ error: 'Erreur lors de la création du compte' }, 500);
  }
});

// Route de vérification du token
app.get('/api/auth/verify', authMiddleware, dbMiddleware, async (c) => {
  try {
    const userPayload = c.get('user');
    const sql = c.get('db');

    const users = await sql`
      SELECT * FROM utilisateur
      WHERE id = ${parseInt(userPayload.sub)} AND actif = true
        LIMIT 1
    `;

    const user = users[0];

    if (!user) {
      return c.json({ error: 'Utilisateur non trouvé' }, 404);
    }

    const { mot_de_passe, ...userWithoutPassword } = user;
    return c.json({ user: userWithoutPassword });

  } catch (error) {
    console.error('Verify error:', error);
    return c.json({ error: 'Erreur de vérification' }, 500);
  }
});

// Routes des chauffeurs
app.get('/api/chauffeurs', authMiddleware, dbMiddleware, async (c) => {
  try {
    const sql = c.get('db');

    const chauffeurs = await sql`
      SELECT c.*, u.nom, u.prenom, u.email, u.telephone, u.role,
             rs.nom as regle_salaire_nom, rs.type_regle, rs.taux_fixe, rs.taux_variable
      FROM chauffeur c
             JOIN utilisateur u ON c.utilisateur_id = u.id
             LEFT JOIN regle_salaire rs ON c.regle_salaire_id = rs.id
      WHERE c.actif = true AND u.actif = true
      ORDER BY c.created_at DESC
    `;

    return c.json(chauffeurs);
  } catch (error) {
    console.error('Error fetching chauffeurs:', error);
    return c.json({ error: 'Erreur lors de la récupération des chauffeurs' }, 500);
  }
});

app.post('/api/chauffeurs', authMiddleware, dbMiddleware, async (c) => {
  try {
    const {
      utilisateur_id,
      numero_badge,
      date_embauche,
      type_contrat,
      compte_bancaire,
      taux_commission,
      salaire_base,
      regle_salaire_id,
      notes
    } = await c.req.json();

    if (!numero_badge || !date_embauche) {
      return c.json({ error: 'Numéro de badge et date d\'embauche requis' }, 400);
    }

    const sql = c.get('db');

    const existingChauffeur = await sql`
      SELECT id FROM chauffeur WHERE numero_badge = ${numero_badge} LIMIT 1
    `;

    if (existingChauffeur.length > 0) {
      return c.json({ error: 'Ce numéro de badge est déjà utilisé' }, 409);
    }

    const nouveauChauffeur = await sql`
      INSERT INTO chauffeur
      (utilisateur_id, numero_badge, date_embauche, type_contrat, compte_bancaire,
       taux_commission, salaire_base, regle_salaire_id, notes, actif)
      VALUES
        (${utilisateur_id || null}, ${numero_badge}, ${date_embauche}, ${type_contrat || null},
         ${compte_bancaire || null}, ${taux_commission || 0}, ${salaire_base || 0},
         ${regle_salaire_id || null}, ${notes || null}, true)
        RETURNING *
    `;

    return c.json({
      message: 'Chauffeur créé avec succès',
      chauffeur: nouveauChauffeur[0]
    }, 201);

  } catch (error) {
    console.error('Error creating chauffeur:', error);
    return c.json({ error: 'Erreur lors de la création du chauffeur' }, 500);
  }
});

// Routes des véhicules
app.get('/api/vehicules', authMiddleware, dbMiddleware, async (c) => {
  try {
    const sql = c.get('db');

    const vehicules = await sql`
      SELECT * FROM vehicule
      WHERE actif = true
      ORDER BY created_at DESC
    `;

    return c.json(vehicules);
  } catch (error) {
    console.error('Error fetching vehicules:', error);
    return c.json({ error: 'Erreur lors de la récupération des véhicules' }, 500);
  }
});

app.post('/api/vehicules', authMiddleware, dbMiddleware, async (c) => {
  try {
    const {
      numero_plaque,
      marque,
      modele,
      annee,
      couleur,
      numero_chassis,
      date_mise_service,
      capacite_passagers,
      type_carburant,
      consommation_moy,
      notes
    } = await c.req.json();

    if (!numero_plaque || !marque || !modele) {
      return c.json({ error: 'Numéro de plaque, marque et modèle requis' }, 400);
    }

    const sql = c.get('db');

    const nouveauVehicule = await sql`
      INSERT INTO vehicule
      (numero_plaque, marque, modele, annee, couleur, numero_chassis,
       date_mise_service, capacite_passagers, type_carburant, consommation_moy, notes, actif)
      VALUES
        (${numero_plaque}, ${marque}, ${modele}, ${annee || null}, ${couleur || null},
         ${numero_chassis || null}, ${date_mise_service || null}, ${capacite_passagers || 4},
         ${type_carburant || 'Essence'}, ${consommation_moy || null}, ${notes || null}, true)
        RETURNING *
    `;

    return c.json({
      message: 'Véhicule créé avec succès',
      vehicule: nouveauVehicule[0]
    }, 201);

  } catch (error) {
    console.error('Error creating vehicule:', error);
    return c.json({ error: 'Erreur lors de la création du véhicule' }, 500);
  }
});

// Routes des courses
app.get('/api/courses', authMiddleware, dbMiddleware, async (c) => {
  try {
    const { page = 1, limit = 50, date_debut, date_fin, chauffeur_id } = c.req.query();
    const sql = c.get('db');

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereConditions = [];

    if (date_debut && date_fin) {
      whereConditions.push(`co.heure_embarquement >= '${date_debut}' AND co.heure_embarquement <= '${date_fin}'`);
    }

    if (chauffeur_id) {
      whereConditions.push(`fr.chauffeur_id = ${parseInt(chauffeur_id)}`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const courses = await sql.unsafe(`
      SELECT co.*, cl.nom as client_nom, cl.prenom as client_prenom,
             u.nom as chauffeur_nom, u.prenom as chauffeur_prenom,
             v.numero_plaque, v.marque, v.modele,
             mp.libelle as mode_paiement_libelle
      FROM course co
             JOIN feuille_route fr ON co.feuille_route_id = fr.id
             JOIN chauffeur c ON fr.chauffeur_id = c.id
             JOIN utilisateur u ON c.utilisateur_id = u.id
             JOIN vehicule v ON fr.vehicule_id = v.id
             LEFT JOIN client cl ON co.client_id = cl.id
             LEFT JOIN mode_paiement mp ON co.mode_paiement_id = mp.id
        ${whereClause}
      ORDER BY co.heure_embarquement DESC
        LIMIT ${parseInt(limit)} OFFSET ${offset}
    `);

    const totalResult = await sql.unsafe(`
      SELECT COUNT(*) as total
      FROM course co
             JOIN feuille_route fr ON co.feuille_route_id = fr.id
        ${whereClause}
    `);

    const total = parseInt(totalResult[0].total);

    return c.json({
      courses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching courses:', error);
    return c.json({ error: 'Erreur lors de la récupération des courses' }, 500);
  }
});

// Routes des clients
app.get('/api/clients', authMiddleware, dbMiddleware, async (c) => {
  try {
    const sql = c.get('db');

    const clients = await sql`
      SELECT cl.*,
             COUNT(co.id) as nb_courses,
             SUM(co.somme_percue) as total_depense
      FROM client cl
             LEFT JOIN course co ON cl.id = co.client_id
      WHERE cl.actif = true
      GROUP BY cl.id
      ORDER BY cl.created_at DESC
    `;

    return c.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return c.json({ error: 'Erreur lors de la récupération des clients' }, 500);
  }
});

// Routes des modes de paiement
app.get('/api/modes-paiement', authMiddleware, dbMiddleware, async (c) => {
  try {
    const sql = c.get('db');

    const modesPaiement = await sql`
      SELECT * FROM mode_paiement
      WHERE actif = true
      ORDER BY libelle ASC
    `;

    return c.json(modesPaiement);
  } catch (error) {
    console.error('Error fetching modes paiement:', error);
    return c.json({ error: 'Erreur lors de la récupération des modes de paiement' }, 500);
  }
});

// Routes des règles de salaire
app.get('/api/regles-salaire', authMiddleware, dbMiddleware, async (c) => {
  try {
    const sql = c.get('db');

    const reglesSalaire = await sql`
      SELECT * FROM regle_salaire
      WHERE actif = true
      ORDER BY nom ASC
    `;

    return c.json(reglesSalaire);
  } catch (error) {
    console.error('Error fetching regles salaire:', error);
    return c.json({ error: 'Erreur lors de la récupération des règles de salaire' }, 500);
  }
});

// Route pour les statistiques du tableau de bord
app.get('/api/dashboard/stats', authMiddleware, dbMiddleware, async (c) => {
  try {
    const sql = c.get('db');

    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    const stats = await sql`
      SELECT
          (SELECT COUNT(*) FROM chauffeur WHERE actif = true) as total_chauffeurs,
          (SELECT COUNT(*) FROM vehicule WHERE actif = true) as total_vehicules,
          (SELECT COUNT(*) FROM client WHERE actif = true) as total_clients,
          (SELECT COUNT(*) FROM course co
                                  JOIN feuille_route fr ON co.feuille_route_id = fr.id
           WHERE fr.date = ${today}) as courses_aujourdhui,
          (SELECT COUNT(*) FROM course co
                                  JOIN feuille_route fr ON co.feuille_route_id = fr.id
           WHERE fr.date >= ${firstDayOfMonth}) as courses_mois,
          (SELECT COALESCE(SUM(somme_percue), 0) FROM course co
                                                        JOIN feuille_route fr ON co.feuille_route_id = fr.id
           WHERE fr.date >= ${firstDayOfMonth}) as chiffre_affaires_mois
    `;

    return c.json(stats[0]);

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return c.json({ error: 'Erreur lors de la récupération des statistiques' }, 500);
  }
});

// Test de connexion à la base de données
app.get('/api/test-db', dbMiddleware, async (c) => {
  try {
    const sql = c.get('db');
    const result = await sql`SELECT NOW() as current_time, version() as db_version`;
    return c.json({
      success: true,
      time: result[0].current_time,
      version: result[0].db_version
    });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Route pour servir les fichiers statiques (React app)
app.get('*', async (c) => {
  try {
    return c.env.ASSETS.fetch(c.req.raw);
  } catch (error) {
    return c.text('Application non trouvée', 404);
  }
});

export default app;

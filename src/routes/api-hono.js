import { Hono } from 'hono';
import { createPrismaClientWithEnv } from '../configs/database.config.js';
import jwt from 'jsonwebtoken';

const api = new Hono();

// Create Prisma client
const prisma = createPrismaClientWithEnv(process.env);

// Helper: Auth middleware
const authenticateToken = async (c, next) => {
  const authHeader = c.req.header('authorization');
  const token = authHeader?.split(' ')[1];
  if (!token) {
    return c.json({ error: 'Access token required' }, 401);
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    c.set('user', decoded);
    await next();
  } catch {
    return c.json({ error: 'Invalid token' }, 403);
  }
};

// Chauffeur APIs
api.get('/chauffeurs', authenticateToken, async (c) => {
  try {
    const chauffeurs = await prisma.chauffeur.findMany({
      include: {
        utilisateur: true,
        regle_salaire: true,
        vehicules: {
          include: {
            vehicule: true
          }
        }
      }
    });
    return c.json(chauffeurs);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

api.get('/chauffeurs/:id', authenticateToken, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const chauffeur = await prisma.chauffeur.findUnique({
      where: { id },
      include: {
        utilisateur: true,
        regle_salaire: true,
        vehicules: {
          include: {
            vehicule: true
          }
        }
      }
    });
    if (!chauffeur) return c.json({ error: 'Chauffeur not found' }, 404);
    return c.json(chauffeur);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

api.post('/chauffeurs', authenticateToken, async (c) => {
  try {
    const data = await c.req.json();
    const chauffeur = await prisma.chauffeur.create({ data });
    return c.json(chauffeur, 201);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});

api.put('/chauffeurs/:id', authenticateToken, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const data = await c.req.json();
    const chauffeur = await prisma.chauffeur.update({
      where: { id },
      data,
    });
    return c.json(chauffeur);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});

api.delete('/chauffeurs/:id', authenticateToken, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    await prisma.chauffeur.delete({ where: { id } });
    return c.json({ message: 'Chauffeur deleted' }, 204);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Vehicule APIs
api.get('/vehicules', authenticateToken, async (c) => {
  try {
    const vehicules = await prisma.vehicule.findMany({
      include: {
        chauffeurs: {
          include: {
            chauffeur: true
          }
        }
      }
    });
    return c.json(vehicules);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

api.get('/vehicules/:id', authenticateToken, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const vehicule = await prisma.vehicule.findUnique({
      where: { id },
      include: {
        chauffeurs: {
          include: {
            chauffeur: true
          }
        }
      }
    });
    if (!vehicule) return c.json({ error: 'Vehicule not found' }, 404);
    return c.json(vehicule);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

api.post('/vehicules', authenticateToken, async (c) => {
  try {
    const data = await c.req.json();
    const vehicule = await prisma.vehicule.create({ data });
    return c.json(vehicule, 201);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});

api.put('/vehicules/:id', authenticateToken, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const data = await c.req.json();
    const vehicule = await prisma.vehicule.update({
      where: { id },
      data,
    });
    return c.json(vehicule);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});

api.delete('/vehicules/:id', authenticateToken, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    await prisma.vehicule.delete({ where: { id } });
    return c.json({ message: 'Vehicule deleted' }, 204);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Course APIs
api.get('/courses', authenticateToken, async (c) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        client: true,
        feuille_route: true,
        mode_paiement: true
      }
    });
    return c.json(courses);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

api.get('/courses/:id', authenticateToken, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        client: true,
        feuille_route: true,
        mode_paiement: true
      }
    });
    if (!course) return c.json({ error: 'Course not found' }, 404);
    return c.json(course);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

api.post('/courses', authenticateToken, async (c) => {
  try {
    const data = await c.req.json();
    const course = await prisma.course.create({ data });
    return c.json(course, 201);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});

api.put('/courses/:id', authenticateToken, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const data = await c.req.json();
    const course = await prisma.course.update({
      where: { id },
      data,
    });
    return c.json(course);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});

api.delete('/courses/:id', authenticateToken, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    await prisma.course.delete({ where: { id } });
    return c.json({ message: 'Course deleted' }, 204);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Feuille Route APIs
api.get('/feuille-routes', authenticateToken, async (c) => {
  try {
    const feuilles = await prisma.feuille_route.findMany({
      include: {
        chauffeur: true,
        vehicule: true,
        course: true
      }
    });
    return c.json(feuilles);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

api.get('/feuille-routes/:id', authenticateToken, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const feuille = await prisma.feuille_route.findUnique({
      where: { id },
      include: {
        chauffeur: true,
        vehicule: true,
        course: true
      }
    });
    if (!feuille) return c.json({ error: 'Feuille route not found' }, 404);
    return c.json(feuille);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

api.post('/feuille-routes', authenticateToken, async (c) => {
  try {
    const data = await c.req.json();
    const feuille = await prisma.feuille_route.create({ data });
    return c.json(feuille, 201);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});

api.put('/feuille-routes/:id', authenticateToken, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const data = await c.req.json();
    const feuille = await prisma.feuille_route.update({
      where: { id },
      data,
    });
    return c.json(feuille);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});

api.delete('/feuille-routes/:id', authenticateToken, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    await prisma.feuille_route.delete({ where: { id } });
    return c.json({ message: 'Feuille route deleted' }, 204);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Client APIs
api.get('/clients', authenticateToken, async (c) => {
  try {
    const clients = await prisma.client.findMany();
    return c.json(clients);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

api.get('/clients/:id', authenticateToken, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const client = await prisma.client.findUnique({
      where: { id }
    });
    if (!client) return c.json({ error: 'Client not found' }, 404);
    return c.json(client);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

api.post('/clients', authenticateToken, async (c) => {
  try {
    const data = await c.req.json();
    const client = await prisma.client.create({ data });
    return c.json(client, 201);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});

api.put('/clients/:id', authenticateToken, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const data = await c.req.json();
    const client = await prisma.client.update({
      where: { id },
      data,
    });
    return c.json(client);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});

api.delete('/clients/:id', authenticateToken, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    await prisma.client.delete({ where: { id } });
    return c.json({ message: 'Client deleted' }, 204);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Utilisateur APIs
api.get('/utilisateurs', authenticateToken, async (c) => {
  try {
    const utilisateurs = await prisma.utilisateur.findMany({
      include: {
        chauffeur: true
      }
    });
    return c.json(utilisateurs);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

api.get('/utilisateurs/:id', authenticateToken, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id },
      include: {
        chauffeur: true
      }
    });
    if (!utilisateur) return c.json({ error: 'Utilisateur not found' }, 404);
    return c.json(utilisateur);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

api.post('/utilisateurs', authenticateToken, async (c) => {
  try {
    const data = await c.req.json();
    const utilisateur = await prisma.utilisateur.create({ data });
    return c.json(utilisateur, 201);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});

api.put('/utilisateurs/:id', authenticateToken, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const data = await c.req.json();
    const utilisateur = await prisma.utilisateur.update({
      where: { id },
      data,
    });
    return c.json(utilisateur);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});

api.delete('/utilisateurs/:id', authenticateToken, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    await prisma.utilisateur.delete({ where: { id } });
    return c.json({ message: 'Utilisateur deleted' }, 204);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

export default api;
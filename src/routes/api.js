const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const router = express.Router();
const prisma = new PrismaClient();

// Helper: Auth middleware
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Chauffeur APIs
router.get('/chauffeurs', authenticateToken, async (req, res) => {
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
    res.json(chauffeurs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/chauffeurs/:id', authenticateToken, async (req, res) => {
  try {
    const chauffeur = await prisma.chauffeur.findUnique({
      where: { id: parseInt(req.params.id) },
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
    if (!chauffeur) return res.status(404).json({ error: 'Chauffeur not found' });
    res.json(chauffeur);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/chauffeurs', authenticateToken, async (req, res) => {
  try {
    const chauffeur = await prisma.chauffeur.create({ data: req.body });
    res.status(201).json(chauffeur);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/chauffeurs/:id', authenticateToken, async (req, res) => {
  try {
    const chauffeur = await prisma.chauffeur.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(chauffeur);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/chauffeurs/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.chauffeur.delete({ where: { id: parseInt(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vehicule APIs
router.get('/vehicules', authenticateToken, async (req, res) => {
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
    res.json(vehicules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/vehicules/:id', authenticateToken, async (req, res) => {
  try {
    const vehicule = await prisma.vehicule.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        chauffeurs: {
          include: {
            chauffeur: true
          }
        }
      }
    });
    if (!vehicule) return res.status(404).json({ error: 'Vehicule not found' });
    res.json(vehicule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/vehicules', authenticateToken, async (req, res) => {
  try {
    const vehicule = await prisma.vehicule.create({ data: req.body });
    res.status(201).json(vehicule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/vehicules/:id', authenticateToken, async (req, res) => {
  try {
    const vehicule = await prisma.vehicule.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(vehicule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/vehicules/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.vehicule.delete({ where: { id: parseInt(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Course APIs
router.get('/courses', authenticateToken, async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        client: true,
        feuille_route: true,
        mode_paiement: true
      }
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/courses/:id', authenticateToken, async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        client: true,
        feuille_route: true,
        mode_paiement: true
      }
    });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/courses', authenticateToken, async (req, res) => {
  try {
    const course = await prisma.course.create({ data: req.body });
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/courses/:id', authenticateToken, async (req, res) => {
  try {
    const course = await prisma.course.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(course);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/courses/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.course.delete({ where: { id: parseInt(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Feuille Route APIs
router.get('/feuille-routes', authenticateToken, async (req, res) => {
  try {
    const feuilles = await prisma.feuille_route.findMany({
      include: {
        chauffeur: true,
        vehicule: true,
        course: true
      }
    });
    res.json(feuilles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/feuille-routes/:id', authenticateToken, async (req, res) => {
  try {
    const feuille = await prisma.feuille_route.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        chauffeur: true,
        vehicule: true,
        course: true
      }
    });
    if (!feuille) return res.status(404).json({ error: 'Feuille route not found' });
    res.json(feuille);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/feuille-routes', authenticateToken, async (req, res) => {
  try {
    const feuille = await prisma.feuille_route.create({ data: req.body });
    res.status(201).json(feuille);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/feuille-routes/:id', authenticateToken, async (req, res) => {
  try {
    const feuille = await prisma.feuille_route.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(feuille);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/feuille-routes/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.feuille_route.delete({ where: { id: parseInt(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Client APIs
router.get('/clients', authenticateToken, async (req, res) => {
  try {
    const clients = await prisma.client.findMany();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/clients/:id', authenticateToken, async (req, res) => {
  try {
    const client = await prisma.client.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/clients', authenticateToken, async (req, res) => {
  try {
    const client = await prisma.client.create({ data: req.body });
    res.status(201).json(client);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/clients/:id', authenticateToken, async (req, res) => {
  try {
    const client = await prisma.client.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(client);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/clients/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.client.delete({ where: { id: parseInt(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Utilisateur APIs
router.get('/utilisateurs', authenticateToken, async (req, res) => {
  try {
    const utilisateurs = await prisma.utilisateur.findMany({
      include: {
        chauffeur: true
      }
    });
    res.json(utilisateurs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/utilisateurs/:id', authenticateToken, async (req, res) => {
  try {
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        chauffeur: true
      }
    });
    if (!utilisateur) return res.status(404).json({ error: 'Utilisateur not found' });
    res.json(utilisateur);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/utilisateurs', authenticateToken, async (req, res) => {
  try {
    const utilisateur = await prisma.utilisateur.create({ data: req.body });
    res.status(201).json(utilisateur);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/utilisateurs/:id', authenticateToken, async (req, res) => {
  try {
    const utilisateur = await prisma.utilisateur.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(utilisateur);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/utilisateurs/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.utilisateur.delete({ where: { id: parseInt(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { sign, verify } from '@tsndr/cloudflare-worker-jwt';
import express from 'express';
import cors from 'cors';

const app = express();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Log des requêtes pour debug
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`, req.body);
  next();
});

// Routes d'authentification
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Tentative de connexion:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Email ou mot de passe manquant');
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    // Rechercher l'utilisateur
    const user = await prisma.utilisateur.findUnique({
      where: { email },
      include: { chauffeur: true }
    });

    if (!user || !user.actif) {
      console.log('Utilisateur non trouvé ou inactif');
      return res.status(401).json({ error: 'Utilisateur non trouvé ou inactif' });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.mot_de_passe);
    if (!isValidPassword) {
      console.log('Mot de passe incorrect');
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }

    // Mettre à jour la dernière connexion
    await prisma.utilisateur.update({
      where: { id: user.id },
      data: { last_login: new Date() }
    });

    // Générer le token JWT
    const token = await sign({
      userId: user.id,
      email: user.email,
      type: user.type_utilisateur,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24h
    }, JWT_SECRET);

    // eslint-disable-next-line no-unused-vars
    const { mot_de_passe, ...userWithoutPassword } = user;

    console.log('Connexion réussie pour:', user.email);
    res.json({
      authToken: token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, nom, prenom, telephone, type_utilisateur = 'chauffeur' } = req.body;

    if (!email || !password || !nom || !telephone) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.utilisateur.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Un utilisateur avec cet email existe déjà' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'utilisateur
    const newUser = await prisma.utilisateur.create({
      data: {
        email,
        mot_de_passe: hashedPassword,
        nom,
        prenom,
        telephone,
        type_utilisateur,
        actif: true,
        date_creation: new Date()
      },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        type_utilisateur: true,
        telephone: true,
        actif: true
      }
    });

    res.json(newUser);
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/auth/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token d\'authentification requis' });
    }

    const token = authHeader.substring(7);
    const decoded = await verify(token, JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ error: 'Token invalide' });
    }

    const user = await prisma.utilisateur.findUnique({
      where: { id: decoded.userId },
      include: { chauffeur: true },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        type_utilisateur: true,
        telephone: true,
        adresse: true,
        ville: true,
        code_postal: true,
        pays: true,
        actif: true,
        last_login: true,
        chauffeur: {
          select: {
            numero_badge: true,
            date_embauche: true,
            type_contrat: true,
            taux_commission: true,
            salaire_base: true,
            actif: true
          }
        }
      }
    });

    if (!user || !user.actif) {
      return res.status(404).json({ error: 'Utilisateur non trouvé ou inactif' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/users/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token d\'authentification requis' });
    }

    const token = authHeader.substring(7);
    const decoded = await verify(token, JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ error: 'Token invalide' });
    }

    const updateData = req.body;
    // eslint-disable-next-line no-unused-vars
    const { chauffeur, ...userData } = updateData;

    // Mettre à jour les données utilisateur
    const updatedUser = await prisma.utilisateur.update({
      where: { id: decoded.userId },
      data: {
        ...userData,
        updated_at: new Date()
      },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        type_utilisateur: true,
        telephone: true,
        adresse: true,
        ville: true,
        code_postal: true,
        pays: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Serveur API démarré sur le port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

process.on('SIGINT', async () => {
  console.log('Arrêt du serveur...');
  await prisma.$disconnect();
  process.exit(0);
});

export default app;

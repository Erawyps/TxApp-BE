// Serveur de développement TxApp avec endpoints refactorisés
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { PrismaClient } from '@prisma/client';

const app = new Hono();

// Configuration CORS pour développement local
app.use('*', cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin',
    'Cache-Control',
    'Pragma'
  ],
  credentials: true,
  maxAge: 3600
}));

// Health check
app.get('/api/health', (c) => c.json({
  ok: true,
  env: 'development',
  timestamp: new Date().toISOString(),
  database: 'connected'
}));

// Instance globale de Prisma
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Middleware pour passer Prisma au contexte
const dbMiddleware = async (c, next) => {
  try {
    c.set('prisma', prisma);
    await next();
  } catch (error) {
    console.error('Database error:', error);
    return c.json({ error: 'Database error' }, 500);
  }
};

// ============ FONCTIONS DE MAPPING UNIFIÉ ============

// Fonction de mapping unifié : DB → Frontend
const mapFeuilleRouteForFrontend = (dbData) => {
  if (!dbData) return null;
  
  return {
    // Données de base
    feuille_id: dbData.feuille_id,
    chauffeur_id: dbData.chauffeur_id,
    vehicule_id: dbData.vehicule_id,
    date_service: dbData.date_service,
    mode_encodage: dbData.mode_encodage,
    heure_debut: dbData.heure_debut,
    heure_fin: dbData.heure_fin,
    index_km_debut_tdb: dbData.index_km_debut_tdb,
    index_km_fin_tdb: dbData.index_km_fin_tdb,
    km_tableau_bord_debut: dbData.km_tableau_bord_debut,
    km_tableau_bord_fin: dbData.km_tableau_bord_fin,
    interruptions: dbData.interruptions,
    montant_salaire_cash_declare: dbData.montant_salaire_cash_declare,
    est_validee: dbData.est_validee,
    date_validation: dbData.date_validation,
    validated_by: dbData.validated_by,
    signature_chauffeur: dbData.signature_chauffeur,
    created_at: dbData.created_at,
    
    // Données taximètre (utiliser les nouveaux champs)
    taximetre_prise_charge_debut: dbData.taximetre?.taximetre_prise_charge_debut || null,
    taximetre_index_km_debut: dbData.taximetre?.taximetre_index_km_debut || null,
    taximetre_km_charge_debut: dbData.taximetre?.taximetre_km_charge_debut || null,
    taximetre_chutes_debut: dbData.taximetre?.taximetre_chutes_debut || null,
    taximetre_prise_charge_fin: dbData.taximetre?.taximetre_prise_charge_fin || null,
    taximetre_index_km_fin: dbData.taximetre?.taximetre_index_km_fin || null,
    taximetre_km_charge_fin: dbData.taximetre?.taximetre_km_charge_fin || null,
    taximetre_chutes_fin: dbData.taximetre?.taximetre_chutes_fin || null,
    
    // Relations
    chauffeur: dbData.chauffeur,
    vehicule: dbData.vehicule,
    course: dbData.course,
    charge: dbData.charge
  };
};

// Fonction de préparation : Frontend → DB
const prepareFeuilleRouteForDB = (formData) => {
  const feuilleData = {
    chauffeur_id: parseInt(formData.chauffeur_id),
    vehicule_id: parseInt(formData.vehicule_id),
    date_service: new Date(formData.date_service),
    mode_encodage: formData.mode_encodage || 'LIVE',
    heure_debut: formData.heure_debut ? new Date(`1970-01-01T${formData.heure_debut}:00Z`) : null,
    heure_fin: formData.heure_fin ? new Date(`1970-01-01T${formData.heure_fin}:00Z`) : null,
    index_km_debut_tdb: formData.index_km_debut_tdb ? parseInt(formData.index_km_debut_tdb) : null,
    index_km_fin_tdb: formData.index_km_fin_tdb ? parseInt(formData.index_km_fin_tdb) : null,
    km_tableau_bord_debut: formData.index_km_debut_tdb ? parseInt(formData.index_km_debut_tdb) : null,
    km_tableau_bord_fin: formData.index_km_fin_tdb ? parseInt(formData.index_km_fin_tdb) : null,
    interruptions: formData.interruptions || '',
    montant_salaire_cash_declare: formData.montant_salaire_cash_declare || '0',
    est_validee: formData.est_validee || false,
    validated_by: formData.validated_by || null,
    signature_chauffeur: formData.signature_chauffeur || null
  };
  
  const taximetreData = {
    // Nouveaux champs (utilisés par frontend)
    taximetre_prise_charge_debut: formData.taximetre_prise_charge_debut || null,
    taximetre_index_km_debut: formData.taximetre_index_km_debut ? parseInt(formData.taximetre_index_km_debut) : null,
    taximetre_km_charge_debut: formData.taximetre_km_charge_debut || null,
    taximetre_chutes_debut: formData.taximetre_chutes_debut || null,
    taximetre_prise_charge_fin: formData.taximetre_prise_charge_fin || null,
    taximetre_index_km_fin: formData.taximetre_index_km_fin ? parseInt(formData.taximetre_index_km_fin) : null,
    taximetre_km_charge_fin: formData.taximetre_km_charge_fin || null,
    taximetre_chutes_fin: formData.taximetre_chutes_fin || null,
    
    // Champs anciens (compatibilité)
    pc_debut_tax: formData.taximetre_prise_charge_debut || null,
    pc_fin_tax: formData.taximetre_prise_charge_fin || null,
    index_km_debut_tax: formData.taximetre_index_km_debut ? parseInt(formData.taximetre_index_km_debut) : null,
    index_km_fin_tax: formData.taximetre_index_km_fin ? parseInt(formData.taximetre_index_km_fin) : null,
    km_charge_debut: formData.taximetre_km_charge_debut || null,
    km_charge_fin: formData.taximetre_km_charge_fin || null,
    chutes_debut_tax: formData.taximetre_chutes_debut || null,
    chutes_fin_tax: formData.taximetre_chutes_fin || null
  };
  
  return { feuilleData, taximetreData };
};

// Fonction de préparation pour mise à jour partielle : Frontend → DB
const preparePartialUpdateForDB = (formData) => {
  const feuilleData = {};
  const taximetreData = {};
  
  // Traiter seulement les champs fournis pour feuille_route
  if (formData.chauffeur_id !== undefined) feuilleData.chauffeur_id = parseInt(formData.chauffeur_id);
  if (formData.vehicule_id !== undefined) feuilleData.vehicule_id = parseInt(formData.vehicule_id);
  if (formData.date_service !== undefined) feuilleData.date_service = new Date(formData.date_service);
  if (formData.mode_encodage !== undefined) feuilleData.mode_encodage = formData.mode_encodage;
  if (formData.heure_debut !== undefined) feuilleData.heure_debut = formData.heure_debut ? new Date(`1970-01-01T${formData.heure_debut}:00Z`) : null;
  if (formData.heure_fin !== undefined) feuilleData.heure_fin = formData.heure_fin ? new Date(`1970-01-01T${formData.heure_fin}:00Z`) : null;
  if (formData.index_km_debut_tdb !== undefined) {
    feuilleData.index_km_debut_tdb = parseInt(formData.index_km_debut_tdb);
    feuilleData.km_tableau_bord_debut = parseInt(formData.index_km_debut_tdb);
  }
  if (formData.index_km_fin_tdb !== undefined) {
    feuilleData.index_km_fin_tdb = parseInt(formData.index_km_fin_tdb);
    feuilleData.km_tableau_bord_fin = parseInt(formData.index_km_fin_tdb);
  }
  if (formData.interruptions !== undefined) feuilleData.interruptions = formData.interruptions;
  if (formData.montant_salaire_cash_declare !== undefined) feuilleData.montant_salaire_cash_declare = formData.montant_salaire_cash_declare;
  if (formData.est_validee !== undefined) feuilleData.est_validee = formData.est_validee;
  if (formData.validated_by !== undefined) feuilleData.validated_by = formData.validated_by;
  if (formData.signature_chauffeur !== undefined) feuilleData.signature_chauffeur = formData.signature_chauffeur;
  
  // Traiter seulement les champs fournis pour taximetre
  if (formData.taximetre_prise_charge_debut !== undefined) {
    taximetreData.taximetre_prise_charge_debut = formData.taximetre_prise_charge_debut;
    taximetreData.pc_debut_tax = formData.taximetre_prise_charge_debut;
  }
  if (formData.taximetre_index_km_debut !== undefined) {
    taximetreData.taximetre_index_km_debut = parseInt(formData.taximetre_index_km_debut);
    taximetreData.index_km_debut_tax = parseInt(formData.taximetre_index_km_debut);
  }
  if (formData.taximetre_km_charge_debut !== undefined) {
    taximetreData.taximetre_km_charge_debut = formData.taximetre_km_charge_debut;
    taximetreData.km_charge_debut = formData.taximetre_km_charge_debut;
  }
  if (formData.taximetre_chutes_debut !== undefined) {
    taximetreData.taximetre_chutes_debut = formData.taximetre_chutes_debut;
    taximetreData.chutes_debut_tax = formData.taximetre_chutes_debut;
  }
  if (formData.taximetre_prise_charge_fin !== undefined) {
    taximetreData.taximetre_prise_charge_fin = formData.taximetre_prise_charge_fin;
    taximetreData.pc_fin_tax = formData.taximetre_prise_charge_fin;
  }
  if (formData.taximetre_index_km_fin !== undefined) {
    taximetreData.taximetre_index_km_fin = parseInt(formData.taximetre_index_km_fin);
    taximetreData.index_km_fin_tax = parseInt(formData.taximetre_index_km_fin);
  }
  if (formData.taximetre_km_charge_fin !== undefined) {
    taximetreData.taximetre_km_charge_fin = formData.taximetre_km_charge_fin;
    taximetreData.km_charge_fin = formData.taximetre_km_charge_fin;
  }
  if (formData.taximetre_chutes_fin !== undefined) {
    taximetreData.taximetre_chutes_fin = formData.taximetre_chutes_fin;
    taximetreData.chutes_fin_tax = formData.taximetre_chutes_fin;
  }
  
  return { feuilleData, taximetreData };
};

// ============ ENDPOINTS REFACTORISÉS ============

// Endpoints de debug temporaires
app.get('/api/debug/chauffeurs', dbMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const chauffeurs = await prisma.chauffeur.findMany({
      include: {
        utilisateur: {
          select: {
            nom: true,
            prenom: true,
            email: true
          }
        }
      },
      take: 5
    });
    return c.json(chauffeurs);
  } catch (error) {
    console.error('Error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.get('/api/debug/vehicules', dbMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const vehicules = await prisma.vehicule.findMany({
      take: 5
    });
    return c.json(vehicules);
  } catch (error) {
    console.error('Error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// GET /api/feuilles-route/active/:chauffeurId - Récupérer la feuille active d'un chauffeur
app.get('/api/feuilles-route/active/:chauffeurId', dbMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const chauffeurId = parseInt(c.req.param('chauffeurId'));
    
    console.log('🔍 GET /api/feuilles-route/active - Chauffeur:', chauffeurId);
    
    const activeFeuille = await prisma.feuille_route.findFirst({
      where: {
        chauffeur_id: chauffeurId,
        est_validee: false
      },
      include: {
        chauffeur: {
          include: {
            utilisateur: {
              select: {
                nom: true,
                prenom: true,
                email: true
              }
            }
          }
        },
        vehicule: true,
        course: {
          include: {
            mode_paiement: true
          }
        },
        charge: true,
        taximetre: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    if (!activeFeuille) {
      console.log('❌ Aucun shift actif trouvé pour chauffeur:', chauffeurId);
      return c.json(null);
    }

    console.log('✅ Shift actif trouvé:', activeFeuille.feuille_id);
    return c.json(mapFeuilleRouteForFrontend(activeFeuille));
  } catch (error) {
    console.error('❌ Erreur récupération shift actif:', error);
    return c.json({ error: 'Erreur lors de la récupération du shift actif' }, 500);
  }
});

// POST /api/feuilles-route - Créer une nouvelle feuille de route
app.post('/api/feuilles-route', dbMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const requestData = await c.req.json();
    
    console.log('📝 POST /api/feuilles-route - Données reçues:', requestData);
    
    const { feuilleData, taximetreData } = prepareFeuilleRouteForDB(requestData);
    
    // Vérifier si un shift actif existe déjà
    const existingActiveShift = await prisma.feuille_route.findFirst({
      where: {
        chauffeur_id: feuilleData.chauffeur_id,
        est_validee: false
      }
    });

    if (existingActiveShift) {
      console.log('⚠️ Shift actif existant trouvé, validation automatique:', existingActiveShift.feuille_id);
      await prisma.feuille_route.update({
        where: { feuille_id: existingActiveShift.feuille_id },
        data: { 
          est_validee: true,
          date_validation: new Date()
        }
      });
    }

    // Créer la nouvelle feuille de route
    const nouvelleFeuille = await prisma.feuille_route.create({
      data: feuilleData,
      include: {
        chauffeur: {
          include: {
            utilisateur: {
              select: {
                nom: true,
                prenom: true,
                email: true
              }
            }
          }
        },
        vehicule: true,
        course: true,
        charge: true
      }
    });

    console.log('✅ Feuille créée avec ID:', nouvelleFeuille.feuille_id);

    // Créer les données taximètre si fournies
    if (Object.values(taximetreData).some(val => val !== null)) {
      await prisma.taximetre.create({
        data: {
          feuille_id: nouvelleFeuille.feuille_id,
          ...taximetreData
        }
      });
      console.log('✅ Données taximètre créées');
    }

    // Retourner les données complètes
    const feuilleComplete = await prisma.feuille_route.findUnique({
      where: { feuille_id: nouvelleFeuille.feuille_id },
      include: {
        chauffeur: {
          include: {
            utilisateur: {
              select: {
                nom: true,
                prenom: true,
                email: true
              }
            }
          }
        },
        vehicule: true,
        course: true,
        charge: true,
        taximetre: true
      }
    });

    return c.json(mapFeuilleRouteForFrontend(feuilleComplete));
  } catch (error) {
    console.error('❌ Erreur création feuille de route:', error);
    return c.json({ error: 'Erreur lors de la création de la feuille de route', details: error.message }, 500);
  }
});

// PUT /api/feuilles-route/:id - Mettre à jour une feuille de route
app.put('/api/feuilles-route/:id', dbMiddleware, async (c) => {
  try {
    const prisma = c.get('prisma');
    const feuilleId = parseInt(c.req.param('id'));
    const requestData = await c.req.json();
    
    console.log('📝 PUT /api/feuilles-route - ID:', feuilleId, 'Données:', requestData);
    
    const { feuilleData, taximetreData } = preparePartialUpdateForDB(requestData);
    
    // Mettre à jour la feuille de route (seulement les champs fournis)
    if (Object.keys(feuilleData).length > 0) {
      await prisma.feuille_route.update({
        where: { feuille_id: feuilleId },
        data: feuilleData
      });
      console.log('✅ Feuille mise à jour:', feuilleId);
    }

    // Mettre à jour ou créer les données taximètre (seulement les champs fournis)
    if (Object.keys(taximetreData).length > 0) {
      await prisma.taximetre.upsert({
        where: { feuille_id: feuilleId },
        update: taximetreData,
        create: {
          feuille_id: feuilleId,
          ...taximetreData
        }
      });
      console.log('✅ Données taximètre mises à jour');
    }

    // Si validation demandée
    if (requestData.est_validee) {
      await prisma.feuille_route.update({
        where: { feuille_id: feuilleId },
        data: { 
          est_validee: true,
          date_validation: new Date()
        }
      });
      console.log('✅ Feuille validée');
    }

    // Retourner les données complètes
    const feuilleComplete = await prisma.feuille_route.findUnique({
      where: { feuille_id: feuilleId },
      include: {
        chauffeur: {
          include: {
            utilisateur: {
              select: {
                nom: true,
                prenom: true,
                email: true
              }
            }
          }
        },
        vehicule: true,
        course: {
          include: {
            mode_paiement: true
          }
        },
        charge: true,
        taximetre: true
      }
    });

    return c.json(mapFeuilleRouteForFrontend(feuilleComplete));
  } catch (error) {
    console.error('❌ Erreur mise à jour feuille de route:', error);
    return c.json({ error: 'Erreur lors de la mise à jour de la feuille de route', details: error.message }, 500);
  }
});

// Route pour tester les nouveaux endpoints
app.get('/', (c) => c.json({ 
  message: 'TxApp Development Server - REFACTORISÉ', 
  mode: 'development',
  endpoints: [
    'GET /api/health',
    'GET /api/feuilles-route/active/:chauffeurId',
    'POST /api/feuilles-route',
    'PUT /api/feuilles-route/:id'
  ]
}));

// Fermer proprement Prisma
process.on('SIGINT', async () => {
  console.log('\\n🔌 Fermeture de la connexion à la base de données...');
  await prisma.$disconnect();
  console.log('👋 Serveur arrêté proprement');
  process.exit(0);
});

const port = process.env.PORT || 3002;

console.log(`🚀 Serveur REFACTORISÉ démarré sur http://localhost:${port}`);
console.log(`📡 CORS configuré pour: http://localhost:5173`);
console.log(`🔧 Mode: DEVELOPMENT`);
console.log(`✨ Endpoints simplifiés et cohérents`);

serve({
  fetch: app.fetch,
  port: parseInt(port)
});
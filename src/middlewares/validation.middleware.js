// src/middlewares/validation.middleware.js
import Joi from 'joi';

// Schémas de validation pour les entités principales

export const chauffeurValidation = {
  create: Joi.object({
    utilisateur_id: Joi.number().integer().required(),
    numero_badge: Joi.string().min(1).max(50).required(),
    date_embauche: Joi.date().required(),
    date_fin_contrat: Joi.date().optional(),
    type_contrat: Joi.string().max(50).optional(),
    compte_bancaire: Joi.string().max(50).optional(),
    taux_commission: Joi.number().min(0).max(100).optional(),
    salaire_base: Joi.number().min(0).optional(),
    notes: Joi.string().optional(),
    actif: Joi.boolean().optional()
  }),

  update: Joi.object({
    regle_salaire_id: Joi.number().integer().optional(),
    date_fin_contrat: Joi.date().optional(),
    type_contrat: Joi.string().max(50).optional(),
    compte_bancaire: Joi.string().max(50).optional(),
    taux_commission: Joi.number().min(0).max(100).optional(),
    salaire_base: Joi.number().min(0).optional(),
    notes: Joi.string().optional(),
    actif: Joi.boolean().optional()
  })
};

export const vehiculeValidation = {
  create: Joi.object({
    plaque_immatriculation: Joi.string().min(1).max(20).required(),
    numero_identification: Joi.string().min(1).max(50).required(),
    marque: Joi.string().min(1).max(50).required(),
    modele: Joi.string().min(1).max(50).required(),
    annee: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).required(),
    type_vehicule: Joi.string().max(50).optional(),
    couleur: Joi.string().max(30).optional(),
    date_mise_circulation: Joi.date().required(),
    date_dernier_controle: Joi.date().optional(),
    capacite: Joi.number().integer().min(1).max(50).optional(),
    carburant: Joi.string().max(20).optional(),
    consommation: Joi.number().min(0).optional(),
    etat: Joi.string().valid('Disponible', 'En service', 'En maintenance', 'Hors service').optional(),
    notes: Joi.string().optional()
  }),

  update: Joi.object({
    type_vehicule: Joi.string().max(50).optional(),
    couleur: Joi.string().max(30).optional(),
    date_dernier_controle: Joi.date().optional(),
    capacite: Joi.number().integer().min(1).max(50).optional(),
    carburant: Joi.string().max(20).optional(),
    consommation: Joi.number().min(0).optional(),
    etat: Joi.string().valid('Disponible', 'En service', 'En maintenance', 'Hors service').optional(),
    notes: Joi.string().optional()
  })
};

export const clientValidation = {
  create: Joi.object({
    type_client: Joi.string().valid('Particulier', 'Entreprise').required(),
    nom: Joi.string().min(1).max(100).required(),
    prenom: Joi.string().max(100).optional(),
    telephone: Joi.string().min(1).max(20).required(),
    email: Joi.string().email().optional(),
    adresse: Joi.string().optional(),
    ville: Joi.string().max(100).optional(),
    code_postal: Joi.string().max(20).optional(),
    pays: Joi.string().max(50).optional(),
    num_tva: Joi.string().max(20).optional(),
    periode_facturation: Joi.string().valid('Mensuelle', 'Trimestrielle', 'Annuelle').optional(),
    mode_facturation: Joi.string().valid('Simple', 'Détaillée').optional(),
    procedure_envoi: Joi.string().optional(),
    adresse_facturation_diff: Joi.boolean().optional(),
    adresse_facturation: Joi.string().optional(),
    notes: Joi.string().optional(),
    actif: Joi.boolean().optional()
  }),

  update: Joi.object({
    prenom: Joi.string().max(100).optional(),
    telephone: Joi.string().min(1).max(20).optional(),
    email: Joi.string().email().optional(),
    adresse: Joi.string().optional(),
    ville: Joi.string().max(100).optional(),
    code_postal: Joi.string().max(20).optional(),
    pays: Joi.string().max(50).optional(),
    num_tva: Joi.string().max(20).optional(),
    periode_facturation: Joi.string().valid('Mensuelle', 'Trimestrielle', 'Annuelle').optional(),
    mode_facturation: Joi.string().valid('Simple', 'Détaillée').optional(),
    procedure_envoi: Joi.string().optional(),
    adresse_facturation_diff: Joi.boolean().optional(),
    adresse_facturation: Joi.string().optional(),
    notes: Joi.string().optional(),
    actif: Joi.boolean().optional()
  })
};

export const courseValidation = {
  create: Joi.object({
    feuille_route_id: Joi.number().integer().required(),
    client_id: Joi.number().integer().optional(),
    mode_paiement_id: Joi.number().integer().optional(),
    numero_ordre: Joi.number().integer().min(1).required(),
    index_depart: Joi.number().integer().min(0).required(),
    lieu_embarquement: Joi.string().min(1).required(),
    heure_embarquement: Joi.date().required(),
    index_arrivee: Joi.number().integer().min(0).required(),
    lieu_debarquement: Joi.string().min(1).required(),
    heure_debarquement: Joi.date().optional(),
    prix_taximetre: Joi.number().min(0).required(),
    somme_percue: Joi.number().min(0).required(),
    hors_creneau: Joi.boolean().optional(),
    notes: Joi.string().optional()
  }),

  update: Joi.object({
    client_id: Joi.number().integer().optional(),
    mode_paiement_id: Joi.number().integer().optional(),
    numero_ordre: Joi.number().integer().min(1).optional(),
    index_depart: Joi.number().integer().min(0).optional(),
    lieu_embarquement: Joi.string().min(1).optional(),
    heure_embarquement: Joi.date().optional(),
    index_arrivee: Joi.number().integer().min(0).optional(),
    lieu_debarquement: Joi.string().min(1).optional(),
    heure_debarquement: Joi.date().optional(),
    prix_taximetre: Joi.number().min(0).optional(),
    somme_percue: Joi.number().min(0).optional(),
    hors_creneau: Joi.boolean().optional(),
    notes: Joi.string().optional()
  })
};

export const chargeValidation = {
  create: Joi.object({
    feuille_route_id: Joi.number().integer().required(),
    type_charge: Joi.string().min(1).max(50).required(),
    description: Joi.string().optional(),
    montant: Joi.number().min(0).required(),
    date: Joi.date().optional(),
    mode_paiement_id: Joi.number().integer().optional(),
    justificatif: Joi.string().max(255).optional(),
    notes: Joi.string().optional()
  }),

  update: Joi.object({
    type_charge: Joi.string().min(1).max(50).optional(),
    description: Joi.string().optional(),
    montant: Joi.number().min(0).optional(),
    date: Joi.date().optional(),
    mode_paiement_id: Joi.number().integer().optional(),
    justificatif: Joi.string().max(255).optional(),
    notes: Joi.string().optional()
  })
};

export const feuilleRouteValidation = {
  create: Joi.object({
    chauffeur_id: Joi.number().integer().required(),
    vehicule_id: Joi.number().integer().required(),
    date: Joi.date().required(),
    heure_debut: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    km_debut: Joi.number().integer().min(0).required(),
    prise_en_charge_debut: Joi.number().min(0).optional(),
    chutes_debut: Joi.number().min(0).optional(),
    notes: Joi.string().optional()
  }),

  update: Joi.object({
    heure_debut: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    heure_fin: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    km_debut: Joi.number().integer().min(0).optional(),
    km_fin: Joi.number().integer().min(0).optional(),
    prise_en_charge_debut: Joi.number().min(0).optional(),
    prise_en_charge_fin: Joi.number().min(0).optional(),
    chutes_debut: Joi.number().min(0).optional(),
    chutes_fin: Joi.number().min(0).optional(),
    notes: Joi.string().optional()
  }),

  end: Joi.object({
    heure_fin: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    km_fin: Joi.number().integer().min(0).required(),
    prise_en_charge_fin: Joi.number().min(0).optional(),
    chutes_fin: Joi.number().min(0).optional(),
    notes: Joi.string().optional()
  })
};

// Middleware de validation générique
export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Données de validation invalides',
        details: errors,
        timestamp: new Date().toISOString()
      });
    }

    req.body = value;
    next();
  };
};

// Middleware de validation des paramètres d'URL
export const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Paramètres d\'URL invalides',
        details: errors,
        timestamp: new Date().toISOString()
      });
    }

    req.params = value;
    next();
  };
};

// Schémas de validation pour les paramètres
export const paramValidation = {
  id: Joi.object({
    id: Joi.number().integer().positive().required()
  }),

  chauffeurVehicule: Joi.object({
    chauffeur_id: Joi.number().integer().positive().required(),
    vehicule_id: Joi.number().integer().positive().required()
  })
};
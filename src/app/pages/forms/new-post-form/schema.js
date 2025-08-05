// Import Dependencies
import * as Yup from 'yup';

// ----------------------------------------------------------------------

export const shiftSchema = Yup.object().shape({
  // Informations générales
  date: Yup.date()
    .required('Date requise'),
  
  // Chauffeur
  driver: Yup.object().shape({
    nom: Yup.string()
      .trim()
      .min(2, 'Nom trop court!')
      .max(50, 'Nom trop long!')
      .required('Nom du chauffeur requis'),
    prenom: Yup.string()
      .trim()
      .min(2, 'Prénom trop court!')
      .max(50, 'Prénom trop long!')
      .required('Prénom du chauffeur requis'),
    badge: Yup.string()
      .required('Numéro de badge requis')
  }),

  // Véhicule
  vehicleId: Yup.string()
    .required('Véhicule requis'),

  // Début de shift
  startTime: Yup.string()
    .required('Heure de début requise'),
  estimatedEndTime: Yup.string()
    .test('is-after-start', 'L\'heure de fin estimée doit être après le début', function(value) {
      const { startTime } = this.parent;
      if (!value || !startTime) return true;
      return value > startTime;
    }),
  interruptions: Yup.string()
    .default('00:00'),
  totalHours: Yup.string(),
  remunerationType: Yup.string()
    .oneOf(['percentage', 'fixed', 'hybrid'], 'Type de rémunération invalide')
    .required('Type de rémunération requis'),

  // Kilométrage et taximètre début
  startKm: Yup.number()
    .min(0, 'Valeur invalide')
    .required('Kilométrage début requis'),
  
  startTaximeter: Yup.object().shape({
    priseEnCharge: Yup.number()
      .min(0, 'Valeur invalide')
      .required('Prise en charge début requise'),
    indexKm: Yup.number()
      .min(0, 'Valeur invalide')
      .required('Index km début requis'),
    kmEnCharge: Yup.number()
      .min(0, 'Valeur invalide')
      .required('Km en charge début requis'),
    chutes: Yup.number()
      .min(0, 'Valeur invalide')
      .required('Chutes début requises')
  }),

  // Fin de shift
  endTime: Yup.string()
    .test('is-after-start', 'L\'heure de fin doit être après le début', function(value) {
      const { startTime } = this.parent;
      if (!value || !startTime) return true;
      return value > startTime;
    }),
  
  endKm: Yup.number()
    .min(0, 'Valeur invalide')
    .test('is-greater-than-start', 'Le kilométrage fin doit être supérieur au début', function(value) {
      const { startKm } = this.parent;
      if (!value || !startKm) return true;
      return value >= startKm;
    }),

  endTaximeter: Yup.object().shape({
    priseEnCharge: Yup.number()
      .min(0, 'Valeur invalide'),
    indexKm: Yup.number()
      .min(0, 'Valeur invalide'),
    kmEnCharge: Yup.number()
      .min(0, 'Valeur invalide'),
    chutes: Yup.number()
      .min(0, 'Valeur invalide')
  }),

  // Courses
  courses: Yup.array().of(
    Yup.object().shape({
      numeroOrdre: Yup.number()
        .required('Numéro d\'ordre requis'),
      
      // Index départ (facultatif)
      indexDepart: Yup.number()
        .min(0, 'Valeur invalide'),
      
      // Embarquement
      embarquement: Yup.object().shape({
        index: Yup.number()
          .min(0, 'Index invalide')
          .required('Index d\'embarquement requis'),
        lieu: Yup.string()
          .trim()
          .required('Lieu d\'embarquement requis'),
        heure: Yup.string()
          .required('Heure d\'embarquement requise')
      }),
      
      // Débarquement
      debarquement: Yup.object().shape({
        index: Yup.number()
          .min(0, 'Index invalide')
          .required('Index de débarquement requis'),
        lieu: Yup.string()
          .trim()
          .required('Lieu de débarquement requis'),
        heure: Yup.string()
          .required('Heure de débarquement requise')
          .test('is-after-embarquement', 'L\'heure de débarquement doit être après l\'embarquement', function(value) {
            const embarquementHeure = this.parent.parent?.embarquement?.heure;
            if (!value || !embarquementHeure) return true;
            return value > embarquementHeure;
          })
      }),
      
      // Tarification  
      prixTaximetre: Yup.number()
        .min(0, 'Prix invalide')
        .required('Prix taximètre requis'),
      sommesPercues: Yup.number()
        .min(0, 'Somme invalide')
        .required('Sommes perçues requises'),
      modePaiement: Yup.string()
        .oneOf(['CASH', 'BC', 'VIR', 'F-SNCB', 'F-WL', 'F-TX'], 'Mode de paiement invalide')
        .required('Mode de paiement requis'),
      
      // Client (requis pour factures)
      client: Yup.string()
        .when('modePaiement', {
          is: (val) => val && val.startsWith('F-'),
          then: (schema) => schema.required('Client requis pour les factures'),
          otherwise: (schema) => schema.notRequired()
        }),
      
      // Rémunération chauffeur
      remunerationChauffeur: Yup.number()
        .min(0, 'Rémunération invalide'),
      
      // Notes
      notes: Yup.string()
        .max(500, 'Notes trop longues')
    })
  ),

  // Dépenses
  expenses: Yup.array().of(
    Yup.object().shape({
      type: Yup.string()
        .oneOf(['carburant', 'peage', 'parking', 'reparation', 'autre'], 'Type de dépense invalide')
        .required('Type de dépense requis'),
      amount: Yup.number()
        .min(0, 'Montant invalide')
        .required('Montant requis'),
      description: Yup.string()
        .required('Description requise'),
      receipt: Yup.boolean()
        .default(false)
    })
  ),

  // Courses externes (prestataires)
  externalRides: Yup.array().of(
    Yup.object().shape({
      provider: Yup.string()
        .required('Prestataire requis'),
      amount: Yup.number()
        .min(0, 'Montant invalide')
        .required('Montant requis'),
      commission: Yup.number()
        .min(0, 'Commission invalide')
        .max(100, 'Commission trop élevée'),
      description: Yup.string()
        .required('Description requise')
    })
  ),

  // Signature
  signature: Yup.string()
    .when(['endTime', 'endKm'], {
      is: (endTime, endKm) => endTime && endKm,
      then: (schema) => schema.required('Signature requise pour finaliser le shift'),
      otherwise: (schema) => schema.notRequired()
    })
});

// Schema pour une course individuelle
export const courseSchema = Yup.object().shape({
  numeroOrdre: Yup.number()
    .required('Numéro d\'ordre requis'),
  
  indexDepart: Yup.number()
    .min(0, 'Valeur invalide'),
  
  embarquement: Yup.object().shape({
    index: Yup.number()
      .min(0, 'Index invalide')
      .required('Index d\'embarquement requis'),
    lieu: Yup.string()
      .trim()
      .required('Lieu d\'embarquement requis'),
    heure: Yup.string()
      .required('Heure d\'embarquement requise')
  }),
  
  debarquement: Yup.object().shape({
    index: Yup.number()
      .min(0, 'Index invalide')
      .required('Index de débarquement requis'),
    lieu: Yup.string()
      .trim()
      .required('Lieu de débarquement requis'),
    heure: Yup.string()
      .required('Heure de débarquement requise')
  }),
  
  prixTaximetre: Yup.number()
    .min(0, 'Prix invalide')
    .required('Prix taximètre requis'),
  sommesPercues: Yup.number()
    .min(0, 'Somme invalide')
    .required('Sommes perçues requises'),
  modePaiement: Yup.string()
    .oneOf(['CASH', 'BC', 'VIR', 'F-SNCB', 'F-WL', 'F-TX'], 'Mode de paiement invalide')
    .required('Mode de paiement requis'),
  
  client: Yup.string()
    .when('modePaiement', {
      is: (val) => val && val.startsWith('F-'),
      then: (schema) => schema.required('Client requis pour les factures'),
      otherwise: (schema) => schema.notRequired()
    }),
  
  remunerationChauffeur: Yup.number()
    .min(0, 'Rémunération invalide'),
  
  notes: Yup.string()
    .max(500, 'Notes trop longues')
});

// Schema pour les dépenses
export const expenseSchema = Yup.object().shape({
  type: Yup.string()
    .oneOf(['carburant', 'peage', 'parking', 'reparation', 'autre'], 'Type de dépense invalide')
    .required('Type de dépense requis'),
  amount: Yup.number()
    .min(0, 'Montant invalide')
    .required('Montant requis'),
  description: Yup.string()
    .required('Description requise'),
  receipt: Yup.boolean()
    .default(false)
});

// Schema pour les courses externes
export const externalRideSchema = Yup.object().shape({
  provider: Yup.string()
    .required('Prestataire requis'),
  amount: Yup.number()
    .min(0, 'Montant invalide')
    .required('Montant requis'),
  commission: Yup.number()
    .min(0, 'Commission invalide')
    .max(100, 'Commission trop élevée'),
  description: Yup.string()
    .required('Description requise')
});
import * as Yup from 'yup';

// Liste des constantes pour les valeurs enumrées
export const CHARGE_TYPES = ['Carburant', 'Péage', 'Entretien', 'Carwash', 'Divers'];
export const PAYMENT_MODES = ['CASH', 'BC', 'VIR', 'F-SNCB', 'F-WL', 'F-TX', 'F-AM', 'F-COM', 'F-HOP', 'AVC', 'DEM'];
export const CONTRACT_TYPES = ['CDI', 'CDD', 'Indépendant'];
export const VEHICLE_TYPES = ['Berline', 'Van', 'Luxe', 'Eco'];

export const schema = Yup.object().shape({
  // En-tête avec informations obligatoires
  header: Yup.object().shape({
    date: Yup.date()
      .required('La date est requise')
      .default(() => new Date()),
    chauffeur: Yup.object().shape({
      id: Yup.string().required('ID chauffeur requis'),
      nom: Yup.string().required('Nom requis'),
      prenom: Yup.string().required('Prénom requis'),
      numero_badge: Yup.string().required('Badge requis'),
      type_contrat: Yup.string().oneOf(CONTRACT_TYPES).required('Type de contrat requis'),
      compte_bancaire: Yup.string().nullable()
    }).required('Informations chauffeur requises'),
    vehicule: Yup.object().shape({
      id: Yup.string().required('ID véhicule requis'),
      plaque_immatriculation: Yup.string()
        .required('Plaque requise')
        .matches(/^[A-Z]{2}-[0-9]{3}-[A-Z]{2}$/, 'Format plaque invalide'),
      numero_identification: Yup.string().required('Numéro identification requis'),
      marque: Yup.string().required('Marque requise'),
      modele: Yup.string().required('Modèle requis'),
      type_vehicule: Yup.string().oneOf(VEHICLE_TYPES).nullable()
    }).required('Informations véhicule requises')
  }).required('En-tête requise'),

  // Période de service
  shift: Yup.object().shape({
    start: Yup.string()
      .required('Heure de début requise')
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:MM invalide'),
    end: Yup.string()
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:MM invalide')
      .test(
        'heure-superieure',
        'L\'heure de fin doit être après l\'heure de début',
        function(value) {
          return !this.parent.start || !value || value > this.parent.start;
        }
      ),
    interruptions: Yup.number()
      .min(0, 'Doit être positif')
      .default(0),
    duree_interruptions: Yup.string().nullable()
  }),

  // Kilométrage et mesures
  kilometers: Yup.object().shape({
  start: Yup.number()
    .required('Km de début requis')
    .min(0, 'Doit être positif'),
  end: Yup.number()
    .min(Yup.ref('start'), 'Doit être supérieur au km de départ')
    .nullable(),
  prise_en_charge_debut: Yup.number()
    .min(0, 'Doit être positif')
    .nullable(),
  prise_en_charge_fin: Yup.number()
    .min(0, 'Doit être positif')
    .nullable(),
  chutes_debut: Yup.number()
    .min(0, 'Doit être positif')
    .nullable(),
  chutes_fin: Yup.number()
    .min(0, 'Doit être positif')
    .nullable()
}),

  // Liste des courses
  courses: Yup.array().of(
    Yup.object().shape({
      id: Yup.string().required(),
      client_id: Yup.string().nullable(),
      mode_paiement_id: Yup.string()
        .oneOf(PAYMENT_MODES)
        .required('Mode paiement requis'),
      numero_ordre: Yup.number().required(),
      index_depart: Yup.number()
        .required('Index départ requis')
        .min(0, 'Doit être positif'),
      lieu_embarquement: Yup.string().required('Lieu départ requis'),
      heure_embarquement: Yup.string()
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:MM invalide')
        .required('Heure départ requise'),
      index_arrivee: Yup.number()
        .required('Index arrivée requis')
        .min(Yup.ref('index_depart'), 'Doit être supérieur à l\'index de départ'),
      lieu_debarquement: Yup.string().required('Lieu arrivée requis'),
      heure_debarquement: Yup.string()
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:MM invalide')
        .nullable(),
      prix_taximetre: Yup.number()
        .required('Prix taximètre requis')
        .min(0, 'Doit être positif'),
      somme_percue: Yup.number()
        .required('Somme perçue requise')
        .min(0, 'Doit être positif'),
      est_facture: Yup.boolean().default(false),
      code_paiement: Yup.string().nullable(),
      est_hors_creneau: Yup.boolean().default(false),
      notes: Yup.string().nullable()
    })
  ).default([]),

  // Liste des charges/dépenses
  charges: Yup.array().of(
    Yup.object().shape({
      id: Yup.string().required(),
      type_charge: Yup.string()
        .required('Type de charge requis')
        .oneOf(CHARGE_TYPES),
      montant: Yup.number()
        .required('Montant requis')
        .min(0, 'Doit être positif'),
      date: Yup.date().default(() => new Date()),
      mode_paiement_id: Yup.string()
        .oneOf(['CASH', 'BC']) // Seuls cash et bancontact pour les charges
        .required('Mode paiement requis'),
      description: Yup.string().nullable(),
      justificatif: Yup.string().nullable()
    })
  ).default([]),

  // Totaux calculés
  totals: Yup.object().shape({
    recettes: Yup.number().min(0).required(),
    charges: Yup.number().min(0).required(),
    salaire: Yup.number().min(0).required()
  }),

  // Validation finale
  validation: Yup.object().shape({
    signature: Yup.string().required('Signature requise'),
    date_validation: Yup.date().default(() => new Date()),
    valide_par: Yup.string().nullable()
  })
});

export const defaultData = {
  header: {
    date: new Date(),
    chauffeur: {
      id: "CH001",
      nom: "Tehou",
      prenom: "Hasler",
      numero_badge: "TX-2023-001",
      type_contrat: "Indépendant",
      compte_bancaire: null
    },
    vehicule: {
      id: "VH001",
      plaque_immatriculation: "TX-AA-171",
      numero_identification: "10",
      marque: "Mercedes",
      modele: "Classe E",
      type_vehicule: "Berline"
    }
  },
  shift: {
    start: "",
    end: "",
    interruptions: 0,
    duree_interruptions: null
  },
  kilometers: {
  start: null,
  end: null,
  prise_en_charge_debut: null,
  prise_en_charge_fin: null,
  chutes_debut: null,
  chutes_fin: null
},
  courses: [],
  charges: [],
  totals: {
    recettes: 0,
    charges: 0,
    salaire: 0
  },
  validation: {
    signature: "",
    date_validation: null,
    valide_par: null
  }
};
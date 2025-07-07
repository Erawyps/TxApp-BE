import * as Yup from 'yup';

export const schema = Yup.object().shape({
  // En-tête avec info chauffeur (lecture seule après connexion)
  header: Yup.object().shape({
    date: Yup.date()
      .required('La date est requise')
      .default(() => new Date()),
    chauffeur: Yup.object().shape({
      id: Yup.string().required('Chauffeur requis'),
      utilisateur_id: Yup.string().required('ID utilisateur requis'),
      nom: Yup.string().required('Nom requis'),
      prenom: Yup.string().required('Prénom requis'),
      numero_badge: Yup.string().required('Numéro de badge requis'),
      type_contrat: Yup.string().oneOf(['CDI', 'CDD', 'Indépendant']),
      compte_bancaire: Yup.string().nullable()
    }).test(
      'chauffeur-complet',
      'Les informations du chauffeur doivent être complètes',
      function(value) {
        // Validation supplémentaire si nécessaire
        if (!value) return false;
        const { id, utilisateur_id, nom, prenom, numero_badge } = value;
        if (!id || !utilisateur_id || !nom || !prenom || !numero_badge) {
          return this.createError({ path: this.path, message: 'Chauffeur incomplet' });
        }
        // Si toutes les informations sont présentes, la validation réussit
        return true;
      }
    ),
    
    // Info véhicule (partie modifiable)
    vehicule: Yup.object().shape({
      id: Yup.string().required('Véhicule requis'),
      plaque_immatriculation: Yup.string()
        .required('Plaque requise')
        .matches(/^[A-Z]{2}-[0-9]{3}-[A-Z]{2}$/, 'Format plaque invalide'),
      numero_identification: Yup.string().required('Numéro d\'identification requis'),
      type_vehicule: Yup.string().oneOf(['Berline', 'Van', 'Luxe', 'Eco'])
    })
  }),

  // Période de service (à remplir en début/fin de shift)
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
          return !this.parent.start || !value || value > this.parent.start
        }
      ),
    duree_interruptions: Yup.number()
      .min(0, 'Doit être positif')
      .nullable(),
    nombre_interruptions: Yup.number()
      .min(0, 'Doit être positif')
      .nullable()
  }),

  // Kilométrage
  kilometers: Yup.object().shape({
    start: Yup.number()
      .required('Km de début requis')
      .min(0, 'Doit être positif'),
    end: Yup.number()
      .min(Yup.ref('start'), 'Doit être supérieur au km de début')
      .nullable()
  }),

  // Courses
  courses: Yup.array().of(
    Yup.object().shape({
      id: Yup.string().required(),
      numero_ordre: Yup.number().required(),
      index_depart: Yup.number()
        .required('Index départ requis')
        .min(0, 'Doit être positif'),
      lieu_embarquement: Yup.string().required('Lieu de départ requis'),
      heure_embarquement: Yup.string()
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:MM invalide')
        .required('Heure départ requise'),
      index_arrivee: Yup.number()
        .required('Index arrivée requis')
        .min(Yup.ref('index_depart'), 'Doit être supérieur à l\'index de départ'),
      lieu_debarquement: Yup.string().required('Lieu d\'arrivée requis'),
      heure_debarquement: Yup.string()
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:MM invalide')
        .nullable(),
      prix_taximetre: Yup.number()
        .required('Prix requis')
        .min(0, 'Doit être positif'),
      somme_percue: Yup.number()
        .required('Somme perçue requise')
        .min(0, 'Doit être positif'),
      mode_paiement_id: Yup.string().required('Mode paiement requis'),
      client_id: Yup.string()
        .when('mode_paiement_id', {
          is: (val) => val === 'FACTURE', // Vérifier l'ID du mode facture
          then: (schema) => schema.required('Client requis pour les factures'),
          otherwise: (schema) => schema.nullable()
        }),
      est_facture: Yup.boolean().default(false),
      notes: Yup.string().nullable()
    })
  ),

  // Charges
  charges: Yup.array().of(
    Yup.object().shape({
      id: Yup.string().required(),
      type_charge: Yup.string()
        .required('Type de charge requis')
        .oneOf(['carburant', 'peage', 'entretien', 'carwash', 'divers']),
      montant: Yup.number()
        .required('Montant requis')
        .min(0, 'Doit être positif'),
      mode_paiement_id: Yup.string().required('Mode paiement requis'),
      description: Yup.string().nullable(),
      date: Yup.date().default(() => new Date()),
      justificatif: Yup.string().nullable()
    })
  ),

  // Totaux et validation
  totals: Yup.object().shape({
    recettes_total: Yup.number().min(0),
    charges_total: Yup.number().min(0),
    salaire_total: Yup.number().min(0)
  }),

  validation: Yup.object().shape({
    signature: Yup.string().required('Signature requise'),
    date_validation: Yup.date().default(() => new Date()),
    valide_par: Yup.string().nullable() // ID utilisateur qui a validé
  })
});
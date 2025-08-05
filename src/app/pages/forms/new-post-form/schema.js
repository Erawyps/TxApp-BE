// Import Dependencies
import * as Yup from 'yup';

// ----------------------------------------------------------------------

export const shiftSchema = Yup.object().shape({
  date: Yup.date()
    .required('Date requise'),
  chauffeur: Yup.object().shape({
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
    numero_badge: Yup.string()
      .required('Numéro de badge requis')
  }),
  vehicule: Yup.object().shape({
    plaque_immatriculation: Yup.string()
      .required('Plaque d\'immatriculation requise'),
    numero_identification: Yup.string()
      .required('Numéro d\'identification requis')
  }),
  service: Yup.object().shape({
    heure_debut: Yup.string()
      .required('Heure de début requise'),
    heure_fin: Yup.string()
      .test('is-after-start', 'L\'heure de fin doit être après l\'heure de début', function(value) {
        const { heure_debut } = this.parent;
        if (!value || !heure_debut) return true;
        return value > heure_debut;
      }),
    interruptions: Yup.string()
      .default('00:00'),
    total_heures: Yup.string()
  }),
  index: Yup.object().shape({
    km_tableau_bord_debut: Yup.number()
      .min(0, 'Valeur invalide')
      .required('Index km début requis'),
    km_tableau_bord_fin: Yup.number()
      .min(0, 'Valeur invalide')
      .test('is-greater-than-start', 'L\'index de fin doit être supérieur au début', function(value) {
        const { km_tableau_bord_debut } = this.parent;
        if (!value || !km_tableau_bord_debut) return true;
        return value >= km_tableau_bord_debut;
      }),
    taximetre_debut: Yup.number()
      .min(0, 'Valeur invalide'),
    taximetre_fin: Yup.number()
      .min(0, 'Valeur invalide'),
    km_en_charge: Yup.number()
      .min(0, 'Valeur invalide'),
    chutes: Yup.number()
      .min(0, 'Valeur invalide'),
    recettes: Yup.number()
      .min(0, 'Valeur invalide')
  }),
  courses: Yup.array().of(
    Yup.object().shape({
      numero_ordre: Yup.number()
        .required('Numéro d\'ordre requis'),
      index_depart: Yup.number()
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
      prix_taximetre: Yup.number()
        .min(0, 'Prix invalide')
        .required('Prix taximètre requis'),
      sommes_percues: Yup.number()
        .min(0, 'Somme invalide')
        .required('Sommes perçues requises'),
      mode_paiement: Yup.string()
        .oneOf(['CASH', 'BC', 'VIR', 'F-SNCB', 'F-WL', 'F-TX'], 'Mode de paiement invalide')
        .required('Mode de paiement requis'),
      client: Yup.string()
        .when('mode_paiement', {
          is: (val) => val && val.startsWith('F-'),
          then: (schema) => schema.required('Client requis pour les factures'),
          otherwise: (schema) => schema.notRequired()
        }),
      notes: Yup.string()
        .max(500, 'Notes trop longues')
    })
  ).min(0, 'Au moins une course est requise')
});

export const courseSchema = Yup.object().shape({
  numero_ordre: Yup.number()
    .required('Numéro d\'ordre requis'),
  index_depart: Yup.number()
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
  prix_taximetre: Yup.number()
    .min(0, 'Prix invalide')
    .required('Prix taximètre requis'),
  sommes_percues: Yup.number()
    .min(0, 'Somme invalide')
    .required('Sommes perçues requises'),
  mode_paiement: Yup.string()
    .oneOf(['CASH', 'BC', 'VIR', 'F-SNCB', 'F-WL', 'F-TX'], 'Mode de paiement invalide')
    .required('Mode de paiement requis'),
  client: Yup.string()
    .when('mode_paiement', {
      is: (val) => val && val.startsWith('F-'),
      then: (schema) => schema.required('Client requis pour les factures'),
      otherwise: (schema) => schema.notRequired()
    }),
  notes: Yup.string()
    .max(500, 'Notes trop longues')
});
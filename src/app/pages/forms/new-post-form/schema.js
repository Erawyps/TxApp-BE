import * as Yup from 'yup';

export const schema = Yup.object().shape({
  date: Yup.date()
    .required('La date est requise'),
  chauffeur_id: Yup.string()
    .required('Le chauffeur est requis'),
  vehicule_id: Yup.string()
    .required('Le véhicule est requis'),
  heure_debut: Yup.string()
    .required('L\'heure de début est requise')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:MM invalide'),
  heure_fin: Yup.string()
    .required('L\'heure de fin est requise')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:MM invalide')
    .test(
      'heure-superieure',
      'L\'heure de fin doit être après l\'heure de début',
      function(value) {
        return !this.parent.heure_debut || value > this.parent.heure_debut
      }
    ),
  interruptions: Yup.number()
    .min(0, 'Doit être positif')
    .nullable(),
  km_debut: Yup.number()
    .required('L\'index km de début est requis')
    .min(0, 'Doit être positif'),
  km_fin: Yup.number()
    .required('L\'index km de fin est requis')
    .min(Yup.ref('km_debut'), 'Doit être supérieur à l\'index de début'),
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
    .nullable(),
  courses: Yup.array().of(
    Yup.object().shape({
      index_depart: Yup.number()
        .required('Index départ requis')
        .min(0, 'Doit être positif'),
      index_arrivee: Yup.number()
        .required('Index arrivée requis')
        .min(Yup.ref('index_depart'), 'Doit être supérieur à l\'index de départ'),
      lieu_embarquement: Yup.string()
        .required('Lieu d\'embarquement requis'),
      lieu_debarquement: Yup.string()
        .required('Lieu de débarquement requis'),
      client_id: Yup.string()
        .required('Client requis'),
      prix_taximetre: Yup.number()
        .required('Prix requis')
        .min(0, 'Doit être positif'),
      mode_paiement: Yup.string()
        .required('Mode de paiement requis'),
      numero_bon: Yup.string()
        .when('mode_paiement', {
          is: 'facture',
          then: (schema) => schema.required('Numéro de bon requis pour les factures'),
          otherwise: (schema) => schema.nullable()
        })
    })
  ),
  charges: Yup.array().of(
    Yup.object().shape({
      type: Yup.string()
        .required('Type de charge requis'),
      montant: Yup.number()
        .required('Montant requis')
        .min(0, 'Doit être positif'),
      description: Yup.string()
        .nullable()
    })
  ),
  salaire_cash: Yup.number()
    .min(0, 'Doit être positif')
    .nullable(),
  notes: Yup.string()
    .nullable()
});
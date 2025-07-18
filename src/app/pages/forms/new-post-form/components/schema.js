import * as Yup from 'yup';

export const shiftSchema = Yup.object().shape({
  date: Yup.date().required(),
  start: Yup.string()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:MM invalide')
    .required(),
  estimated_end: Yup.string()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:MM invalide')
    .required(),
  vehicleId: Yup.string().required(),
  km_start: Yup.number().min(0).required(),
  prise_charge: Yup.number().min(0).required()
});

export const courseSchema = Yup.object().shape({
  depart: Yup.object().shape({
    lieu: Yup.string().required(),
    heure: Yup.string()
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:MM invalide')
      .required(),
    index: Yup.number().min(0)
  }),
  arrivee: Yup.object().shape({
    lieu: Yup.string().required(),
    heure: Yup.string()
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:MM invalide'),
    index: Yup.number().min(Yup.ref('depart.index'))
  }),
  prix: Yup.number().min(0).required(),
  somme_percue: Yup.number().min(0),
  mode_paiement: Yup.string()
    .oneOf(['cash', 'bancontact', 'facture'])
    .required(),
  client: Yup.string().when('mode_paiement', {
    is: 'facture',
    then: Yup.string().required()
  })
});

export const expenseSchema = Yup.object().shape({
  type: Yup.string()
    .oneOf(['carburant', 'peage', 'entretien', 'carwash', 'divers'])
    .required(),
  montant: Yup.number().min(0).required(),
  date: Yup.date().required()
});
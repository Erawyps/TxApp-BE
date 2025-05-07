import * as Yup from 'yup';

export const vehicleInfoSchema = Yup.object().shape({
  vehicle: Yup.object().shape({
    plaqueImmatriculation: Yup.string()
      .required('La plaque est requise')
      .matches(/^[A-Z]{2}-[0-9]{3}-[A-Z]{2}$/, 'Format invalide (ex: AB-123-CD)'),
    numeroIdentification: Yup.string()
      .required('Le numéro est requis')
      .min(3, 'Minimum 3 caractères')
  }),
  service: Yup.object().shape({
    date: Yup.date()
      .required('La date est requise')
      .max(new Date(), 'La date ne peut pas être future'),
    heureDebut: Yup.string()
      .required('L\'heure de début est requise')
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:MM'),
    heureFin: Yup.string()
      .nullable()
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:MM'),
    interruptions: Yup.string()
      .nullable()
      .matches(/^[0-9]+$/, 'Nombre entier seulement')
  }),
  taximetre: Yup.object().shape({
    priseEnChargeDebut: Yup.number()
      .required('La prise en charge est requise')
      .positive('Doit être positif'),
    priseEnChargeFin: Yup.number()
      .nullable()
      .positive('Doit être positif'),
    indexKmDebut: Yup.number()
      .required('L\'index début est requis')
      .integer('Nombre entier seulement')
      .positive('Doit être positif'),
    indexKmFin: Yup.number()
      .nullable()
      .integer('Nombre entier seulement')
      .positive('Doit être positif')
      .moreThan(Yup.ref('indexKmDebut'), 'Doit être > index début')
  }),
  charges: Yup.array()
    .of(
      Yup.object().shape({
        type: Yup.string().required('Type requis'),
        description: Yup.string().required('Description requise'),
        montant: Yup.number()
          .required('Montant requis')
          .positive('Doit être positif')
      })
    )
    .nullable(),
  notes: Yup.string().nullable()
});

export const coursesSchema = Yup.object().shape({
  courses: Yup.array().of(
    Yup.object().shape({
      indexDepart: Yup.number()
        .required('Index départ requis')
        .integer()
        .positive(),
      lieuEmbarquement: Yup.string().required('Lieu requis'),
      heureEmbarquement: Yup.string()
        .required('Heure requise')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:MM'),
      indexArrivee: Yup.number()
        .required('Index arrivée requis')
        .integer()
        .positive()
        .min(Yup.ref('indexDepart'), 'Doit être >= départ'),
      lieuDebarquement: Yup.string().required('Lieu requis'),
      heureDebarquement: Yup.string()
        .required('Heure requise')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:MM'),
      prixTaximetre: Yup.number()
        .required('Prix requis')
        .positive(),
      sommePercue: Yup.number()
        .required('Somme requise')
        .positive(),
        modePaiement: Yup.string()
        .required('Mode paiement requis')
        .oneOf(
          ["cash", "bancontact", "facture", "virement", "avance", "sncb", "william_lenox"],
          "Mode de paiement invalide"
        ),
    })
  )
});

export const validationSchema = Yup.object().shape({
  signature: Yup.string()
    .required('Signature requise')
    .min(3, 'Minimum 3 caractères'),
  dateSignature: Yup.date()
    .required('Date requise')
    .max(new Date(), 'Date future invalide'),
  salaireCash: Yup.number()
    .required('Montant requis')
    .min(0, 'Montant négatif invalide')
});
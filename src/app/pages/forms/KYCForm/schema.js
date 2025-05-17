import * as Yup from 'yup';

export const chauffeurSchema = Yup.object().shape({
  chauffeurId: Yup.string().required('Chauffeur requis'),
  periodeService: Yup.object().shape({
    date: Yup.date().required('Date requise'),
    heureDebut: Yup.string()
      .required('Heure début requise')
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:MM'),
    heureFin: Yup.string()
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:MM')
  }),
  remunerationType: Yup.string()
    .required('Type de rémunération requis')
    .oneOf(['fixe', '40percent', '30percent', 'mixte', 'heure10', 'heure12']),
  notes: Yup.string().nullable()
});

export const vehicleSchema = Yup.object().shape({
  plaqueImmatriculation: Yup.string()
    .required('Plaque requise')
    .matches(/^[A-Z]{2}-[0-9]{3}-[A-Z]{2}$/, 'Format invalide'),
  numeroIdentification: Yup.string().required('Numéro requis'),
  taximetre: Yup.object().shape({
    kmChargeDebut: Yup.number()
      .required('KM charge début requis')
      .positive('Doit être positif'),
    kmChargeFin: Yup.number()
      .positive('Doit être positif')
      .moreThan(Yup.ref('kmChargeDebut'), 'Doit être supérieur au début'),
    chutesDebut: Yup.number()
      .required('Chutes début requises')
      .positive('Doit être positif'),
    chutesFin: Yup.number()
      .positive('Doit être positif')
  })
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
      remunerationExceptionnelle: Yup.string()
        .oneOf(['fixe', '40percent', '30percent', 'mixte', 'heure10', 'heure12'])
    })
  ),
  notes: Yup.string().nullable()
});

export const chargesSchema = Yup.object().shape({
  charges: Yup.array().of(
    Yup.object().shape({
      type: Yup.string().required('Type requis'),
      description: Yup.string().required('Description requise'),
      montant: Yup.number()
        .required('Montant requis')
        .positive('Doit être positif'),
      modePaiement: Yup.string()
        .required('Mode paiement requis')
        .oneOf(["cash", "bancontact", "virement"])
    })
  )
});

export const validationSchema = Yup.object().shape({
  signature: Yup.string()
    .required('Signature requise')
    .min(3, 'Minimum 3 caractères'),
  dateSignature: Yup.date()
    .required('Date requise')
    .max(new Date(), 'Date future invalide')
});
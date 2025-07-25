import * as Yup from 'yup';

const parseNumber = (value) => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const num = parseFloat(value.toString().replace(',', '.'));
  return isNaN(num) ? 0 : num;
};

export const chauffeurSchema = Yup.object().shape({
  nom: Yup.string().required("Nom requis"),
  prenom: Yup.string().required("Prénom requis"),
  date: Yup.date().default(() => new Date()),
  heureDebut: Yup.string()
    .required("Heure de début requise")
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format HH:MM invalide"),
  heureFin: Yup.string()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format HH:MM invalide")
    .nullable(),
  interruptions: Yup.string()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format HH:MM invalide")
    .nullable(),
  regleSalaire: Yup.string()
    .required("Règle de salaire requise")
    .oneOf(["fixe", "40percent", "30percent", "mixte", "heure10", "heure12"]),
  tauxSalaire: Yup.number()
    .transform(parseNumber)
    .when('regleSalaire', {
      is: (val) => ["fixe", "heure10", "heure12"].includes(val),
      then: (schema) => schema.required("Taux requis").positive("Doit être positif"),
      otherwise: (schema) => schema.nullable()
    })
});

export const vehiculeSchema = Yup.object().shape({
  plaqueImmatriculation: Yup.string()
    .required("Plaque requise")
    .min(4, "Minimum 4 caractères")
    .max(10, "Maximum 10 caractères"),
  numeroIdentification: Yup.string().required("Numéro d'identification requis"),
  kmDebut: Yup.number()
    .required("Kilométrage de début requis")
    .positive("Doit être positif")
    .integer("Doit être un entier"),
  kmFin: Yup.number()
    .positive("Doit être positif")
    .integer("Doit être un entier")
    .min(Yup.ref("kmDebut"), "Doit être >= km début")
    .nullable(),
  priseEnChargeDebut: Yup.number().positive().nullable(),
  priseEnChargeFin: Yup.number().positive().min(Yup.ref("priseEnChargeDebut")).nullable(),
  kmTotalDebut: Yup.number().positive().nullable(),
  kmTotalFin: Yup.number().positive().min(Yup.ref("kmTotalDebut")).nullable(),
  kmEnChargeDebut: Yup.number().positive().nullable(),
  kmEnChargeFin: Yup.number().positive().min(Yup.ref("kmEnChargeDebut")).nullable(),
  chutesDebut: Yup.number().positive().nullable(),
  chutesFin: Yup.number().positive().nullable(),
  recettes: Yup.number().positive().nullable()
});

export const courseSchema = Yup.object().shape({
  indexDepart: Yup.number()
    .required("Index départ requis")
    .positive("Doit être positif")
    .integer("Doit être un entier"),
  indexArrivee: Yup.number()
    .required("Index arrivée requis")
    .positive("Doit être positif")
    .integer("Doit être un entier")
    .min(Yup.ref("indexDepart"), "Doit être >= index départ"),
  lieuEmbarquement: Yup.string().nullable(),
  lieuDebarquement: Yup.string().nullable(),
  heureEmbarquement: Yup.string()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format HH:MM invalide")
    .nullable(),
  heureDebarquement: Yup.string()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format HH:MM invalide")
    .nullable(),
  prixTaximetre: Yup.number()
    .transform(parseNumber)
    .required("Prix taximètre requis")
    .positive("Doit être positif"),
  sommePercue: Yup.number()
    .transform(parseNumber)
    .required("Somme perçue requise")
    .positive("Doit être positif"),
  modePaiement: Yup.string()
    .required("Mode paiement requis")
    .oneOf(["cash", "bancontact", "facture", "virement"]),
  clientFacture: Yup.string().when('modePaiement', {
    is: 'facture',
    then: Yup.string().required("Client requis pour les factures")
  })
});

export const chargeSchema = Yup.object().shape({
  type: Yup.string().required("Type de charge requis"),
  description: Yup.string().nullable(),
  montant: Yup.number()
    .transform(parseNumber)
    .required("Montant requis")
    .positive("Doit être positif"),
  modePaiement: Yup.string()
    .required("Mode paiement requis")
    .oneOf(["cash", "bancontact"])
});

export const feuilleRouteSchema = Yup.object().shape({
  date: Yup.date().required("Date requise"),
  heure_debut: Yup.string()
    .required("Heure de début requise")
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format HH:MM invalide"),
  heure_fin: Yup.string()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format HH:MM invalide")
    .nullable(),
  interruptions: Yup.string()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format HH:MM invalide")
    .nullable(),
  km_debut: Yup.number()
    .required("Kilométrage de début requis")
    .positive("Doit être positif")
    .integer("Doit être un entier"),
  km_fin: Yup.number()
    .positive("Doit être positif")
    .integer("Doit être un entier")
    .min(Yup.ref("km_debut"), "Doit être >= km début")
    .nullable(),
  prise_en_charge_debut: Yup.number().positive().nullable(),
  prise_en_charge_fin: Yup.number().positive().min(Yup.ref("prise_en_charge_debut")).nullable(),
  chutes_debut: Yup.number().positive().nullable(),
  chutes_fin: Yup.number().positive().nullable(),
  statut: Yup.string()
    .oneOf(["Planifiée", "En cours", "Terminée", "Annulée", "Validée"])
    .default("En cours"),
  saisie_mode: Yup.string()
    .oneOf(["chauffeur", "superviseur"])
    .default("chauffeur")
});
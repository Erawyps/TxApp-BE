import * as Yup from 'yup';

// Helpers pour la validation
const parseNumber = (value) => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const num = parseFloat(value.toString().replace(',', '.'));
  return isNaN(num) ? 0 : num;
};

// Schémas de validation
export const chauffeurSchema = Yup.object().shape({
  nom: Yup.string().required("Nom requis"),
  prenom: Yup.string().required("Prénom requis"),
  date: Yup.date().default(() => new Date()),
  heureDebut: Yup.string()
    .required("Heure de début requise")
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format HH:MM invalide"),
  heureFin: Yup.string()
    .required("Heure de fin requise")
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format HH:MM invalide"),
  interruptions: Yup.string()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format HH:MM invalide")
    .nullable(),
  regleSalaire: Yup.string()
    .required("Règle de salaire requise")
    .oneOf(["fixe", "40percent", "30percent", "mixte", "heure10", "heure12"]),
  tauxSalaire: Yup.number()
    .transform((value) => parseNumber(value))
    .when('regleSalaire', {
      is: (val) => ["fixe", "heure10", "heure12"].includes(val),
      then: (schema) => schema.required("Taux requis").positive("Doit être positif"),
      otherwise: (schema) => schema.nullable()
    }),
  note: Yup.string().nullable()
});

export const vehiculeSchema = Yup.object().shape({
  plaqueImmatriculation: Yup.string()
    .required("Plaque requise")
    .matches(/^[A-Z]{1,3}-[0-9]{1,4}$/, "Format invalide (ex: T-XXX-999)"),
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
    .oneOf(["cash", "bancontact", "facture", "virement"])
});

export const chargeSchema = Yup.object().shape({
  type: Yup.string()
    .required("Type de charge requis")
    .oneOf(["carburant", "peage", "entretien", "divers"]),
  description: Yup.string().nullable(),
  montant: Yup.number()
    .transform(parseNumber)
    .required("Montant requis")
    .positive("Doit être positif"),
  modePaiement: Yup.string()
    .required("Mode paiement requis")
    .oneOf(["cash", "bancontact", "virement"])
});

// Données mock pour les listes déroulantes
export const mockData = {
  reglesSalaire: [
    { label: "Contrat fixe", value: "fixe" },
    { label: "40% sur tout", value: "40percent" },
    { label: "30% sur tout", value: "30percent" },
    { label: "40% jusqu'à 180€ puis 30%", value: "mixte" },
    { label: "Heure 10€", value: "heure10" },
    { label: "Heure 12€", value: "heure12" }
  ],
  modesPaiement: [
    { label: "Cash", value: "cash" },
    { label: "Bancontact", value: "bancontact" },
    { label: "Facture", value: "facture" },
    { label: "Virement", value: "virement" }
  ],
  typesCharge: [
    { label: "Carburant", value: "carburant" },
    { label: "Péage", value: "peage" },
    { label: "Entretien", value: "entretien" },
    { label: "Divers", value: "divers" }
  ]
};
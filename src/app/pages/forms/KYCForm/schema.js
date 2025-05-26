import * as Yup from "yup";

export const chauffeurSchema = Yup.object().shape({
  nom: Yup.string().required("Nom requis"),
  prenom: Yup.string().required("Prénom requis"),
  date: Yup.date().default(() => new Date()),
  heureDebut: Yup.string().required("Heure de début requise"),
  heureFin: Yup.string().required("Heure de fin requise"),
  interruptions: Yup.string(),
  regleSalaire: Yup.string()
    .required("Règle de salaire requise")
    .oneOf(["fixe", "40percent", "30percent", "mixte", "heure10", "heure12"]),
  tauxSalaire: Yup.number()
    .typeError("Doit être un nombre")
    .positive("Doit être positif")
    .when('regleSalaire', {
      is: (val) => ["fixe", "heure10", "heure12"].includes(val),
      then: (schema) => schema.required("Taux requis"),
      otherwise: (schema) => schema.notRequired()
    })
    .transform((value) => value ? value.toString().replace(',', '.') : value)
});

export const vehiculeSchema = Yup.object().shape({
  plaqueImmatriculation: Yup.string()
  
    .matches(
      // Regex for Belgian license plates
      /^([A-Z]{1,2}-[A-Z]{3}-\d{3}|[A-Z]{1,2}-\d{3}-[A-Z]{3}|[A-Z]{1,2}-\d{2}-[A-Z]{2})$/,
      "Format de plaque invalide. Exemple valide: T-XAA-751"
    )
    .uppercase("Doit être en majuscules"),
  numeroIdentification: Yup.string().required("Numéro d'identification requis"),
  kmDebut: Yup.number()
    .typeError("Doit être un nombre")
    .positive("Doit être positif")
    .required("Kilométrage de début requis"),
  priseEnChargeDebut: Yup.number()
    .typeError("Doit être un nombre")
    .positive("Doit être positif"),
  priseEnChargeFin: Yup.number()
    .typeError("Doit être un nombre")
    .positive("Doit être positif"),
  kmTotalDebut: Yup.number()
    .typeError("Doit être un nombre")
    .positive("Doit être positif"),
  kmTotalFin: Yup.number()
    .typeError("Doit être un nombre")
    .positive("Doit être positif"),
  kmEnChargeDebut: Yup.number()
    .typeError("Doit être un nombre")
    .positive("Doit être positif"),
  kmEnChargeFin: Yup.number()
    .typeError("Doit être un nombre")
    .positive("Doit être positif"),
  chutesDebut: Yup.number()
    .typeError("Doit être un nombre")
    .positive("Doit être positif"),
  chutesFin: Yup.number()
    .typeError("Doit être un nombre")
    .positive("Doit être positif"),
  recettes: Yup.number()
    .typeError("Doit être un nombre")
    .positive("Doit être positif")
});

export const courseSchema = Yup.object().shape({
  indexDepart: Yup.number()
    .typeError("Doit être un nombre")
    .positive("Doit être positif")
    .required("Index de départ requis"),
  indexArrivee: Yup.number()
    .typeError("Doit être un nombre")
    .positive("Doit être positif")
    .min(
      Yup.ref("indexDepart"),
      "Doit être supérieur ou égal à l'index de départ"
    ),
  lieuEmbarquement: Yup.string(),
  lieuDebarquement: Yup.string(),
  heureEmbarquement: Yup.string(),
  heureDebarquement: Yup.string(),
  prixTaximetre: Yup.number()
    .typeError("Doit être un nombre")
    .positive("Doit être positif")
    .transform((value) => value ? value.toString().replace(',', '.') : value),
  sommePercue: Yup.number()
    .typeError("Doit être un nombre")
    .positive("Doit être positif")
    .required("Somme perçue requise")
    .transform((value) => value ? value.toString().replace(',', '.') : value),
  modePaiement: Yup.string()
    .required("Mode de paiement requis")
    .oneOf(["cash", "bancontact", "facture", "virement"], "Mode invalide")
});

export const chargeSchema = Yup.object().shape({
  type: Yup.string()
    .required("Type de charge requis")
    .oneOf(["carburant", "peage", "entretien", "divers"], "Type invalide"),
  description: Yup.string(),
  montant: Yup.number()
    .typeError("Doit être un nombre")
    .positive("Doit être positif")
    .required("Montant requis")
    .transform((value) => value ? value.toString().replace(',', '.') : value),
  modePaiement: Yup.string()
    .required("Mode de paiement requis")
    .oneOf(["cash", "bancontact", "virement"], "Mode invalide")
});
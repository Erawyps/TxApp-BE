import * as Yup from "yup";

export const chauffeurSchema = Yup.object().shape({
  nom: Yup.string().required("Nom requis"),
  prenom: Yup.string().required("Prénom requis"),
  regleSalaire: Yup.string()
    .required("Règle de salaire requise")
    .oneOf(["fixe", "40percent", "30percent", "mixte", "heure10", "heure12"]),
  // Rendre tauxSalaire conditionnel mais pas obligatoire si non applicable
  tauxSalaire: Yup.number().when('regleSalaire', {
    is: (val) => ["fixe", "heure10", "heure12"].includes(val),
    then: (schema) => schema.required("Taux requis"),
    otherwise: (schema) => schema.notRequired()
  })
});

export const vehiculeSchema = Yup.object().shape({
  plaqueImmatriculation: Yup.string()
    .required("Plaque requise")
    .matches(
      /^[1-9]-[A-Z]{3}-[0-9]{3}$|^[A-Z]{3}-[0-9]{3}$|^TX-[0-9]{3}-[A-Z]{3}$|^T-[0-9]{3}-[A-Z]{3}$/,
      "Format de plaque invalide. Exemples valides : 1-ABC-123, ABC-123, TX-123-ABC"
    )
    .uppercase("Doit être en majuscules"),
  kmDebut: Yup.number()
    .positive("Doit être positif")
    .required("Kilométrage de début requis"),
  kmFin: Yup.number()
    .positive("Doit être positif")
    .min(
      Yup.ref("kmDebut"),
      "Doit être supérieur ou égal au kilométrage de début"
    )
    .required("Kilométrage de fin requis"),
});

export const courseSchema = Yup.object().shape({
  indexDepart: Yup.number()
    .positive("Doit être positif")
    .required("Index de départ requis"),
  indexArrivee: Yup.number()
    .positive("Doit être positif")
    .min(
      Yup.ref("indexDepart"),
      "Doit être supérieur ou égal à l'index de départ"
    )
    .required("Index d'arrivée requis"),
  lieuEmbarquement: Yup.string().required("Lieu d'embarquement requis"),
  lieuDebarquement: Yup.string().required("Lieu de débarquement requis"),
  heureEmbarquement: Yup.string().required("Heure d'embarquement requise"),
  heureDebarquement: Yup.string().required("Heure de débarquement requise"),
  prixTaximetre: Yup.number()
    .positive("Doit être positif")
    .required("Prix taximètre requis"),
  sommePercue: Yup.number()
    .positive("Doit être positif")
    .required("Somme perçue requise"),
  modePaiement: Yup.string()
    .required("Mode de paiement requis")
    .oneOf(["cash", "bancontact", "facture", "virement"], "Mode invalide"),
  regleExceptionnelle: Yup.string().oneOf(
    ["fixe", "40percent", "30percent", "mixte", "heure10", "heure12", null],
    "Règle invalide"
  ),
});

export const chargeSchema = Yup.object().shape({
  type: Yup.string()
    .required("Type de charge requis")
    .oneOf(["carburant", "peage", "entretien", "divers"], "Type invalide"),
  description: Yup.string().required("Description requise"),
  montant: Yup.number()
    .positive("Doit être positif")
    .required("Montant requis"),
  modePaiement: Yup.string()
    .required("Mode de paiement requis")
    .oneOf(["cash", "bancontact", "virement"], "Mode invalide"),
});
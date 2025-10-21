// Import Dependencies
import * as Yup from 'yup';

// ----------------------------------------------------------------------

export const shiftSchema = Yup.object().shape({
  date: Yup.string() // Changé de Yup.date() à Yup.string()
    .required('Date requise'),
  heure_debut: Yup.string()
    .required('Heure de début requise'),
  heure_fin_estimee: Yup.string()
    .required('Heure de fin estimée requise'),
  interruptions: Yup.string()
    .required('Interruptions requises'),
  type_remuneration: Yup.string()
    .required('Type de rémunération requis'),
  vehicule_id: Yup.string()
    .required('Véhicule requis'),
  km_tableau_bord_debut: Yup.number()
    .transform((value, originalValue) => {
      return originalValue === '' ? undefined : value;
    })
    .min(0, 'Les kilomètres doivent être positifs')
    .required('Kilomètres tableau de bord requis'),
  taximetre_prise_charge_debut: Yup.number()
    .transform((value, originalValue) => {
      return originalValue === '' ? 0 : value;
    })
    .min(0, 'La valeur doit être positive')
    .nullable(),
  taximetre_index_km_debut: Yup.number()
    .transform((value, originalValue) => {
      return originalValue === '' ? 0 : value;
    })
    .min(0, 'L\'index km doit être positif')
    .nullable(),
  taximetre_km_charge_debut: Yup.number()
    .transform((value, originalValue) => {
      return originalValue === '' ? 0 : value;
    })
    .min(0, 'Les km en charge doivent être positifs')
    .nullable(),
  taximetre_chutes_debut: Yup.number()
    .transform((value, originalValue) => {
      return originalValue === '' ? 0 : value;
    })
    .min(0, 'Les chutes doivent être positives')
    .nullable()
});

export const getCourseSchema = (creationType = 'complete') => {
  const baseSchema = {
    numero_ordre: Yup.number()
      .min(1, 'Le numéro d\'ordre doit être supérieur à 0')
      .required('Numéro d\'ordre requis'),
    index_depart: Yup.number()
      .min(0, 'L\'index doit être positif'),
    index_embarquement: Yup.number()
      .min(0, 'L\'index embarquement doit être positif')
      .required('Index embarquement requis'),
    lieu_embarquement: Yup.string()
      .trim()
      .min(2, 'Le lieu d\'embarquement est trop court')
      .max(100, 'Le lieu d\'embarquement est trop long')
      .required('Lieu d\'embarquement requis'),
    heure_embarquement: Yup.string()
      .required('Heure d\'embarquement requise'),
    notes: Yup.string()
      .max(500, 'Les notes sont trop longues')
  };

  if (creationType === 'start') {
    // Pour les courses démarrées, seulement les champs minimaux sont requis
    return Yup.object().shape(baseSchema);
  } else {
    // Pour les courses complètes, tous les champs sont requis
    return Yup.object().shape({
      ...baseSchema,
      index_debarquement: Yup.number()
        .min(0, 'L\'index débarquement doit être positif')
        .required('Index débarquement requis')
        .test('greater-than-embarquement', 'L\'index débarquement doit être supérieur à l\'embarquement', function(value) {
          return value > this.parent.index_embarquement;
        }),
      lieu_debarquement: Yup.string()
        .trim()
        .min(2, 'Le lieu de débarquement est trop court')
        .max(100, 'Le lieu de débarquement est trop long')
        .required('Lieu de débarquement requis'),
      heure_debarquement: Yup.string()
        .required('Heure de débarquement requise'),
      prix_taximetre: Yup.number()
        .min(0, 'Le prix doit être positif')
        .required('Prix taximètre requis'),
      sommes_percues: Yup.number()
        .min(0, 'La somme perçue doit être positive')
        .required('Sommes perçues requises'),
      mode_paiement: Yup.string()
        .required('Mode de paiement requis'),
      client: Yup.string()
        .when('mode_paiement', {
          is: (val) => val && val.startsWith('F-'),
          then: (schema) => schema.required('Client requis pour les factures'),
          otherwise: (schema) => schema
        }),
      remuneration_chauffeur: Yup.string()
        .required('Rémunération chauffeur requise')
    });
  }
};

export const courseSchema = getCourseSchema('complete');

export const endShiftSchema = Yup.object().shape({
  heure_fin: Yup.string()
    .required('Heure de fin requise'),
  interruptions: Yup.number()
    .min(0, 'Les interruptions doivent être positives')
    .nullable(),
  km_tableau_bord_fin: Yup.number()
    .min(0, 'Les kilomètres doivent être positifs')
    .required('Kilomètres tableau de bord de fin requis'),
  taximetre_prise_charge_fin: Yup.number()
    .min(0, 'La valeur doit être positive'),
  taximetre_index_km_fin: Yup.number()
    .min(0, 'L\'index km doit être positif'),
  taximetre_km_charge_fin: Yup.number()
    .min(0, 'Les km en charge doivent être positifs'),
  taximetre_chutes_fin: Yup.number()
    .min(0, 'Les chutes doivent être positives'),
  observations: Yup.string()
    .max(1000, 'Les observations sont trop longues')
});
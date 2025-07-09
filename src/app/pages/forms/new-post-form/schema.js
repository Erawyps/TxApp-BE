import * as Yup from 'yup';

// Schéma de validation pour la feuille de route
export const schema = Yup.object().shape({
  header: Yup.object().shape({
    date: Yup.date().default(() => new Date()),
    chauffeur: Yup.object().shape({
      id: Yup.string().required('Chauffeur requis'),
    }).required('Chauffeur requis'),
    vehicule: Yup.object().shape({
      id: Yup.string().required('Véhicule requis'),
    }).required('Véhicule requis')
  }).required('Header requis'),

  shift: Yup.object().shape({
    start: Yup.string().nullable(),
    end: Yup.string().nullable(),
    interruptions: Yup.number().min(0, 'Les interruptions ne peuvent pas être négatives').default(0)
  }),

  kilometers: Yup.object().shape({
    start: Yup.number()
      .min(0, 'Le kilométrage ne peut pas être négatif')
      .required('Kilométrage de départ requis'),
    end: Yup.number()
      .min(0, 'Le kilométrage ne peut pas être négatif')
      .nullable()
      .when('start', {
        is: (start) => start != null,
        then: (schema) => schema.min(Yup.ref('start'), 'Le kilométrage de fin doit être supérieur au départ'),
        otherwise: (schema) => schema
      })
  }),

  courses: Yup.array().of(
    Yup.object().shape({
      id: Yup.string(),
      depart: Yup.object().shape({
        lieu: Yup.string().required('Lieu de départ requis'),
        heure: Yup.string()
      }),
      arrivee: Yup.object().shape({
        lieu: Yup.string().required('Lieu d\'arrivée requis'),
        heure: Yup.string()
      }),
      prix: Yup.number()
        .min(0, 'Le prix ne peut pas être négatif')
        .required('Prix requis'),
      mode_paiement: Yup.string()
        .oneOf(['cash', 'bancontact', 'facture'], 'Mode de paiement invalide')
        .default('cash'),
      client: Yup.string().nullable()
    })
  ).default([]),

  charges: Yup.array().of(
    Yup.object().shape({
      id: Yup.string(),
      type: Yup.string()
        .oneOf(['carburant', 'peage', 'entretien', 'carwash', 'divers'], 'Type de charge invalide')
        .required('Type requis'),
      montant: Yup.number()
        .min(0, 'Le montant ne peut pas être négatif')
        .required('Montant requis'),
      mode_paiement: Yup.string()
        .oneOf(['cash', 'bancontact'], 'Mode de paiement invalide')
        .default('cash'),
      description: Yup.string().nullable(),
      date: Yup.string()
    })
  ).default([])
});

// Données par défaut
export const defaultData = {
  header: {
    date: new Date(),
    chauffeur: { id: "CH001" },
    vehicule: { id: "VH001" }
  },
  shift: {
    start: "",
    end: "",
    interruptions: 0
  },
  kilometers: {
    start: 0,
    end: null
  },
  courses: [],
  charges: []
};
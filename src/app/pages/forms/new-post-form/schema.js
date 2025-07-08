import * as Yup from 'yup';

export const schema = Yup.object().shape({
  header: Yup.object().shape({
    date: Yup.date().default(() => new Date()),
    chauffeur: Yup.object().shape({
      id: Yup.string().required('Chauffeur requis'),
    }).required('Chauffeur requis'),
    vehicule: Yup.object().shape({
      id: Yup.string().required('Véhicule requis'),
      plaque_immatriculation: Yup.string().optional(),
      numero_identification: Yup.string().optional(),
      marque: Yup.string().optional(),
      modele: Yup.string().optional(),
      type_vehicule: Yup.string().optional()
    }).required('Véhicule requis')
  }).required('Header requis'),

  shift: Yup.object().shape({
    start: Yup.string().nullable(),
    end: Yup.string().nullable(),
    interruptions: Yup.number().min(0).default(0)
  }),

  kilometers: Yup.object().shape({
    start: Yup.number().min(0).required('Kilométrage de départ requis'),
    end: Yup.number().min(0).nullable()
      .when('start', {
        is: (start) => start != null,
        then: (schema) => schema.min(Yup.ref('start'), 'Le kilométrage de fin doit être supérieur au départ'),
        otherwise: (schema) => schema
      })
  }),

  courses: Yup.array().of(
    Yup.object().shape({
      id: Yup.string().optional(),
      depart: Yup.object().shape({
        lieu: Yup.string().required('Lieu de départ requis'),
        heure: Yup.string().optional()
      }),
      arrivee: Yup.object().shape({
        lieu: Yup.string().required('Lieu d\'arrivée requis'),
        heure: Yup.string().optional()
      }),
      prix: Yup.number().min(0).required('Prix requis'),
      mode_paiement: Yup.string().oneOf(['cash', 'bancontact', 'facture']).default('cash'),
      client: Yup.string().nullable()
    })
  ).default([]),

  charges: Yup.array().of(
    Yup.object().shape({
      id: Yup.string().optional(),
      type: Yup.string().oneOf(['carburant', 'peage', 'entretien', 'carwash', 'divers']).required('Type requis'),
      montant: Yup.number().min(0).required('Montant requis'),
      mode_paiement: Yup.string().oneOf(['cash', 'bancontact']).default('cash'),
      description: Yup.string().nullable(),
      date: Yup.string().optional()
    })
  ).default([])
});

export const defaultData = {
  header: {
    date: new Date(),
    chauffeur: { id: "CH001" },
    vehicule: { 
      id: "VH001",
      plaque_immatriculation: "",
      numero_identification: "",
      marque: "",
      modele: "",
      type_vehicule: ""
    }
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
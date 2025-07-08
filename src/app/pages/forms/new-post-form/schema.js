import * as Yup from 'yup';

export const schema = Yup.object().shape({
  header: Yup.object().shape({
    date: Yup.date().required('La date est requise'),
    chauffeur: Yup.object().shape({
      id: Yup.string().required(),
      nom: Yup.string().required(),
      prenom: Yup.string().required(),
      numero_badge: Yup.string().required()
    }),
    vehicule: Yup.object().shape({
      id: Yup.string().required(),
      plaque_immatriculation: Yup.string().required(),
      numero_identification: Yup.string().required()
    })
  }),
  shift: Yup.object().shape({
    start: Yup.string().required(),
    end: Yup.string().nullable(),
    interruptions: Yup.number().min(0).nullable()
  }),
  kilometers: Yup.object().shape({
    start: Yup.number().required().min(0),
    end: Yup.number().nullable().min(Yup.ref('start'))
  }),
  courses: Yup.array().of(
    Yup.object().shape({
      id: Yup.string().required(),
      depart: Yup.object().shape({
        lieu: Yup.string().required(),
        index: Yup.number().required().min(0),
        heure: Yup.string().required()
      }),
      arrivee: Yup.object().shape({
        lieu: Yup.string().required(),
        index: Yup.number().required().min(Yup.ref('..depart.index'))
      }),
      prix: Yup.number().required().min(0),
      mode_paiement: Yup.string().required()
    })
  ),
  charges: Yup.array().of(
    Yup.object().shape({
      id: Yup.string().required(),
      type: Yup.string().required(),
      montant: Yup.number().required().min(0),
      mode_paiement: Yup.string().required()
    })
  ),
  validation: Yup.object().shape({
    signature: Yup.string().required(),
    date_validation: Yup.date().nullable()
  })
});
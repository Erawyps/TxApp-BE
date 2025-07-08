import * as Yup from 'yup';

export const schema = Yup.object().shape({
  header: Yup.object().shape({
    date: Yup.date().default(() => new Date()),
    chauffeur: Yup.object().shape({
      id: Yup.string().required('Chauffeur requis'),
    }),
    vehicule: Yup.object().shape({
      id: Yup.string().required('Véhicule requis'),
    })
  }),

  shift: Yup.object().shape({
    start: Yup.string(),
    end: Yup.string(),
    interruptions: Yup.number().min(0)
  }),

  kilometers: Yup.object().shape({
    start: Yup.number().min(0),
    end: Yup.number().min(Yup.ref('start'))
  }),

  courses: Yup.array().of(
    Yup.object().shape({
      depart: Yup.object().shape({
        lieu: Yup.string().required('Lieu requis'),
      }),
      arrivee: Yup.object().shape({
        lieu: Yup.string().required('Lieu requis'),
      }),
      prix: Yup.number().min(0).required('Prix requis'),
    })
  ),

  charges: Yup.array().of(
    Yup.object().shape({
      type: Yup.string().required('Type requis'),
      montant: Yup.number().min(0).required('Montant requis'),
    })
  )
});

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
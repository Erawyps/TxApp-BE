import * as Yup from 'yup';

export const schema = Yup.object().shape({
  header: Yup.object().shape({
    date: Yup.date()
      .required('La date est requise')
      .default(() => new Date()),
    chauffeur: Yup.object().shape({
      id: Yup.string().required('Chauffeur requis'),
      nom: Yup.string().required('Nom requis'),
      prenom: Yup.string().required('Prénom requis'),
      numero_badge: Yup.string().required('Numéro de badge requis')
    }),
    vehicule: Yup.object().shape({
      id: Yup.string().required('Véhicule requis'),
      plaque_immatriculation: Yup.string().required('Plaque requise'),
      numero_identification: Yup.string().required('Numéro d\'identification requis')
    })
  }),

  shift: Yup.object().shape({
    start: Yup.string()
      .required('Heure de début requise')
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:MM invalide'),
    end: Yup.string()
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:MM invalide'),
    interruptions: Yup.number()
      .min(0, 'Doit être positif')
      .nullable()
  }),

  kilometers: Yup.object().shape({
    start: Yup.number()
      .required('Km de début requis')
      .min(0, 'Doit être positif'),
    end: Yup.number()
      .min(Yup.ref('start'), 'Doit être supérieur au km de début')
      .nullable()
  }),

  courses: Yup.array().of(
    Yup.object().shape({
      depart: Yup.object().shape({
        lieu: Yup.string().required('Lieu de départ requis'),
        heure: Yup.string()
          .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:MM invalide')
          .required('Heure départ requise')
      }),
      arrivee: Yup.object().shape({
        lieu: Yup.string().required('Lieu d\'arrivée requis')
      }),
      prix: Yup.number()
        .required('Prix requis')
        .min(0, 'Doit être positif'),
      mode_paiement: Yup.string()
        .required('Mode paiement requis')
        .oneOf(['cash', 'bancontact', 'facture']),
      client: Yup.string()
        .when('mode_paiement', {
          is: 'facture',
          then: Yup.string().required('Client requis pour les factures')
        })
    })
  ),

  charges: Yup.array().of(
    Yup.object().shape({
      type: Yup.string()
        .required('Type de charge requis')
        .oneOf(['carburant', 'peage', 'entretien', 'carwash', 'divers']),
      montant: Yup.number()
        .required('Montant requis')
        .min(0, 'Doit être positif'),
      mode_paiement: Yup.string()
        .required('Mode paiement requis')
        .oneOf(['cash', 'bancontact']),
      description: Yup.string().nullable()
    })
  )
});

export const defaultData = {
  header: {
    date: new Date(),
    chauffeur: {
      id: "CH001",
      nom: "Tehou",
      prenom: "Hasler",
      numero_badge: "TX-2023-001"
    },
    vehicule: {
      id: "VH001",
      plaque_immatriculation: "TX-AA-171",
      numero_identification: "10"
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
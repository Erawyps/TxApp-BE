import * as Yup from 'yup';

export const schema = Yup.object().shape({
  // En-tête de la feuille de route (informations mises en avant)
  header: Yup.object().shape({
    date: Yup.date()
      .required('La date est requise')
      .default(() => new Date()),
    chauffeur: Yup.object().shape({
      id: Yup.string().required('Chauffeur requis'),
      nom: Yup.string().required('Nom requis'),
      prenom: Yup.string().required('Prénom requis'),
      badge: Yup.string().required('Numéro de badge requis')
    }),
    vehicule: Yup.object().shape({
      id: Yup.string().required('Véhicule requis'),
      plaque: Yup.string()
        .required('Plaque requise')
        .matches(/^[A-Z]{2}-[0-9]{3}-[A-Z]{2}$/, 'Format plaque invalide'),
      numero: Yup.string().required('Numéro d\'identification requis')
    })
  }),

  // Période de service
  shift: Yup.object().shape({
    start: Yup.string()
      .required('Heure de début requise')
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:MM invalide'),
    end: Yup.string()
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:MM invalide')
      .test(
        'heure-superieure',
        'L\'heure de fin doit être après l\'heure de début',
        function(value) {
          return !this.parent.start || !value || value > this.parent.start
        }
      ),
    interruptions: Yup.number()
      .min(0, 'Doit être positif')
      .nullable()
  }),

  // Kilométrage
  kilometers: Yup.object().shape({
    start: Yup.number()
      .required('Km de début requis')
      .min(0, 'Doit être positif'),
    end: Yup.number()
      .min(Yup.ref('start'), 'Doit être supérieur au km de début')
      .nullable()
  }),

  // Courses
  courses: Yup.array().of(
    Yup.object().shape({
      id: Yup.string().required(),
      order: Yup.number().required(),
      depart: Yup.object().shape({
        lieu: Yup.string().required('Lieu de départ requis'),
        index: Yup.number()
          .required('Index départ requis')
          .min(0, 'Doit être positif'),
        heure: Yup.string()
          .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:MM invalide')
          .required('Heure départ requise'),
        position: Yup.object().shape({
          lat: Yup.number(),
          lng: Yup.number()
        }).nullable()
      }),
      arrivee: Yup.object().shape({
        lieu: Yup.string().required('Lieu d\'arrivée requis'),
        index: Yup.number()
          .required('Index arrivée requis')
          .min(Yup.ref('..depart.index'), 'Doit être supérieur à l\'index de départ'),
        heure: Yup.string()
          .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:MM invalide')
          .nullable(),
        position: Yup.object().shape({
          lat: Yup.number(),
          lng: Yup.number()
        }).nullable()
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
        }),
      notes: Yup.string().nullable()
    })
  ),

  // Charges
  charges: Yup.array().of(
    Yup.object().shape({
      id: Yup.string().required(),
      type: Yup.string()
        .required('Type de charge requis')
        .oneOf(['carburant', 'peage', 'entretien', 'carwash', 'divers']),
      montant: Yup.number()
        .required('Montant requis')
        .min(0, 'Doit être positif'),
      mode_paiement: Yup.string()
        .required('Mode paiement requis')
        .oneOf(['cash', 'bancontact']),
      description: Yup.string().nullable(),
      date: Yup.date().default(() => new Date())
    })
  ),

  // Totaux et validation
  totals: Yup.object().shape({
    recettes: Yup.number().min(0),
    charges: Yup.number().min(0),
    salaire: Yup.number().min(0)
  }),

  validation: Yup.object().shape({
    signature: Yup.string().required('Signature requise'),
    date_validation: Yup.date().default(() => new Date())
  })
});
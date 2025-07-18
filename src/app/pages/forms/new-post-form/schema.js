import * as Yup from 'yup';

export const remunerationTypes = [
  { value: '40/30', label: '40% jusqu\'à 180€ puis 30%' },
  { value: '50', label: '50% fixe' },
  { value: 'other', label: 'Autre' }
];

export const schema = Yup.object().shape({
  shift: Yup.object().shape({
    date: Yup.date()
      .required('La date est requise')
      .default(() => new Date()),
    start: Yup.string()
      .required('Heure de début requise')
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:MM invalide'),
    estimatedEnd: Yup.string()
      .required('Heure de fin estimée requise')
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:MM invalide'),
    actualEnd: Yup.string()
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:MM invalide')
      .test(
        'after-start',
        'Doit être après l\'heure de début',
        function(value) {
          return !this.parent.start || !value || value > this.parent.start;
        }
      ),
    interruptions: Yup.string()
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:MM invalide'),
    remunerationType: Yup.string()
      .oneOf(remunerationTypes.map(t => t.value))
      .required('Type de rémunération requis')
  }).required(),
  
  vehicle: Yup.object().shape({
    id: Yup.string().required('Véhicule requis'),
    startKm: Yup.number()
      .required('Kilométrage début requis')
      .min(0, 'Doit être positif'),
    endKm: Yup.number()
      .min(Yup.ref('startKm'), 'Doit être ≥ km début')
      .when('startKm', (startKm, schema) => (
        startKm ? schema.required('Kilométrage fin requis') : schema
      ))
  }).required(),

  taximeter: Yup.object().shape({
    startCharge: Yup.number().min(0, 'Doit être positif'),
    startTotalKm: Yup.number().min(0, 'Doit être positif'),
    startInChargeKm: Yup.number().min(0, 'Doit être positif'),
    startFalls: Yup.number().min(0, 'Doit être positif'),
    endCharge: Yup.number().min(0, 'Doit être positif'),
    endTotalKm: Yup.number().min(0, 'Doit être positif'),
    endInChargeKm: Yup.number().min(0, 'Doit être positif'),
    endFalls: Yup.number().min(0, 'Doit être positif')
  }),

  courses: Yup.array().of(
    Yup.object().shape({
      id: Yup.string().required(),
      order: Yup.number().required(),
      startIndex: Yup.number().min(0, 'Doit être positif'),
      startLocation: Yup.string().required('Lieu départ requis'),
      startTime: Yup.string()
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:MM invalide')
        .required('Heure départ requise'),
      endIndex: Yup.number()
        .min(Yup.ref('startIndex'), 'Doit être ≥ index départ')
        .required('Index arrivée requis'),
      endLocation: Yup.string().required('Lieu arrivée requis'),
      endTime: Yup.string()
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:MM invalide'),
      meterPrice: Yup.number()
        .required('Prix taximètre requis')
        .min(0, 'Doit être positif'),
      amountReceived: Yup.number()
        .required('Somme perçue requise')
        .min(0, 'Doit être positif'),
      paymentMethod: Yup.string().required('Mode paiement requis'),
      client: Yup.string().when('paymentMethod', {
        is: (val) => val.startsWith('F-'),
        then: Yup.string().required('Client requis pour facture')
      }),
      notes: Yup.string()
    })
  ).default([]),

  expenses: Yup.array().of(
    Yup.object().shape({
      id: Yup.string().required(),
      type: Yup.string().required('Type dépense requis'),
      amount: Yup.number()
        .required('Montant requis')
        .min(0, 'Doit être positif'),
      paymentMethod: Yup.string().required('Mode paiement requis'),
      date: Yup.date().default(() => new Date()),
      description: Yup.string()
    })
  ).default([]),

  validation: Yup.object().shape({
    signature: Yup.string().required('Signature requise'),
    fullName: Yup.string().required('Nom complet requis'),
    date: Yup.date().default(() => new Date())
  }).required()
});

export const defaultData = {
  shift: {
    date: new Date(),
    start: '',
    estimatedEnd: '',
    actualEnd: '',
    interruptions: '',
    remunerationType: '40/30'
  },
  vehicle: {
    id: '',
    startKm: null,
    endKm: null
  },
  taximeter: {
    startCharge: null,
    startTotalKm: null,
    startInChargeKm: null,
    startFalls: null,
    endCharge: null,
    endTotalKm: null,
    endInChargeKm: null,
    endFalls: null
  },
  courses: [],
  expenses: [],
  validation: {
    signature: '',
    fullName: '',
    date: null
  }
};
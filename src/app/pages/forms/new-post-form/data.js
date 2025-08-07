// Mock Data pour TxApp
export const mockData = {
  driver: {
    id: 1,
    nom: "Dubois",
    prenom: "Jean",
    numero_badge: "TX001",
    type_contrat: "Indépendant",
    telephone: "+32 475 123 456",
    email: "jean.dubois@email.com"
  },

  vehicles: [
    {
      id: "1",
      plaque_immatriculation: "1-ABC-123",
      numero_identification: "TX001",
      marque: "Mercedes",
      modele: "Classe E",
      type_vehicule: "Berline",
      annee: 2020,
      couleur: "Noir"
    },
    {
      id: "2",
      plaque_immatriculation: "1-DEF-456",
      numero_identification: "TX002",
      marque: "BMW",
      modele: "Série 5",
      type_vehicule: "Berline",
      annee: 2021,
      couleur: "Bleu"
    }
  ],

  courses: [
    {
      id: 1,
      numero_ordre: 1,
      index_depart: 125430,
      index_embarquement: 125432,
      lieu_embarquement: "Place Eugène Flagey",
      heure_embarquement: "09:15",
      index_debarquement: 125445,
      lieu_debarquement: "Gare Centrale",
      heure_debarquement: "09:35",
      prix_taximetre: 18.50,
      sommes_percues: 20.00,
      mode_paiement: "CASH",
      client: "",
      remuneration_chauffeur: "Indépendant",
      notes: "Client régulier",
      status: "completed"
    },
    {
      id: 2,
      numero_ordre: 2,
      index_depart: 125445,
      index_embarquement: 125448,
      lieu_embarquement: "Avenue Louise 150",
      heure_embarquement: "10:20",
      index_debarquement: 125465,
      lieu_debarquement: "Aéroport de Bruxelles",
      heure_debarquement: "10:55",
      prix_taximetre: 45.80,
      sommes_percues: 45.80,
      mode_paiement: "CARD",
      client: "",
      remuneration_chauffeur: "Indépendant",
      notes: "Course longue",
      status: "completed"
    },
    {
      id: 3,
      numero_ordre: 3,
      index_depart: 125465,
      index_embarquement: 125470,
      lieu_embarquement: "Rue de la Loi 200",
      heure_embarquement: "14:10",
      index_debarquement: 125485,
      lieu_debarquement: "Place Sainte-Catherine",
      heure_debarquement: "14:30",
      prix_taximetre: 12.40,
      sommes_percues: 15.00,
      mode_paiement: "CASH",
      client: "",
      remuneration_chauffeur: "Indépendant",
      notes: "",
      status: "completed"
    }
  ]
};

// Options pour les formulaires
export const paymentMethods = [
  { value: 'CASH', label: 'Espèces' },
  { value: 'CARD', label: 'Carte bancaire' },
  { value: 'VOUCHER', label: 'Bon de transport' },
  { value: 'F-ENTREPRISE', label: 'Facture entreprise' },
  { value: 'F-PARTICULIER', label: 'Facture particulier' },
  { value: 'APP', label: 'Application mobile' }
];

export const contractTypes = [
  { value: 'Indépendant', label: 'Indépendant' },
  { value: 'Salarié', label: 'Salarié' },
  { value: 'Locataire', label: 'Locataire véhicule' }
];

export const statusOptions = [
  { value: 'all', label: 'Toutes les courses' },
  { value: 'completed', label: 'Terminées' },
  { value: 'in-progress', label: 'En cours' },
  { value: 'cancelled', label: 'Annulées' }
];
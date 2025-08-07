// Données simulées pour l'application Taxi

export const mockData = {
  courses: [
    {
      id: 1,
      numero_ordre: 1,
      index_embarquement: 152,
      lieu_embarquement: "Place Eugène Flagey",
      heure_embarquement: "08:30",
      index_debarquement: 158,
      lieu_debarquement: "Gare Centrale",
      heure_debarquement: "08:45",
      prix_taximetre: 12.50,
      sommes_percues: 15.00,
      mode_paiement: "CASH",
      notes: "Client très aimable",
      status: "completed"
    },
    {
      id: 2,
      numero_ordre: 2,
      index_embarquement: 158,
      lieu_embarquement: "Gare Centrale",
      heure_embarquement: "09:15",
      index_debarquement: 165,
      lieu_debarquement: "Avenue Louise 123",
      heure_debarquement: "09:35",
      prix_taximetre: 18.75,
      sommes_percues: 20.00,
      mode_paiement: "BC",
      notes: "",
      status: "completed"
    }
  ],
  vehicles: [
    {
      id: "VH001",
      plaque_immatriculation: "TX-AA-171",
      numero_identification: "10",
      marque: "Mercedes",
      modele: "Classe E",
      type_vehicule: "Berline"
    }
  ],
  driver: {
    nom: "Tehou",
    prenom: "Hasler",
    numero_badge: "TX-2023-001",
    type_contrat: "Indépendant"
  }
};

export const paymentMethods = [
  { value: 'CASH', label: 'Espèces' },
  { value: 'BC', label: 'Bancontact' },
  { value: 'VIR', label: 'Virement' },
  { value: 'F-SNCB', label: 'Facture SNCB' },
  { value: 'F-WL', label: 'Facture Wallonie' },
  { value: 'F-TX', label: 'Facture Taxi' }
];

export const contractTypes = [
  { value: 'Indépendant', label: 'Indépendant' },
  { value: 'CDI', label: 'CDI' },
  { value: 'CDD', label: 'CDD' }
];

export const statusOptions = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'completed', label: 'Terminées' },
  { value: 'in-progress', label: 'En cours' },
  { value: 'cancelled', label: 'Annulées' }
];
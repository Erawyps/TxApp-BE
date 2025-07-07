export const defaultData = {
  header: {
    date: new Date(),
    chauffeur: {
      id: "CH001",
      nom: "Tehou",
      prenom: "Hasler",
      badge: "TX-2023-001"
    },
    vehicule: {
      id: "VH001",
      plaque: "TX-AA-171",
      numero: "10"
    }
  },
  shift: {
    start: "08:00",
    end: null,
    interruptions: 0
  },
  kilometers: {
    start: 125000,
    end: null
  },
  courses: [],
  charges: [],
  totals: {
    recettes: 0,
    charges: 0,
    salaire: 0
  },
  validation: {
    signature: "",
    date_validation: null
  }
};

export const sampleData = {
  ...defaultData,
  shift: {
    start: "08:00",
    end: "16:30",
    interruptions: 30
  },
  kilometers: {
    start: 125000,
    end: 125240
  },
  courses: [
    {
      id: "CRS001",
      order: 1,
      depart: {
        lieu: "Gare Centrale, Bruxelles",
        index: 125000,
        heure: "08:15",
        position: { lat: 50.8455, lng: 4.3571 }
      },
      arrivee: {
        lieu: "Aéroport de Bruxelles",
        index: 125025,
        heure: "08:45",
        position: { lat: 50.9014, lng: 4.4844 }
      },
      prix: 45.50,
      mode_paiement: "cash",
      notes: "Client pressé"
    },
    // ... autres courses
  ],
  charges: [
    {
      id: "CHG001",
      type: "carburant",
      montant: 65.20,
      mode_paiement: "bancontact",
      description: "Plein d'essence",
      date: new Date()
    }
  ],
  totals: {
    recettes: 215.75,
    charges: 85.20,
    salaire: 130.55
  },
  validation: {
    signature: "data:image/png;base64,...",
    date_validation: new Date()
  }
};
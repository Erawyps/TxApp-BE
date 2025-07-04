export const PDF_MAPPING = {
  // En-tête
  date: { x: 90, y: 78, size: 11 },
  chauffeur: { x: 280, y: 78, size: 11 },

  // Véhicule
  plaqueImmatriculation: { x: 90, y: 108, size: 10 },
  numeroIdentification: { x: 300, y: 108, size: 10 },

  // Service
  heureDebut: { x: 73, y: 154, size: 10 },
  heureFin: { x: 130, y: 154, size: 10 },
  interruptions: { x: 205, y: 154, size: 10 },
  totalHeures: { x: 275, y: 154, size: 10 },
  kmDebut: { x: 370, y: 154, size: 10 },
  kmFin: { x: 370, y: 169, size: 10 },
  kmParcourus: { x: 370, y: 184, size: 10 },

  // Prise en charge
  kmCharge: { x: 305, y: 216, size: 10 },
  chutes: { x: 410, y: 216, size: 10 },
  recettes: { x: 510, y: 216, size: 10 },

  // Courses
  courses: {
    startY: 262,
    rowHeight: 23.5,
    maxPage1: 8,
    columns: {
      numero: { x: 37, width: 18 },
      indexDepart: { x: 57, width: 28 },
      lieuEmbarquement: { x: 102, width: 90 },
      heureEmbarquement: { x: 193, width: 50 },
      indexArrivee: { x: 247, width: 28 },
      lieuDebarquement: { x: 292, width: 90 },
      heureDebarquement: { x: 383, width: 50 },
      prix: { x: 437, width: 50 },
      somme: { x: 500, width: 60 }
    }
  },

  // Signature
  signature: { x: 100, y: 725, size: 10 },
  salaireCash: { x: 300, y: 725, size: 10 },

  // Notes
  notes: { x: 60, y: 745, size: 9, maxWidth: 450 }
};

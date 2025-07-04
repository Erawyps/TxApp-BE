export const PDF_MAPPING = {
  // Page 1 - En-tête
  date: { x: 100, y: 100, size: 11 },
  chauffeur: { x: 300, y: 100, size: 11 },
  
  // Section Véhicule
  plaqueImmatriculation: { x: 100, y: 130, size: 10 },
  numeroIdentification: { x: 300, y: 130, size: 10 },
  
  // Section Service
  heureDebut: { x: 100, y: 180, size: 10 },
  heureFin: { x: 200, y: 180, size: 10 },
  kmDebut: { x: 300, y: 180, size: 10 },
  kmFin: { x: 400, y: 180, size: 10 },
  interruptions: { x: 100, y: 200, size: 10 },
  totalHeures: { x: 200, y: 200, size: 10 },
  kmParcourus: { x: 300, y: 200, size: 10 },
  
  // Section Courses
  courses: {
    startY: 220,
    rowHeight: 20,
    maxPage1: 8,
    columns: {
      numero: { x: 50, width: 30 },
      indexDepart: { x: 90, width: 60 },
      lieuEmbarquement: { x: 160, width: 90 },
      heureEmbarquement: { x: 260, width: 60 },
      indexArrivee: { x: 330, width: 60 },
      lieuDebarquement: { x: 400, width: 90 },
      heureDebarquement: { x: 500, width: 60 },
      prix: { x: 570, width: 70 },
      somme: { x: 650, width: 70 }
    }
  }
};
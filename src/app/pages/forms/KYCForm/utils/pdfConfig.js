export const PDF_COORDINATES = {
  // Page 1
  date: { x: 100, y: 100 },
  chauffeurNom: { x: 300, y: 100 },
  plaqueImmatriculation: { x: 100, y: 130 },
  numeroIdentification: { x: 300, y: 130 },
  
  // Section Service
  heureDebut: { x: 100, y: 180 },
  heureFin: { x: 200, y: 180 },
  kmDebut: { x: 300, y: 180 },
  kmFin: { x: 400, y: 180 },
  interruptions: { x: 100, y: 200 },
  totalHeures: { x: 200, y: 200 },
  kmParcourus: { x: 300, y: 200 },
  
  // Section Courses
  courses: {
    startY: 220,
    rowHeight: 20,
    columns: {
      numero: { x: 50, width: 30 },
      indexDepart: { x: 80, width: 70 },
      lieuEmbarquement: { x: 150, width: 100 },
      heureEmbarquement: { x: 250, width: 100 },
      indexArrivee: { x: 350, width: 70 },
      lieuDebarquement: { x: 420, width: 100 },
      heureDebarquement: { x: 520, width: 100 },
      prixTaximetre: { x: 620, width: 80 },
      sommePercue: { x: 700, width: 80 }
    },
    maxRowsPage1: 8
  }
};
interface Vehicle {
  id: string;
  plaque: string;
  marque: string;
  modele: string;
  type: string;
  km: number;
}

interface Course {
  id: string;
  order: number;
  depart: {
    index: number;
    lieu: string;
    heure: string;
  };
  arrivee: {
    index: number;
    lieu: string;
    heure: string;
  };
  prix: number;
  somme_percue: number;
  mode_paiement: 'cash' | 'bancontact' | 'facture';
  client?: string;
  notes?: string;
}

interface Depense {
  id: string;
  type: 'carburant' | 'peage' | 'entretien' | 'carwash' | 'divers';
  montant: number;
  date: string;
  description?: string;
}

interface Shift {
  date: string;
  start: string;
  estimated_end: string;
  end?: string;
  interruptions: string;
  vehicle: Vehicle;
}
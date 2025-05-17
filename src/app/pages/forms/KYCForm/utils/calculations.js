export function calculerSalaire(remunerationType, montantTotal, heures) {
  switch(remunerationType) {
    case 'fixe':
      return 0; // À adapter selon le contrat fixe
    case '40percent':
      return montantTotal * 0.4;
    case '30percent':
      return montantTotal * 0.3;
    case 'mixte': {
      const seuil = 180;
      return montantTotal <= seuil 
        ? montantTotal * 0.4 
        : (seuil * 0.4) + ((montantTotal - seuil) * 0.3);
    }
    case 'heure10':
      return heures * 10;
    case 'heure12':
      return heures * 12;
    default:
      return 0;
  }
}

export function calculerHeuresTravaillees(heureDebut, heureFin) {
  if (!heureDebut || !heureFin) return 0;
  
  const [h1, m1] = heureDebut.split(':').map(Number);
  const [h2, m2] = heureFin.split(':').map(Number);
  
  return (h2 - h1) + (m2 - m1) / 60;
}
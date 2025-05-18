export function calculerSalaire(typeRemuneration, courses, dateDebut, dateFin) {
  let montant = 0;
  let type = "";

  switch (typeRemuneration) {
    case "fixe": {
      // Calcul basé sur les heures travaillées
      const heures = (dateFin - dateDebut) / (1000 * 60 * 60);
      montant = heures * 10; // Exemple: 10€/h
      type = "Salaire fixe";
      break;
    }

    case "40": {
      // 40% sur tout le CA
      const ca40 = courses.reduce((sum, course) => sum + course.sommePercue, 0);
      montant = ca40 * 0.4;
      type = "40% du CA";
      break;
    }

    case "30": {
      // 30% sur tout le CA
      const ca30 = courses.reduce((sum, course) => sum + course.sommePercue, 0);
      montant = ca30 * 0.3;
      type = "30% du CA";
      break;
    }

    case "40-30": {
      // 40% jusqu'à 180€ puis 30%
      const ca = courses.reduce((sum, course) => sum + course.sommePercue, 0);
      if (ca <= 180) {
        montant = ca * 0.4;
      } else {
        montant = 180 * 0.4 + (ca - 180) * 0.3;
      }
      type = "40% jusqu'à 180€ puis 30%";
      break;
    }

    case "heure-10": {
      // 10€/h
      const heures10 = (dateFin - dateDebut) / (1000 * 60 * 60);
      montant = heures10 * 10;
      type = "10€/h";
      break;
    }

    case "heure-12": {
      // 12€/h
      const heures12 = (dateFin - dateDebut) / (1000 * 60 * 60);
      montant = heures12 * 12;
      type = "12€/h";
      break;
    }

    default: {
      // Par défaut, 30% du CA
      const caDefaut = courses.reduce(
        (sum, course) => sum + course.sommePercue,
        0
      );
      montant = caDefaut * 0.3;
      type = "30% du CA (défaut)";
      break;
    }
  }

  return { montant, type };
}
// Script de débogage pour le chargement des chauffeurs
console.log('=== DÉBOGAGE CHARGEMENT CHAUFFEURS ===');

// Simuler les données de l'API
const mockApiResponse = {
  "data": [
    {
      "id": 15,
      "utilisateur_id": 88,
      "numero_badge": "CH001",
      "date_embauche": "2023-01-15T00:00:00.000Z",
      "type_contrat": "CDI",
      "taux_commission": "35",
      "salaire_base": "0",
      "actif": true,
      "utilisateur": {
        "id": 88,
        "nom": "Dubois",
        "prenom": "François-José",
        "telephone": "+32 485 12 34 56",
        "email": "francois.dubois@taxibruxelles.be"
      },
      "metrics": {
        "chiffre_affaires_total": 65,
        "nb_courses": 2,
        "courses": [
          {
            "id": 3,
            "date": "2025-09-05T05:08:27.813Z",
            "depart": "Gare Centrale - Place Eugène Flagey",
            "arrivee": "Aéroport de Bruxelles-National",
            "index_depart": 45230,
            "index_arrivee": 45245,
            "prix_taximetre": 45.5,
            "somme_percue": 50,
            "distance_km": 15,
            "client": "Sophie Vandenberg",
            "mode_paiement": "Espèces"
          },
          {
            "id": 4,
            "date": "2025-09-05T06:38:27.813Z",
            "depart": "Hôtel des Galeries - Rue des Bouchers",
            "arrivee": "Place Sainte-Catherine",
            "index_depart": 45245,
            "index_arrivee": 45250,
            "prix_taximetre": 12.5,
            "somme_percue": 15,
            "distance_km": 5,
            "client": "Hotel des Galeries",
            "mode_paiement": "Carte Bancaire"
          }
        ]
      }
    }
  ]
};

// Simuler la logique du composant
function debugChauffeurLoading(apiResponse) {
  console.log('1. Données API reçues:', apiResponse.data.length, 'chauffeurs');

  const chauffeursList = apiResponse.data;
  console.log('2. Liste des chauffeurs:', chauffeursList.map(c => ({
    id: c.id,
    nom: c.utilisateur?.nom,
    prenom: c.utilisateur?.prenom,
    actif: c.actif
  })));

  // Vérifier si on a des chauffeurs
  if (chauffeursList.length > 0) {
    console.log('3. ✅ Chauffeurs trouvés, recherche de François-José Dubois...');

    // Chercher spécifiquement François-José Dubois
    let chauffeur = chauffeursList.find(ch =>
      ch.utilisateur &&
      ch.utilisateur.prenom === 'François-José' &&
      ch.utilisateur.nom === 'Dubois'
    );

    console.log('4. Recherche par nom complet:', chauffeur ? '✅ Trouvé' : '❌ Non trouvé');

    // Si pas trouvé, chercher par prénom seulement
    if (!chauffeur) {
      chauffeur = chauffeursList.find(ch =>
        ch.utilisateur &&
        ch.utilisateur.prenom === 'François-José'
      );
      console.log('5. Recherche par prénom seulement:', chauffeur ? '✅ Trouvé' : '❌ Non trouvé');
    }

    // Si toujours pas trouvé, prendre le premier chauffeur actif
    if (!chauffeur) {
      chauffeur = chauffeursList.find(ch => ch.utilisateur && ch.actif);
      console.log('6. Recherche premier chauffeur actif:', chauffeur ? '✅ Trouvé' : '❌ Non trouvé');
    }

    // Si toujours pas trouvé, prendre le premier de la liste
    if (!chauffeur) {
      chauffeur = chauffeursList[0];
      console.log('7. Prendre le premier chauffeur:', chauffeur ? '✅ Trouvé' : '❌ Non trouvé');
    }

    if (chauffeur) {
      console.log('8. Chauffeur sélectionné:', {
        id: chauffeur.id,
        nom: chauffeur.utilisateur?.nom,
        prenom: chauffeur.utilisateur?.prenom,
        courses_count: chauffeur.metrics?.courses?.length || 0
      });

      // Vérifier les courses
      if (chauffeur.metrics && chauffeur.metrics.courses) {
        console.log('9. Courses du chauffeur:');
        chauffeur.metrics.courses.forEach((course, index) => {
          console.log(`   Course ${index + 1}:`, {
            id: course.id,
            trajet: `${course.depart} → ${course.arrivee}`,
            index: `${course.index_depart} → ${course.index_arrivee}`,
            montant: `${course.prix_taximetre}€ (${course.somme_percue}€ perçus)`
          });
        });
      }
    } else {
      console.log('❌ ERREUR: Aucun chauffeur trouvé malgré la présence de données');
    }
  } else {
    console.log('❌ ERREUR: Aucun chauffeur dans la liste');
  }
}

debugChauffeurLoading(mockApiResponse);
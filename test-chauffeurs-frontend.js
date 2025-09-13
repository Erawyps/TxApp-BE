import { getChauffeurs } from './src/services/chauffeurs.js';

async function testChauffeurs() {
  try {
    console.log('Testing chauffeurs API...');
    const chauffeurs = await getChauffeurs();
    console.log('Chauffeurs récupérés:', chauffeurs);

    if (chauffeurs && chauffeurs.data && chauffeurs.data.length > 0) {
      console.log(`Nombre de chauffeurs: ${chauffeurs.data.length}`);

      // Chercher François-José Dubois
      const dubois = chauffeurs.data.find(ch =>
        ch.utilisateur &&
        ch.utilisateur.prenom === 'François-José' &&
        ch.utilisateur.nom === 'Dubois'
      );

      if (dubois) {
        console.log('François-José Dubois trouvé:', {
          id: dubois.id,
          nom: dubois.utilisateur.nom,
          prenom: dubois.utilisateur.prenom,
          courses: dubois.metrics?.courses?.length || 0
        });

        if (dubois.metrics && dubois.metrics.courses) {
          console.log('Courses de Dubois:');
          dubois.metrics.courses.forEach((course, index) => {
            console.log(`Course ${index + 1}:`, {
              id: course.id,
              depart: course.depart,
              arrivee: course.arrivee,
              index_depart: course.index_depart,
              index_arrivee: course.index_arrivee,
              prix_taximetre: course.prix_taximetre,
              somme_percue: course.somme_percue
            });
          });
        }
      } else {
        console.log('François-José Dubois NON trouvé');
        console.log('Chauffeurs disponibles:');
        chauffeurs.data.forEach(ch => {
          console.log(`- ${ch.utilisateur?.prenom} ${ch.utilisateur?.nom} (ID: ${ch.id})`);
        });
      }
    } else {
      console.log('Aucun chauffeur trouvé ou données vides');
    }
  } catch (error) {
    console.error('Erreur lors du test:', error);
  }
}

testChauffeurs();
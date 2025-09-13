// Script complet de test du chargement des chauffeurs
// Simule exactement la logique du composant

async function testCompleteFlow() {
  try {
    console.log('🧪 TEST COMPLET DU CHARGEMENT DES CHAUFFEURS');
    console.log('==========================================');

    // 1. Simuler l'appel API
    console.log('1️⃣ Test de l\'appel API...');
    const response = await fetch('http://localhost:3001/api/chauffeurs');
    const chauffeursResult = await response.json();

    console.log('✅ API Response Status:', response.status);
    console.log('✅ Données reçues:', chauffeursResult.data ? chauffeursResult.data.length + ' chauffeurs' : 'Aucune donnée');

    // 2. Extraire les données comme dans le composant
    console.log('\n2️⃣ Extraction des données...');
    const chauffeursList = chauffeursResult?.data || [];
    console.log('📊 chauffeursList:', {
      length: chauffeursList.length,
      type: typeof chauffeursList,
      isArray: Array.isArray(chauffeursList)
    });

    // 3. Vérifier si on a des chauffeurs
    console.log('\n3️⃣ Vérification des chauffeurs...');
    if (chauffeursList.length > 0) {
      console.log('✅ Chauffeurs trouvés:', chauffeursList.length);

      // Afficher tous les chauffeurs
      chauffeursList.forEach((ch, index) => {
        console.log(`   ${index + 1}. ${ch.utilisateur?.prenom} ${ch.utilisateur?.nom} (ID: ${ch.id}, Actif: ${ch.actif})`);
      });

      // 4. Chercher François-José Dubois
      console.log('\n4️⃣ Recherche de François-José Dubois...');
      let chauffeur = chauffeursList.find(ch =>
        ch.utilisateur &&
        ch.utilisateur.prenom === 'François-José' &&
        ch.utilisateur.nom === 'Dubois'
      );

      console.log('   Recherche par nom complet:', chauffeur ? '✅ Trouvé' : '❌ Non trouvé');

      if (!chauffeur) {
        chauffeur = chauffeursList.find(ch =>
          ch.utilisateur &&
          ch.utilisateur.prenom === 'François-José'
        );
        console.log('   Recherche par prénom seulement:', chauffeur ? '✅ Trouvé' : '❌ Non trouvé');
      }

      if (!chauffeur) {
        chauffeur = chauffeursList.find(ch => ch.utilisateur && ch.actif);
        console.log('   Recherche premier chauffeur actif:', chauffeur ? '✅ Trouvé' : '❌ Non trouvé');
      }

      if (!chauffeur) {
        chauffeur = chauffeursList[0];
        console.log('   Prendre le premier chauffeur:', chauffeur ? '✅ Trouvé' : '❌ Non trouvé');
      }

      // 5. Traiter le chauffeur trouvé
      if (chauffeur && chauffeur.utilisateur) {
        console.log('\n5️⃣ Chauffeur sélectionné:', {
          id: chauffeur.id,
          nom: chauffeur.utilisateur.nom,
          prenom: chauffeur.utilisateur.prenom,
          actif: chauffeur.actif,
          courses_count: chauffeur.metrics?.courses?.length || 0
        });

        // 6. Traiter les courses
        if (chauffeur.metrics && chauffeur.metrics.courses) {
          console.log('\n6️⃣ Traitement des courses...');
          const chauffeurCourses = chauffeur.metrics.courses.map((course, index) => ({
            id: course.id,
            numero_ordre: index + 1,
            index_embarquement: course.index_depart || 0,
            index_debarquement: course.index_arrivee || 0,
            lieu_embarquement: course.depart || 'Point de départ non spécifié',
            lieu_debarquement: course.arrivee || 'Point d\'arrivée non spécifié',
            prix_taximetre: parseFloat(course.prix_taximetre) || 0,
            sommes_percues: parseFloat(course.somme_percue) || 0,
            mode_paiement: course.mode_paiement || 'CASH',
            client: course.client || '',
            distance_km: parseInt(course.distance_km) || 0,
            status: 'completed',
            notes: `Course du ${new Date(course.date).toLocaleDateString('fr-FR')} - ${course.depart} → ${course.arrivee}`
          }));

          console.log('✅ Courses transformées:', chauffeurCourses.length);
          chauffeurCourses.forEach((course, index) => {
            console.log(`   Course ${index + 1}:`, {
              trajet: `${course.lieu_embarquement} → ${course.lieu_debarquement}`,
              index: `${course.index_embarquement} → ${course.index_debarquement}`,
              montant: `${course.prix_taximetre}€ (${course.sommes_percues}€ perçus)`,
              distance: `${course.distance_km} km`
            });
          });

          console.log('\n🎉 SUCCÈS: Toutes les données ont été traitées correctement!');
          console.log('📋 Résumé:');
          console.log(`   - Chauffeur: ${chauffeur.utilisateur.prenom} ${chauffeur.utilisateur.nom}`);
          console.log(`   - Courses: ${chauffeurCourses.length}`);
          console.log(`   - Index total parcouru: ${chauffeurCourses.reduce((total, c) => total + (c.index_debarquement - c.index_embarquement), 0)} km`);

        } else {
          console.log('❌ Aucune course trouvée dans les métriques');
        }
      } else {
        console.log('❌ Chauffeur trouvé mais données utilisateur manquantes');
      }
    } else {
      console.log('❌ ERREUR: Aucun chauffeur dans la liste');
      console.log('Détails du problème:', {
        chauffeursList_length: chauffeursList.length,
        chauffeursList_type: typeof chauffeursList,
        chauffeursResult_keys: Object.keys(chauffeursResult)
      });
    }

  } catch (error) {
    console.error('❌ ERREUR GLOBALE:', error);
  }
}

testCompleteFlow();
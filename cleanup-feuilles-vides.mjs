import fetch from 'node-fetch';

const API_URL = 'http://localhost:5173/api';

// IDs des feuilles de route vides à supprimer
const FEUILLES_VIDES = [11, 21, 23, 24, 25, 27, 28, 30];

console.log('🗑️  NETTOYAGE DES FEUILLES DE ROUTE VIDES\n');

async function supprimerFeuillesVides() {
  for (const feuilleId of FEUILLES_VIDES) {
    try {
      const response = await fetch(`${API_URL}/feuilles-route/${feuilleId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        console.log(`✅ Feuille #${feuilleId} supprimée`);
      } else {
        const error = await response.text();
        console.log(`❌ Feuille #${feuilleId} - Erreur: ${error}`);
      }
    } catch (error) {
      console.log(`❌ Feuille #${feuilleId} - Erreur: ${error.message}`);
    }
  }

  console.log('\n📊 Vérification des feuilles restantes...\n');

  // Vérifier les feuilles restantes
  const response = await fetch(`${API_URL}/feuilles-route`);
  const feuilles = await response.json();

  console.log(`Total feuilles restantes: ${feuilles.length}`);
  console.log('\nFeuilles avec courses:');
  
  const feuillesAvecCourses = feuilles.filter(f => f.course && f.course.length > 0);
  feuillesAvecCourses.forEach(f => {
    console.log(`  - Feuille #${f.feuille_id}: ${f.course.length} courses (${f.chauffeur.utilisateur.prenom} ${f.chauffeur.utilisateur.nom})`);
  });

  console.log('\nFeuilles vides restantes:');
  const feuillesVides = feuilles.filter(f => !f.course || f.course.length === 0);
  feuillesVides.forEach(f => {
    console.log(`  - Feuille #${f.feuille_id}: 0 courses (${f.chauffeur.utilisateur.prenom} ${f.chauffeur.utilisateur.nom})`);
  });

  console.log('\n✅ Nettoyage terminé !');
}

supprimerFeuillesVides().catch(console.error);

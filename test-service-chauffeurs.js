// Script de test du service getChauffeurs
// Test direct de l'API sans passer par le service frontend

async function testAPI() {
  try {
    console.log('🧪 Test direct de l\'API chauffeurs...');

    const response = await fetch('http://localhost:3001/api/chauffeurs');
    const result = await response.json();

    console.log('✅ Réponse API:', response.status);
    console.log('📊 Données reçues:', result);

    if (result && result.data) {
      console.log(`📊 ${result.data.length} chauffeurs trouvés`);
      result.data.forEach((ch, index) => {
        console.log(`${index + 1}. ${ch.utilisateur?.prenom} ${ch.utilisateur?.nom} (ID: ${ch.id})`);
        if (ch.metrics && ch.metrics.courses) {
          console.log(`   📋 ${ch.metrics.courses.length} courses`);
        }
      });
    } else {
      console.log('❌ Pas de données ou structure incorrecte');
    }
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

testAPI();
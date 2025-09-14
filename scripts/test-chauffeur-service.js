import { getDuboisDataForNewPostForm } from '../src/services/chauffeurData.js';

async function testDuboisDataService() {
  try {
    console.log('🧪 Test du service chauffeurData pour François-José Dubois...\n');

    const data = await getDuboisDataForNewPostForm();

    console.log('✅ Données récupérées avec succès!\n');

    console.log('👤 PROFIL:');
    console.log(JSON.stringify(data.profil, null, 2));
    console.log('\n🚗 VÉHICULES:');
    console.log(JSON.stringify(data.vehicules, null, 2));
    console.log('\n📊 ACTIVITÉ:');
    console.log(JSON.stringify(data.activiteRecente, null, 2));
    console.log('\n💰 STATISTIQUES:');
    console.log(JSON.stringify(data.statistiques, null, 2));
    console.log('\n⚙️ PERMISSIONS:');
    console.log(JSON.stringify(data.permissions, null, 2));

    console.log('\n🎯 TEST RÉUSSI - Données prêtes pour new-post-form');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

testDuboisDataService();
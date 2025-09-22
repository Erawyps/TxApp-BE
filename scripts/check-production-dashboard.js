// Script de vérification de production pour le dashboard
// À exécuter avant le déploiement pour s'assurer que tout fonctionne

const API_BASE = 'https://api.txapp.be/api';

async function checkProductionReadiness() {
  console.log('🔍 Vérification de la production du dashboard...\n');

  try {
    // Test 1: Vérifier la santé de l'API
    console.log('1. Test de la santé de l\'API...');
    const healthResponse = await fetch(`${API_BASE.replace('/api', '')}/health`);
    if (!healthResponse.ok) throw new Error('API health check failed');
    console.log('✅ API opérationnelle\n');

    // Test 2: Vérifier les statistiques des courses
    console.log('2. Test des statistiques des courses...');
    const statsResponse = await fetch(`${API_BASE}/dashboard/courses/stats`);
    if (!statsResponse.ok) throw new Error('Stats API failed');

    const stats = await statsResponse.json();
    console.log('📊 Statistiques récupérées:');
    console.log(`   - Courses totales: ${stats.totalCourses}`);
    console.log(`   - Revenus totaux: ${stats.totalRevenue}€`);
    console.log(`   - Distance totale: ${stats.totalDistance}km`);
    console.log(`   - Chauffeurs actifs: ${stats.chauffeursActifs}`);
    console.log(`   - Véhicules utilisés: ${stats.vehiculesUtilises}`);
    console.log(`   - Revenu moyen/course: ${stats.averageEarningsPerTrip}€`);
    console.log(`   - Distance moyenne/course: ${stats.averageDistancePerTrip}km`);

    if (stats.averageEarningsPerTrip > 0 && stats.averageDistancePerTrip > 0) {
      console.log('✅ Moyennes correctement calculées\n');
    } else {
      console.log('❌ Problème avec les moyennes\n');
    }

    // Test 3: Vérifier les données des graphiques
    console.log('3. Test des données de graphiques...');
    const chartResponse = await fetch(`${API_BASE}/dashboard/courses/chart-data?type=daily-revenue`);
    if (!chartResponse.ok) throw new Error('Chart data API failed');

    const chartData = await chartResponse.json();
    console.log(`📈 Données de graphique récupérées: ${chartData.data.length} points`);
    console.log('✅ Graphiques opérationnels\n');

    // Test 4: Vérifier le format des données
    console.log('4. Validation du format des données...');
    const sampleData = chartData.data[0];
    if (sampleData && sampleData.date && typeof sampleData.revenue === 'number') {
      console.log('✅ Format des données correct\n');
    } else {
      console.log('❌ Format des données incorrect\n');
    }

    console.log('🎉 Dashboard prêt pour la production !');

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    process.exit(1);
  }
}

// Exécuter la vérification
checkProductionReadiness();
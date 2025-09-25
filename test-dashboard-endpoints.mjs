import axios from 'axios';

const BASE_URL = 'https://txapp.be/api';

async function testDashboardEndpoints() {
  console.log('📊 Test des endpoints du dashboard...\n');

  // Test 1: Statistiques des courses
  try {
    console.log('Testing courses stats...');
    const statsResponse = await axios.get(`${BASE_URL}/dashboard/courses/stats`, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (statsResponse.status === 200) {
      console.log('✅ Courses stats: Réussi');
      console.log(`   Total courses: ${statsResponse.data.totalCourses}`);
      console.log(`   Total revenue: ${statsResponse.data.totalRevenue}`);
    } else {
      console.log(`❌ Courses stats: Status ${statsResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Courses stats: Erreur - ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
    }
  }

  // Test 2: Données de graphique des courses
  try {
    console.log('Testing courses chart data...');
    const chartResponse = await axios.get(`${BASE_URL}/dashboard/courses/chart-data?type=trips-count`, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (chartResponse.status === 200) {
      console.log('✅ Courses chart data: Réussi');
      if (chartResponse.data.data && Array.isArray(chartResponse.data.data)) {
        console.log(`   Data points: ${chartResponse.data.data.length}`);
      }
    } else {
      console.log(`❌ Courses chart data: Status ${chartResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Courses chart data: Erreur - ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
    }
  }

  console.log('\n🏁 Tests du dashboard terminés');
}

testDashboardEndpoints().catch(console.error);
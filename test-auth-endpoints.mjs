import axios from 'axios';

const BASE_URL = 'https://txapp.be/api';

async function testAuthEndpoints() {
  console.log('🔐 Test des endpoints d\'authentification...\n');

  // Test 1: Login avec des credentials valides
  try {
    console.log('Testing login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin@txapp.be',
      password: 'admin123'
    }, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (loginResponse.status === 200 && loginResponse.data.token) {
      console.log('✅ Login: Réussi');
      const token = loginResponse.data.token;

      // Test 2: Vérification du token
      try {
        console.log('Testing token verification...');
        const verifyResponse = await axios.get(`${BASE_URL}/auth/verify`, {
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (verifyResponse.status === 200) {
          console.log('✅ Token verification: Réussi');
        } else {
          console.log(`❌ Token verification: Status ${verifyResponse.status}`);
        }
      } catch (error) {
        console.log(`❌ Token verification: Erreur - ${error.message}`);
      }

      // Test 3: Changement de mot de passe
      try {
        console.log('Testing password change...');
        const changeResponse = await axios.post(`${BASE_URL}/auth/change-password`, {
          oldPassword: 'admin123',
          newPassword: 'admin1234'
        }, {
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (changeResponse.status === 200) {
          console.log('✅ Password change: Réussi');
        } else {
          console.log(`❌ Password change: Status ${changeResponse.status}`);
        }
      } catch (error) {
        console.log(`❌ Password change: Erreur - ${error.message}`);
      }

    } else {
      console.log(`❌ Login: Status ${loginResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Login: Erreur - ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data: ${JSON.stringify(error.response.data)}`);
    }
  }

  console.log('\n🏁 Tests d\'authentification terminés');
}

testAuthEndpoints().catch(console.error);
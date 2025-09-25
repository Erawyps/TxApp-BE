import axios from 'axios';

// Test simple de connexion à l'API
const testApiConnection = async () => {
  try {
    console.log('Testing API connection...');

    // Test avec les mêmes credentials que dans le script
    const response = await axios.post('/api/auth/login', {
      email: 'ismail.drissi@txapp.be',
      password: 'ismail2024'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Success:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
};

// Exporter pour utilisation dans la console du navigateur
window.testApiConnection = testApiConnection;

export { testApiConnection };
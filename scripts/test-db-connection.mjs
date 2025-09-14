import { testDatabaseConnection } from '../src/configs/database.config.js';

console.log('🔄 Test de connexion à la base de données...');

try {
  const result = await testDatabaseConnection();
  console.log('✅ Résultat du test:', result);

  if (result) {
    console.log('✅ Connexion réussie !');
  } else {
    console.log('❌ Échec de la connexion');
  }
} catch (error) {
  console.error('❌ Erreur lors du test:', error.message);
  console.error('Stack trace:', error.stack);
}
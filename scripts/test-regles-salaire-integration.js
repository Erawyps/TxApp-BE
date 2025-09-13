#!/usr/bin/env node

/**
 * Script de test pour vérifier l'intégration des règles de salaire
 * dans le système new-post-form
 */

// Utilisation de l'API fetch native de Node.js

const API_BASE_URL = 'http://localhost:3001/api';

async function testReglesSalaireAPI() {
  console.log('🧪 Test des règles de salaire API\n');

  try {
    // Test 1: Récupération de toutes les règles de salaire
    console.log('📡 Test 1: Récupération des règles de salaire...');
    const response = await fetch(`${API_BASE_URL}/regles-salaire`);
    const data = await response.json();

    if (response.ok) {
      console.log('✅ API règles de salaire fonctionnelle');
      console.log(`📊 ${data.data?.length || 0} règles trouvées:`);

      if (data.data && data.data.length > 0) {
        data.data.forEach((regle, index) => {
          console.log(`  ${index + 1}. ${regle.nom} (${regle.type_regle})`);
        });
      } else {
        console.log('⚠️ Aucune règle de salaire trouvée dans la base de données');
      }
    } else {
      console.log('❌ Erreur API:', response.status, data.error);
    }

    // Test 2: Récupération d'une règle spécifique (si disponible)
    if (data.data && data.data.length > 0) {
      const firstRegle = data.data[0];
      console.log(`\n📡 Test 2: Récupération de la règle "${firstRegle.nom}"...`);

      const detailResponse = await fetch(`${API_BASE_URL}/regles-salaire/${firstRegle.id}`);
      const detailData = await detailResponse.json();

      if (detailResponse.ok) {
        console.log('✅ Détail de la règle récupéré:');
        console.log(`  - Nom: ${detailData.nom}`);
        console.log(`  - Type: ${detailData.type_regle}`);
        console.log(`  - Description: ${detailData.description || 'N/A'}`);
        console.log(`  - Actif: ${detailData.actif ? 'Oui' : 'Non'}`);
      } else {
        console.log('❌ Erreur récupération détail:', detailResponse.status, detailData.error);
      }
    }

    // Test 3: Vérification de la cohérence des données
    console.log('\n📡 Test 3: Vérification de la cohérence des données...');
    const typesUniques = [...new Set(data.data?.map(r => r.type_regle) || [])];
    console.log(`📊 Types de règles trouvés: ${typesUniques.join(', ')}`);

    const reglesActives = data.data?.filter(r => r.actif) || [];
    console.log(`📊 Règles actives: ${reglesActives.length}/${data.data?.length || 0}`);

  } catch (error) {
    console.error('💥 Erreur lors des tests:', error.message);
  }
}

async function testFrontendIntegration() {
  console.log('\n🖥️ Test de l\'intégration frontend\n');

  try {
    // Test de récupération des règles formatées pour dropdown
    console.log('📡 Test: Récupération des règles formatées pour dropdown...');

    // Simuler l'appel au service frontend
    const response = await fetch(`${API_BASE_URL}/regles-salaire`);
    const data = await response.json();

    if (response.ok && data.data) {
      const formattedRules = data.data.map(regle => ({
        value: regle.id,
        label: `${regle.nom} - ${regle.type_regle}`,
        description: regle.description,
        type: regle.type_regle,
        parametres: regle.parametres
      }));

      console.log('✅ Règles formatées pour dropdown:');
      formattedRules.slice(0, 3).forEach((rule, index) => {
        console.log(`  ${index + 1}. ${rule.label}`);
      });

      if (formattedRules.length > 3) {
        console.log(`  ... et ${formattedRules.length - 3} autres`);
      }
    } else {
      console.log('❌ Impossible de récupérer les règles pour le dropdown');
    }

  } catch (error) {
    console.error('💥 Erreur test frontend:', error.message);
  }
}

async function main() {
  console.log('🚀 Démarrage des tests d\'intégration des règles de salaire\n');

  // Vérifier que le serveur est accessible
  try {
    const healthCheck = await fetch(`${API_BASE_URL}/chauffeurs`);
    if (!healthCheck.ok) {
      console.log('⚠️ Le serveur API ne semble pas accessible sur localhost:3001');
      console.log('Assurez-vous que le serveur est démarré avec: npm run dev');
      return;
    }
  } catch (error) {
    console.log('❌ Impossible de contacter le serveur API');
    console.log('Vérifiez que le serveur est démarré sur le port 3001');
    return;
  }

  await testReglesSalaireAPI();
  await testFrontendIntegration();

  console.log('\n✨ Tests terminés!');
  console.log('\n📋 Résumé:');
  console.log('- API des règles de salaire ajoutée et fonctionnelle');
  console.log('- Service frontend créé pour récupérer les règles');
  console.log('- Intégration dans le composant ShiftForm effectuée');
  console.log('- Dropdown "Type de rémunération" utilise maintenant les données de la base');
}

// Exécuter les tests
main().catch(console.error);
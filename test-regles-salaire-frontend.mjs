#!/usr/bin/env node

/**
 * 🎯 TEST RÈGLES DE SALAIRE POUR FRONTEND
 * Vérification que les règles de salaire sont correctement disponibles
 * pour la sélection "Rémunération chauffeur" dans l'interface
 */

console.log('🎯 TEST RÈGLES DE SALAIRE POUR FRONTEND');
console.log('⏰', new Date().toLocaleString());
console.log('');

const BASE_URL_DEV = 'http://localhost:3001/api';
const BASE_URL_PROD = 'https://api.txapp.be/api';

async function testReglesSalaire(env) {
  const url = env === 'dev' 
    ? `${BASE_URL_DEV}/dashboard/regles-salaire`
    : `${BASE_URL_PROD}/regles-salaire`;
    
  const headers = {};
  if (env === 'prod') {
    headers['X-API-Key'] = 'TxApp-API-Key-2025';
  }

  try {
    const response = await fetch(url, { headers });
    const regles = await response.json();

    if (!response.ok || !Array.isArray(regles)) {
      console.log(`❌ ${env.toUpperCase()}: Erreur ${response.status}`);
      return null;
    }

    console.log(`✅ ${env.toUpperCase()}: ${regles.length} règles de salaire disponibles`);
    
    regles.forEach((regle, index) => {
      const type = regle.est_variable ? 'Variable' : 'Fixe';
      const description = regle.description || 'Pas de description';
      
      console.log(`   ${index + 1}. ${regle.nom_regle} (${type})`);
      console.log(`      🔹 Description: ${description}`);
      
      if (regle.est_variable) {
        const base = regle.pourcentage_base ? `${regle.pourcentage_base}%` : 'Non défini';
        console.log(`      🔹 Pourcentage base: ${base}`);
        
        if (regle.seuil_recette) {
          const seuil = `${regle.seuil_recette}€`;
          const auDela = regle.pourcentage_au_dela ? `${regle.pourcentage_au_dela}%` : 'Non défini';
          console.log(`      🔹 Seuil: ${seuil}, au-delà: ${auDela}`);
        }
      }
      console.log('');
    });

    return regles;
  } catch (error) {
    console.log(`💥 ${env.toUpperCase()}: ${error.message}`);
    return null;
  }
}

async function validateForFrontend(regles) {
  console.log('🔍 VALIDATION POUR INTERFACE FRONTEND:');
  
  const issues = [];
  
  regles.forEach((regle, index) => {
    // Vérifications obligatoires
    if (!regle.nom_regle || regle.nom_regle.trim() === '') {
      issues.push(`Règle ${index + 1}: Nom manquant`);
    }
    
    if (regle.regle_id === undefined || regle.regle_id === null) {
      issues.push(`Règle ${index + 1}: ID manquant`);
    }
    
    // Vérifications variables
    if (regle.est_variable) {
      if (!regle.pourcentage_base) {
        issues.push(`Règle ${index + 1}: Pourcentage de base manquant pour règle variable`);
      }
    }
  });
  
  if (issues.length === 0) {
    console.log('   ✅ Toutes les règles sont valides pour l\'interface');
    console.log('   ✅ Les champs requis sont présents');
    console.log('   ✅ Structure compatible avec le frontend');
  } else {
    console.log('   ⚠️  Problèmes détectés:');
    issues.forEach(issue => console.log(`      - ${issue}`));
  }
  
  console.log('');
  return issues.length === 0;
}

async function main() {
  console.log('🔄 Test dev/prod des règles de salaire...\n');
  
  const reglesDev = await testReglesSalaire('dev');
  const reglesProd = await testReglesSalaire('prod');
  
  console.log('📊 RÉSUMÉ:');
  
  if (reglesDev && reglesProd) {
    const devCount = reglesDev.length;
    const prodCount = reglesProd.length;
    
    if (devCount === prodCount) {
      console.log(`   ✅ Cohérence dev/prod: ${devCount} règles dans les deux environnements`);
    } else {
      console.log(`   ⚠️  Incohérence: ${devCount} règles en dev vs ${prodCount} en prod`);
    }
    
    // Validation pour frontend
    console.log('');
    const devValid = await validateForFrontend(reglesDev);
    
    console.log('🎯 RECOMMANDATIONS POUR "RÉMUNÉRATION CHAUFFEUR":');
    console.log('   1. Utiliser regle_id comme value dans le select');
    console.log('   2. Afficher nom_regle comme label visible');
    console.log('   3. Ajouter la description en tooltip ou sous-texte');
    console.log('   4. Indiquer le type (Fixe/Variable) dans l\'interface');
    
    if (devValid) {
      console.log('   ✅ Structure prête pour intégration frontend');
    }
    
  } else {
    console.log('   ❌ Problème de récupération des données');
  }
}

main().catch(console.error);
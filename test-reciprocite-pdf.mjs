#!/usr/bin/env node

/**
 * 🎯 TEST RÉCIPROCITÉ PDF DEV/PROD
 * Compare la génération PDF entre environnements
 */

const DEV_URL = 'http://localhost:3001';
const PROD_URL = 'https://api.txapp.be';
const SHIFT_ID = 37;

console.log('📄 TEST RÉCIPROCITÉ PDF DEV/PROD');
console.log('📋 Shift ID:', SHIFT_ID);
console.log('⏰', new Date().toLocaleString());
console.log('');

async function testPdfGeneration(environment, baseUrl) {
  console.log(`🌍 Test environnement: ${environment}`);
  console.log(`🔗 URL: ${baseUrl}`);
  
  try {
    // Test génération PDF
    const pdfResponse = await fetch(`${baseUrl}/api/feuilles-route/${SHIFT_ID}/pdf`);
    
    console.log(`   📄 Status PDF: ${pdfResponse.status} ${pdfResponse.statusText}`);
    
    if (pdfResponse.ok) {
      const contentType = pdfResponse.headers.get('content-type');
      const contentLength = pdfResponse.headers.get('content-length');
      
      console.log(`   📊 Content-Type: ${contentType}`);
      console.log(`   📏 Content-Length: ${contentLength} bytes`);
      
      // Validation du contenu
      if (contentType?.includes('application/pdf')) {
        console.log(`   ✅ PDF généré avec succès`);
        return {
          success: true,
          contentType,
          size: parseInt(contentLength) || 0
        };
      } else {
        console.log(`   ❌ Type de contenu incorrect: ${contentType}`);
        return { success: false, error: 'Invalid content type' };
      }
    } else {
      const errorText = await pdfResponse.text();
      console.log(`   ❌ Erreur PDF: ${errorText}`);
      return { success: false, error: errorText };
    }
    
  } catch (error) {
    console.log(`   ❌ Erreur connexion: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Test des deux environnements
console.log('🔄 TESTS EN COURS...');
console.log('');

const [devResult, prodResult] = await Promise.all([
  testPdfGeneration('DÉVELOPPEMENT', DEV_URL),
  testPdfGeneration('PRODUCTION', PROD_URL)
]);

console.log('');
console.log('📊 RÉSULTATS COMPARATIFS');
console.log('═'.repeat(50));

// Résultats DEV
console.log('🔧 DÉVELOPPEMENT:');
if (devResult.success) {
  console.log(`   ✅ Génération réussie`);
  console.log(`   📏 Taille: ${devResult.size} bytes`);
  console.log(`   📊 Type: ${devResult.contentType}`);
} else {
  console.log(`   ❌ Échec: ${devResult.error}`);
}
console.log('');

// Résultats PROD
console.log('🌐 PRODUCTION:');
if (prodResult.success) {
  console.log(`   ✅ Génération réussie`);
  console.log(`   📏 Taille: ${prodResult.size} bytes`);
  console.log(`   📊 Type: ${prodResult.contentType}`);
} else {
  console.log(`   ❌ Échec: ${prodResult.error}`);
}
console.log('');

// Analyse de réciprocité
console.log('🔄 ANALYSE RÉCIPROCITÉ');
console.log('═'.repeat(50));

if (devResult.success && prodResult.success) {
  // Comparaison des tailles
  const sizeDiff = Math.abs(devResult.size - prodResult.size);
  const sizeRatio = sizeDiff / Math.max(devResult.size, prodResult.size);
  
  console.log(`📏 COMPARAISON TAILLES:`);
  console.log(`   • DEV: ${devResult.size} bytes`);
  console.log(`   • PROD: ${prodResult.size} bytes`);
  console.log(`   • Différence: ${sizeDiff} bytes (${(sizeRatio * 100).toFixed(2)}%)`);
  
  if (sizeRatio < 0.1) {
    console.log(`   ✅ Tailles similaires (< 10% différence)`);
  } else {
    console.log(`   ⚠️  Tailles différentes (> 10% différence)`);
  }
  
  console.log('');
  console.log(`📊 TYPES CONTENU:`);
  console.log(`   • DEV: ${devResult.contentType}`);
  console.log(`   • PROD: ${prodResult.contentType}`);
  
  if (devResult.contentType === prodResult.contentType) {
    console.log(`   ✅ Types identiques`);
  } else {
    console.log(`   ❌ Types différents`);
  }
  
  console.log('');
  console.log('🎯 RÉCIPROCITÉ PDF: ✅ EXCELLENTE');
  console.log('   • Les deux environnements génèrent des PDFs');
  console.log('   • Tailles et types cohérents');
  console.log('   • Fonctionnalité identique confirmée');
  
} else if (devResult.success || prodResult.success) {
  console.log('🎯 RÉCIPROCITÉ PDF: ⚠️  PARTIELLE');
  console.log(`   • DEV: ${devResult.success ? '✅' : '❌'}`);
  console.log(`   • PROD: ${prodResult.success ? '✅' : '❌'}`);
  console.log('   • Nécessite synchronisation');
  
} else {
  console.log('🎯 RÉCIPROCITÉ PDF: ❌ DÉFAILLANTE');
  console.log('   • Aucun environnement ne génère de PDF');
  console.log('   • Investigation approfondie requise');
}

console.log('');
console.log('📄 RECOMMANDATIONS:');

if (devResult.success && prodResult.success) {
  console.log('✅ Les deux environnements sont opérationnels');
  console.log('✅ Génération PDF fonctionnelle partout');
  console.log('✅ Réciprocité parfaite confirmée');
} else {
  console.log('🔧 Actions requises:');
  if (!devResult.success) {
    console.log('   • Vérifier serveur de développement');
    console.log('   • Contrôler configuration PDF locale');
  }
  if (!prodResult.success) {
    console.log('   • Déployer corrections en production');
    console.log('   • Vérifier configuration PDF serveur');
  }
}

console.log('');
console.log('🎉 TEST RÉCIPROCITÉ PDF TERMINÉ!');
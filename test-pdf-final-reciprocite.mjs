import fetch from 'node-fetch';

const DEV_BASE_URL = 'http://localhost:8787';
const PROD_BASE_URL = 'https://tx-app-be.kua-tech-dev.workers.dev';

console.log('🧪 TEST PDF FINAL - RÉCIPROCITÉ DEV/PROD');
console.log('=' .repeat(60));

async function testPDFGeneration() {
  let devResults = { tests: 0, passed: 0, details: [] };
  let prodResults = { tests: 0, passed: 0, details: [] };
  
  // Test 1: Vérifier existence du shift 38 en dev
  console.log('\n📋 1. Vérification existence shift 38 en dev...');
  try {
    const response = await fetch(`${DEV_BASE_URL}/api/feuilles-route/38`);
    devResults.tests++;
    
    if (response.ok) {
      const shift = await response.json();
      devResults.passed++;
      devResults.details.push({
        test: 'GET shift 38',
        status: '✅ SUCCESS',
        data: `Shift ${shift.id} - ${shift.numero_feuille} - Courses: ${shift.courses?.length || 0}, Charges: ${shift.charges?.length || 0}`
      });
      console.log(`✅ DEV: Shift 38 trouvé - ${shift.numero_feuille}`);
    } else {
      devResults.details.push({
        test: 'GET shift 38',
        status: '❌ FAILED',
        error: `HTTP ${response.status}`
      });
      console.log(`❌ DEV: Shift 38 non trouvé - ${response.status}`);
    }
  } catch (error) {
    devResults.details.push({
      test: 'GET shift 38',
      status: '❌ ERROR',
      error: error.message
    });
    console.log(`❌ DEV: Erreur - ${error.message}`);
  }

  // Test 2: Génération PDF dev
  console.log('\n📄 2. Test génération PDF dev...');
  try {
    const response = await fetch(`${DEV_BASE_URL}/api/feuilles-route/38/pdf`);
    devResults.tests++;
    
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      
      devResults.passed++;
      devResults.details.push({
        test: 'PDF generation',
        status: '✅ SUCCESS',
        data: `Content-Type: ${contentType}, Size: ${contentLength} bytes`
      });
      console.log(`✅ DEV: PDF généré - Type: ${contentType}, Taille: ${contentLength} bytes`);
    } else {
      const errorText = await response.text();
      devResults.details.push({
        test: 'PDF generation',
        status: '❌ FAILED',
        error: `HTTP ${response.status}: ${errorText}`
      });
      console.log(`❌ DEV: Échec génération PDF - ${response.status}: ${errorText}`);
    }
  } catch (error) {
    devResults.details.push({
      test: 'PDF generation',
      status: '❌ ERROR',
      error: error.message
    });
    console.log(`❌ DEV: Erreur PDF - ${error.message}`);
  }

  // Test 3: Vérifier si shift existe en prod
  console.log('\n📋 3. Vérification existence shift en prod...');
  try {
    const response = await fetch(`${PROD_BASE_URL}/api/feuilles-route/38`);
    prodResults.tests++;
    
    if (response.ok) {
      const shift = await response.json();
      prodResults.passed++;
      prodResults.details.push({
        test: 'GET shift 38',
        status: '✅ SUCCESS',
        data: `Shift ${shift.id} - ${shift.numero_feuille} - Courses: ${shift.courses?.length || 0}, Charges: ${shift.charges?.length || 0}`
      });
      console.log(`✅ PROD: Shift 38 trouvé - ${shift.numero_feuille}`);
    } else {
      prodResults.details.push({
        test: 'GET shift 38',
        status: '❌ FAILED',
        error: `HTTP ${response.status}`
      });
      console.log(`❌ PROD: Shift 38 non trouvé - ${response.status}`);
    }
  } catch (error) {
    prodResults.details.push({
      test: 'GET shift 38',
      status: '❌ ERROR',
      error: error.message
    });
    console.log(`❌ PROD: Erreur - ${error.message}`);
  }

  // Test 4: Génération PDF prod (si shift existe)
  console.log('\n📄 4. Test génération PDF prod...');
  try {
    const response = await fetch(`${PROD_BASE_URL}/api/feuilles-route/38/pdf`);
    prodResults.tests++;
    
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      
      prodResults.passed++;
      prodResults.details.push({
        test: 'PDF generation',
        status: '✅ SUCCESS',
        data: `Content-Type: ${contentType}, Size: ${contentLength} bytes`
      });
      console.log(`✅ PROD: PDF généré - Type: ${contentType}, Taille: ${contentLength} bytes`);
    } else {
      const errorText = await response.text();
      prodResults.details.push({
        test: 'PDF generation',
        status: '❌ FAILED',
        error: `HTTP ${response.status}: ${errorText}`
      });
      console.log(`❌ PROD: Échec génération PDF - ${response.status}: ${errorText}`);
    }
  } catch (error) {
    prodResults.details.push({
      test: 'PDF generation',
      status: '❌ ERROR',
      error: error.message
    });
    console.log(`❌ PROD: Erreur PDF - ${error.message}`);
  }

  // Test 5: Comparaison structure des données si disponibles
  console.log('\n🔍 5. Comparaison structure données...');
  try {
    const [devResponse, prodResponse] = await Promise.all([
      fetch(`${DEV_BASE_URL}/api/feuilles-route/38`),
      fetch(`${PROD_BASE_URL}/api/feuilles-route/38`)
    ]);

    if (devResponse.ok && prodResponse.ok) {
      const devShift = await devResponse.json();
      const prodShift = await prodResponse.json();
      
      const comparison = {
        numeroFeuille: {
          dev: devShift.numero_feuille,
          prod: prodShift.numero_feuille,
          match: devShift.numero_feuille === prodShift.numero_feuille
        },
        coursesCount: {
          dev: devShift.courses?.length || 0,
          prod: prodShift.courses?.length || 0,
          match: (devShift.courses?.length || 0) === (prodShift.courses?.length || 0)
        },
        chargesCount: {
          dev: devShift.charges?.length || 0,
          prod: prodShift.charges?.length || 0,
          match: (devShift.charges?.length || 0) === (prodShift.charges?.length || 0)
        },
        estValidee: {
          dev: devShift.est_validee,
          prod: prodShift.est_validee,
          match: devShift.est_validee === prodShift.est_validee
        }
      };

      console.log('\n📊 Comparaison structure:');
      Object.entries(comparison).forEach(([key, value]) => {
        const status = value.match ? '✅' : '❌';
        console.log(`  ${status} ${key}: DEV=${value.dev}, PROD=${value.prod}`);
      });
    }
  } catch (error) {
    console.log(`❌ Erreur comparaison: ${error.message}`);
  }

  // Résultats finaux
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSULTATS FINAUX PDF RÉCIPROCITÉ');
  console.log('='.repeat(60));
  
  console.log(`\n🔧 DÉVELOPPEMENT:`);
  console.log(`  Tests: ${devResults.passed}/${devResults.tests} réussis (${Math.round(devResults.passed/devResults.tests*100)}%)`);
  devResults.details.forEach(detail => {
    console.log(`  ${detail.status} ${detail.test}: ${detail.data || detail.error}`);
  });
  
  console.log(`\n🚀 PRODUCTION:`);
  console.log(`  Tests: ${prodResults.passed}/${prodResults.tests} réussis (${Math.round(prodResults.passed/prodResults.tests*100)}%)`);
  prodResults.details.forEach(detail => {
    console.log(`  ${detail.status} ${detail.test}: ${detail.data || detail.error}`);
  });
  
  const totalTests = devResults.tests + prodResults.tests;
  const totalPassed = devResults.passed + prodResults.passed;
  console.log(`\n🎯 RÉCIPROCITÉ GLOBALE: ${totalPassed}/${totalTests} (${Math.round(totalPassed/totalTests*100)}%)`);
  
  if (devResults.passed === devResults.tests && prodResults.passed === prodResults.tests) {
    console.log('\n🎉 RÉCIPROCITÉ PARFAITE - Dev et Prod identiques !');
  } else {
    console.log('\n⚠️  RÉCIPROCITÉ PARTIELLE - Corrections nécessaires');
  }
}

// Exécution du test
testPDFGeneration().catch(console.error);
console.log('🧪 Test final de l\'import dynamique de dayjs après correction...\n');

// Simuler l'import comme dans langs.js corrigé
async function testCorrectedImport() {
  try {
    console.log('📦 Test de l\'import corrigé dayjs/locale/fr.js...');

    // Tester l'import avec l'extension .js explicite
    const dayjsFr = await import('dayjs/locale/fr.js');
    console.log('✅ Import réussi avec .js:', dayjsFr);

    console.log('📅 Test de configuration de la locale...');
    const dayjs = (await import('dayjs')).default;
    dayjs.locale('fr');

    const testDate = dayjs().format('DD/MM/YYYY HH:mm');
    console.log('📆 Date formatée en français:', testDate);

    return true;
  } catch (error) {
    console.error('❌ Erreur avec l\'import corrigé:', error);
    return false;
  }
}

// Test de toutes les locales
async function testAllLocales() {
  const locales = ['fr.js', 'nl-be.js', 'en.js'];

  console.log('\n🌐 Test de toutes les locales dayjs...\n');

  for (const locale of locales) {
    try {
      console.log(`📦 Test de ${locale}...`);
      const module = await import(`dayjs/locale/${locale}`);
      console.log(`✅ ${locale}: Import réussi`);
    } catch (error) {
      console.error(`❌ ${locale}: Erreur -`, error.message);
      return false;
    }
  }

  return true;
}

// Fonction principale
async function runFinalTest() {
  console.log('🚀 Test final après correction des imports dayjs...\n');

  const correctedTest = await testCorrectedImport();
  const allLocalesTest = await testAllLocales();

  console.log('\n📋 Résumé du test final:');
  console.log(`✅ Import corrigé: ${correctedTest ? 'RÉUSSI' : 'ÉCHEC'}`);
  console.log(`✅ Toutes les locales: ${allLocalesTest ? 'RÉUSSIES' : 'ÉCHEC'}`);

  if (correctedTest && allLocalesTest) {
    console.log('\n🎉 SUCCÈS ! L\'erreur dayjs devrait maintenant être résolue.');
    console.log('💡 Le serveur Vite devrait maintenant charger correctement les locales dayjs.');
  } else {
    console.log('\n⚠️ Le problème persiste. Il peut être nécessaire de redémarrer le navigateur.');
  }
}

runFinalTest();
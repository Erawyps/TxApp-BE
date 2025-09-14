console.log('🧪 Test de l\'import dynamique de dayjs locale...\n');

// Simuler l'import dynamique comme dans langs.js
async function testDayjsImport() {
  try {
    console.log('📦 Test de l\'import dynamique de dayjs/locale/fr...');

    // Simuler l'import dynamique
    const dayjsFr = await import('dayjs/locale/fr');
    console.log('✅ Import réussi:', dayjsFr);

    console.log('📅 Test de la locale française...');
    const dayjs = (await import('dayjs')).default;
    dayjs.locale('fr');
    console.log('✅ Locale française chargée');

    const testDate = dayjs().format('DD/MM/YYYY HH:mm');
    console.log('📆 Date formatée:', testDate);

    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'import:', error);
    return false;
  }
}

// Simuler la fonction updateLocale du Provider
async function testUpdateLocale() {
  try {
    console.log('\n🌐 Test de la fonction updateLocale...');

    const newLocale = 'fr_be';
    console.log(`📍 Changement de locale vers: ${newLocale}`);

    // Simuler l'import dynamique
    const localeModule = await import('dayjs/locale/fr');
    console.log('✅ Module de locale chargé:', localeModule);

    // Simuler la configuration de dayjs
    const dayjs = (await import('dayjs')).default;
    dayjs.locale('fr');
    console.log('✅ Locale configurée dans dayjs');

    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de locale:', error);
    return false;
  }
}

// Fonction principale
async function runTests() {
  console.log('🚀 Démarrage des tests d\'import dynamique...\n');

  const importTest = await testDayjsImport();
  const localeTest = await testUpdateLocale();

  console.log('\n📋 Résumé des tests:');
  console.log(`✅ Import dayjs: ${importTest ? 'RÉUSSI' : 'ÉCHEC'}`);
  console.log(`✅ Update locale: ${localeTest ? 'RÉUSSI' : 'ÉCHEC'}`);

  if (importTest && localeTest) {
    console.log('\n🎉 Tous les tests sont passés ! L\'erreur dayjs devrait être résolue.');
  } else {
    console.log('\n⚠️ Certains tests ont échoué. L\'erreur peut persister.');
  }
}

runTests();
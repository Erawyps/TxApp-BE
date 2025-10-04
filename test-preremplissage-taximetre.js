// Script de test pour vérifier le pré-remplissage des champs taximètre
// À exécuter dans la console du navigateur sur http://localhost:5176

console.log('🧪 TEST: Vérification du pré-remplissage des champs taximètre');

// 1. Vérifier le localStorage
console.log('\n📦 1. Vérification localStorage:');
const endShiftData = localStorage.getItem('endShiftFormData');
const startShiftData = localStorage.getItem('shiftFormData');

console.log('  endShiftFormData:', endShiftData ? JSON.parse(endShiftData) : 'null');
console.log('  shiftFormData:', startShiftData ? JSON.parse(startShiftData) : 'null');

// 2. Vérifier la connexion API
console.log('\n🌐 2. Test connexion API:');
fetch('/api/auth/me')
  .then(res => res.json())
  .then(user => {
    console.log('  Utilisateur connecté:', user);
    
    if (user?.user_id || user?.id) {
      const userId = user.user_id || user.id;
      console.log('  ID utilisateur:', userId);
      
      // 3. Récupérer la feuille de route active
      return fetch(`/api/chauffeurs/${userId}/feuilles-route`);
    } else {
      throw new Error('Utilisateur non trouvé');
    }
  })
  .then(res => res.json())
  .then(feuilles => {
    console.log('\n📋 3. Feuilles de route récupérées:', feuilles);
    
    if (feuilles && feuilles.length > 0) {
      const activeFeuille = feuilles[0];
      console.log('  Feuille active:', activeFeuille);
      
      console.log('\n🔍 4. Données taximètre dans la feuille:');
      console.log('  taximetre_prise_charge_fin:', activeFeuille.taximetre_prise_charge_fin);
      console.log('  taximetre_index_km_fin:', activeFeuille.taximetre_index_km_fin);
      console.log('  taximetre_km_charge_fin:', activeFeuille.taximetre_km_charge_fin);
      console.log('  taximetre_chutes_fin:', activeFeuille.taximetre_chutes_fin);
      console.log('  km_tableau_bord_fin:', activeFeuille.km_tableau_bord_fin);
      console.log('  index_km_fin_tdb:', activeFeuille.index_km_fin_tdb);
      
      if (activeFeuille.taximetre) {
        console.log('\n📊 5. Relation taximetre:');
        console.log('  taximetre object:', activeFeuille.taximetre);
      }
    } else {
      console.log('  ❌ Aucune feuille de route trouvée');
    }
  })
  .catch(error => {
    console.error('❌ Erreur:', error);
  });

// 6. Vérifier les champs dans le DOM
console.log('\n🎛️ 6. Vérification des champs dans le DOM:');
setTimeout(() => {
  const fields = [
    'km_tableau_bord_fin',
    'taximetre_prise_charge_fin',
    'taximetre_index_km_fin',
    'taximetre_km_charge_fin',
    'taximetre_chutes_fin'
  ];
  
  fields.forEach(fieldName => {
    const field = document.querySelector(`input[name="${fieldName}"]`);
    if (field) {
      console.log(`  ${fieldName}:`, {
        value: field.value,
        placeholder: field.placeholder,
        type: field.type
      });
    } else {
      console.log(`  ${fieldName}: FIELD NOT FOUND`);
    }
  });
}, 2000);

console.log('\n✅ Test terminé. Vérifiez les résultats ci-dessus.');
console.log('💡 Astuce: Naviguez vers l\'onglet "Fin de feuille" pour voir les champs.');
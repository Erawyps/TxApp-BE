import fetch from 'node-fetch';

async function testAPIConnectivity() {
  try {
    console.log('🧪 Test de connectivité API...\n');

    // Test 1: Health check
    console.log('1. Test du health check...');
    try {
      const healthResponse = await fetch('http://localhost:3001/health');
      if (healthResponse.ok) {
        console.log('✅ Health check: OK');
      } else {
        console.log('❌ Health check:', healthResponse.status);
      }
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
    }

    // Test 2: Règles de salaire
    console.log('\n2. Test des règles de salaire...');
    try {
      const reglesResponse = await fetch('http://localhost:3001/api/regles-salaire?actif=true&limit=100');
      if (reglesResponse.ok) {
        const reglesData = await reglesResponse.json();
        console.log('✅ Règles de salaire:', reglesData.length || 0, 'éléments');
        if (reglesData.length > 0) {
          console.log('   Exemples:', reglesData.slice(0, 2).map(r => r.nom));
        }
      } else {
        console.log('❌ Règles de salaire:', reglesResponse.status);
      }
    } catch (error) {
      console.log('❌ Règles de salaire failed:', error.message);
    }

    // Test 3: Véhicules
    console.log('\n3. Test des véhicules...');
    try {
      const vehiculesResponse = await fetch('http://localhost:3001/api/vehicules');
      if (vehiculesResponse.ok) {
        const vehiculesData = await vehiculesResponse.json();
        console.log('✅ Véhicules:', vehiculesData.length || 0, 'éléments');
        if (vehiculesData.length > 0) {
          console.log('   Exemples:', vehiculesData.slice(0, 2).map(v => `${v.plaque_immatriculation} ${v.marque}`));
        }
      } else {
        console.log('❌ Véhicules:', vehiculesResponse.status);
      }
    } catch (error) {
      console.log('❌ Véhicules failed:', error.message);
    }

    // Test 4: Chauffeurs
    console.log('\n4. Test des chauffeurs...');
    try {
      const chauffeursResponse = await fetch('http://localhost:3001/api/chauffeurs');
      if (chauffeursResponse.ok) {
        const chauffeursData = await chauffeursResponse.json();
        console.log('✅ Chauffeurs:', chauffeursData.length || 0, 'éléments');
        if (chauffeursData.length > 0) {
          console.log('   Exemples:', chauffeursData.slice(0, 2).map(c => `${c.utilisateur?.prenom} ${c.utilisateur?.nom}`));
        }
      } else {
        console.log('❌ Chauffeurs:', chauffeursResponse.status);
      }
    } catch (error) {
      console.log('❌ Chauffeurs failed:', error.message);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

testAPIConnectivity();
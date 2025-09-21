import { createClient } from "@supabase/supabase-js";
import { config } from 'dotenv';

// Charger les variables d'environnement
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Simuler la fonction updateUserProfile
const updateUserProfile = async (userId, updateData) => {
  try {
    const allowedFields = [
      'nom', 'prenom', 'telephone', 'adresse', 'ville',
      'code_postal', 'pays', 'num_bce', 'num_tva',
      'tva_applicable', 'tva_percent'
    ];

    const dataToUpdate = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        dataToUpdate[field] = updateData[field];
      }
    });

    dataToUpdate.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('utilisateur')
      .update(dataToUpdate)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error('Erreur lors de la mise à jour du profil');
    }

    // Retourner sans le mot de passe
    const { mot_de_passe: _, reset_token: __, reset_token_expires: ___, ...userWithoutPassword } = data;
    return userWithoutPassword;

  } catch (error) {
    console.error('Erreur dans updateUserProfile:', error);
    throw error;
  }
};

async function testUpdateFlow() {
  try {
    console.log('🧪 Test du flux de mise à jour du profil...');

    // Simuler les données de test
    const userId = 244;
    const profileData = {
      nom: 'Test-Nom-' + Date.now(),
      prenom: 'Test-Prenom',
      telephone: '0123456789'
    };

    console.log('1. Test de updateUserProfile...');
    const updatedUser = await updateUserProfile(userId, profileData);
    console.log('✅ updateUserProfile réussi:', updatedUser);

    console.log('2. Simulation du dispatch UPDATE_PROFILE...');
    // Simuler ce que fait le reducer
    const mockState = {
      user: { id: 244, nom: 'Ancien Nom', prenom: 'Ancien Prenom' }
    };

    const newState = {
      ...mockState,
      user: { ...mockState.user, ...updatedUser },
    };

    console.log('✅ État mis à jour simulé:', newState.user);

    console.log('🎉 Test du flux terminé avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

testUpdateFlow();
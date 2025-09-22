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

// Simuler getUserProfile pour tester
async function testGetUserProfile(userId) {
  try {
    console.log(`🧪 Test de récupération du profil utilisateur ${userId}...`);

    // Récupérer les données utilisateur
    const { data: userData, error: userError } = await supabase
      .from('utilisateur')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      throw new Error(`Erreur utilisateur: ${userError.message}`);
    }

    console.log('✅ Données utilisateur récupérées');

    let chauffeurData = null;

    // Essayer de récupérer les données chauffeur (si l'utilisateur est un chauffeur)
    if (userData.type_utilisateur === 'CHAUFFEUR') {
      try {
        const { data: chauffeur, error: chauffeurError } = await supabase
          .from('chauffeur')
          .select('id, numero_badge, date_embauche, type_contrat, taux_commission, salaire_base, actif')
          .eq('utilisateur_id', userId)
          .eq('actif', true)
          .maybeSingle();

        if (!chauffeurError && chauffeur) {
          chauffeurData = chauffeur;
          console.log('✅ Données chauffeur récupérées');
        } else if (chauffeurError && chauffeurError.code !== 'PGRST116') {
          console.warn('⚠️ Erreur chauffeur (non critique):', chauffeurError.message);
        }
      } catch (chauffeurErr) {
        console.warn('⚠️ Impossible de récupérer les données chauffeur:', chauffeurErr.message);
      }
    }

    // Construire le profil complet
    const userProfile = {
      ...userData,
      chauffeur: chauffeurData,
    };

    console.log('✅ Profil complet construit:', {
      id: userProfile.id,
      nom: userProfile.nom,
      email: userProfile.email,
      type: userProfile.type_utilisateur,
      chauffeur: !!userProfile.chauffeur
    });

    return userProfile;

  } catch (error) {
    console.error('❌ Erreur dans testGetUserProfile:', error);
    throw error;
  }
}

// Simuler updateUserProfile pour tester
async function testUpdateUserProfile(userId, updateData) {
  try {
    console.log(`🧪 Test de mise à jour du profil ${userId}...`);

    const allowedFields = [
      'nom', 'prenom', 'telephone', 'adresse', 'ville',
      'code_postal', 'pays', 'num_bce', 'num_tva',
      'tva_applicable', 'tva_percent', 'email'
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
      throw new Error(`Erreur mise à jour: ${error.message}`);
    }

    const { mot_de_passe: _, reset_token: __, reset_token_expires: ___, ...userWithoutPassword } = data;
    console.log('✅ Mise à jour réussie');

    return userWithoutPassword;

  } catch (error) {
    console.error('❌ Erreur dans testUpdateUserProfile:', error);
    throw error;
  }
}

async function testCompleteFlow() {
  try {
    console.log('🚀 Test du flux complet de mise à jour de profil...\n');

    const userId = 244;
    const updateData = {
      nom: 'Test-Update-' + Date.now(),
      email: 'test.updated@example.com',
      telephone: '0987654321'
    };

    // 1. Récupérer le profil initial
    console.log('1️⃣ Récupération du profil initial...');
    const initialProfile = await testGetUserProfile(userId);

    // 2. Mettre à jour le profil
    console.log('\n2️⃣ Mise à jour du profil...');
    const updatedUser = await testUpdateUserProfile(userId, updateData);

    // 3. Rafraîchir le profil (simuler refreshUserProfile)
    console.log('\n3️⃣ Rafraîchissement du profil après mise à jour...');
    const refreshedProfile = await testGetUserProfile(userId);

    // 4. Vérifier que les données ont été mises à jour
    console.log('\n4️⃣ Vérification des mises à jour...');
    const emailUpdated = refreshedProfile.email === updateData.email;
    const nomUpdated = refreshedProfile.nom === updateData.nom;
    const telUpdated = refreshedProfile.telephone === updateData.telephone;

    console.log(`📧 Email mis à jour: ${emailUpdated ? '✅' : '❌'}`);
    console.log(`👤 Nom mis à jour: ${nomUpdated ? '✅' : '❌'}`);
    console.log(`📞 Téléphone mis à jour: ${telUpdated ? '✅' : '❌'}`);

    if (emailUpdated && nomUpdated && telUpdated) {
      console.log('\n🎉 Flux complet réussi ! Les mises à jour de profil fonctionnent.');
    } else {
      console.log('\n⚠️ Certaines mises à jour n\'ont pas été appliquées correctement.');
    }

  } catch (error) {
    console.error('❌ Erreur dans le flux complet:', error);
  }
}

testCompleteFlow();
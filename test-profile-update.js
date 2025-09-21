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

async function testProfileUpdate() {
  try {
    console.log('🧪 Test de mise à jour du profil utilisateur...');

    // Récupérer un utilisateur existant
    const { data: users, error: fetchError } = await supabase
      .from('utilisateur')
      .select('id, nom, prenom, email')
      .limit(1);

    if (fetchError) {
      console.log('❌ Erreur lors de la récupération des utilisateurs:', fetchError.message);
      return;
    }

    if (!users || users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé dans la base de données');
      return;
    }

    const user = users[0];
    console.log('👤 Utilisateur trouvé:', user);

    // Tester la mise à jour
    const newName = `Test-${Date.now()}`;
    const { data: updatedUser, error: updateError } = await supabase
      .from('utilisateur')
      .update({
        nom: newName,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select();

    if (updateError) {
      console.log('❌ Erreur lors de la mise à jour:', updateError.message);
      return;
    }

    console.log('✅ Mise à jour réussie:', updatedUser);

    // Restaurer le nom original
    const { error: restoreError } = await supabase
      .from('utilisateur')
      .update({
        nom: user.nom,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (restoreError) {
      console.log('⚠️ Impossible de restaurer le nom original:', restoreError.message);
    } else {
      console.log('✅ Nom original restauré');
    }

    console.log('🎉 Test de mise à jour du profil terminé avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

testProfileUpdate();
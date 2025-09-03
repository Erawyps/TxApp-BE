import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = "https://jfrhzwtkfotsrjkacrns.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impmcmh6d3RrZm90c3Jqa2Fjcm5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMzc2NTMsImV4cCI6MjA2NDcxMzY1M30.wmECv2qWzI076PcUKj0JjKuTOTS3Hb3uoENeDpSNuFU";

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAdminPassword() {
  try {
    console.log("🔧 Correction du mot de passe administrateur...");

    const email = "admin@taxi.be";
    const password = "password123";

    // Générer le hash correct avec bcrypt
    console.log("1. Génération du hash du mot de passe...");
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log("✅ Hash généré:", hashedPassword.substring(0, 20) + "...");

    // Mettre à jour le mot de passe de l'utilisateur admin
    console.log("2. Mise à jour du mot de passe dans la base de données...");
    const { data, error } = await supabase
      .from('utilisateur')
      .update({
        mot_de_passe: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select('id, email, nom, prenom');

    if (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      return;
    }

    if (data && data.length > 0) {
      console.log('✅ Mot de passe mis à jour avec succès!');
      console.log('👤 Utilisateur:', data[0].prenom, data[0].nom);
      console.log('📧 Email:', data[0].email);
      console.log('🔑 Nouveau mot de passe:', password);
      console.log('');

      // Test de vérification du hash
      console.log("3. Vérification du hash...");
      const isValid = await bcrypt.compare(password, hashedPassword);
      console.log(`${isValid ? '✅' : '❌'} Vérification du hash:`, isValid ? 'OK' : 'ÉCHEC');

      if (isValid) {
        console.log('');
        console.log('🎉 SUCCÈS ! Vous pouvez maintenant vous connecter avec:');
        console.log('   Email:', email);
        console.log('   Mot de passe:', password);
      }
    } else {
      console.log('❌ Aucun utilisateur trouvé avec cet email');
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

fixAdminPassword();

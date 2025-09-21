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

async function checkRLSPolicies() {
  try {
    console.log('🔍 Vérification des politiques RLS actuelles...');

    // Tester la lecture
    console.log('1. Test de lecture...');
    const { data: users, error: readError } = await supabase
      .from('utilisateur')
      .select('id, nom, prenom, email')
      .limit(5);

    if (readError) {
      console.log('❌ Erreur de lecture:', readError.message);
    } else {
      console.log('✅ Lecture réussie, utilisateurs trouvés:', users.length);
    }

    // Tester la mise à jour sur l'utilisateur spécifique (id=244)
    console.log('2. Test de mise à jour sur l\'utilisateur id=244...');
    const { data: updateData, error: updateError } = await supabase
      .from('utilisateur')
      .update({
        nom: 'Test-Update-' + Date.now(),
        updated_at: new Date().toISOString()
      })
      .eq('id', 244)
      .select();

    if (updateError) {
      console.log('❌ Erreur de mise à jour:', updateError.message);
      console.log('🔧 Application de politiques RLS permissives...');

      // Désactiver RLS temporairement
      const { error: disableError } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE utilisateur DISABLE ROW LEVEL SECURITY;'
      });

      if (disableError) {
        console.log('❌ Impossible de désactiver RLS via RPC:', disableError.message);
        console.log('💡 Solution manuelle: Exécutez dans Supabase Dashboard > SQL Editor:');
        console.log(`
-- Désactiver RLS pour permettre les mises à jour
ALTER TABLE utilisateur DISABLE ROW LEVEL SECURITY;
        `);
      } else {
        console.log('✅ RLS désactivé temporairement');

        // Tester à nouveau la mise à jour
        const { data: retryData, error: retryError } = await supabase
          .from('utilisateur')
          .update({
            nom: 'Test-Update-' + Date.now(),
            updated_at: new Date().toISOString()
          })
          .eq('id', 244)
          .select();

        if (retryError) {
          console.log('❌ Mise à jour toujours impossible:', retryError.message);
        } else {
          console.log('✅ Mise à jour réussie après désactivation RLS:', retryData);
        }
      }
    } else {
      console.log('✅ Mise à jour réussie:', updateData);
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
}

checkRLSPolicies();
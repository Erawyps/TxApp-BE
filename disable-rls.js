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

async function disableRLSForDevelopment() {
  try {
    console.log('🔧 Désactivation de RLS pour la table utilisateur en développement...');

    // Méthode 1: Via RPC si disponible
    console.log('1. Tentative via RPC...');
    const { error: rpcError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE utilisateur DISABLE ROW LEVEL SECURITY;'
    });

    if (rpcError) {
      console.log('❌ RPC non disponible:', rpcError.message);
      console.log('💡 Solution: Exécutez manuellement dans Supabase Dashboard > SQL Editor:');

      const sqlCommand = `
-- Désactiver RLS pour permettre les mises à jour en développement
ALTER TABLE utilisateur DISABLE ROW LEVEL SECURITY;

-- Vérifier que c'est bien désactivé
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'utilisateur';
      `;

      console.log(sqlCommand);

      // Essayer une approche alternative avec une fonction personnalisée
      console.log('2. Création d\'une fonction RPC personnalisée...');

      const createFunctionSQL = `
        CREATE OR REPLACE FUNCTION disable_rls_utilisateur()
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          ALTER TABLE utilisateur DISABLE ROW LEVEL SECURITY;
        END;
        $$;
      `;

      console.log('SQL pour créer la fonction:', createFunctionSQL);

      // Tester si on peut créer la fonction
      const { error: createFuncError } = await supabase.rpc('exec_sql', {
        sql: createFunctionSQL
      });

      if (createFuncError) {
        console.log('❌ Impossible de créer la fonction RPC');
        console.log('🔧 Solution finale: Utilisez Supabase Dashboard pour désactiver RLS manuellement');
      } else {
        console.log('✅ Fonction RPC créée, exécution...');

        // Appeler la fonction
        const { error: callFuncError } = await supabase.rpc('disable_rls_utilisateur');

        if (callFuncError) {
          console.log('❌ Erreur lors de l\'exécution de la fonction:', callFuncError.message);
        } else {
          console.log('✅ RLS désactivé avec succès via fonction RPC');
        }
      }

    } else {
      console.log('✅ RLS désactivé avec succès via RPC');
    }

    // Tester la mise à jour après désactivation
    console.log('3. Test de mise à jour après désactivation RLS...');
    const { data: testUpdate, error: testError } = await supabase
      .from('utilisateur')
      .update({
        nom: 'Test-RLS-Disabled-' + Date.now(),
        updated_at: new Date().toISOString()
      })
      .eq('id', 244)
      .select();

    if (testError) {
      console.log('❌ Test de mise à jour échoué:', testError.message);
    } else {
      console.log('✅ Test de mise à jour réussi:', testUpdate);
    }

  } catch (error) {
    console.error('❌ Erreur lors de la désactivation RLS:', error);
  }
}

disableRLSForDevelopment();
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = "https://jfrhzwtkfotsrjkacrns.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impmcmh6d3RrZm90c3Jqa2Fjcm5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMzc2NTMsImV4cCI6MjA2NDcxMzY1M30.wmECv2qWzI076PcUKj0JjKuTOTS3Hb3uoENeDpSNuFU";

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseAuthProblem() {
  console.log("🔍 DIAGNOSTIC COMPLET DU PROBLÈME D'AUTHENTIFICATION");
  console.log("==================================================\n");

  try {
    // 1. Vérifier la connexion Supabase
    console.log("1. Test de connexion Supabase...");
    const { data: testData, error: testError } = await supabase
      .from('utilisateur')
      .select('count')
      .limit(1);

    if (testError) {
      console.log("❌ Connexion Supabase échouée:", testError.message);
      return;
    }
    console.log("✅ Connexion Supabase OK");

    // 2. Rechercher l'utilisateur admin
    console.log("\n2. Recherche de l'utilisateur admin...");
    const { data: adminUser, error: adminError } = await supabase
      .from('utilisateur')
      .select('*')
      .eq('email', 'admin@taxi.be')
      .single();

    if (adminError) {
      console.log("❌ Utilisateur admin non trouvé:", adminError.message);

      // Créer l'utilisateur admin
      console.log("\n3. Création de l'utilisateur admin...");
      const password = "password123";
      const hashedPassword = await bcrypt.hash(password, 12);

      const { data: newUser, error: createError } = await supabase
        .from('utilisateur')
        .insert([{
          email: 'admin@taxi.be',
          mot_de_passe: hashedPassword,
          nom: 'Admin',
          prenom: 'Système',
          telephone: '+32 123 456 789',
          type_utilisateur: 'administrateur',
          actif: true,
          date_creation: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) {
        console.log("❌ Création échouée:", createError.message);
        console.log("\n🔧 SOLUTION: Exécutez ce script SQL dans Supabase:");
        console.log("ALTER TABLE public.utilisateur DISABLE ROW LEVEL SECURITY;");
        console.log("INSERT INTO public.utilisateur (email, mot_de_passe, nom, prenom, telephone, type_utilisateur, actif, date_creation, updated_at)");
        console.log(`VALUES ('admin@taxi.be', '${hashedPassword}', 'Admin', 'Système', '+32 123 456 789', 'administrateur', true, NOW(), NOW());`);
        console.log("ALTER TABLE public.utilisateur ENABLE ROW LEVEL SECURITY;");
        return;
      }

      console.log("✅ Utilisateur admin créé!");
      return;
    }

    console.log("✅ Utilisateur admin trouvé:");
    console.log("   - ID:", adminUser.id);
    console.log("   - Email:", adminUser.email);
    console.log("   - Nom:", adminUser.prenom, adminUser.nom);
    console.log("   - Type:", adminUser.type_utilisateur);
    console.log("   - Actif:", adminUser.actif);
    console.log("   - Hash stocké:", adminUser.mot_de_passe?.substring(0, 20) + "...");

    // 3. Tester le hash du mot de passe
    console.log("\n3. Test du hash du mot de passe...");
    const password = "password123";

    if (!adminUser.mot_de_passe) {
      console.log("❌ Aucun mot de passe stocké!");
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, adminUser.mot_de_passe);
    console.log(`${isPasswordValid ? '✅' : '❌'} Test bcrypt.compare("${password}", hash):`, isPasswordValid);

    if (!isPasswordValid) {
      console.log("\n🔧 CORRECTION: Génération d'un nouveau hash...");
      const newHash = await bcrypt.hash(password, 12);
      console.log("   Nouveau hash:", newHash.substring(0, 20) + "...");

      // Test du nouveau hash
      const isNewHashValid = await bcrypt.compare(password, newHash);
      console.log(`${isNewHashValid ? '✅' : '❌'} Test nouveau hash:`, isNewHashValid);

      console.log("\n📋 SCRIPT SQL À EXÉCUTER:");
      console.log("ALTER TABLE public.utilisateur DISABLE ROW LEVEL SECURITY;");
      console.log(`UPDATE public.utilisateur SET mot_de_passe = '${newHash}', updated_at = NOW() WHERE email = 'admin@taxi.be';`);
      console.log("ALTER TABLE public.utilisateur ENABLE ROW LEVEL SECURITY;");
      console.log("CREATE POLICY \"Allow select for auth\" ON public.utilisateur FOR SELECT TO anon, authenticated USING (true);");
      console.log("CREATE POLICY \"Allow update for auth\" ON public.utilisateur FOR UPDATE TO authenticated USING (true) WITH CHECK (true);");
    }

    // 4. Simuler la fonction loginUser
    console.log("\n4. Simulation de la fonction loginUser...");
    console.log("   Recherche utilisateur avec email...");

    const { data: loginTest, error: loginError } = await supabase
      .from('utilisateur')
      .select('*')
      .eq('email', 'admin@taxi.be')
      .eq('actif', true)
      .single();

    if (loginError) {
      console.log("❌ Erreur lors de la recherche:", loginError.message);
      console.log("🔧 Problème de politique RLS - exécutez ce script:");
      console.log("CREATE POLICY \"Allow select for auth\" ON public.utilisateur FOR SELECT TO anon, authenticated USING (true);");
      return;
    }

    console.log("✅ Utilisateur trouvé pour login");

    if (loginTest.mot_de_passe) {
      const finalTest = await bcrypt.compare("password123", loginTest.mot_de_passe);
      console.log(`${finalTest ? '✅' : '❌'} Test final du mot de passe:`, finalTest);

      if (finalTest) {
        console.log("\n🎉 AUTHENTIFICATION DEVRAIT FONCTIONNER!");
        console.log("   Email: admin@taxi.be");
        console.log("   Mot de passe: password123");
      }
    }

  } catch (error) {
    console.error("❌ Erreur générale:", error.message);
  }
}

diagnoseAuthProblem();

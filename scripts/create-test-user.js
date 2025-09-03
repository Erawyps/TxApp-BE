// Script pour créer un utilisateur de test
// Exécuter avec: node scripts/create-test-user.js

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = "https://jfrhzwtkfotsrjkacrns.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impmcmh6d3RrZm90c3Jqa2Fjcm5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMzc2NTMsImV4cCI6MjA2NDcxMzY1M30.wmECv2qWzI076PcUKj0JjKuTOTS3Hb3uoENeDpSNuFU";

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUser() {
  try {
    console.log("🔍 Tentative de création d'un utilisateur de test...");

    const email = "admin@taxi.be";
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 12);

    // Essayer d'abord de vérifier si l'utilisateur existe déjà
    console.log("1. Vérification de l'existence de l'utilisateur...");
    try {
      const { data: existing, error: checkError } = await supabase
        .from('utilisateur')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (!checkError && existing) {
        console.log('✅ Utilisateur de test existe déjà');
        console.log('📧 Email:', email);
        console.log('🔑 Mot de passe:', password);
        return;
      }
    } catch (checkErr) {
      console.log("⚠️ Impossible de vérifier l'existence (normal si RLS est activé)");
    }

    // Créer l'utilisateur de test
    console.log("2. Création de l'utilisateur de test...");
    const { data, error } = await supabase
      .from('utilisateur')
      .insert([
        {
          email,
          mot_de_passe: hashedPassword,
          nom: "Admin",
          prenom: "Système",
          telephone: "+32 123 456 789",
          type_utilisateur: "administrateur",
          actif: true,
          date_creation: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '42501') {
        console.log('❌ ERREUR: Permission refusée pour le schéma public');
        console.log('');
        console.log('🔧 SOLUTION: Vous devez configurer les politiques de sécurité dans Supabase:');
        console.log('');
        console.log('1. Allez dans votre tableau de bord Supabase');
        console.log('2. Cliquez sur "SQL Editor"');
        console.log('3. Exécutez le script suivant:');
        console.log('');
        console.log('-- Désactiver temporairement RLS pour permettre l\'insertion');
        console.log('ALTER TABLE public.utilisateur DISABLE ROW LEVEL SECURITY;');
        console.log('');
        console.log('-- Ou créer des politiques plus permissives:');
        console.log('CREATE POLICY "Permettre insertion pour anon" ON public.utilisateur');
        console.log('FOR INSERT TO anon WITH CHECK (true);');
        console.log('');
        console.log('CREATE POLICY "Permettre lecture pour anon" ON public.utilisateur');
        console.log('FOR SELECT TO anon USING (true);');
        console.log('');
        console.log('4. Puis réexécutez ce script');
        return;
      }

      if (error.code === '23505') {
        console.log('✅ Utilisateur existe déjà (conflit d\'email)');
        console.log('📧 Email:', email);
        console.log('🔑 Mot de passe:', password);
        return;
      }

      console.error('❌ Erreur lors de la création:', error);
      return;
    }

    console.log('✅ Utilisateur de test créé avec succès!');
    console.log('📧 Email:', email);
    console.log('🔑 Mot de passe:', password);
    console.log('🆔 ID:', data.id);
    console.log('');
    console.log('🚀 Vous pouvez maintenant vous connecter à l\'application!');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    console.log('');
    console.log('💡 Suggestions:');
    console.log('1. Vérifiez que Supabase est accessible');
    console.log('2. Vérifiez les clés API dans le script');
    console.log('3. Configurez les politiques RLS dans Supabase');
  }
}

createTestUser();
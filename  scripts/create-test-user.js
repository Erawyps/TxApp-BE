// Script pour créer un utilisateur de test
// Exécuter avec: node scripts/create-test-user.js

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = "https://jfrhzwtkfotsrjkacrns.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impmcmh6d3RrZm90c3Jqa2Fjcm5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMzc2NTMsImV4cCI6MjA2NDcxMzY1M30.wmECv2qWzI076PcUKj0JjKuTOTS3Hb3uoENeDpSNuFU";

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUser() {
  try {
    const email = "admin@taxi.be";
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 12);

    // Vérifier si l'utilisateur existe déjà
    const { data: existing } = await supabase
      .from('utilisateur')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      console.log('Utilisateur de test existe déjà');
      return;
    }

    // Créer l'utilisateur de test
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
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création:', error);
      return;
    }

    console.log('Utilisateur de test créé avec succès:');
    console.log('Email:', email);
    console.log('Mot de passe:', password);
    console.log('ID:', data.id);

  } catch (error) {
    console.error('Erreur:', error);
  }
}

createTestUser();
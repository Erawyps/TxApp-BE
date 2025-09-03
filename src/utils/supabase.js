import { createClient } from "@supabase/supabase-js";

// Utiliser uniquement les variables VITE_ du fichier .env principal
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Configuration simplifiée
const supabaseOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }
};

// Vérification de la configuration
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Configuration Supabase manquante. Vérifiez votre fichier .env');
  console.error('Variables requises: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
}

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey, supabaseOptions) : null;

// Debug: Afficher les informations de configuration en mode développement
if (import.meta.env.MODE === 'development') {
  console.log('🔧 Supabase Configuration:', {
    url: supabaseUrl ? '✅ Configured' : '❌ Missing',
    key: supabaseKey ? '✅ Configured' : '❌ Missing',
    client: supabase ? '✅ Created' : '❌ Failed'
  });
}

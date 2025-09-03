import { createClient } from "@supabase/supabase-js";

// Prefer Vite browser env vars; fallback to Node env if available
const supabaseUrl = typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_SUPABASE_URL
  ? import.meta.env.VITE_SUPABASE_URL
  : (typeof globalThis !== "undefined" && globalThis.process && globalThis.process.env.REACT_APP_SUPABASE_URL) || undefined;

const supabaseKey = typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY
  ? import.meta.env.VITE_SUPABASE_ANON_KEY
  : (typeof globalThis !== "undefined" && globalThis.process && globalThis.process.env.REACT_APP_SUPABASE_ANON_KEY) || undefined;

// Configuration corrigée sans headers problématiques
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

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey, supabaseOptions) : null;

// Debug: Afficher les informations de configuration en mode développement
if (import.meta.env.MODE === 'development') {
  console.log('🔧 Supabase Configuration:', {
    url: supabaseUrl ? '✅ Configured' : '❌ Missing',
    key: supabaseKey ? '✅ Configured' : '❌ Missing',
    client: supabase ? '✅ Created' : '❌ Failed'
  });
}

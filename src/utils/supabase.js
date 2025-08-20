import { createClient } from "@supabase/supabase-js";

// Prefer Vite browser env vars; fallback to Node env if available
const supabaseUrl = typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_SUPABASE_URL
  ? import.meta.env.VITE_SUPABASE_URL
  : (typeof globalThis !== "undefined" && globalThis.process && globalThis.process.env.REACT_APP_SUPABASE_URL) || undefined;

const supabaseKey = typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY
  ? import.meta.env.VITE_SUPABASE_ANON_KEY
  : (typeof globalThis !== "undefined" && globalThis.process && globalThis.process.env.REACT_APP_SUPABASE_ANON_KEY) || undefined;

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
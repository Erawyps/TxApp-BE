import { createClient } from "@supabase/supabase-js";


const supabaseUrl = typeof window === "undefined" && typeof globalThis.process !== "undefined" ? globalThis.process.env.REACT_APP_SUPABASE_URL : null;
const supabaseKey = typeof window === "undefined" && typeof globalThis.process !== "undefined" ? globalThis.process.env.REACT_APP_SUPABASE_ANON_KEY : null;

export const supabase = createClient(supabaseUrl, supabaseKey);
import { createClient } from '@supabase/supabase-js';

const isVercel = window.location.hostname.includes('vercel.app');
const SUPABASE_URL = isVercel
    ? `${window.location.origin}/api/supabase`
    : (import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co");

const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "placeholder-key";

console.log("Supabase Client Initializing. Mode:", isVercel ? "Proxy" : "Direct", "URL:", SUPABASE_URL);

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
    }
});

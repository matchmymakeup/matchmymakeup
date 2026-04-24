import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — auth and data reads will fail')
}

// TEMP — remove after Preview URL verification (Phase 1 gate).
// Prevents the catastrophic "prod client talks to staging DB" class of bug by
// making the target URL visible on every first-load during rollout.
console.log('[supabase] connected to', url)

// detectSessionInUrl: false — AuthCallback.jsx manually exchanges the PKCE code
// for deterministic error handling. Auto-detection would race the manual
// exchange. No other code path consumes URL auth params.
export const supabase = createClient(url, key, {
  auth: { detectSessionInUrl: false },
})

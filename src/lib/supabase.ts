import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

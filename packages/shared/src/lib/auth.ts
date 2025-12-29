import { SupabaseClient } from "@supabase/supabase-js";

export async function signInWithEmail(
  supabase: SupabaseClient,
  email: string,
  pass: string
) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });

  if (error) {
    return { user: null, error: error.message };
  }

  return { user: data.user, error: null };
}

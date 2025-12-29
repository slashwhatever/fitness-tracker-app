import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "../types/database.types";

/**
 * Platform-specific dependencies that hooks need
 * Each platform (web/mobile) provides its own Supabase client and auth
 */
export type HookDependencies = {
  supabase: SupabaseClient<Database>;
  user: User | null;
};

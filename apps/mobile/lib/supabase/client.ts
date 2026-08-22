import type { Database } from "@fitness/shared";
import {
  createClient as createSupabaseClient,
  SupabaseClient,
} from "@supabase/supabase-js";
import { Platform } from "react-native";
import { secureAuthStorage } from "./secureStorage";

export type { Database } from "@fitness/shared";

let client: SupabaseClient<Database> | undefined;

export function createClient() {
  if (client) {
    return client;
  }

  const originUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseUrl =
    Platform.OS === "android" && originUrl?.includes("localhost")
      ? originUrl.replace("localhost", "10.0.2.2")
      : originUrl;
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing Supabase environment variables. Please ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set in your .env file."
    );
  }

  client = createSupabaseClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      // Persist the session (incl. refresh token) in the OS keystore rather
      // than unencrypted AsyncStorage. See secureStorage.ts.
      storage: secureAuthStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

  return client;
}

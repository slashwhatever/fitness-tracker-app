import { useMemo } from "react";
import { createClient } from "./client";
import type { TypedSupabaseClient } from "./types";

function useSupabaseBrowser(): TypedSupabaseClient {
  return useMemo(() => createClient(), []) as TypedSupabaseClient;
}

export default useSupabaseBrowser;

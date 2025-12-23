export type { Database } from "./database.types";
export type { Tables, TablesInsert, TablesUpdate, Enums } from "./database.types";

import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export type TypedSupabaseClient = SupabaseClient<Database>;

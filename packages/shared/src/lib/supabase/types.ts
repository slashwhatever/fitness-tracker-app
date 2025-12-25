export type {
  Database,
  Enums,
  Tables,
  TablesInsert,
  TablesUpdate,
} from "../../types/database.types";

import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../types/database.types";

export type TypedSupabaseClient = SupabaseClient<Database>;

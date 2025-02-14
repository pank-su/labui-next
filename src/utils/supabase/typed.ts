import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./gen-types";

export type TypedSupabaseClient = SupabaseClient<Database>
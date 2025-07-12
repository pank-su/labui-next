import {Database} from "@/utils/supabase/gen-types";
import {createBrowserClient} from "@supabase/ssr";
import {SupabaseClient} from "@supabase/supabase-js";
import {useMemo} from "react";

let client: SupabaseClient<Database> | undefined

function createClient() {
    if (client) {
        return client
    }
    client = createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            global: {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            }
        }
    )
    return client
}

export function useClient() {
    return useMemo(createClient, [])
}
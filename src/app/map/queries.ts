import {TypedSupabaseClient} from "@/utils/supabase/typed";
import {getBasicView} from "@/app/(general)/queries";

export function getPositions(client: TypedSupabaseClient) {
    return getBasicView(client).not('latitude', 'is', null)
        .not('longitude', 'is', null)
}
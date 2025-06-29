import React from 'react';
import {createClient} from "@/utils/supabase/server";
import {dehydrate, HydrationBoundary, QueryClient} from '@tanstack/react-query';
import {getPositions} from "@/app/map/queries";
import {prefetchQuery} from "@supabase-cache-helpers/postgrest-react-query";
import Map from "@/app/map/map";

// TODO: снова починить карту :)
async function MapPage() {
    const supabase = await createClient()
    const queryClient = new QueryClient();

    //prefetchQuery(queryClient, getPositions(supabase));

    return <HydrationBoundary state={dehydrate(queryClient)}><Map/></HydrationBoundary>

}


export default MapPage;
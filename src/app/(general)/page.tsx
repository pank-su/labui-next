import {cookies} from "next/headers";
import {createClient} from "@/utils/supabase/server";
import {dehydrate, HydrationBoundary, QueryClient} from "@tanstack/react-query";
import {getBasicView, loadOrders} from "@/app/(general)/queries";
import {prefetchQuery} from "@supabase-cache-helpers/postgrest-react-query";
import CollectionTable from "@/app/(general)/table/table";


export default async function Page() {
    const cookieStore = cookies();
    const supabase = await createClient()
    const queryClient = new QueryClient();
    await prefetchQuery(queryClient, getBasicView(supabase));
    await prefetchQuery(queryClient, loadOrders(supabase));


    return <HydrationBoundary state={dehydrate(queryClient)}><CollectionTable/></HydrationBoundary>

}


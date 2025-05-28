import {createClient} from "@/utils/supabase/server";
import {dehydrate, HydrationBoundary, QueryClient} from "@tanstack/react-query";
import {getBasicView, loadOrders} from "@/app/(general)/queries";
import {prefetchQuery} from "@supabase-cache-helpers/postgrest-react-query";
import CollectionTable from "@/app/(general)/table/table";


export default async function Page() {
    const supabase = await createClient()
    const queryClient = new QueryClient();
    // Передаем collectId в функции, если они должны фильтровать по нему
    const basicViewPromise = prefetchQuery(queryClient, getBasicView(supabase));
    const ordersPromise = prefetchQuery(queryClient, loadOrders(supabase));

    await Promise.all([basicViewPromise, ordersPromise]); // Выполняем параллельно


    return <HydrationBoundary state={dehydrate(queryClient)}><CollectionTable/></HydrationBoundary>

}


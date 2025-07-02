import {createClient} from "@/utils/supabase/server";
import {dehydrate, HydrationBoundary, QueryClient,} from "@tanstack/react-query";
import {orders, nextCollectionId} from "@/app/(general)/queries";
import CollectionTable from "@/app/(general)/table/table";


// Страница с таблицей коллекции
export default async function Page({
                                       searchParams,
                                   }: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {

    const params = (await searchParams)

    const stableParams = {...params};

    const supabase = await createClient()
    const queryClient = new QueryClient();

    // если используем paging, то не предзагружaем (сервер не знает когда загрузить новые данные)
    //const basicViewPromise = queryClient.prefetchInfiniteQuery(basicView(supabase, stableParams));
    const ordersPromise = queryClient.prefetchQuery(orders(supabase));
    const nextIdPromise = queryClient.prefetchQuery(nextCollectionId(supabase));
    
    // Preload user data to avoid hydration issues
    const user = await supabase.auth.getUser();
    queryClient.setQueryData(["supabase-get-user"], user);

    await Promise.all([ordersPromise, nextIdPromise]); // Выполняем параллельно


    return <HydrationBoundary state={dehydrate(queryClient)}><CollectionTable
        params={stableParams}/></HydrationBoundary>

}


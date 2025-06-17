import {createClient} from "@/utils/supabase/server";
import {dehydrate, HydrationBoundary, QueryClient,} from "@tanstack/react-query";
import {orders} from "@/app/(general)/queries";
import CollectionTable from "@/app/(general)/table/table";


export default async function Page({
                                       searchParams,
                                   }: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {

    const params = (await searchParams)

    const stableParams = {...params};

    const supabase = await createClient()
    const queryClient = new QueryClient();

    // если используем paging, то не предзагружаем (сервер не знает когда загрузить новые данные)
    //const basicViewPromise = queryClient.prefetchInfiniteQuery(basicView(supabase, stableParams));
    const ordersPromise = queryClient.prefetchQuery(orders(supabase));

    await Promise.all([ordersPromise]); // Выполняем параллельно


    return <HydrationBoundary state={dehydrate(queryClient)}><CollectionTable
        params={stableParams}/></HydrationBoundary>

}


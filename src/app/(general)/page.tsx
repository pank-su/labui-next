import {createClient} from "@/utils/supabase/server";
import {dehydrate, HydrationBoundary, QueryClient,} from "@tanstack/react-query";
import {basicView, orders} from "@/app/(general)/queries";
import CollectionTable from "@/app/(general)/table/table";
import {FormattedBasicViewFilters} from "@/app/(general)/models";


export default async function Page({
                                       searchParams,
                                   }: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {

    const params = (await searchParams)

    const supabase = await createClient()
    const queryClient = new QueryClient();
    // В будущем можно перевести кучу логики на supabase, что позволит оптимизировать всё взаимодействие с ним
    // Это отдельная большая работа
    const basicViewPromise = queryClient.prefetchInfiniteQuery(basicView(supabase, params));
    const ordersPromise = queryClient.prefetchQuery(orders(supabase));

    await Promise.all([basicViewPromise, ordersPromise]); // Выполняем параллельно


    return <HydrationBoundary state={dehydrate(queryClient)}><CollectionTable params={params} /></HydrationBoundary>

}


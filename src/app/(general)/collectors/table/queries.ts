import { TypedSupabaseClient } from "@/utils/supabase/typed";
import { infiniteQueryOptions, keepPreviousData } from "@tanstack/react-query";
import { parseIndexFilterToSupabaseFilter } from "@/utils/parseIndexFilter";

const fetchSize = 50;

export const collectors = (client: TypedSupabaseClient, params: {
    [key: string]: string | string[] | undefined
}) => 
    infiniteQueryOptions({
        queryKey: ["collectors", params],
        queryFn: async ({ pageParam = 0 }) => await getCollectors(client, pageParam, params),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            if (
                !lastPage.data ||
                lastPage.data.length === 0 ||
                lastPage.data.length < fetchSize
            ) {
                return undefined;
            }
            return allPages.length;
        },
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: false,
        placeholderData: keepPreviousData,
    });

async function getCollectors(client: TypedSupabaseClient, page: number, params: {
    [key: string]: string | string[] | undefined
}) {
    const start = page * fetchSize;
    const finish = start + fetchSize - 1;

    let query = client.from("collector").select("*", { count: "exact" });

    // Применяем фильтры
    const textFields = ["last_name", "first_name", "second_name"] as const;
    textFields.forEach(field => {
        if (params[field]) {
            query = query.ilike(field, `%${params[field]}%`);
        }
    });

    // Фильтр по ID (как в основной таблице)
    if (params.id && typeof params.id === 'string') {
        query = query.or(parseIndexFilterToSupabaseFilter(params.id));
    }

    // Поиск по всем полям
    if (params.q && typeof params.q === 'string') {
        const queryString = params.q.trim().toLowerCase();
        query = query.or([
            `last_name.ilike.%${queryString}%`,
            `first_name.ilike.%${queryString}%`,
            `second_name.ilike.%${queryString}%`
        ].join(","));
    }

    // Применяем сортировку
    if (params.sort_field && params.sort_direction && typeof params.sort_field === 'string') {
        const sortDirection = params.sort_direction === 'asc';
        query = query.order(params.sort_field, { ascending: sortDirection });
    } else {
        query = query.order("last_name", { ascending: true });
    }

    return query.range(start, finish);
}
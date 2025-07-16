import { TypedSupabaseClient } from "@/utils/supabase/typed";
import { infiniteQueryOptions, keepPreviousData } from "@tanstack/react-query";
import { parseIndexFilterToSupabaseFilter } from "@/utils/parseIndexFilter";

const fetchSize = 50;

export const tags = (client: TypedSupabaseClient, params: {
    [key: string]: string | string[] | undefined
}) => 
    infiniteQueryOptions({
        queryKey: ["tags", params],
        queryFn: async ({ pageParam = 0 }) => await getTags(client, pageParam, params),
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

async function getTags(client: TypedSupabaseClient, page: number, params: {
    [key: string]: string | string[] | undefined
}) {
    const start = page * fetchSize;
    const finish = start + fetchSize - 1;

    let query = client.from("tags").select("*", { count: "exact" });

    // Применяем фильтры
    const textFields = ["name", "description"] as const;
    textFields.forEach(field => {
        if (params[field] && typeof params[field] === 'string') {
            query = query.ilike(field, `%${params[field]}%`);
        }
    });

    // Фильтр по ID (как в основной таблице)
    if (params.id && typeof params.id === 'string') {
        query = query.or(parseIndexFilterToSupabaseFilter(params.id));
    }

    // Фильтр по цвету
    if (params.color && typeof params.color === 'string') {
        query = query.eq("color", params.color);
    }

    // Поиск по всем полям
    if (params.q && typeof params.q === 'string') {
        const queryString = params.q.trim().toLowerCase();
        query = query.or([
            `name.ilike.%${queryString}%`,
            `description.ilike.%${queryString}%`,
            `color.ilike.%${queryString}%`
        ].join(","));
    }

    // Применяем сортировку
    if (params.sort_field && params.sort_direction && typeof params.sort_field === 'string') {
        const sortDirection = params.sort_direction === 'asc';
        query = query.order(params.sort_field, { ascending: sortDirection });
    } else {
        query = query.order("id", { ascending: true });
    }

    return query.range(start, finish);
}
import {TypedSupabaseClient} from "@/utils/supabase/typed";
import {FormattedBasicViewFilters} from "@/app/(general)/models";
import {parseIndexFilter} from "@/utils/parseIndexFilter";
import {infiniteQueryOptions, keepPreviousData, queryOptions} from "@tanstack/react-query";
import {ReadonlyURLSearchParams} from "next/navigation";
import {PostgrestFilterBuilder} from "@supabase/postgrest-js";
import {parseDate} from "@/utils/date";
import {buildDateFilterString} from "@/app/(general)/utils";

const fetchSize = 50

export const basicView = (client: TypedSupabaseClient, params: {
    [key: string]: string | string[] | undefined
} | ReadonlyURLSearchParams) => infiniteQueryOptions({
    queryKey: ["basic_view", params],
    queryFn: async ({pageParam}) => await getBasicView(client, pageParam, params as FormattedBasicViewFilters),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
        // Более надежная проверка окончания данных
        console.log("lastPage.data?.length:", lastPage.data?.length);
        console.log("fetchSize:", fetchSize);
        console.log("allPages.length:", allPages.length);
        const totalFetched = allPages.reduce((sum, page) => sum + (page.data?.length ?? 0), 0);
        console.log("totalFetched:", totalFetched);
        const totalCount = lastPage && lastPage.count !== undefined && lastPage.count !== null ? lastPage.count : 0;
        console.log("lastPage.count (totalCount):", totalCount);

        // Если получили меньше данных чем запрашивали, или достигли общего количества
        if (!lastPage.data || lastPage.data.length < fetchSize || totalFetched >= totalCount) {
            console.log("Returning: null");
            return null;
        }

        const nextPageParam = allPages.length;
        console.log("Returning:", nextPageParam);
        return nextPageParam;
    },
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
})

export async function getBasicView(client: TypedSupabaseClient, page: number, filters: FormattedBasicViewFilters | undefined = undefined) {

    const start = page * fetchSize
    const finish = start + fetchSize - 1

    let query = client.from("basic_view").select("*", {count: "exact"})

    if (!filters) {
        return (await query.range(start , finish));
    }

    if (filters?.collect_id) {
        query = query.textSearch("collect_id", filters.collect_id)
    }
    // Применяем фильтры к дате
    applyDateRangeFiltersToQuery(query, filters.from_date, filters.to_date)


    const taxonomyFields: (keyof Pick<
        FormattedBasicViewFilters,
        "order" | "family" | "genus" | "kind"
    >)[] = ["order", "family", "genus", "kind"];
    taxonomyFields.forEach((field) => {
        if (filters[field]) {
            if (filters[field] === " ") {
                query = query.is(field + "->>name", null);
            } else {

                query = query.filter(field + "->>name", "eq", filters[field]) // 'order_name', 'family_name' etc.
            }
        }
    });

    if (filters?.id) {
        const {data} = await client.from("basic_view").select("id.max()").single()

        const ids = parseIndexFilter(filters.id as string, 1, data?.max ?? 10000);
        if (ids.length > 0) {
            query = query.in("id", ids)
        }
    }

    const res = (await query.range(start , finish))

    if (res.error || res.data === null) {
        console.error("Error fetching basic view:", res.error);
        return { data: [], count: 0, error: res.error };
    }

    return res;
}





export const orders = (client: TypedSupabaseClient) => queryOptions({
    queryKey: ["orders"],
    queryFn: async () => loadOrders(client)
})


async function loadOrders(client: TypedSupabaseClient) {
    return (await client.from("order").select("id,name").not('name', 'is', null)).data
}


/**
 * Применяет фильтры диапазона дат к запросу Supabase.
 * @param initialQuery Экземпляр PostgrestFilterBuilder от Supabase.
 * @param fromDateStr Строка начальной даты (может быть "ГГГГ", "ММ.ГГГГ", "ДД.ММ.ГГГГ").
 * @param toDateStr Строка конечной даты (может быть "ГГГГ", "ММ.ГГГГ", "ДД.ММ.ГГГГ").
 * @returns Модифицированный экземпляр PostgrestFilterBuilder.
 */
export function applyDateRangeFiltersToQuery( // Переименовал обратно для соответствия
    initialQuery: PostgrestFilterBuilder<any, any, any>,
    fromDateStr?: string,
    toDateStr?: string
): PostgrestFilterBuilder<any, any, any> {
    let query = initialQuery;
    const fromDate = fromDateStr ? parseDate(fromDateStr) : null;
    const toDate = toDateStr ? parseDate(toDateStr) : null;

    let isAnyDateFilterApplied = false;

    if (fromDate) {
        isAnyDateFilterApplied = true;
        const filterString = buildDateFilterString(fromDate, {
            yearComparison: "gt",
            monthComparison: "gt",
            dayComparison: "gte",
        });
        //console.log("DEBUG: fromDate filter string:", filterString);
        query = query.or(filterString);
    }

    if (toDate) {
        isAnyDateFilterApplied = true;
        const filterString = buildDateFilterString(toDate, {
            yearComparison: "lt",
            monthComparison: "lt",
            dayComparison: "lte",
        });
        //console.log("DEBUG: toDate filter string:", filterString);
        query = query.or(filterString);
    }

    if (isAnyDateFilterApplied) {
        // Гарантируем, что записи без указанного года не будут включены,
        // если применялся хотя бы один фильтр по дате.
        // Это важно, так как все условия фильтрации оперируют с полем 'year'.
        query = query.not("year", "is", null);
    }

    return query;
}
import {TypedSupabaseClient} from "@/utils/supabase/typed";
import {FormattedBasicViewFilters} from "@/app/(general)/models";
import {parseIndexFilter, parseIndexFilterToSupabaseFilter} from "@/utils/parseIndexFilter";
import {infiniteQueryOptions, keepPreviousData, queryOptions} from "@tanstack/react-query";
import {ReadonlyURLSearchParams} from "next/navigation";
import {parseDate} from "@/utils/date";
import {buildDateFilterString} from "@/app/(general)/utils";

const fetchSize = 50

// Настройки для запроса коллекции 
export const basicView = (client: TypedSupabaseClient, params: {
    [key: string]: string | string[] | undefined
} | ReadonlyURLSearchParams) => infiniteQueryOptions({
    queryKey: ["basic_view", params],
    queryFn: async ({pageParam}) => await getBasicView(client, pageParam, params as FormattedBasicViewFilters),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {

        // Если получили меньше данных чем запрашивали, или достигли общего количества
        if (
            !lastPage.data ||
            lastPage.data.length === 0 ||
            lastPage.data.length < fetchSize
        ) {
            console.log({message: "ok, end of data"});
            return undefined;
        }

        return allPages.length;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    placeholderData: keepPreviousData,
})



// Создаём запрос c фильтроми и сортировкой к basic query
function basicViewQuery(client: TypedSupabaseClient, filters: FormattedBasicViewFilters | undefined,  range: {
    start: number,
    end: number
} | undefined = undefined) {
    let max;
    let query = client.from("basic_view").select("*", {count: "exact"})

    //


    if (!filters) {
        if (range) {
            query = query.range(range.start, range.end)
        }
        return query
    }
    // применяем фильтры
    /* очень хочется выделить в отдельную функцию, но будут проблемы с типами */


    const textSearchFields = ["collect_id", "comment", "geocomment"] as const;
    textSearchFields.forEach(field => {
        if (filters[field]) {

            query = query.textSearch(field, filters[field])
        }

    })


    // Фильтры по таксономии
    const taxonomyFields = ["order", "family", "genus", "kind"] as const;
    taxonomyFields.forEach((field) => {
        if (filters[field]) {
            if (filters[field] === " ") {
                query = query.is(field + "->>name", null);
            } else {
                query = query.filter(field + "->>name", "eq", filters[field]) // 'order_name', 'family_name' etc.
            }
        }
    });


    // Применяем фильтры к дате
    query = applyDateRangeFiltersToQuery(query, filters.from_date, filters.to_date)

    // Фильтры для значений с выбором
    const selectFields = ["sex", "age", "country", "region", "voucher"] as const;

    selectFields.forEach((field) => {
        if (filters[field]) {
            if (field == "voucher") {
                query = query.eq("voucher_institute", filters[field])

            } else {
                query = query.eq(field, filters[field])
            }

        }
    })

    // Фильтр по id
    if (filters?.id) {
        query = query.or(parseIndexFilterToSupabaseFilter(filters.id,))

    }
    if (range) {
        query = query.range(range.start, range.end)
    }
    return query;
}

// Запрос коллекции 
export async function getBasicView(client: TypedSupabaseClient, page: number, filters: FormattedBasicViewFilters | undefined = undefined) {

    const start = page * fetchSize
    const finish = start + fetchSize - 1

    const query = ( basicViewQuery(client, filters, {start: start, end: finish}))


    return query;
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
// Исправляем applyDateRangeFiltersToQuery
export function applyDateRangeFiltersToQuery(
    initialQuery: any, // Используем any
    fromDateStr?: string,
    toDateStr?: string
): any { // Возвращаем any
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
        query = query.or(filterString);
    }

    if (toDate) {
        isAnyDateFilterApplied = true;
        const filterString = buildDateFilterString(toDate, {
            yearComparison: "lt",
            monthComparison: "lt",
            dayComparison: "lte",
        });
        query = query.or(filterString);
    }

    if (isAnyDateFilterApplied) {
        query = query.not("year", "is", null);
    }

    return query;
}
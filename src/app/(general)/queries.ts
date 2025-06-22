import {TypedSupabaseClient} from "@/utils/supabase/typed";
import {FormattedBasicViewFilters, GeoBasicView} from "@/app/(general)/models";
import {parseIndexFilterToSupabaseFilter} from "@/utils/parseIndexFilter";
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
function basicViewQuery(client: TypedSupabaseClient, filters: FormattedBasicViewFilters | undefined) {
    let query = client.from("basic_view").select("*", {count: "exact"})

    //


    if (!filters) {

        return query
    }
    // применяем фильтры
    /* очень хочется выделить в отдельную функцию, но будут проблемы с типами */


    // Возможно, верну позже, сейчас не очень привычная его работа
    const textSearchFields = [] as const;
    textSearchFields.forEach(field => {
        if (filters[field]) {

            query = query.textSearch(field, filters[field], {
                config: "russian",
            })
        }

    })

    const likeFields = ["collect_id", "voucher_id", "comment", "geo_comment"] as const;
    likeFields.forEach(field => {
        if (filters[field]) {

            query = query.ilike(field, `%${filters[field]}%`)
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

    const otherFields = []

    // Поиск
    if (filters?.q) {
        const queryString = filters.q.trim().toLowerCase()

        query = query.or([...selectFields, ...(taxonomyFields.map((field) => `${field}->>name`)), ...likeFields].map(field => {
            if (field == "voucher") {
                return `voucher_institute.ilike.%${queryString}%`
            } else return `${field}.ilike.%${queryString}%`
        }).join(","))
        //query.ilike("")
    }

    return query;
}

// Запрос коллекции 
export async function getBasicView(client: TypedSupabaseClient, page: number, filters: FormattedBasicViewFilters | undefined = undefined) {

    const start = page * fetchSize
    const finish = start + fetchSize - 1

    return (basicViewQuery(client, filters).range(start, finish));
}

export async function getBasicViewModelCsv(client: TypedSupabaseClient, filters: FormattedBasicViewFilters | undefined = undefined) {
    return (basicViewQuery(client, filters).csv())
}


export const orders = (client: TypedSupabaseClient) => queryOptions({
    queryKey: ["orders"],
    queryFn: async () => loadOrders(client)
})


async function loadOrders(client: TypedSupabaseClient) {
    return (await client.from("order").select("id,name").not('name', 'is', null)).data
}


export function values(client: TypedSupabaseClient, tableName: string, columnId: string, filters: {
    [key: string]: string | string[] | undefined
} | undefined = undefined) {
    const {from_lat, to_lat, from_lng, to_lng, ...cleanFilters} = filters || {}

    return queryOptions({
        queryKey: [tableName, columnId,  cleanFilters as (FormattedBasicViewFilters | undefined)],
        queryFn: async () => {
            switch (tableName) {
                case "basic_view":
                    return basicViewQuery(client, filters as (FormattedBasicViewFilters | undefined)).select(`value:${columnId}, count()`).overrideTypes<{
                        value: string | null, count: number

                    }[]>();

            }
        },
    })

}


export async function getGeoBasicView(client: TypedSupabaseClient, filters: {
    [key: string]: string | string[] | undefined
} | undefined = undefined) {
    const result = await basicViewQuery(client, filters)
        .select("id,collect_id,order,family,genus,kind,latitude,longitude");
    return result.data as GeoBasicView[] || [];
}
export function geoBasicView(client: TypedSupabaseClient, filters: {
    [key: string]: string | string[] | undefined
} | undefined = undefined) {
    const {from_lat, to_lat, from_lng, to_lng, ...cleanFilters} = filters || {}

    return queryOptions({
        queryKey: ["geo_basic_view", cleanFilters],
        queryFn: async () =>  getGeoBasicView(client, filters),
    })
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



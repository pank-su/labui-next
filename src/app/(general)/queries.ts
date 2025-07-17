import {TypedSupabaseClient} from "@/utils/supabase/typed";
import {FormattedBasicViewFilters, GeoBasicView, isGeoFilters} from "@/app/(general)/models";
import {compressIdsToRanges, parseIndexFilterToSupabaseFilter} from "@/utils/parseIndexFilter";
import {infiniteQueryOptions, keepPreviousData, queryOptions} from "@tanstack/react-query";
import {parseDate} from "@/utils/date";
import {buildDateFilterString} from "@/app/(general)/utils";

const fetchSize = 50

// Настройки для запроса коллекции 
export const basicView = (client: TypedSupabaseClient, params: {
    [key: string]: string | string[] | undefined
}) => infiniteQueryOptions({
    queryKey: ["basic_view", params],
    queryFn: async ({pageParam}) => await getBasicView(client, pageParam, params),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {

        // Если получили меньше данных чем запрашивали, или достигли общего количества
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
})


// Создаём запрос c фильтроми к basic query
export function basicViewQuery(client: TypedSupabaseClient, filters: FormattedBasicViewFilters | undefined) {
    let query = client.from("basic_view").select("id,collect_id,order,family,genus,kind,age,sex,voucher_institute,voucher_id,latitude,longitude,country,region,geo_comment,day,month,year,comment,ncbi_biosample_id,biosample_sra_type,biosample_sra_id,collectors,tags,last_modified,last_modified_by,last_operation,edit_users", {count: "exact"})

    if (isGeoFilters(filters)) {

        query = query.gte('longitude', Number(filters.from_lng))
            .lte('longitude', Number(filters.to_lng))
            .gte('latitude', Number(filters.from_lat))
            .lte('latitude', Number(filters.to_lat));
    }

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

    const likeFields = ["collect_id", "voucher_id", "comment", "geo_comment", "ncbi_biosample_id", "biosample_sra_id"] as const;
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
    const selectFields = ["sex", "age", "country", "region", "voucher", "biosample"] as const;

    selectFields.forEach((field) => {
        if (filters[field]) {
            if (field == "voucher") {
                query = query.eq("voucher_institute", filters[field])

            } else if (field == "biosample") {
                query = query.eq("biosample_sra_type", filters[field])
            } else {
                query = query.eq(field, filters[field])
            }

        }
    })


    // Фильтр по id
    if (filters?.id) {
        query = query.or(parseIndexFilterToSupabaseFilter(filters.id,))

    }

    if (filters.tags) {
        const tags = filters.tags.split(",")

        query = query.contains("tag_ids", tags.map(Number));
    }

    if (filters.collectors) {
        const collectors = filters.collectors.split(",")

        query = query.contains("collector_ids", collectors.map(Number));
    }

    if (filters.edit) {
        const editUsers = filters.edit.split(",")

        query = query.contains("edit_user_ids", editUsers);
    }

    // Фильтрация по дате последнего изменения
    if (filters.from_last_modified) {
        // Преобразуем дату в формат ISO для базы данных
        const fromDate = parseDate(filters.from_last_modified);

        if (fromDate) {
            const isoDate = new Date(fromDate.year, (fromDate.month || 1) - 1, fromDate.day || 1).toISOString();
            query = query.gte("last_modified", isoDate);
        }
    }
    
    if (filters.to_last_modified) {
        // Преобразуем дату в формат ISO для базы данных
        const toDate = parseDate(filters.to_last_modified);
        if (toDate) {
            const isoDate = new Date(toDate.year, (toDate.month || 12) - 1, toDate.day || 31, 23, 59, 59).toISOString();
            query = query.lte("last_modified", isoDate);
        }
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

    // Геофильтры

    return query;
}

// Применяем сортировку только для getBasicView
function applyBasicViewSorting(query: any, filters: FormattedBasicViewFilters | undefined) {
    if (filters?.sort_field && filters?.sort_direction) {
        const sortField = filters.sort_field;
        const sortDirection = filters.sort_direction === 'asc';

        // Для полей таксономии используем вложенную сортировку
        if (['order', 'family', 'genus', 'kind'].includes(sortField)) {
            return query.order(`${sortField}->>name`, {ascending: sortDirection});
        }
        // Если пришло поле с _name, преобразуем обратно в синтаксис PostgREST
        if (sortField.endsWith('_name') && ['order_name', 'family_name', 'genus_name', 'kind_name'].includes(sortField)) {
            const baseField = sortField.replace('_name', '');
            return query.order(`${baseField}->>name`, {ascending: sortDirection});
        }
        // Для даты используем составную сортировку
        else if (sortField === 'date') {
            return query
                .order('year', {ascending: sortDirection, nullsFirst: false})
                .order('month', {ascending: sortDirection, nullsFirst: false})
                .order('day', {ascending: sortDirection, nullsFirst: false});
        } else {
            return query.order(sortField, {ascending: sortDirection, nullsFirst: false});
        }
    } else {
        // Сортировка по умолчанию по id
        return query.order('id', {ascending: true});
    }
}

// Запрос коллекции 
export async function getBasicView(client: TypedSupabaseClient, page: number, filters: FormattedBasicViewFilters | undefined = undefined) {

    const start = page * fetchSize
    const finish = start + fetchSize - 1

    let query = basicViewQuery(client, filters);
    query = applyBasicViewSorting(query, filters);

    return query.range(start, finish);
}

export async function getBasicViewModelCsv(client: TypedSupabaseClient, filters: FormattedBasicViewFilters | undefined = undefined) {
    const queryResult = await basicViewQuery(client, filters);
    const ids = queryResult.data?.map(({id}) => id).filter((id): id is number => id !== null) || [];

    // Преобразуем массив ID в компактную строку диапазонов
    const compressedIds = compressIdsToRanges(ids);

    // Используем parseIndexFilterToSupabaseFilter для создания фильтра
    return client.from("csv_export_view")
        .select("*")
        .or(parseIndexFilterToSupabaseFilter(compressedIds))
        .csv();
}


export const orders = (client: TypedSupabaseClient) => queryOptions({
    queryKey: ["orders"],
    queryFn: async () => loadOrders(client)
})


async function loadOrders(client: TypedSupabaseClient) {
    return (await client.from("order").select("id,name").not('name', 'is', null)).data
}

export const voucherInstitutes = (client: TypedSupabaseClient) => queryOptions({
    queryKey: ["voucher_institutes"],
    queryFn: async () => loadVoucherInstitutes(client)
})

async function loadVoucherInstitutes(client: TypedSupabaseClient) {
    return (await client.from("voucher_institute").select("id,name")).data
}

export const biosampleSraTypes = (client: TypedSupabaseClient) => queryOptions({
    queryKey: ["biosample_sra_types"],
    queryFn: async () => loadBiosampleSraTypes(client)
})

async function loadBiosampleSraTypes(client: TypedSupabaseClient) {
    return (await client.from("biosample_sra_type").select("id,name")).data
}


export function values(client: TypedSupabaseClient, tableName: string, columnId: string, filters: {
    [key: string]: string | string[] | undefined
} | undefined = undefined) {

    return queryOptions({
        queryKey: [tableName, columnId, filters as (FormattedBasicViewFilters | undefined)],
        queryFn: async () => {
            switch (tableName) {
                case "basic_view":
                    if (columnId === "edit_users") {
                        // Для edit_users получаем все записи и обрабатываем на клиенте
                        const result = await client.from("basic_view")
                            .select("edit_users")
                            .not("edit_users", "is", null);
                        
                        if (!result.data) return { data: [] };
                        
                        // Собираем всех уникальных пользователей
                        const userMap = new Map();
                        result.data.forEach((row: any) => {
                            if (row.edit_users) {
                                row.edit_users.forEach((user: any) => {
                                    if (user.id) {
                                        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
                                        const key = user.id;
                                        if (!userMap.has(key)) {
                                            userMap.set(key, {
                                                value: user.id,
                                                count: 0,
                                                label: fullName || 'Пользователь'
                                            });
                                        }
                                        userMap.get(key).count++;
                                    }
                                });
                            }
                        });
                        
                        return { data: Array.from(userMap.values()) };
                    } else {
                        return basicViewQuery(client, filters as (FormattedBasicViewFilters | undefined)).select(`value:${columnId}, count()`).overrideTypes<{
                            value: string | null, count: number
                        }[]>();
                    }

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
    const {from_lat, to_lat, from_lng, to_lng, zoom, map, edit_row, ...cleanFilters} = filters || {}


    return queryOptions({
        queryKey: ["geo_basic_view", cleanFilters],
        queryFn: async () => getGeoBasicView(client, cleanFilters),
    })
}

export function nextCollectionId(client: TypedSupabaseClient) {
    return queryOptions({
        queryKey: ["next_collection_id"],
        queryFn: async () => {
            const result = await client.from("collection").select("id").order("id", {ascending: false}).limit(1);
            return result.data && result.data.length > 0 ? result.data[0].id + 1 : 1;
        },
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



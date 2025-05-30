"use client"

import {useClient} from "@/utils/supabase/client";
import {useSubscription, useUpsertItem} from "@supabase-cache-helpers/postgrest-react-query";
import {
    getCoreRowModel,
    getFacetedMinMaxValues,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable
} from "@tanstack/react-table";
import {useCallback, useEffect, useMemo, useRef} from "react";
import {useInfiniteQuery} from "@tanstack/react-query";
import {useInView} from "react-intersection-observer";

import {Database, Tables} from "@/utils/supabase/gen-types";
import {SupabaseClient} from "@supabase/supabase-js";
import getColumns from "@/app/(general)/table/columns";
import DataTable from "@/app/components/data-table/data-table";
import {FormattedBasicView} from "@/app/(general)/models";
import {basicView} from "@/app/(general)/queries";
import CollectionTableControls from "@/app/(general)/table/controls";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import CollectionMap from "@/app/components/map/CollectionMap";


const mapStates = ["closed", "open", "select"] as const;
type MapState = typeof mapStates[number];

async function loadBasicViewItemById(supabase: SupabaseClient<Database>, id: number) {
    return ((await supabase.from("basic_view").select("*").eq("id", id)).data as FormattedBasicView[])[0]
}

/**
 *  Таблица коллекции с возможностью отображения карты
 */
export default function CollectionTable() {
    const supabase = useClient()

    const router = useRouter();
    const pathname = usePathname()
    const searchParams = useSearchParams()


    // Зачем тут все поля? Чтобы библиотека понимала, что нужно будет обновить, а не пыталась обновлять всё
    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({
        ...basicView(supabase, searchParams),
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 0,
        maxPages: 20 
    })

    const search = searchParams.get("q") ?? "";

    const param = searchParams.get("map");
    const mapState: "closed" | "open" | "select" = mapStates.includes(param as MapState)
        ? (param as MapState)
        : "closed";

    const upsertItem = useUpsertItem({
        primaryKeys: ["id"],
        table: "basic_view",
        schema: "public"
    })

    // Supabase не поддерживает realtime для представлений
    // поэтому просто будет получать все изменения в таблице
    // и самостоятельно обновлять кэш
    // надо также подключить обновление при изменении смежных таблиц
    // TODO: привязаться к триггеру обновления view
    useSubscription(supabase, "collection_updates", {
        event: "*",
        table: "collection",
        schema: "public"
    }, ["id"], {
        callback: async (payload) => {
            console.log(payload)
            const newItem = payload.new as Tables<"collection">
            const basicViewItem = await loadBasicViewItemById(supabase, newItem.id)
            await upsertItem(basicViewItem) // Элементы коллекции не удаляются
        }
    })

    // Данные таблицы
    const tableData = useMemo(() => {
        return data ? data.pages.flatMap(page => page.data ?? []) : [];
    }, [data])


    // Таблица использует отфильтрованные данные в режиме разделенного экрана
    const table = useReactTable({
        columns: getColumns(),
        data: tableData,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        // getFilteredRowModel: getFilteredRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getFacetedMinMaxValues: getFacetedMinMaxValues(),
        //debugTable: true,
        autoResetPageIndex: false,
        state: {
            globalFilter: search
        },
        manualFiltering: true,
        filterFns: {
            selectFilter: (row, id, filterValue) => {
                const value = row.getValue(id) as string | null
                return filterValue === " " && value === null || filterValue === value
            }
        },
        meta: {}
    })

    const boundsChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);


    // Обработчик изменения границ карты
    const handleBoundsChange = useCallback((bounds: [number, number, number, number]) => {
        if (boundsChangeTimeoutRef.current) {
            clearTimeout(boundsChangeTimeoutRef.current);
        }

        const [fromLng, fromLat, toLng, toLat] = bounds;
        table.getColumn("latitude")?.setFilterValue({
            from: fromLat,
            to: toLat
        })
        table.getColumn("longitude")?.setFilterValue({
            from: fromLng,
            to: toLng
        })

        boundsChangeTimeoutRef.current = setTimeout(() => {


            const params = new URLSearchParams(searchParams);

            params.set("from_lat", fromLat.toString());
            params.set("to_lat", toLat.toString());
            params.set("from_lng", fromLng.toString());
            params.set("to_lng", toLng.toString());
            if (params.size != 0) router.push(pathname + "?" + params.toString());
            else {
                router.replace(pathname)
            }
        }, 2000);
    }, []);

    const mapItems = useMemo(() => {

        return table.getFilteredRowModel().rows.map((row) => row.original);
    }, [table.getFilteredRowModel().rows]);


    return (
        <div className="h-full flex flex-col">

            <CollectionTableControls table={table}/>

            {/* Содержимое в зависимости от режима отображения */}
            <div className="flex-1 flex" style={{minHeight: 0}}>

                <div className={mapState === "open" ? "w-1/2" : "w-full"}>
                    <DataTable table={table} loading={isLoading || isFetchingNextPage} padding={42}/>
                    <div ref={ref} /> {/* Sentinel for infinite scroll */}
                    {/* Optional: Loading spinner for when fetching next page */}
                    {isFetchingNextPage && (
                        <div className="flex justify-center p-4">
                            <p>Loading more items...</p>
                        </div>
                    )}
                </div>

                {mapState === "open" && <div className={"w-1/2"}>
                    <CollectionMap
                        height="100%"
                        onBoundsChange={handleBoundsChange}
                        items={mapItems}
                        isLoading={isLoading || isFetchingNextPage}
                    />


                </div>}


            </div>
        </div>
    );
}
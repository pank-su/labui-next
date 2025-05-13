"use client"

import {useClient} from "@/utils/supabase/client";
import {useQuery, useSubscription, useUpsertItem} from "@supabase-cache-helpers/postgrest-react-query";
import {
    getCoreRowModel,
    getFacetedMinMaxValues,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable
} from "@tanstack/react-table";
import {useCallback, useMemo, useState} from "react";

import {useSearchParams} from 'next/navigation';
import {Database, Tables} from "@/utils/supabase/gen-types";
import {SupabaseClient} from "@supabase/supabase-js";
import getColumns from "@/app/(general)/table/columns";
import DataTable from "@/app/components/data-table/data-table";
import {FormattedBasicView} from "@/app/(general)/models";
import {getBasicView} from "@/app/(general)/queries";
import CollectionTableControls from "@/app/(general)/table/controls";

async function loadBasicViewItemById(supabase: SupabaseClient<Database>, id: number) {
    return ((await supabase.from("basic_view").select("*").eq("id", id)).data as FormattedBasicView[])[0]
}

/**
 *  Таблица коллекции с возможностью отображения карты
 */
export default function CollectionTable() {
    const supabase = useClient()
    // const {search} = useSearch()



    // Режим отображения (по умолчанию - только таблица)
    //const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.TABLE_ONLY);

    // Границы карты для фильтрации элементов
    const [mapBounds, setMapBounds] = useState<[number, number, number, number] | null>(null);

    // Зачем тут все поля? Чтобы библиотека понимала, что нужно будет обновить, а не пыталась обновлять всё
    const {
        data,
        isLoading
    } = useQuery(getBasicView(supabase))

    const searchParams = useSearchParams()
    const search = searchParams.get("q") || ""

    const upsertItem = useUpsertItem({
        primaryKeys: ["id"],
        table: "basic_view",
        schema: "public"
    })

    // Supabase не поддерживает realtime для представлений
    // поэтому просто будет получать все изменения в таблице
    // и самостоятельно обновлять кэш
    // надо также подключить обновление при изменении смежных таблиц
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
        return data ?? []
    }, [data])


    // Обработчик изменения границ карты
    const handleBoundsChange = useCallback((bounds: [number, number, number, number]) => {
        setMapBounds(bounds);
    }, []);

    // Таблица использует отфильтрованные данные в режиме разделенного экрана
    const table = useReactTable({
        columns: getColumns(),
        data: tableData,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getFacetedMinMaxValues: getFacetedMinMaxValues(),
        //debugTable: true,
        autoResetPageIndex: false,
        state: {
            globalFilter: search
        },
        filterFns:{
          selectFilter: (row, id, filterValue) => {
              const value = row.getValue(id) as string | null
              return  filterValue === " " && value === null || filterValue === value
          }
        },
        meta: {}
    })


    return (
        <div className="h-full flex flex-col">

            <CollectionTableControls table={table}/>

            {/* Содержимое в зависимости от режима отображения */}
            <div className="flex-1 flex" style={{minHeight: 0}}>
                {/* Отображение таблицы */}
                {/*{(viewMode === ViewMode.TABLE_ONLY || viewMode === ViewMode.SPLIT) && (*/}
                {/*    <div className={`${viewMode === ViewMode.SPLIT ? 'w-1/2' : 'w-full'} overflow-auto`}>*/}
                <DataTable table={table} loading={isLoading} padding={42}/>
                {/*    </div>*/}
                {/*)}*/}

                {/*/!* Отображение карты *!/*/}
                {/*{(viewMode === ViewMode.MAP_ONLY || viewMode === ViewMode.SPLIT) && (*/}
                {/*    <div className={`${viewMode === ViewMode.SPLIT ? 'w-1/2' : 'w-full'} relative`}>*/}
                {/*        <CollectionMap*/}
                {/*            height="100%"*/}
                {/*            showAllItems={false}*/}
                {/*            onBoundsChange={handleBoundsChange}*/}
                {/*            filteredItems={viewMode === ViewMode.SPLIT ? undefined : tableData}*/}
                {/*            simplified={viewMode === ViewMode.SPLIT}*/}
                {/*        />*/}
                {/*    </div>*/}
                {/*)}*/}
            </div>
        </div>
    );
}
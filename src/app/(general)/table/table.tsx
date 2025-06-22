"use client"

import {useClient} from "@/utils/supabase/client";
import {
    useQuery as useTableQuery,
    useSubscription,
    useUpdateMutation,
    useUpsertItem
} from "@supabase-cache-helpers/postgrest-react-query";
import {
    getCoreRowModel,
    getFacetedMinMaxValues,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getSortedRowModel,
    useReactTable
} from "@tanstack/react-table";
import {useCallback, useMemo, useRef, useState} from "react";
import {basicView, geoBasicView, orders as loadOrders} from "@/app/(general)/queries";

import {Database, Tables} from "@/utils/supabase/gen-types";
import {SupabaseClient} from "@supabase/supabase-js";
import getColumns from "@/app/(general)/table/columns";
import DataTable from "@/app/components/data-table/data-table";
import {FormattedBasicView, GenomRow, toGenomRow, Topology} from "../models"
import CollectionTableControls from "@/app/(general)/table/controls";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {MapFilter} from "@/app/(general)/table/map-filter";
import {useQuery, useSuspenseInfiniteQuery, useSuspenseQuery} from "@tanstack/react-query";
import {useUser} from "@/app/components/header";
import {Spin} from "antd";
import {MapState, mapStates} from "@/app/components/data-table/filters/utils";




async function loadBasicViewItemById(supabase: SupabaseClient<Database>, id: number) {
    return ((await supabase.from("basic_view").select("*").eq("id", id)).data as FormattedBasicView[])[0]
}

/**
 *  Таблица коллекции с возможностью отображения карты
 */
export default function CollectionTable({params}: { params: { [key: string]: string | string[] | undefined } }) {
    const supabase = useClient()

    const router = useRouter();
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const queryOptions = useMemo(
        () => basicView(supabase, params),
        [supabase, params] // Зависимости: объект будет создан заново только если изменится supabase или params
    );

    const {
        data,
        isLoading,
        fetchNextPage,
        isFetching,
        hasNextPage,

    } = useSuspenseInfiniteQuery(queryOptions)

    const tableData = useMemo(
        () => data?.pages?.filter(page => page.data != null)?.flatMap(page => page.data) ?? [],
        [data]
    )


    const mapState = useMemo(() => {
        const mapParam = params["map"];
        return mapStates.includes(mapParam as MapState)
            ? (mapParam as MapState)
            : "closed";
    }, [params]);

    const mapQuery = useMemo(() => geoBasicView(supabase, params)
        , [params, supabase]);

    const {data: mapItems, isLoading: mapItemsLoading} = useQuery(geoBasicView(supabase, params))



    const upsertItem = useUpsertItem({
        primaryKeys: ["id"],
        table: "basic_view",
        schema: "public"
    })

    const [editedGenomRow, setEditedGenomRow] = useState<GenomRow | null>(null)
    const {user} = useUser()

    const handleEdit = useCallback((row: FormattedBasicView) => {
        setEditedGenomRow(toGenomRow(row));
    }, []);

    const {mutateAsync: update} = useUpdateMutation(
        supabase.from("collection"),
        ['id']
    );

    const {data: orders, isLoading: isOrdersLoading} = useSuspenseQuery(loadOrders(supabase));

    const {data: families, isLoading: isFamiliesLoading} = useTableQuery(
        supabase.from("family").select("id,name").not('name', 'is', null)
            .eq('order_id', editedGenomRow?.order?.id || -1),
        {enabled: !!editedGenomRow?.order?.id}
    );
    const {data: genera, isLoading: isGeneraLoading} = useTableQuery(
        supabase.from("genus").select("id,name").not('name', 'is', null)
            .eq('family_id', editedGenomRow?.family?.id || -1),
        {enabled: !!editedGenomRow?.family?.id}
    );
    const {data: kinds, isLoading: isKindsLoading} = useTableQuery(
        supabase.from("kind").select("id,name").not('name', 'is', null)
            .eq('genus_id', editedGenomRow?.genus?.id || -1),
        {enabled: !!editedGenomRow?.genus?.id}
    );

    const handleFieldChange = (field: string, value: Topology | undefined) => {
        if (!editedGenomRow) return;

        const updatedRow = {...editedGenomRow};
        switch (field) {
            case 'order':
                updatedRow.order = value;
                updatedRow.family = undefined;
                updatedRow.genus = undefined;
                updatedRow.kind = undefined;
                break;
            case 'family':
                updatedRow.family = value;
                updatedRow.genus = undefined;
                updatedRow.kind = undefined;
                break;
            case 'genus':
                updatedRow.genus = value;
                updatedRow.kind = undefined;
                break;
            case 'kind':
                updatedRow.kind = value;
                break;
        }

        setEditedGenomRow(updatedRow);
    };

    const handleSave = async () => {
        if (editedGenomRow) {
            console.log(editedGenomRow)
            await supabase.rpc("update_collection_taxonomy_by_ids", {
                col_id: editedGenomRow.rowId!,
                order_id: editedGenomRow.order?.id ?? undefined,
                family_id: editedGenomRow.family?.id ?? undefined,
                genus_id: editedGenomRow.genus?.id ?? undefined,
                kind_id: editedGenomRow.kind?.id ?? undefined
            })
            setEditedGenomRow(null)

        }
    };

    const handleCancel = () => {
        setEditedGenomRow(null);
    };


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


    const columns = useMemo(() => getColumns({
        user,
        editedGenomRow,
        orders: orders || [],
        families: families || [],
        genera: genera || [],
        kinds: kinds || [],
        isOrdersLoading,
        isFamiliesLoading,
        isGeneraLoading,
        isKindsLoading,
        onEdit: handleEdit,
        onFieldChange: handleFieldChange,
        onSave: handleSave,
        onCancel: handleCancel,
        onUpdate: update,
    }), [
        user, editedGenomRow, orders, families, genera, kinds,
        isOrdersLoading, isFamiliesLoading, isGeneraLoading, isKindsLoading,
        handleEdit, handleFieldChange, handleSave, handleCancel, update
    ]);


    // Таблица использует отфильтрованные данные в режиме разделенного экрана
    const table = useReactTable({
        columns: columns,
        data: tableData,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        // getFilteredRowModel: getFilteredRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getFacetedMinMaxValues: getFacetedMinMaxValues(),
        //debugTable: true,
        autoResetPageIndex: false,

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


            const searchParams = new URLSearchParams();

            // Так как дурацкий URLSearchParams не принимает params
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    if (Array.isArray(value)) {
                        // Если значение - массив, добавляем каждый элемент
                        value.forEach(v => searchParams.append(key, v));
                    } else {
                        // Если значение - строка
                        searchParams.set(key, value);
                    }
                }
            });
            console.log(params)
            searchParams.set("from_lat", fromLat.toString());
            searchParams.set("to_lat", toLat.toString());
            searchParams.set("from_lng", fromLng.toString());
            searchParams.set("to_lng", toLng.toString());
            if (searchParams.size != 0) router.push(pathname + "?" + searchParams.toString());
            else {
                router.replace(pathname)
            }
        }, 2000);
    }, [params]);




    return (
        <div className="h-full flex flex-col">

            <CollectionTableControls filters={params} table={table}/>

            {/* Содержимое в зависимости от режима отображения */}
            <div className="flex-1 flex" style={{minHeight: 0}}>

                <div className={mapState === "open" ? "w-1/2" : "w-full"}>
                    <DataTable filters={params} tableName={"basic_view"} table={table} hasNextPage={hasNextPage}
                               fetchedSize={tableData.length} size={data.pages[0].count ?? 0}
                               fetchNextPage={fetchNextPage} isFetching={isFetching} loading={isLoading} padding={42}/>
                </div>

                {mapState === "open" && <div className={"w-1/2"}>
                    <MapFilter
                        height="100%"
                        onBoundsChange={handleBoundsChange}
                        items={mapItems || []}
                        isLoading={mapItemsLoading}
                    />


                </div>}


            </div>
            <div
                className="absolute bottom-4 left-4 px-3 py-2 text-sm text-gray-600 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border z-50">
                Загружено {tableData.length} из {data.pages[0].count ?? 0} записей
                {isFetching && <><span className="mx-1"/> <Spin size={"small"}/></>}
            </div>
        </div>
    );
}
"use client"

import {useClient} from "@/utils/supabase/client";
import {
    useQuery as useTableQuery,
    useSubscription,
    useUpdateMutation
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
import {basicView, basicViewQuery, geoBasicView, orders as loadOrders} from "@/app/(general)/queries";

import {Database, Tables} from "@/utils/supabase/gen-types";
import {SupabaseClient} from "@supabase/supabase-js";
import getColumns from "@/app/(general)/table/columns";
import DataTable from "@/app/components/data-table/data-table";
import {FormattedBasicView, GenomRow, isGeoFilters, MapState, mapStates, toGenomRow, Topology} from "../models"
import CollectionTableControls from "@/app/(general)/table/controls";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {MapFilter} from "@/app/(general)/table/map-filter";
import {useQuery, useQueryClient, useSuspenseInfiniteQuery, useSuspenseQuery} from "@tanstack/react-query";
import {useUser} from "@/app/components/header";
import {Spin} from "antd";




// Утилиты
async function loadBasicViewItemById(supabase: SupabaseClient<Database>, id: number) {
    const result = await supabase.from("basic_view").select("*").eq("id", id);
    return result.data?.[0] as FormattedBasicView;
}

// Хук для управления редактированием
const useEditing = () => {
    const [editedGenomRow, setEditedGenomRow] = useState<GenomRow | null>(null)
    const [editingFields, setEditingFields] = useState<Set<string>>(new Set())

    const handleEdit = useCallback((row: FormattedBasicView) => {
        setEditedGenomRow(toGenomRow(row));
    }, []);

    const handleFieldChange = useCallback((field: string, value: Topology | undefined) => {
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
    }, [editedGenomRow]);

    const handleStartEditing = useCallback((rowId: number, fieldName: string) => {
        const fieldKey = `${rowId}-${fieldName}`;
        setEditingFields(prev => new Set(prev).add(fieldKey));
    }, []);

    const handleStopEditing = useCallback((rowId: number, fieldName: string) => {
        const fieldKey = `${rowId}-${fieldName}`;
        setEditingFields(prev => {
            const newSet = new Set(prev);
            newSet.delete(fieldKey);
            return newSet;
        });
    }, []);

    const isFieldEditing = useCallback((rowId: number, fieldName: string) => {
        const fieldKey = `${rowId}-${fieldName}`;
        return editingFields.has(fieldKey);
    }, [editingFields]);

    const handleCancel = useCallback(() => {
        setEditedGenomRow(null);
    }, []);

    return {
        editedGenomRow,
        setEditedGenomRow,
        handleEdit,
        handleFieldChange,
        handleStartEditing,
        handleStopEditing,
        isFieldEditing,
        handleCancel
    }
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
    }, [params["map"]]);

    const mapQuery = useMemo(() => geoBasicView(supabase, params)
        , [params, supabase]);

    const {data: mapItems, isLoading: mapItemsLoading} = useQuery(geoBasicView(supabase, params))




    const {user} = useUser()
    const editing = useEditing()
    const {editedGenomRow, setEditedGenomRow} = editing

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


    const queryClient = useQueryClient()

    // Функция для обновления конкретной записи в кэше
    const updateItemInCache = async (collectionId: number, isInsert: boolean = false) => {
        // Сохраняем состояние редактирования таксономии перед обновлением
        const isEditingTaxonomy = editedGenomRow?.rowId === collectionId;
        
        // Для INSERT проверяем, попадает ли новая запись под текущие фильтры
        if (isInsert) {
            const filtersWithId = { ...params, id: collectionId.toString() }
            const result = await basicViewQuery(supabase, filtersWithId).select("id")
            
            // Если запись не попадает под фильтры, не обновляем кэш
            if (!result.data || result.data.length === 0) {
                return
            }
            
            // Если попадает, делаем ревалидацию всех страниц
            queryClient.invalidateQueries({ queryKey: ["basic_view"] })
            queryClient.invalidateQueries({ queryKey: ["geo_basic_view"] })
            return
        }

        // Для UPDATE обновляем конкретную запись в кэше
        const basicViewItem = await loadBasicViewItemById(supabase, collectionId)
        if (!basicViewItem) return

        queryClient.setQueryData(queryOptions.queryKey, (oldData: any) => {
            if (!oldData?.pages) return oldData

            return {
                ...oldData,
                pages: oldData.pages.map((page: any) => {
                    if (!page?.data) return page
                    
                    const itemIndex = page.data.findIndex((item: FormattedBasicView) => item.id === collectionId)
                    if (itemIndex === -1) return page

                    const newData = [...page.data]
                    newData[itemIndex] = basicViewItem
                    
                    // Если эта запись редактируется в данный момент, обновляем editedGenomRow
                    if (isEditingTaxonomy && editedGenomRow) {
                        const updatedGenomRow = toGenomRow(basicViewItem);
                        updatedGenomRow.rowId = editedGenomRow.rowId;
                        // Сохраняем текущие изменения пользователя
                        updatedGenomRow.order = editedGenomRow.order;
                        updatedGenomRow.family = editedGenomRow.family;
                        updatedGenomRow.genus = editedGenomRow.genus;
                        updatedGenomRow.kind = editedGenomRow.kind;
                        setEditedGenomRow(updatedGenomRow);
                    }
                    
                    return { ...page, data: newData }
                })
            }
        })

        // Обновляем geo данные если нужно
        queryClient.invalidateQueries({ queryKey: ["geo_basic_view"] })
    }

    // Обновление кэша при изменении таблицы collection
    useSubscription(supabase, "collection_updates", {
        event: "*",
        table: "collection",
        schema: "public"
    }, ["id"], {
        callback: async (payload) => {
            if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
                const newItem = payload.new as Tables<"collection">
                await updateItemInCache(newItem.id, payload.eventType === "INSERT")
            }
        }
    })

    // Обновление кэша при изменении связей тегов
    useSubscription(supabase, "tags_to_collection_updates", {
        event: "*",
        table: "tags_to_collection",
        schema: "public"
    }, ["col_id"], {
        callback: async (payload) => {
            const collectionId = (payload.new as any)?.col_id || (payload.old as any)?.col_id
            if (collectionId) {
                await updateItemInCache(collectionId)
            }
        }
    })

    // Обновление кэша при изменении тегов
    useSubscription(supabase, "tags_updates", {
        event: "*",
        table: "tags",
        schema: "public"
    }, ["id"], {
        callback: async (payload) => {
            if (payload.eventType === "UPDATE") {
                const tagId = (payload.new as any).id
                const { data: tagConnections } = await supabase
                    .from("tags_to_collection")
                    .select("col_id")
                    .eq("tag_id", tagId)
                
                if (tagConnections) {
                    for (const connection of tagConnections) {
                        await updateItemInCache(connection.col_id)
                    }
                }
            }
        }
    })

    // Обновление кэша при изменении связей коллекторов
    useSubscription(supabase, "collector_to_collection_updates", {
        event: "*",
        table: "collector_to_collection",
        schema: "public"
    }, ["collection_id"], {
        callback: async (payload) => {
            const collectionId = (payload.new as any)?.collection_id || (payload.old as any)?.collection_id
            if (collectionId) {
                await updateItemInCache(collectionId)
            }
        }
    })

    // Обновление кэша при изменении коллекторов
    useSubscription(supabase, "collector_updates", {
        event: "*",
        table: "collector",
        schema: "public"
    }, ["id"], {
        callback: async (payload) => {
            if (payload.eventType === "UPDATE") {
                const collectorId = (payload.new as any).id
                const { data: collectorConnections } = await supabase
                    .from("collector_to_collection")
                    .select("collection_id")
                    .eq("collector_id", collectorId)
                
                if (collectorConnections) {
                    for (const connection of collectorConnections) {
                        await updateItemInCache(connection.collection_id)
                    }
                }
            }
        }
    })

    // Для остальных таблиц (таксономия, регионы и т.д.) просто перезагружаем все страницы
    useSubscription(supabase, "taxonomy_updates", {
        event: "*",
        table: "order",
        schema: "public"
    }, ["id"], {
        callback: async (payload) => {
            if (payload.eventType === "UPDATE") {
                queryClient.invalidateQueries({ queryKey: ["basic_view"] })
                queryClient.invalidateQueries({ queryKey: ["geo_basic_view"] })
            }
            if (payload.eventType === "INSERT") {
                queryClient.invalidateQueries({ queryKey: ["orders"] })
            }
        }
    })

    useSubscription(supabase, "family_updates", {
        event: "*", 
        table: "family",
        schema: "public"
    }, ["id"], {
        callback: async (payload) => {
            if (payload.eventType === "UPDATE") {
                queryClient.invalidateQueries({ queryKey: ["basic_view"] })
                queryClient.invalidateQueries({ queryKey: ["geo_basic_view"] })
            }
            if (payload.eventType === "INSERT") {
                queryClient.invalidateQueries({ queryKey: ["family"] })
            }
        }
    })

    useSubscription(supabase, "genus_updates", {
        event: "*",
        table: "genus", 
        schema: "public"
    }, ["id"], {
        callback: async (payload) => {
            if (payload.eventType === "UPDATE") {
                queryClient.invalidateQueries({ queryKey: ["basic_view"] })
                queryClient.invalidateQueries({ queryKey: ["geo_basic_view"] })
            }
            if (payload.eventType === "INSERT") {
                queryClient.invalidateQueries({ queryKey: ["genus"] })
            }
        }
    })

    useSubscription(supabase, "kind_updates", {
        event: "*",
        table: "kind",
        schema: "public"
    }, ["id"], {
        callback: async (payload) => {
            if (payload.eventType === "UPDATE") {
                queryClient.invalidateQueries({ queryKey: ["basic_view"] })
                queryClient.invalidateQueries({ queryKey: ["geo_basic_view"] })
            }
            if (payload.eventType === "INSERT") {
                queryClient.invalidateQueries({ queryKey: ["kind"] })
            }
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
        onEdit: editing.handleEdit,
        onFieldChange: editing.handleFieldChange,
        onSave: handleSave,
        onCancel: editing.handleCancel,
        onUpdate: update,
        onStartEditing: editing.handleStartEditing,
        onStopEditing: editing.handleStopEditing,
        isFieldEditing: editing.isFieldEditing,
    }), [
        user, editedGenomRow, orders, families, genera, kinds,
        isOrdersLoading, isFamiliesLoading, isGeneraLoading, isKindsLoading,
        editing.handleEdit, editing.handleFieldChange, handleSave, editing.handleCancel, update,
        editing.handleStartEditing, editing.handleStopEditing, editing.isFieldEditing
    ]);


    const initialSortingState = useMemo(() => {
        if (params.sort_field && params.sort_direction && typeof params.sort_field === 'string') {
            return [{
                id: params.sort_field,
                desc: params.sort_direction === 'desc'
            }];
        }
        return [{
            id: 'id',
            desc: false
        }];
    }, [params.sort_field, params.sort_direction]);

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
        manualSorting: true,
        enableSortingRemoval: false,
        state: {
            sorting: initialSortingState
        },
        filterFns: {
            selectFilter: (row, id, filterValue) => {
                const value = row.getValue(id) as string | null
                return filterValue === " " && value === null || filterValue === value
            }
        },
        onSortingChange: (updater) => {
            const currentSorting = table.getState().sorting;
            const newSorting = typeof updater === 'function' ? updater(currentSorting) : updater;
            
            const newParams = new URLSearchParams();
            
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && !['sort_field', 'sort_direction'].includes(key)) {
                    if (Array.isArray(value)) {
                        value.forEach(v => newParams.append(key, v));
                    } else {
                        newParams.set(key, value);
                    }
                }
            });

            if (Array.isArray(newSorting) && newSorting.length > 0) {
                const firstSort = newSorting[0];
                newParams.set('sort_field', firstSort.id);
                newParams.set('sort_direction', firstSort.desc ? 'desc' : 'asc');
            }

            const newUrl = newParams.toString() ? `${pathname}?${newParams.toString()}` : pathname;
            router.push(newUrl);
        },
        meta: {}
    })

    const boundsChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [mapInitialized, setMapInitialized] = useState(false);

    const startBounds = useMemo(() => {
        if (isGeoFilters(params)){
            return [params.from_lng, params.from_lat, params.to_lng, params.to_lat].map((val) => Number(val)) as [number, number, number, number];
        }
    }, [params.from_lng, params.from_lat, params.to_lng, params.to_lat]) // Убираем mapInitialized

    const zoom = useMemo(() => {
        if (isGeoFilters(params)){
            return Number(params.zoom)
        }
    }, [params.zoom]) // Убираем mapInitialized

    // Обработчик изменения границ карты
    const handleBoundsChange = useCallback((bounds: [number, number, number, number], zoom: number) => {

        if (!mapInitialized) {
            setMapInitialized(true);
        }

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
            searchParams.set("from_lat", fromLat.toString());
            searchParams.set("to_lat", toLat.toString());
            searchParams.set("from_lng", fromLng.toString());
            searchParams.set("to_lng", toLng.toString());
            searchParams.set("zoom", zoom.toString());
            if (searchParams.size != 0) router.push(pathname + "?" + searchParams.toString());
            else {
                router.replace(pathname)
            }
        }, 500);
    }, [params, mapInitialized]);




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
                        startBounds={startBounds}
                        startZoom={zoom}
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
"use client"

import {
    useInsertMutation,
    useQuery,
    useSubscription,
    useUpsertItem
} from "@supabase-cache-helpers/postgrest-react-query";
import DataTable from "../components/data-table/data-table";
import {
    getCoreRowModel,
    getFacetedMinMaxValues,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable
} from "@tanstack/react-table";
import {useClient} from "@/utils/supabase/client";
import getColumns from "./columns";
import {useState, useMemo, useCallback} from "react";
import {
    PlusOutlined,
    ReloadOutlined,
    DownloadOutlined,
    EnvironmentOutlined,
    SplitCellsOutlined,
    TableOutlined,
    GlobalOutlined
} from "@ant-design/icons";
import {Button,  Tooltip, Popconfirm, Tag} from "antd";
import {useRouter, useSearchParams} from 'next/navigation';
import {Database, Tables} from "@/utils/supabase/gen-types";
import {useUser} from "../components/header";
import {SupabaseClient} from "@supabase/supabase-js";
import {FormattedBasicView} from "./models";
import {download, generateCsv, mkConfig} from "export-to-csv";
import NewId from "../components/data-table/new-id";
import CollectionMap from "../components/map/CollectionMap";

// Режимы отображения страницы
enum ViewMode {
    TABLE_ONLY, // Только таблица
    MAP_ONLY,   // Только карта
    SPLIT       // Разделенный режим (таблица + карта)
}

async function loadBasicViewItemById(supabase: SupabaseClient<Database>, id: number) {
    return ((await supabase.from("basic_view").select("*").eq("id", id)).data as FormattedBasicView[])[0]
}

/**
 *  Таблица коллекции с возможностью отображения карты
 */
export default function CollectionTable() {
    const supabase = useClient()
    const router = useRouter()
    // const {search} = useSearch()

    const searchParams =  useSearchParams()
    const search = searchParams.get("q") || ""

    // Режим отображения (по умолчанию - только таблица)
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.TABLE_ONLY);

    // Границы карты для фильтрации элементов
    const [mapBounds, setMapBounds] = useState<[number, number, number, number] | null>(null);

    // Зачем тут все поля? Чтобы библиотека понимала, что нужно будет обновить, а не пыталась обновлять всё
    const {
        data,
        isLoading
    } = useQuery(supabase.from("basic_view").select("id,collect_id,latitude,longitude,order,family,genus,kind,age,sex,voucher_institute,voucher_id,country,region,geo_comment,day,month,year,comment,collectors,tags"))

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

    // Фильтрация элементов по границам карты
    const filteredData = useMemo(() => {
        if (!mapBounds || viewMode !== ViewMode.SPLIT || !data) return tableData;

        // Элементы только в видимой области карты
        return data.filter(item => {
            if (!item.latitude || !item.longitude) return false;

            const [west, south, east, north] = mapBounds;
            return (
                item.longitude >= west &&
                item.longitude <= east &&
                item.latitude >= south &&
                item.latitude <= north
            );
        });
    }, [tableData, mapBounds, viewMode, data]);

    // Обработчик изменения границ карты
    const handleBoundsChange = useCallback((bounds: [number, number, number, number]) => {
        setMapBounds(bounds);
    }, []);

    // Таблица использует отфильтрованные данные в режиме разделенного экрана
    const table = useReactTable({
        columns: getColumns(),
        data: viewMode === ViewMode.SPLIT ? filteredData : tableData,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getFacetedMinMaxValues: getFacetedMinMaxValues(),
        debugTable: true,
        autoResetPageIndex: false,
        state: {
            globalFilter: search
        },
        meta: {}
    })

    const userLoad = useUser();

    const {mutateAsync: insert} = useInsertMutation(
        supabase.from("collection"),
        ["id"],
        "id",
        {
            onSuccess(data, variables, context) {
            },
        }
    )

    const csvConfig = mkConfig({useKeysAsHeaders: true});

    // Переключение режимов отображения
    const toggleViewMode = (mode: ViewMode) => {
        setViewMode(mode);
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-2 flex justify-between items-center">
                <div className="space-x-2">
                    <Tooltip title={!userLoad.user ? "Для добавления записи нужно войти в аккаунт" : null}>
                        <Popconfirm
                            placement="right"
                            okText="Да"
                            cancelText="Нет"
                            icon={<PlusOutlined style={{color: "blue"}}/>}
                            onConfirm={() => insert([])}
                            title={<>Вы точно хотите добавить запись с ID <NewId
                                column={table.getColumn("id") ?? null}/></>}
                        >
                            <Button
                                type="primary"
                                icon={<PlusOutlined/>}
                                loading={userLoad.isLoading}
                                disabled={!userLoad.user}
                            >
                                Добавить запись
                            </Button>
                        </Popconfirm>
                    </Tooltip>

                    <Tooltip title="Сбросить фильтры">
                        <Button
                            type="text"
                            icon={<ReloadOutlined/>}
                            onClick={() => table.resetColumnFilters()}
                        />
                    </Tooltip>

                    <Tooltip title="Экспорт">
                        <Button
                            type="text"
                            icon={<DownloadOutlined/>}
                            onClick={() => {
                                const rows = table.getRowModel().rows.map(row => ({
                                    ...row.original,
                                    collectors: row.original.collectors?.map((collector) => `${collector.last_name} ${collector.first_name} ${collector.second_name}`).join(","),
                                    tags: row.original.tags?.map((t) => t.name).join(","),
                                    order: row.original.order?.name,
                                    family: row.original.family?.name,
                                    genus: row.original.genus?.name,
                                    kind: row.original.kind?.name
                                }));

                                const csv = generateCsv(csvConfig)(rows);
                                download(csvConfig)(csv);
                            }}
                        />
                    </Tooltip>
                </div>

                {/* Кнопки переключения режимов отображения */}
                <div className="space-x-2">
                    <Button.Group>
                        <Tooltip title="Показать только таблицу">
                            <Button
                                type={viewMode === ViewMode.TABLE_ONLY ? "primary" : "default"}
                                icon={<TableOutlined/>}
                                onClick={() => toggleViewMode(ViewMode.TABLE_ONLY)}
                            />
                        </Tooltip>
                        <Tooltip title="Разделенный режим">
                            <Button
                                type={viewMode === ViewMode.SPLIT ? "primary" : "default"}
                                icon={<SplitCellsOutlined/>}
                                onClick={() => toggleViewMode(ViewMode.SPLIT)}
                            />
                        </Tooltip>
                        <Tooltip title="Показать только карту">
                            <Button
                                type={viewMode === ViewMode.MAP_ONLY ? "primary" : "default"}
                                icon={<GlobalOutlined/>}
                                onClick={() => toggleViewMode(ViewMode.MAP_ONLY)}
                            />
                        </Tooltip>
                    </Button.Group>

                    <Tooltip title="Открыть карту на весь экран">
                        <Button
                            type="primary"
                            ghost
                            icon={<EnvironmentOutlined/>}
                            onClick={() => router.push('/map')}
                        >
                            Карта
                        </Button>
                    </Tooltip>
                </div>
            </div>

            {/* Содержимое в зависимости от режима отображения */}
            <div className="flex-1 flex" style={{minHeight: 0}}>
                {/* Отображение таблицы */}
                {(viewMode === ViewMode.TABLE_ONLY || viewMode === ViewMode.SPLIT) && (
                    <div className={`${viewMode === ViewMode.SPLIT ? 'w-1/2' : 'w-full'} overflow-auto`}>
                        <DataTable table={table} loading={isLoading} padding={42}/>
                    </div>
                )}

                {/* Отображение карты */}
                {(viewMode === ViewMode.MAP_ONLY || viewMode === ViewMode.SPLIT) && (
                    <div className={`${viewMode === ViewMode.SPLIT ? 'w-1/2' : 'w-full'} relative`}>
                        <CollectionMap
                            height="100%"
                            showAllItems={false}
                            onBoundsChange={handleBoundsChange}
                            filteredItems={viewMode === ViewMode.SPLIT ? undefined : tableData}
                            simplified={viewMode === ViewMode.SPLIT}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
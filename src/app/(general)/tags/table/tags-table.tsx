"use client";

import {useMemo, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import {useSuspenseInfiniteQuery, useQueryClient} from "@tanstack/react-query";
import {getCoreRowModel, getSortedRowModel, useReactTable,} from "@tanstack/react-table";
import {Button, message, Tooltip, Spin} from "antd";
import {PlusOutlined, ReloadOutlined} from "@ant-design/icons";
import {useClient} from "@/utils/supabase/client";
import {useSubscription} from "@supabase-cache-helpers/postgrest-react-query";
import CreateTagDialog from "@/app/components/create-tag-dialog";
import DataTable from "@/app/components/data-table/data-table";
import {useTagsColumns} from "./columns";
import {tags} from "./queries";
import type {Tables} from "@/utils/supabase/gen-types";

type Tag = Tables<"tags">;

export default function TagsTable({
                                      params
                                  }: {
    params: { [key: string]: string | string[] | undefined }
}) {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const supabase = useClient();
    const queryClient = useQueryClient();

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

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
        refetch
    } = useSuspenseInfiniteQuery(tags(supabase, params));

    const flatData = data?.pages.flatMap(page => page.data).filter((it) => it != null) ?? [];

    // Подписка на обновления тегов
    useSubscription(supabase, "tags_updates", {
        event: "*",
        table: "tags",
        schema: "public"
    }, ["id"], {
        callback: async (payload) => {
            if (payload.eventType === "INSERT" || payload.eventType === "UPDATE" || payload.eventType === "DELETE") {
                // Обновляем кеш тегов
                queryClient.invalidateQueries({queryKey: ["tags"]});
            }
        }
    });

    const handleCreateSuccess = (newTag: {
        id: number;
        name: string;
        description?: string | null;
        color?: string | null;
    }) => {
        message.success("Тег успешно создан");
        setCreateDialogOpen(false);
        refetch();
    };

    const tagsColumns = useTagsColumns();

    const table = useReactTable({
        data: flatData,
        columns: tagsColumns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualSorting: true,
        autoResetPageIndex: false,
        state: {
            sorting: initialSortingState
        },
        onSortingChange: (updater) => {
            const currentSorting = initialSortingState;
            const newSorting = typeof updater === 'function' ? updater(currentSorting) : updater;

            // Проверяем, действительно ли изменилась сортировка
            const currentSort = currentSorting[0];
            const newSort = newSorting[0];
            
            if (currentSort?.id === newSort?.id && currentSort?.desc === newSort?.desc) {
                return; // Не делаем ничего, если сортировка не изменилась
            }

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
        }
    });

    return (
        <div style={{ position: 'relative' }}>
            {/* Controls */}
            <div className="p-2 flex justify-between items-center">
                <div className="space-x-2">
                    <Button
                        type="primary"
                        icon={<PlusOutlined/>}
                        onClick={() => setCreateDialogOpen(true)}
                    >
                        Добавить тег
                    </Button>

                    <Tooltip title="Сбросить фильтры">
                        <Button
                            type="text"
                            icon={<ReloadOutlined/>}
                            onClick={() => router.push('/tags')}
                        />
                    </Tooltip>
                </div>
            </div>

            {/* Table */}
            <DataTable
                table={table}
                loading={isFetching && !isFetchingNextPage}
                size={flatData.length}
                fetchNextPage={fetchNextPage}
                isFetching={isFetching}
                hasNextPage={hasNextPage}
                tableName="tags"
                filters={params}
            />

            {/* Records Counter */}
            <div
                className="absolute bottom-12 left-4 px-3 py-2 text-sm text-gray-600 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border z-50">
                Загружено {flatData.length} из {data.pages[0].count ?? 0} записей
                {isFetching && <><span className="mx-1"/> <Spin size={"small"}/></>}
            </div>

            <CreateTagDialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                onSuccess={handleCreateSuccess}
            />
        </div>
    );
}
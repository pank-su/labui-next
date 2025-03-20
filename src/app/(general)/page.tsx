"use client"

import { useInsertMutation, useQuery, useSubscription, useUpsertItem } from "@supabase-cache-helpers/postgrest-react-query";
import DataTable from "../components/data-table/data-table";
import { getCoreRowModel, getFacetedMinMaxValues, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useClient } from "../../utils/supabase/client";
import { columns } from "./collection/columns";
import { useEffect, useMemo, useState } from "react";
import { PlusOutlined, ReloadOutlined, DownloadOutlined, SyncOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { Button, Avatar, Tooltip, Popconfirm, Tag } from "antd";
import { useSearch } from "../components/search-context";
import { Database, Tables } from "@/utils/supabase/gen-types";
import { useUser } from "../components/header";
import { SupabaseClient } from "@supabase/supabase-js";
import { FormattedBasicView } from "./models";
import { download, generateCsv, mkConfig } from "export-to-csv";
import { json } from "stream/consumers";
import NewId from "../components/data-table/new-id";


async function loadBasicViewItemById(supabase: SupabaseClient<Database>, id: number) {
    return ((await supabase.from("basic_view").select("*").eq("id", id)).data as FormattedBasicView[])[0]
}


/**
 *  Таблица коллекции
 */
export default function CollectionTable() {
    const supabase = useClient()

    const { search } = useSearch()


    // Зачем тут все поля? Чтобы библиотека понимала, что нужно будет обновить, а не пыталась обновлять всё
    const { data, isLoading } = useQuery(supabase.from("basic_view").select("id,collect_id,latitude,longtitude,order,family,genus,kind,age,sex,voucher_institute,voucher_id,country,region,geo_comment,day,month,year,comment,collectors,tags"))

    const upsertItem = useUpsertItem({
        primaryKeys: ["id"],
        table: "basic_view",
        schema: "public"
    })

    // Supabase не поддерживает realtime для представлений
    // поэтому просто будет получать все изменения в таблице
    // и самостоятельно обновлять кэш
    // надо также подключить обновление при изменение смежных таблиц
    useSubscription(supabase, "collection_updates", {
        event: "*",
        table: "collection",
        schema: "public"
    }, ["id"], {

        callback: async (payload) => {

            console.log(payload)
            const newItem = payload.new as Tables<"collection">
            const basicViewItem = await loadBasicViewItemById(supabase, newItem.id)

            upsertItem(basicViewItem) // Элементы коллекции не удаляются
        }

    })


    const tableData = useMemo(() => {
        return data ?? []
    }, [data])



    const table = useReactTable({
        columns: columns,
        data: tableData,
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
        }
    })

    const userLoad = useUser();

    const { mutateAsync: insert } = useInsertMutation(
        supabase.from("collection"),
        ["id"],
        "id",
        {
            onSuccess(data, variables, context) {

            },
        }
    )
    table.getColumn("id")?.getFacetedMinMaxValues

    const csvConfig = mkConfig({ useKeysAsHeaders: true });

    return <div className="h-full">
        <div className="p-2 flex justify-between items-center">
            <div className="space-x-2">
                <Tooltip title={!userLoad.user ? "Для добавления записи нужно войти в аккаунт" : null}>
                    <Popconfirm placement="right" okText="Да" cancelText="Нет" icon={
                        <QuestionCircleOutlined style={{color: "blue"}}/>
                    } onConfirm={
                        () => insert([{}])
                    } title={<>
                        Вы точно хотите добавить запись с ID <NewId column={table.getColumn("id") ?? null} />
                    </>}>
                        <Button type="primary" icon={<PlusOutlined />} loading={userLoad.isLoading} disabled={!userLoad.user}>
                            Добавить запись
                        </Button>
                    </Popconfirm>
                </Tooltip>

                <Tooltip title="Сбросить фильтры">
                    <Button type="text" icon={<ReloadOutlined />} onClick={() => table.resetColumnFilters()} />
                </Tooltip>
                <Tooltip title="Экспорт">
                    <Button type="text" icon={<DownloadOutlined />} onClick={() => {

                        const rows = table.getRowModel().rows.map(row => ({
                            ...row.original,
                            collectors: JSON.stringify(row.original.collectors),
                            tags: JSON.stringify(row.original.tags)
                        }));

                        const csv = generateCsv(csvConfig)(rows);

                        download(csvConfig)(csv);
                    }} />
                </Tooltip>
            </div>
            <Avatar.Group max={{ count: 3 }} size={"small"}>

            </Avatar.Group>
        </div>
        <DataTable table={table} loading={isLoading} padding={42} />
    </div>

}


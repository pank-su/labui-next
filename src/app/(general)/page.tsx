"use client"

import { useQuery, useSubscription, useUpsertItem } from "@supabase-cache-helpers/postgrest-react-query";
import DataTable from "../components/data-table/data-table";
import { getCoreRowModel, getFacetedMinMaxValues, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useClient } from "../../utils/supabase/client";
import { columns } from "./collection/columns";
import { useEffect, useMemo, useState } from "react";
import { PlusOutlined, ReloadOutlined, SettingOutlined, DownloadOutlined } from "@ant-design/icons";
import { Button, Avatar, Tooltip } from "antd";
import { useSearch } from "../components/search-context";
import exportToCsv from "tanstack-table-export-to-csv";
import { Tables } from "@/utils/supabase/gen-types";
import { useQuery as useQueryRQ } from "@tanstack/react-query";


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
    useSubscription(supabase, "collection_insert", {
        event: "*",
        table: "collection",
        schema: "public"
    }, ["id"], {

        callback: (payload) => {
            upsertItem((payload.new as Tables<"collection">)) // Элементы коллекции не удаляются
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

    // TODO: очищать поля ввода фильтров
    return <div className="h-full">
        <div className="p-2 flex justify-between items-center">
            <div className="space-x-2">
                <Button type="primary" icon={<PlusOutlined />}>Добавить запись</Button>
                <Tooltip title="Сбросить фильтры">
                    <Button type="text" icon={<ReloadOutlined />} onClick={() => table.resetColumnFilters()} />
                </Tooltip>
                <Tooltip title="Экспорт">
                    <Button type="text" icon={<DownloadOutlined />} onClick={() => {
                        const headers = table
                            .getHeaderGroups()
                            .map((x) => x.headers)
                            .flat();

                        const rows = table.getCoreRowModel().rows;

                        exportToCsv("collection", headers, rows);
                    }} />
                </Tooltip>
            </div>
            <Avatar.Group max={{ count: 3 }} size={"small"}>

            </Avatar.Group>
        </div>
        <DataTable table={table} loading={isLoading} padding={42} />
    </div>

}

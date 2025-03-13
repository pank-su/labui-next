"use client"

import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import DataTable from "../components/data-table/data-table";
import { getCoreRowModel, getFacetedMinMaxValues, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useClient } from "../../utils/supabase/client";
import { columns } from "./collection/columns";
import { useMemo, useState } from "react";
import { PlusOutlined, ReloadOutlined, SettingOutlined, DownloadOutlined } from "@ant-design/icons";
import { Button, Avatar, Tooltip } from "antd";
import { generateAvatar } from "../components/profile-avatar";
import { useSearch } from "../components/search-context";
import exportToCsv, { getCsvBlob } from "tanstack-table-export-to-csv";


/**
 *  Таблица коллекции
 * 
 */
export default function CollectionTable() {
    const supabase = useClient()

    const { search } = useSearch()

    const { data, isPending } = useQuery(supabase.from("basic_view").select())

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
                <Avatar src={generateAvatar("1")} />
                <Avatar src={generateAvatar("2")} />
                <Avatar src={generateAvatar("3")} />
                <Avatar src={generateAvatar("4")} />
            </Avatar.Group>
        </div>
        <DataTable table={table} loading={isLoading} padding={42} />
    </div>

}

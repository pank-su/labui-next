"use client"
"use no memo"

import { Tables } from "@/utils/supabase/gen-types";
import { MoreOutlined, PlusOutlined, VerticalAlignBottomOutlined } from "@ant-design/icons";
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { FormattedBasicView } from "./models";
import DataTable from "../components/data-table/data-table";
import { getCoreRowModel, getFacetedMinMaxValues, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { FloatButton, Skeleton, Spin } from "antd";

import { useClient } from "../../utils/supabase/client";

import { columns } from "./collection/columns";
import { useMemo } from "react";
import { log, table } from "console";


interface CollectionTableProps {
    data: FormattedBasicView[]

}


/**
 *  Таблица коллекции
 * 
 */
export default function CollectionTable() {
    const supabase = useClient()

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
    })




    return <div className="h-full">
        <DataTable table={table} loading={isPending}  />
        <FloatButton.Group shape="square" trigger="hover" icon={<MoreOutlined />}>
            <FloatButton icon={<VerticalAlignBottomOutlined />} />
            <FloatButton icon={<PlusOutlined />} />

        </FloatButton.Group>
    </div>

}

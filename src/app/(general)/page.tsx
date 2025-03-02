"use client"
"use no memo"

import { Tables } from "@/utils/supabase/gen-types";
import useWindowSize from "@/utils/useWindowSize";
import { MoreOutlined, PlusOutlined, VerticalAlignBottomOutlined } from "@ant-design/icons";
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { flexRender, getCoreRowModel, getSortedRowModel, Table, useReactTable } from "@tanstack/react-table";
import { FloatButton, Skeleton } from "antd";
import { useMemo, useRef } from "react";
import { useClient } from "../../utils/supabase/client";
import { SortedIcon } from "../components/sorted-filter";
import { TableHead, TableHeader, TableRow, Table as TableUi } from "../components/ui/table";
import { columns } from "./collection/columns";
import { VirtualTableBody } from "../components/data-table/body";
import { FormattedBasicView } from "./models";
import DataTable from "../components/data-table/data-table";


// Захардкоженные значения пола для фильтрации/добавления
const sexes: Tables<"sex">[] = [
    { id: 1, name: "female" },
    { id: 2, name: "male" },
    { id: 3, name: "male?" }
]

const ages: Tables<"age">[] = [
    { id: 3, name: "adult" },
    { id: 1, name: "juvenile" },
    { id: 2, name: "subadult" },
    { id: 4, name: "subadult or adult" }
]


interface CollectionTableProps {
    data: FormattedBasicView[]

}


/**
 *  Таблица коллекции
 * 
 */
function CollectionTable({ data }: CollectionTableProps) {


    const table = useReactTable({
        columns: columns,
        data: data,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        debugTable: true,
    })

    return <DataTable table={table}/>
}


/**
 * Отображение страницы коллекции 
 */
export default function CollectionPage() {
    const supabase = useClient()

    const { data, isPending } = useQuery(supabase.from("basic_view").select())

    if (isPending) {
        return <Skeleton active />
    }
    

    return <div className="h-full">
        <CollectionTable data={data ?? []} />
        <FloatButton.Group shape="square" trigger="hover" icon={<MoreOutlined />}>
            <FloatButton icon={<VerticalAlignBottomOutlined />} />
            <FloatButton icon={<PlusOutlined />} />

        </FloatButton.Group>
    </div>
}
"use client"
"use no memo"

import { FloatButton, Skeleton, Tag, } from "antd"
import { useClient } from "../../utils/supabase/client"
import { useEffect, useMemo, useRef, useState } from "react";
import { Tables } from "@/utils/supabase/gen-types";
import useWindowSize from "@/utils/useWindowSize";
import { badDateToDate, formatDate } from "@/utils/formatDate";
import { CalendarOutlined, MoreOutlined, PlusOutlined, SearchOutlined, VerticalAlignBottomOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { VirtualTableBody } from "./collection/table-body";
import { FormattedBasicView } from "./models";
import { useQuery } from "@tanstack/react-query";
import { getCollection } from "./queries";
import { info } from "console";
import ExpandableText from "../components/expand-text";
import { columns } from "./collection/columns";
import { Table, TableHead, TableHeader, TableRow } from "../components/ui/table";

dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)


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

    const windowSize = useWindowSize()
    const tableContainerRef = useRef<HTMLDivElement>(null)

    const height = useMemo(() => {
        return windowSize.height - 60
    }, [windowSize.height])


    const table = useReactTable({
        columns: columns,
        data: data,
        getCoreRowModel: getCoreRowModel(),
        debugTable: true,
        defaultColumn: {
            minSize: 60,
            maxSize: 800,
        },
    })

    return <>
        <div ref={tableContainerRef} className="overflow-auto" style={{
            position: 'relative', //needed for sticky header,
            height: height
        }}>
            <Table style={{ display: 'grid' }} >
                <TableHeader style={{
                    display: 'grid',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                }}>
                    {table.getHeaderGroups().map(headerGroup => (
                        <TableRow key={headerGroup.id} style={{ display: 'flex', width: '100%' }}>
                            {headerGroup.headers.map(header => (
                                <TableHead
                                    key={header.id}
                                    colSpan={header.colSpan}
                                    // Дополнительные стили/классы
                                    style={{
                                        display: 'flex',
                                        width: header.getSize(),
                                    }}
                                >
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>

                <VirtualTableBody table={table} tableContainerRef={tableContainerRef} />

            </Table>

        </div >
    </>
}


/**
 * Отображение страницы коллекции 
 */
export default function CollectionPage() {
    const supabase = useClient()

    const { data, isPending } = useQuery({
        queryKey: ['collection'], queryFn: () =>
            getCollection(supabase)
    })

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
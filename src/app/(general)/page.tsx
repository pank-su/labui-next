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
import { TableBody } from "./collection/table-body";
import { FormattedBasicView } from "./models";
import { useQuery } from "@tanstack/react-query";
import { getCollection } from "./queries";
import { info } from "console";
import ExpandableText from "../components/expand-text";
import { columns } from "./collection/columns";

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
        <div ref={tableContainerRef} style={{
            overflow: 'auto', //our scrollable table container
            position: 'relative', //needed for sticky header,
            height: height
        }}>
            <table style={{ display: 'grid' }} className="min-w-full table-fixed">
                <thead
                    style={{
                        display: 'grid',
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                    }}
                    className="bg-gray-50 border-b border-gray-200"
                >
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr
                            key={headerGroup.id}
                            style={{ display: 'flex', width: '100%' }}

                        >
                            {headerGroup.headers.map(header => {
                                return (
                                    <th
                                        key={header.id}

                                        style={{
                                            display: 'flex',
                                            width: header.getSize(),
                                        }}
                                        className="px-4 py-2 text-left text-sm font-medium text-gray-700 first:rounded-tl-md 
                            last:rounded-tr-md border-r last:border-r-0  border-gray-200"
                                    >
                                        <div>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </div>
                                    </th>
                                )
                            })}
                        </tr>
                    ))}
                </thead>
                <TableBody table={table} tableContainerRef={tableContainerRef} />

            </table>

        </div>
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
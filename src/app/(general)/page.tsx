"use client"
"use no memo"

import { Tables } from "@/utils/supabase/gen-types";
import useWindowSize from "@/utils/useWindowSize";
import { MoreOutlined, PlusOutlined, VerticalAlignBottomOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { flexRender, getCoreRowModel, getFacetedMinMaxValues, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { FloatButton, Skeleton } from "antd";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useMemo, useRef } from "react";
import { useClient } from "../../utils/supabase/client";
import { SortedIcon } from "../components/sorted-filter";
import { Table, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { columns } from "./collection/columns";
import { VirtualTableBody } from "./collection/table-body";
import { FormattedBasicView } from "./models";
import { getCollection } from "./queries";
import Filter from "../components/filter";

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
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getFacetedRowModel: getFacetedRowModel(), // client-side faceting
        getFacetedUniqueValues: getFacetedUniqueValues(), // generate unique values for select filter/autocomplete
        getFacetedMinMaxValues: getFacetedMinMaxValues(), // generate min/max values for range filter
        debugTable: true,
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
                                        : (
                                            <div
                                                className={"flow w-full justify-between " +
                                                    (header.column.getCanSort()
                                                        ? 'cursor-pointer select-none'
                                                        : '')
                                                }
                                                onClick={header.column.getToggleSortingHandler()}
                                            >

                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext())}
                                                {
                                                    header.column.getCanSort() ? <SortedIcon isSorted={header.column.getIsSorted()} /> : <></>
                                                }
                                            </div>
                                        )}
                                </TableHead>
                            ))}

                        </TableRow>
                    ))}
                    <TableRow key={"filter"} style={{ display: 'flex', width: '100%' }}>
                        {table.getHeaderGroups().toReversed()[0].headers.map(header => {
                            return <th key={"filter" + header.id}
                                style={{
                                    display: 'flex',
                                    width: header.getSize(),
                                }}>
                                    <Filter column={header.column}/>
                                </th>
                        })}
                    </TableRow>

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
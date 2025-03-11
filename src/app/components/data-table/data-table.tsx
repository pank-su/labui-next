"use client"

import { flexRender, Table } from "@tanstack/react-table";
import { TableHead, TableHeader, TableRow, Table as TableUi } from "../ui/table";
import { SortedIcon } from "../sorted-filter";
import { VirtualTableBody } from "./body";
import useWindowSize from "@/utils/useWindowSize";
import { useMemo, useRef } from "react";
import { Spin } from "antd";


interface DataTableProps<T>{
    table: Table<T>
    loading?: boolean
}

export default function DataTable<T>({table, loading = false}: DataTableProps<T>) {
    const windowSize = useWindowSize()

    const height = useMemo(() => {
        return windowSize.height - 60
    }, [windowSize.height])


    const tableContainerRef = useRef<HTMLDivElement>(null)

    

    return <> 
        <div ref={tableContainerRef} className="overflow-auto" style={{
            position: 'relative', //needed for sticky header,
            height: height
        }}>
            <Spin spinning={loading} >
            <TableUi style={{ display: 'grid' }}>
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
                                                        : '')}
                                                onClick={header.column.getToggleSortingHandler()}
                                            >

                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext())}
                                                {header.column.getCanSort() ? <SortedIcon isSorted={header.column.getIsSorted()} /> : <></>}
                                            </div>

                                        )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <VirtualTableBody table={table} tableContainerRef={tableContainerRef} />

            </TableUi>
            </Spin>
        </div>
    </>;
}

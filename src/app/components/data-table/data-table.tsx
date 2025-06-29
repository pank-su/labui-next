"use client"

import {flexRender, Table} from "@tanstack/react-table";
import {Table as TableUi, TableHead, TableHeader, TableRow} from "../ui/table";
import {SortedIcon} from "../sorted-filter";
import {VirtualTableBody} from "./body";
import useWindowSize from "@/utils/useWindowSize";
import {useCallback, useMemo, useRef} from "react";
import {Spin} from "antd";
import {useVirtualizer} from "@tanstack/react-virtual";
import Filter from "./filters/filter";
import {FetchNextPageOptions, InfiniteQueryObserverResult} from "@tanstack/react-query";
import {InfiniteData} from "@tanstack/query-core";


interface DataTableProps<T> {
    table: Table<T>,
    loading?: boolean,
    padding?: number,
    size: number,
    fetchedSize?: number,
    fetchNextPage: (options?: FetchNextPageOptions) => Promise<InfiniteQueryObserverResult<InfiniteData<any>>>,
    isFetching?: boolean,
    hasNextPage?: boolean
    tableName?: string,
    filters: {
        [key: string]: string | string[] | undefined
    }
}

export default function DataTable<T>({
                                         tableName,
                                         table,
                                         loading = false,
                                         padding = 0,
                                         size,
                                         fetchedSize = 0,
                                         fetchNextPage,
                                         isFetching,
                                         hasNextPage, filters
                                     }: DataTableProps<T>) {
    const windowSize = useWindowSize()

    const height = useMemo(() => {
        return windowSize.height - (60 + padding)
    }, [windowSize.height])


    const {rows} = table.getRowModel()


    const tableContainerRef = useRef<HTMLDivElement>(null)

    const fetchMoreOnBottomReached = useCallback(
        (containerRefElement?: HTMLDivElement | null) => {
            if (!containerRefElement) return;

            if (hasNextPage && !isFetching) {
                const {scrollHeight, scrollTop, clientHeight} = containerRefElement;
                const threshold = 500;
                const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

                if (distanceFromBottom < threshold) {
                    fetchNextPage();
                }
            }
        },
        [fetchNextPage, isFetching, hasNextPage] // Убираем изменчивые зависимости
    )

    // Убираем useEffect, используем только onScroll
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        fetchMoreOnBottomReached(e.currentTarget);
    }, [fetchMoreOnBottomReached]);


    // Important: Keep the row virtualizer in the lowest component possible to avoid unnecessary re-renders.
    const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
        count: rows.length,
        estimateSize: () => 24, //estimate row height for accurate scrollbar dragging
        getScrollElement: () => tableContainerRef?.current,
        //measure dynamic row height, except in firefox because it measures table border height incorrectly
        measureElement:
            typeof window !== 'undefined' &&
            navigator.userAgent.indexOf('Firefox') === -1
                ? element => element?.getBoundingClientRect().height
                : undefined,
        overscan: 10, // было 5
    })


    return <>
        <div onScroll={handleScroll} ref={tableContainerRef} className="overflow-auto"
             style={{
                 position: 'relative', //needed for sticky header,
                 height: height
             }}>
            <Spin spinning={loading}>
                <TableUi style={{display: 'grid'}}>
                    <TableHeader style={{
                        display: 'grid',
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                    }}>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id} style={{display: 'flex', width: '100%'}}>
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
                                                    {header.column.getCanSort() ?
                                                        <SortedIcon isSorted={header.column.getIsSorted()}/> : <></>}
                                                </div>

                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                        <TableRow className={"bg-background"} key={"filter"} style={{display: 'flex', width: '100%'}}>
                            {table.getHeaderGroups().at(-1)!!.headers.map(header => {
                                return <th key={"filter" + header.id}
                                           style={{
                                               display: 'flex',
                                               width: header.getSize(),
                                           }}>
                                    <Filter filters={filters} column={header.column} tableName={tableName || ""} />
                                </th>
                            })}
                        </TableRow>
                    </TableHeader>
                    <VirtualTableBody table={table} tableContainerRef={tableContainerRef}
                                      rowVirtualizer={rowVirtualizer}/>

                </TableUi>
                {isFetching && <div>Fetching More...</div>}

            </Spin>

        </div>
    </>;
}

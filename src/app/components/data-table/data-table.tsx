"use client"

import {flexRender, Table} from "@tanstack/react-table";
import {Table as TableUi, TableHead, TableHeader, TableRow} from "../ui/table";
import {SortedIcon} from "../sorted-filter";
import {VirtualTableBody} from "./body";
import useWindowSize from "@/utils/useWindowSize";
import {useCallback, useEffect, useMemo, useRef} from "react";
import {FloatButton, Spin} from "antd";
import {useVirtualizer} from "@tanstack/react-virtual";
import {VerticalAlignBottomOutlined, VerticalAlignTopOutlined} from "@ant-design/icons";
import Filter from "./filters/filter";
import {AnimatePresence, motion} from "framer-motion";
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
}

export default function DataTable<T>({
                                         table,
                                         loading = false,
                                         padding = 0,
                                         size,
                                         fetchedSize = 0,
                                         fetchNextPage,
                                         isFetching,
                                         hasNextPage
                                     }: DataTableProps<T>) {
    const windowSize = useWindowSize()

    const height = useMemo(() => {
        return windowSize.height - (60 + padding)
    }, [windowSize.height])

    // Добавляем ref для отслеживания состояния загрузки
    const isLoadingRef = useRef(false);

    const {rows} = table.getRowModel()


    const tableContainerRef = useRef<HTMLDivElement>(null)

    const fetchMoreOnBottomReached = useCallback(
        async (containerRefElement?: HTMLDivElement | null) => {
            if (containerRefElement && hasNextPage && !isFetching && !isLoadingRef.current) {
                const {scrollHeight, scrollTop, clientHeight} = containerRefElement

                // Увеличиваем порог и добавляем дополнительные проверки
                const threshold = 500; // Увеличено с 500
                const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

                if (distanceFromBottom < threshold) {
                    isLoadingRef.current = true;

                    try {
                        await fetchNextPage();
                    } catch (error) {
                        console.error('Error fetching next page:', error);
                    } finally {
                        // Добавляем небольшую задержку перед разрешением новых запросов
                        setTimeout(() => {
                            isLoadingRef.current = false;
                        }, 100);
                    }
                }
            }
        },
        [fetchNextPage, isFetching, hasNextPage] // Убираем изменчивые зависимости
    )

    // Убираем useEffect, используем только onScroll
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        fetchMoreOnBottomReached(e.currentTarget);
    }, [fetchMoreOnBottomReached]);

    // Сбрасываем флаг при изменении состояния загрузки
    useEffect(() => {
        if (!isFetching) {
            isLoadingRef.current = false;
        }
    }, [isFetching]);
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

    const scrollPosition = useMemo(() => {
        return rowVirtualizer.getVirtualIndexes()[0]
    }, [rowVirtualizer.scrollOffset, rows.length])

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
                                    <Filter column={header.column}/>
                                </th>
                            })}
                        </TableRow>
                    </TableHeader>
                    <VirtualTableBody table={table} tableContainerRef={tableContainerRef}
                                      rowVirtualizer={rowVirtualizer}/>

                </TableUi>
            </Spin>

        </div>

        <AnimatedFloatButton rows={rows} scrollPosition={scrollPosition} rowVirtualizer={rowVirtualizer}/>

    </>;
}


/**
 * Анимированная кнопка для спуска вниз или вверх
 */
interface AnimatedFloatButtonProps {
    rows: any[];
    scrollPosition: number;
    rowVirtualizer: {
        scrollToIndex: (index: number) => void;
    };
}

export const AnimatedFloatButton: React.FC<AnimatedFloatButtonProps> = ({
                                                                            rows,
                                                                            scrollPosition,
                                                                            rowVirtualizer,
                                                                        }) => {
    const isBottom = scrollPosition < rows.length / 2;

    return (
        <AnimatePresence>
            {rows.length > 30 && (
                <motion.div
                    initial={{opacity: 0, scale: 0.8}}
                    animate={{opacity: 1, scale: 1}}
                    exit={{opacity: 0, scale: 0.8}}
                    transition={{duration: 0.3}}
                    style={{position: "fixed", bottom: 20, right: 20}}
                >
                    <FloatButton
                        icon={
                            <motion.div
                                key={isBottom ? "down" : "up"}
                                initial={{rotate: -90, opacity: 0}}
                                animate={{rotate: 0, opacity: 1}}
                                exit={{rotate: 90, opacity: 0}}
                                transition={{duration: 0.3}}
                            >
                                {isBottom ? <VerticalAlignBottomOutlined/> : <VerticalAlignTopOutlined/>}
                            </motion.div>
                        }
                        onClick={() => {
                            if (isBottom) {
                                rowVirtualizer.scrollToIndex(rows.length - 1);
                            } else {
                                rowVirtualizer.scrollToIndex(0);
                            }
                        }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};
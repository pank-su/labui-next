"use client"

import { flexRender, Row, Table } from "@tanstack/react-table"
import { FormattedBasicView } from "../models"
import { useVirtualizer, VirtualItem, Virtualizer } from "@tanstack/react-virtual"

interface TableBodyProps {
    table: Table<FormattedBasicView>
    tableContainerRef: React.RefObject<HTMLDivElement | null>
}

export function TableBody({ table, tableContainerRef }: TableBodyProps) {
    const { rows } = table.getRowModel()

    // Important: Keep the row virtualizer in the lowest component possible to avoid unnecessary re-renders.
    const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
        count: rows.length,
        estimateSize: () => 33, //estimate row height for accurate scrollbar dragging
        getScrollElement: () => tableContainerRef?.current,
        //measure dynamic row height, except in firefox because it measures table border height incorrectly
        measureElement:
            typeof window !== 'undefined' &&
                navigator.userAgent.indexOf('Firefox') === -1
                ? element => element?.getBoundingClientRect().height
                : undefined,
        overscan: 5,
    })

    return (
        <tbody
            style={{
                display: 'grid',
                height: `${rowVirtualizer.getTotalSize()}px`, //tells scrollbar how big the table is
                position: 'relative', //needed for absolute positioning of rows
            }}
        >
            {rowVirtualizer.getVirtualItems().map(virtualRow => {
                const row = rows[virtualRow.index] as Row<FormattedBasicView>
                return (
                    <TableBodyRow
                        key={row.id}
                        row={row}
                        virtualRow={virtualRow}
                        rowVirtualizer={rowVirtualizer}
                    />
                )
            })}
        </tbody>
    )
}

interface TableBodyRowProps {
    row: Row<FormattedBasicView>
    virtualRow: VirtualItem
    rowVirtualizer: Virtualizer<HTMLDivElement, HTMLTableRowElement>
}

export function TableBodyRow({ row, virtualRow, rowVirtualizer }: TableBodyRowProps) {
    return (
        <tr
            data-index={virtualRow.index} //needed for dynamic row height measurement
            ref={node => rowVirtualizer.measureElement(node)} //measure dynamic row height
            key={row.id}
            style={{
                display: 'flex',
                position: 'absolute',
                transform: `translateY(${virtualRow.start}px)`, //this should always be a `style` as it changes on scroll
                width: '100%',
            }}
        >
            {row.getVisibleCells().map(cell => {
                return (
                    <td
                        key={cell.id}
                        style={{
                            display: 'flex',
                            width: cell.column.getSize(),
                        }}
                    >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                )
            })}
        </tr>
    )
}

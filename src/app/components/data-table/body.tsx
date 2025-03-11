"use client"

import { flexRender, Row, Table } from "@tanstack/react-table"
import { useVirtualizer, VirtualItem, Virtualizer } from "@tanstack/react-virtual"
import { TableCell, TableRow } from "@/app/components/ui/table"
import { useMemo } from "react"



interface VirtualTableBodyProps<T> {
    table: Table<T>
    tableContainerRef: React.RefObject<HTMLDivElement | null>
    rowVirtualizer: Virtualizer<HTMLDivElement, HTMLTableRowElement>
}

export function VirtualTableBody<T>({ table, tableContainerRef, rowVirtualizer }: VirtualTableBodyProps<T>) {
    const { rows } = table.getRowModel()

    return (
        <tbody
            style={{
                display: 'grid',
                height: `${rowVirtualizer.getTotalSize()}px`, //tells scrollbar how big the table is
                position: 'relative', //needed for absolute positioning of rows
            }}
        >
            {rowVirtualizer.getVirtualItems().map(virtualRow => {
                const row = rows[virtualRow.index] as Row<T>
                return (
                    <VirtualTableBodyRow
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

interface VirtualTableBodyRowProps<T> {
    row: Row<T>
    virtualRow: VirtualItem
    rowVirtualizer: Virtualizer<HTMLDivElement, HTMLTableRowElement>
}

export function VirtualTableBodyRow<T>({ row, virtualRow, rowVirtualizer }: VirtualTableBodyRowProps<T>) {
    return (
        <TableRow
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
                    <TableCell
                        key={cell.id}
                        style={{
                            display: 'flex',
                            width: cell.column.getSize(),
                        }}
                    >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                )
            })}
        </TableRow>
    )
}

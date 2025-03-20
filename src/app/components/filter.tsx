import { parseIndexFilter } from "@/utils/parseIndexFilter";
import { Column } from "@tanstack/react-table";
import { Input } from "antd";
import { useEffect, useMemo, useState } from "react";

/**
 * Фильтр индекса
 * 
 * 
 * @param column колонку которую необходимо фильтровать
 * 
 */
function IndexFilter({ column }: { column: Column<any, unknown> }) {
    const filterValue = column.getFilterValue()
    const minMax = column.getFacetedMinMaxValues()
    const [value, setValue] = useState("")

    // Если максимальное значение обновилось
    useEffect(() => {
        if (value.trim() === "") {
            column.setFilterValue(undefined)
            return
        }
        const filter = parseIndexFilter(value, 1, minMax?.[1] ?? 9999)
        column.setFilterValue(filter)
    }, [minMax?.[1], value])

    // Если фильтр был сброшен, то очищаем поле
    useEffect(() => {
        if (filterValue == undefined && !column.getIsFiltered()) {
            setValue("")
        }
    }, [filterValue])

    return (
        <Input
            placeholder="1,3-5"
            size="small"
            value={value}
            onChange={e => {
                setValue(e.target.value)
            }}
        />
    )
}

export default function Filter({ column }: { column: Column<any, unknown> }) {
    const { filterVariant } = column.columnDef.meta ?? {}

    return (
        <>
            {filterVariant === "index" && <IndexFilter column={column} />}
        </>
    )
}
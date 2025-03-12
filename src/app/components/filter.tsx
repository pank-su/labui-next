import { parseIndexFilter } from "@/utils/parseIndexFilter";
import { Column } from "@tanstack/react-table";
import { Input } from "antd";
import { useEffect, useState } from "react";

function IndexFilter({ column }: { column: Column<any, unknown> }) {
    const filterValue = column.getFilterValue()
    const [value, setValue] = useState("")

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
                if (e.target.value.trim() === "") {
                    column.setFilterValue([-1])
                    return
                }
                const filter = parseIndexFilter(e.target.value, 1, column.getFacetedMinMaxValues()?.[1]!!)
                column.setFilterValue(filter)
            }}
        />
    )
}

export default function Filter({ column }: { column: Column<any, unknown> }) {
    const { filterVariant } = column.columnDef.meta ?? {}
    
    return (
        <>
            {filterVariant === "index" ? <IndexFilter column={column} /> : <></>}
        </>
    )
}
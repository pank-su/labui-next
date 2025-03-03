import { parseIndexFilter } from "@/utils/parseIndexFilter";
import { Column } from "@tanstack/react-table";
import { Input } from "antd";

export default function Filter({ column }: { column: Column<any, unknown> }) {
    const columnFilterValue = column.getFilterValue()
    const { filterVariant } = column.columnDef.meta ?? {}


    return <>{filterVariant === "index"
        ? <Input placeholder="1,3-5" size="small" onChange={e => {
            if (e.target.value.trim() === "") {
                column.setFilterValue([-1])
                return
            }
            const filter = parseIndexFilter(e.target.value, 1, column.getFacetedMinMaxValues()?.[1] ?? 70003)
            column.setFilterValue(filter)
        }
        } />
        : <></>}</>
}
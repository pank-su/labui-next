import {Column} from "@tanstack/react-table";
import IndexFilter from "@/app/components/data-table/filters/index-filter";
import {InputFilter} from "@/app/components/data-table/filters/input-filter";
import SelectFilter from "@/app/components/data-table/filters/select-filter";
import DateFilter from "@/app/components/data-table/filters/date-filter";
import CheckboxFilter from "@/app/components/data-table/filters/checkbox-filter";
import GeoFilter from "@/app/components/data-table/filters/geo-filter";

export default function Filter({column, tableName, filters}: {
    column: Column<any>, tableName: string, filters: {
        [key: string]: string | string[] | undefined
    }
}) {
    const {filterVariant} = column.columnDef.meta ?? {}

    return (
        <>
            {filterVariant === "index" && <IndexFilter column={column}/>}
            {filterVariant === "input" && <InputFilter column={column}/>}
            {filterVariant === "select" && <SelectFilter filters={filters} column={column} tableName={tableName}/>}
            {filterVariant === "date" && <DateFilter column={column}/>}
            {filterVariant === "checkbox" && <CheckboxFilter column={column}/>}
            {filterVariant === "geo" && <GeoFilter column={column}/>}
        </>
    )
}


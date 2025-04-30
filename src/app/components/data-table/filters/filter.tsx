import {Column} from "@tanstack/react-table";
import IndexFilter from "@/app/components/data-table/filters/index-filter";
import {InputFilter} from "@/app/components/data-table/filters/input-filter";

export default function Filter({ column }: { column: Column<any> }) {
    const { filterVariant } = column.columnDef.meta ?? {}

    return (
        <>
            {filterVariant === "index" && <IndexFilter column={column} />}
            {filterVariant === "input" && <InputFilter column={column} />}

        </>
    )
}


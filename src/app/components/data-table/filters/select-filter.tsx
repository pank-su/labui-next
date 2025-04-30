import {Column} from "@tanstack/react-table";
import {Select} from "antd";
import {useMemo} from "react";
import {useFilterQuery} from "@/app/components/data-table/filters/utils";

export default function SelectFilter({column}: { column: Column<any> }) {
    const columnId = column.id;

    const uniqueValues = column.getFacetedUniqueValues()

    const options = useMemo(() => {
        //console.log(uniqueValues);
        if (uniqueValues.size === 0) {
            return []
        } else {
            return uniqueValues.entries().toArray().sort((entry) => -entry[1]).map((entry) => ({
                label: entry[0] || " ",
                value: entry[0] || " "
            }));
        }

    }, [uniqueValues])

    const {value, setValue} = useFilterQuery(columnId, (value) => {

            column.setFilterValue(value)

    }, () => {
        column.setFilterValue(undefined)
    })


    return <Select value={value} className="w-full text-start" showSearch={true}
                   onSelect={(e) => {
                       setValue(e)

                   }} options={options}/>
}
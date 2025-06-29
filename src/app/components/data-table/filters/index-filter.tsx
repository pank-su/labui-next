import {Input} from "antd";

import {parseIndexFilter} from "@/utils/parseIndexFilter";
import {Column} from "@tanstack/react-table";
import {useFilterQuery} from "@/app/components/data-table/filters/utils";


/**
 * Фильтр индекса
 *
 *
 * @param column колонку которую необходимо фильтровать
 *
 */
export default function IndexFilter({column}: { column: Column<any> }) {
    const columnId = column.id;

    const minMax = column.getFacetedMinMaxValues()

    const {value, setValue} = useFilterQuery(columnId, (value) => {
    }, () => {
    }, [minMax?.[1]])

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

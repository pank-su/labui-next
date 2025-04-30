import {Column} from "@tanstack/react-table";
import {Input} from "antd";
import {useFilterQuery} from "@/app/components/data-table/filters/utils";

export function InputFilter({column}: { column: Column<any> }) {
    const columnId = column.id;

    const {value, setValue} = useFilterQuery(columnId, (value) => {
        column.setFilterValue(value);
    }, () => {
        column.setFilterValue(undefined)
    })


    return (
        <Input value={value} placeholder={"Найти..."} onChange={e => {
            setValue(e.target.value)

        }}/>
    )
}
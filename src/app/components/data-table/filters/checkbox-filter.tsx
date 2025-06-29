import {Column} from "@tanstack/react-table";
import {Checkbox} from "antd";
import {useFilterQuery} from "@/app/components/data-table/filters/utils";


export default function CheckboxFilter({column}: { column: Column<any> }) {
    const columnId = column.id;

    const {value, setValue} = useFilterQuery(columnId, (value) => {
        if (value === "1"){
            column.setFilterValue(true);
        }
    }, () => {
        column.setFilterValue(undefined)
    })

    return <Checkbox checked={value === "1"} onChange={(e) => {
        if (e.target.checked) {
            setValue("1")
        } else {
            setValue("")
        }
    }}/>

}
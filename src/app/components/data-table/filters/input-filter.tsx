import {Column} from "@tanstack/react-table";
import {Button, Input, Space} from "antd";
import {useFilterQuery} from "@/app/components/data-table/filters/utils";
import {ReloadOutlined} from "@ant-design/icons";

export function InputFilter({column}: { column: Column<any> }) {
    const columnId = column.id;

    const {value, setValue} = useFilterQuery(columnId, (value) => {
        column.setFilterValue(value);
    }, () => {
        column.setFilterValue(undefined)
    })


    return (
        <Space.Compact>
            <Input value={value} placeholder={"Найти..."} onChange={e => {
                setValue(e.target.value)

            }}/>
            {value.trim() != "" && <Button onClick={(_) => setValue("")} icon={<ReloadOutlined/>}/>}
        </Space.Compact>
    )
}
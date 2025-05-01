import {MinusOutlined} from "@ant-design/icons";
import {Column} from "@tanstack/react-table";
import {Button, Input, Space} from "antd";
import {useFilterQuery} from "@/app/components/data-table/filters/utils";

export default function GeoFilter({column}: { column: Column<any> }) {

    const columnId = column.id;

    const {value: fromValue, setValue: setFromValue} = useFilterQuery("from_" + columnId, (value) => {
        const num = Number(value)
        column.setFilterValue(num)
    }, () => {
        column.setFilterValue(undefined)
    }, [], (value) => isNaN(Number(value)))

    const {value: toValue, setValue: setToValue} = useFilterQuery("to_" + columnId, (value) => {
        const num = Number(value)
        console.log(num)
        column.setFilterValue(num)
    }, () => {
        column.setFilterValue(undefined)
    }, [], (value) => !isNaN(Number(value)))

    return <Space.Compact>
        <Input placeholder={"От"} value={fromValue}
               onChange={(e) => setFromValue(e.currentTarget.value)}/>

        <Button style={{pointerEvents: 'none'}} icon={<MinusOutlined/>}></Button>
        <Input placeholder={"До"} value={toValue}
               onChange={(e) => setToValue(e.currentTarget.value)}/>
    </Space.Compact>
}
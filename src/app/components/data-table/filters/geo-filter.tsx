import {EnvironmentOutlined, MinusOutlined} from "@ant-design/icons";
import {Column} from "@tanstack/react-table";
import {Button, Input, Space, Tooltip} from "antd";
import {useFilterQuery} from "@/app/components/data-table/filters/utils";
import {useEffect} from "react";

export type FilterGeo = {
    from: number | null;
    to: number | null;
}


export default function GeoFilter({column}: { column: Column<any> }) {

    const columnId = column.id;

    const {value: fromValue, setValue: setFromValue} = useFilterQuery("from_" + columnId, (value) => {
    }, () => {
        column.setFilterValue(undefined)
    }, [],)

    const {value: toValue, setValue: setToValue} = useFilterQuery("to_" + columnId, (value) => {
        const num = Number(value)
        console.log(num)
        //column.setFilterValue(num)
    }, () => {
        column.setFilterValue(undefined)
    }, [], (value) => !isNaN(Number(value)))

    useEffect(() => {

        column.setFilterValue({from: fromValue, to: toValue})
    }, [fromValue, toValue])



    return <Space.Compact>
        <Input placeholder={"От"} value={fromValue} disabled
               onChange={(e) => setFromValue(e.currentTarget.value)}/>

        <Button style={{pointerEvents: 'none'}} icon={<MinusOutlined/>}></Button>
        <Input placeholder={"До"} value={toValue} disabled
               onChange={(e) => setToValue(e.currentTarget.value)}/>
        {column.id === "longitude" &&
            <Tooltip title={"Открыть карту"}><Button icon={<EnvironmentOutlined/>}/></Tooltip>}
    </Space.Compact>
}
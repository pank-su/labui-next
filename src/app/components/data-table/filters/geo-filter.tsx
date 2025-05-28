import {EnvironmentOutlined, MinusOutlined} from "@ant-design/icons";
import {Column} from "@tanstack/react-table";
import {Button, Input, Space, Tooltip} from "antd";
import {useFilterQuery} from "@/app/components/data-table/filters/utils";
import {useEffect, useState} from "react";

export type FilterGeo = {
    from: number | null;
    to: number | null;
}


export default function GeoFilter({column}: { column: Column<any> }) {

    const columnId = column.id;

    const [fromValue, setFromValue] =  useState("")

    const [toValue, setToValue] = useState("")


    useEffect(() => {
        const filterValue = column.getFilterValue() as FilterGeo | undefined;

        setToValue((filterValue?.to ?? "").toString())
        setFromValue((filterValue?.from ?? "").toString())
    }, [column.getFilterValue()]);


    return <Space.Compact>
        <Input placeholder={"От"} value={fromValue} disabled
               onChange={(e) => setFromValue(e.currentTarget.value)}/>

        <Button style={{pointerEvents: 'none'}} icon={<MinusOutlined/>}></Button>
        <Input placeholder={"До"} value={toValue} disabled
               onChange={(e) => setToValue(e.currentTarget.value)}/>
        {column.id === "longitude" &&
            <Tooltip title={"Фильтровать по карте"}><Button icon={<EnvironmentOutlined/>}/></Tooltip>}
    </Space.Compact>
}
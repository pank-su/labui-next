import {EnvironmentOutlined, MinusOutlined} from "@ant-design/icons";
import {Column} from "@tanstack/react-table";
import {Button, Input, Space, Tooltip} from "antd";
import {useFilterQuery} from "@/app/components/data-table/filters/utils";
import {useEffect, useState} from "react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";

export type FilterGeo = {
    from: number | null;
    to: number | null;
}


export default function GeoFilter({column}: { column: Column<any> }) {

    const router = useRouter();
    const pathname = usePathname()

    const searchParams = useSearchParams()

    const queryValue = searchParams.get("map") ?? "";
    const mapState = queryValue === "open" ? "open" : "closed";


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
            <Tooltip title={"Фильтровать по карте"}><Button onClick={ () => {
                const params = new URLSearchParams(searchParams);
                params.set("map", mapState == "open" ? "closed" : "open");
                if (params.size != 0) router.push(pathname + "?" + params.toString());
                else {
                    router.replace(pathname)
                }
            }

            } icon={<EnvironmentOutlined/>}/></Tooltip>}
    </Space.Compact>
}
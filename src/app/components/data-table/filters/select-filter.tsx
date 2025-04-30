import {Column} from "@tanstack/react-table";
import { Select } from "antd";
import {useEffect} from "react";

export default function SelectFilter({column}: { column: Column<any> }){
    const columnId = column.id;

    const uniqueValues = column.getFacetedUniqueValues()

    useEffect(() => {
        console.log(uniqueValues);
    }, [uniqueValues]);

    return <Select className="w-full" options={uniqueValues.entries().map((e) => ({value: e?.[0].toString(), label: e[0].toString()})
        ).toArray()} showSearch={true}/>
}
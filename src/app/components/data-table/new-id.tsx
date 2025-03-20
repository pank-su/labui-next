import { SyncOutlined } from "@ant-design/icons";
import { Column, Table } from "@tanstack/react-table";
import { Tag } from "antd";
import { useMemo } from "react";



export default function NewId({column}: {column: Column<any, unknown> | null}) {
    if (column == null){
        return <Tag icon={<SyncOutlined spin />} color="processing">
        загрузка
    </Tag>
    }
    const minMax = column.getFacetedMinMaxValues()

    const last = useMemo(() => {
        if (minMax) {
            return minMax[1] + 1
        }
        else return null;

    }, [minMax?.[1]])

    if (last) {
        return <Tag color="blue">
            {last}
        </Tag>
    }
    return <Tag icon={<SyncOutlined spin />} color="processing">
        загрузка
    </Tag>

}
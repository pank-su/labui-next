"use client"

import { Empty, Table } from "antd"
import { createClient } from "../../utils/supabase/client"
import { useEffect, useState } from "react";
import { Tables } from "@/src/utils/supabase/gen-types";
import useWindowSize from "@/src/utils/useWindowSize";

const addKey = <T extends { id: number | null }>(obj: T): T & { key: number | null } => {
    return Object.defineProperty(obj, "key", {
        get() {
            return this.id
        },
        enumerable: true,
        configurable: false
    }) as T & { key: number | null };
};


interface Column {
    title: string,
    dataIndex: string,
    key: string
}


/**
 *  Таблица коллекции
 * 
 */
export default function CollectionTable() {
    const windowSize = useWindowSize()
    const [loading, setLoading] = useState(true)

    const [data, setData] = useState<(Tables<"basic_view"> & { key: number | null })[] | null>(null)
    const [columns, setColumns] = useState<Column[]>()

    useEffect(() => {
        async function loadCollection() {

            const supabase = await createClient()
            const { data } = (await supabase.from("basic_view").select())
            setColumns((data!.length > 0
                ? Object.keys(data![0]).map((key) => ({
                    title: key,      // Заголовок колонки
                    dataIndex: key,  // Поле данных для колонки
                    key: key         // Уникальный ключ колонки
                } as Column))
                : []));



            // Добавляем ключ для каждого ряда
            setData((data ?? []).map((row) => addKey(row)))
            setLoading(false)
        }
        loadCollection()
    }, [])





    return <Table virtual size="small" scroll={{ x: 1500, y: windowSize.height - 140 }} loading={loading} dataSource={data!} pagination={false} columns={columns}>

    </Table>
}



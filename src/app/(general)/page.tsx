"use client"

import { Table } from "antd"
import { createClient } from "../../utils/supabase/client"

const addKey = <T extends { id: number | null }>(obj: T): T & { key: number | null } => {
    return Object.defineProperty(obj, "key", {
        get() {
            return this.id
        },
        enumerable: true,
        configurable: false
    }) as T & { key: number | null };
};



/**
 * Страница коллекции
 * 
 */
export default async function CollectionTable() {
    const supabase = createClient()
    const { data } = (await supabase.from("basic_view").select())
    // const { width, height } = useWindowSize();

    // Если есть данные, создаём колонки на основе ключей первого объекта
    const columns = (data ?? []).length > 0
        ? Object.keys(data![0]).map((key) => ({
            title: key,      // Заголовок колонки
            dataIndex: key,  // Поле данных для колонки
            key: key         // Уникальный ключ колонки
        }))
        : []; // TODO: переделать колонки во что-то более адекватное


    // Добавляем ключ для каждого ряда
    const keyedData = data?.map((row) => addKey(row)) ?? [];
    



    return <Table virtual size="small" dataSource={keyedData}  pagination={false} columns={columns}>

    </Table>
}


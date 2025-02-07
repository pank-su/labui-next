"use client"

import { Empty, Table, TableColumnsType, Tag } from "antd"
import { createClient } from "../../utils/supabase/client"
import { useEffect, useState } from "react";
import { Tables } from "@/src/utils/supabase/gen-types";
import useWindowSize from "@/src/utils/useWindowSize";
import { TableProps } from "antd/lib";



/**
 * Добавляет ключ к объекту
 * @param obj Объект
 * @returns Объект с ключом
 */
const addKey = <T extends { id: number | null }>(obj: T): T & { key: number | null } => {
    return {
        ...obj,
        key: obj.id
    };
};

type BasicViewWithKey = Tables<"basic_view"> & { key: number | null };
type Columns = TableColumnsType<BasicViewWithKey>


interface Tag {
    id: number;
    name: string;
}

/**
 * Форматирует дату из отдельных nullable полей
 * @param year Год
 * @param month Месяц
 * @param day День
 * @returns Отформатированная строка даты или '-' если все поля null
 */
const formatDate = (year: number | null, month: number | null, day: number | null): string => {
    const parts: string[] = [];

    if (day !== null) {
        parts.push(day.toString().padStart(2, '0'));
    }

    if (month !== null) {
        parts.push(month.toString().padStart(2, '0'));
    }

    if (year !== null) {
        parts.push(year.toString());
    }

    return parts.length > 0 ? parts.join('.') : '-';
};



function getColumns(data: BasicViewWithKey[]): Columns {

    const idFilters = data.map(item => ({
        text: item.id!.toString(),
        value: item.id!
    }));
    const columns: TableColumnsType<BasicViewWithKey> = [
        {
            title: "ID",
            dataIndex: "id",
            render: (text) => <a>{text}</a>,
            filters: idFilters,
            onFilter: (value, record) => record.id === value,
            filtered: true,
            filterSearch: true,
            filterMode: "menu",
            fixed: 'left',
            width: 65,
        },
        {
            title: "collect id",
            dataIndex: "collect_id",
            width: 100,
        },
        {
            title: "Топология",
            children: [
                {
                    title: "Отряд",
                    dataIndex: "order",
                    width: 100,
                },
                {
                    title: "Семейство",
                    dataIndex: "family",
                    width: 100,
                },
                {
                    title: "Род",
                    dataIndex: "genus",
                    width: 110,
                },
                {
                    title: "Вид",
                    dataIndex: "kind",
                    width: 100,
                },
            ]
        },
        {
            title: "Дата",
            key: "collection_date",

            width: 100,
            render: (_, record) => formatDate(record.year, record.month, record.day)
        },
        {
            title: "Возраст",
            dataIndex: "age",
            width: 80,
        },
        {
            title: "Пол",
            dataIndex: "sex",
            width: 50,
            render: (_, {sex}) => <>{(sex ?? " ")[0] }</> 
        },

        {
            title: "Гео данные",
            children: [
                {
                    title: "Точка", children: [
                        {
                            title: "Широта",
                            dataIndex: "latitude",
                            width: 100,
                        },
                        {
                            title: "Долгота",
                            dataIndex: "longtitude",
                            width: 100,
                        },
                    ]
                },
                {
                    title: "Страна",
                    dataIndex: "country",
                    width: 120
                },
                {
                    title: "Регион",
                    dataIndex: "region",
                    width: 200
                },
                {
                    title: "Геокомментарий",
                    dataIndex: "geo_comment",
                    width: 300
                },
            ]
        },
        {
            title: "Ваучер",
            children: [
                {
                    title: "Институт",
                    width: 200,
                    dataIndex: "voucher_institute",
                },
                {
                    title: "ID",
                    width: 100,
                    dataIndex: "voucher_id",
                }
            ]

        },
        {
            title: "Тэги",
            width: 100,
            dataIndex: "tags",
            render: (_, { tags }) => {
                const tagF = tags as unknown as Tag[]
                return <>{tagF.map(tag => <Tag color="blue" key={tag.id}>{tag.name}</Tag>)}</>
            }
        

        },

        {
            title: "Описание",
            dataIndex: "comment",
            width: 400
        }
    ]

    return columns
}



const rowSelection: TableProps<BasicViewWithKey>['rowSelection'] = {
    onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    },
    getCheckboxProps: (record) => ({
        name: record.id?.toString(),
    }),
    columnWidth: 30,
}


/**
 *  Таблица коллекции
 * 
 */
export default function CollectionTable() {
    const windowSize = useWindowSize()
    const [loading, setLoading] = useState(true)

    const [data, setData] = useState<BasicViewWithKey[] | null>(null)
    const [columns, setColumns] = useState<Columns>()

    useEffect(() => {
        async function loadCollection() {

            const supabase = await createClient()
            const { data } = (await supabase.from("basic_view").select())
            const keyedData = (data ?? []).map((row) => addKey(row))
            // Добавляем ключ для каждого ряда
            setData(keyedData)
            setColumns(getColumns(keyedData))

            setLoading(false)
        }
        loadCollection()
    }, [])



    return <Table bordered rowSelection={{ ...rowSelection }} virtual size="small" scroll={{ x: 2500, y: windowSize.height - 170 }} loading={loading} columns={columns} dataSource={data ?? []} pagination={false}></Table>
}



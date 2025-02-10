"use client"

import { Button, DatePicker, Space, Table, TableColumnsType, Tag, Tooltip } from "antd"
import { createClient } from "../../utils/supabase/client"
import { useEffect, useState } from "react";
import { Tables } from "@/src/utils/supabase/gen-types";
import useWindowSize from "@/src/utils/useWindowSize";
import { TableProps, TableColumnType } from "antd/lib";
import { badDateToDate, formatDate } from "@/src/utils/formatDate";
import { SearchOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"

dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

const { RangePicker } = DatePicker;

/**
 * Форматирует строку возраста в сокращенную форму
 * @param age - Строка возраста для форматирования, может быть null
 * @returns Отформатированная строка возраста:
 * - "ad" для "adult" (взрослый)
 * - "juv" для "juvenile" (молодой)
 * - "sad" для "subadult" (полувзрослый)
 * - Исходная строка или пустая строка если null
 */
function formatAge(age: string | null): string {
    switch (age) {
        case "adult": return "ad"
        case "juvenile": return "juv"
        case "subadult": return "sad"
        default: return age ?? ""
    }
}

/**
 * Форматирует строку пола в сокращенную форму
 * @param sex - Строка пола для форматирования, может быть null
 * @returns Отформатированная строка:
 * - Возвращает пустую строку если входное значение null
 * - Возвращает первый символ строки пола
 * - Если пол не доконца определён то сохраняем знак вопроса
 */

function formatSex(sex: string | null): string {
    if (sex == null) return ""
    let result = sex[0]
    if (sex.endsWith("?")) {
        result += "?"
    }
    return result
}


/**
 * Добавляет ключ к объекту
 * @param obj Объект
 * @returns Объект с ключом
 */
const formatData = async <T extends { id: number | null, day: number | null, month: number | null, year: number | null }>(obj: T): Promise<T & { key: number | null, date: Dayjs | null }> => {
    const date = badDateToDate(obj.year, obj.month, obj.day)
    return {
        ...obj,
        key: obj.id,
        date: date != null ? dayjs(date) : null
    };
};

type BasicViewWithKey = Tables<"basic_view"> & { key: number | null, date: Dayjs | null };
type Columns = TableColumnsType<BasicViewWithKey>


interface Tag {
    id: number;
    name: string;
}

// Захардкоженные значения пола для фильтрации/добавления
const sexes: Tables<"sex">[] = [{
    id: 1,
    name: "female"
}, { id: 2, name: "male" }, { id: 3, name: "male?" }]

const ages: Tables<"age">[] = [{ id: 3, name: "adult" }, { id: 1, name: "juvenile" }, { id: 2, name: "subadult" }, { id: 4, name: "subadult or adult" }]

function getColumns(data: BasicViewWithKey[]): Columns {

    const dateColumn: TableColumnType<BasicViewWithKey> = {
        title: "Дата",
        dataIndex: "collection_date",
        width: 100,
        filterDropdown: ({
            setSelectedKeys,
            selectedKeys,
            confirm,
            clearFilters
        }) => {
            // selectedKeys[0] обычно будет [startDayjs, endDayjs]
            const rangeValue = (selectedKeys[0] as unknown as [Dayjs?, Dayjs?]) || [];
            const start = rangeValue[0];
            const end = rangeValue[1];

            return (
                <div style={{ padding: 8 }}>
                    <RangePicker
                        style={{ marginBottom: 8, display: "block" }}
                        value={[start, end]}
                        onChange={(dates) => {
                            // При изменении диапазона устанавливаем его во внутренний state фильтра
                            setSelectedKeys(dates ? [dates as unknown as React.Key] : []);
                        }}
                    />
                    <Space>
                        <Button
                            type="primary"
                            onClick={() => confirm()}
                            icon={<SearchOutlined />}
                            size="small"
                            style={{ width: 90 }}
                        >
                            OK
                        </Button>
                        <Button
                            onClick={() => {
                                clearFilters && clearFilters();
                                confirm();
                            }}
                            size="small"
                            style={{ width: 90 }}
                        >
                            Сброс
                        </Button>
                    </Space>
                </div>
            );
        },
        // Иконка фильтра (лупа). Можно кастомизировать по желанию.
        filterIcon: (filtered: boolean) => (
            <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
        ),
        // Логика сравнения даты записи с выбранным диапазоном
        onFilter: (value: unknown, record) => {
            const dateRange = value as [Dayjs, Dayjs];
            if (!dateRange || !Array.isArray(dateRange) || dateRange.length < 2) return true;
            const [start, end] = dateRange;

            if (!start || !end) return true;
            if (!record.date) return false;

            // Сравниваем record.collectionDate со стартом и концом
            return record.date.isSameOrAfter(start.startOf('day'))
                && record.date.isSameOrBefore(end.endOf('day'));
        },
        render: (_, record) => {
            // Отображаем так, как и раньше - при помощи formatDate
            return formatDate(record.year, record.month, record.day);
        }
    };

    const columns: TableColumnsType<BasicViewWithKey> = [
        {
            title: "ID",
            dataIndex: "id",
            render: (text) => <a>{text}</a>,
            // onFilter: (value, record) => record.id === value,
            // filtered: true,
            // filterSearch: true,
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
        dateColumn,
        {
            title: "Возраст",
            dataIndex: "age",
            width: 90,
            filters: ages.map((age => ({ text: age.name!, value: age.name! }))),
            onFilter: (value, record) => record.age === value,
            render: (_, { age }) => <><Tooltip title={age}>{formatAge(age)} </Tooltip></>
        },
        {
            title: "Пол",
            dataIndex: "sex",
            width: 70,
            filters: sexes.map((sex => ({ text: sex.name, value: sex.name }))),
            onFilter: (value, record) => record.sex === value,
            render: (_, { sex }) => <><Tooltip title={sex}>{formatSex(sex)}</Tooltip></>
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
                    ellipsis: true,
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
            const formattedData = await Promise.all((data ?? []).map((row) => formatData(row)))
            // Добавляем ключ для каждого ряда
            setData(formattedData)
            setColumns(getColumns(formattedData))

            setLoading(false)
        }
        loadCollection()
    }, [])



    return <Table bordered rowSelection={{ ...rowSelection }} virtual size="small" scroll={{ x: 2500, y: windowSize.height - 170 }} loading={loading} columns={columns} dataSource={data ?? []} pagination={false}></Table>
}



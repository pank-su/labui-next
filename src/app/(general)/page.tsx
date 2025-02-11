"use client"
"use no memo"

import { FloatButton, } from "antd"
import { createClient } from "../../utils/supabase/client"
import { useEffect, useMemo, useRef, useState } from "react";
import { Tables } from "@/src/utils/supabase/gen-types";
import useWindowSize from "@/src/utils/useWindowSize";
import { badDateToDate, formatDate } from "@/src/utils/formatDate";
import { CalendarOutlined, MoreOutlined, PlusOutlined, SearchOutlined, VerticalAlignBottomOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { TableBody } from "../components/table/table-body";
import { FormattedBasicView } from "../components/table/models";

dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

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
 * - Если пол не до конца определён то сохраняем знак вопроса
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




/**
 * Интерфейс для представления тега.
 * @interface
 * @property {number} id - Уникальный идентификатор тега
 * @property {string} name - Название тега
 */
interface Tag {
    id: number;
    name: string;
}

// Захардкоженные значения пола для фильтрации/добавления
const sexes: Tables<"sex">[] = [
    { id: 1, name: "female" },
    { id: 2, name: "male" },
    { id: 3, name: "male?" }
]

const ages: Tables<"age">[] = [
    { id: 3, name: "adult" },
    { id: 1, name: "juvenile" },
    { id: 2, name: "subadult" },
    { id: 4, name: "subadult or adult" }
]


const columnHelper = createColumnHelper<FormattedBasicView>()

const columns = [
    columnHelper.accessor('id', {
        cell: info => <>{info.getValue()}</>,
        header: "id",
        size: 60
    }),
    columnHelper.group({
        header: "Топология",
        columns: [
            columnHelper.accessor('order', {
                cell: info => <>{info.getValue()}</>,
                header: "order",
                size: 100
            }),
            columnHelper.accessor('family', {
                cell: info => <>{info.getValue()}</>,
                header: "family",
                size: 110
            }),
            columnHelper.accessor('genus', {
                cell: info => <>{info.getValue()}</>,
                header: "genus",
                size: 120
            }),
            columnHelper.accessor('kind', {
                cell: info => <>{info.getValue()}</>,
                header: "kind",
                size: 90
            }),
        ]
    })
]


/**
 * Кнопка для скролла вверх или вниз
 */
function BottomOrTopButton() {

}



/**
 *  Таблица коллекции
 * 
 */
function CollectionTable() {

    const windowSize = useWindowSize()
    const [loading, setLoading] = useState(true)
    const tableContainerRef = useRef<HTMLDivElement>(null)


    const [data, setData] = useState<FormattedBasicView[] | null>(null)
    // const [columns, setColumns] = useState<any>()
    const height = useMemo(() => {
        return windowSize.height - 170
    }, [windowSize.height])




    useEffect(() => {
        async function loadCollection() {
            const supabase = await createClient()
            const { data } = (await supabase.from("basic_view").select())
            const formattedData = await Promise.all((data ?? []).map((row) => formatData(row)))
            // Добавляем ключ для каждого ряда
            setData(formattedData)

            setLoading(false)

        }
        loadCollection()

    }, [])


    const table = useReactTable({
        columns: columns,
        data: data ?? [],
        getCoreRowModel: getCoreRowModel(),
        debugTable: true,
    })





    return <>
        <div ref={tableContainerRef} className="h-full" style={{
            overflow: 'auto', //our scrollable table container
            position: 'relative', //needed for sticky header
        }}>
            <table style={{ display: 'grid' }} className="min-w-full table-fixed">
                <thead
                    style={{
                        display: 'grid',
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                    }}
                    className="bg-gray-50 border-b border-gray-200"
                >
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr
                            key={headerGroup.id}
                            style={{ display: 'flex', width: '100%' }}

                        >
                            {headerGroup.headers.map(header => {
                                return (
                                    <th
                                        key={header.id}

                                        style={{
                                            display: 'flex',
                                            width: header.getSize(),
                                        }}
                                        className="px-4 py-2 text-left text-sm font-medium text-gray-700 first:rounded-tl-md 
                            last:rounded-tr-md border-r last:border-r-0  border-gray-200"
                                    >
                                        <div>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </div>
                                    </th>
                                )
                            })}
                        </tr>
                    ))}
                </thead>
                <TableBody table={table} tableContainerRef={tableContainerRef} />

            </table>

        </div>
    </>
}


/**
 * Отображение страницы коллекции 
 */
export default function CollectionPage() {
    return <div className="h-full">
        <CollectionTable />
        <FloatButton.Group shape="square" trigger="hover" icon={<MoreOutlined />}>
            <FloatButton icon={<VerticalAlignBottomOutlined />} />
            <FloatButton icon={<PlusOutlined />} />

        </FloatButton.Group>
    </div>
}
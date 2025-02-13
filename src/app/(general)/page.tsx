"use client"
"use no memo"

import { FloatButton, Skeleton, Tag, } from "antd"
import { useClient } from "../../utils/supabase/client"
import { useEffect, useMemo, useRef, useState } from "react";
import { Tables } from "@/src/utils/supabase/gen-types";
import useWindowSize from "@/src/utils/useWindowSize";
import { badDateToDate, formatDate } from "@/src/utils/formatDate";
import { CalendarOutlined, MoreOutlined, PlusOutlined, SearchOutlined, VerticalAlignBottomOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { TableBody } from "./table/table-body";
import { FormattedBasicView } from "./models";
import { useQuery } from "@tanstack/react-query";
import { getCollection } from "./queries";
import { info } from "console";
import ExpandableText from "../components/expand-text";

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
        header: "ID",
        size: 60
    }),

    columnHelper.accessor('collect_id', {
        cell: info => <>{info.getValue()}</>,
        header: "collect id",
        size: 120
    }),

    columnHelper.group({
        header: "Топология",
        columns: [
            columnHelper.accessor('order', {
                cell: info => <>{info.getValue()}</>,
                header: "Отряд",
                size: 120
            }),
            columnHelper.accessor('family', {
                cell: info => <>{info.getValue()}</>,
                header: "Семейство",
                size: 120
            }),
            columnHelper.accessor('genus', {
                cell: info => <>{info.getValue()}</>,
                header: "Род",
                size: 130
            }),
            columnHelper.accessor('kind', {
                cell: info => <>{info.getValue()}</>,
                header: "Вид",
                size: 120
            }),
        ]
    }),
    columnHelper.accessor(row => formatDate(row.year, row.month, row.day), {
        id: "date",
        header: "Дата"
    }),
    columnHelper.accessor("age", {
        cell: info => <>{formatAge(info.getValue())}</>,
        header: "Возраст"
    }),
    columnHelper.accessor("sex", {
        cell: info => <>{formatSex(info.getValue())}</>,
        header: "Пол"
    }),
    columnHelper.group({
        header: "Позиция",
        columns: [columnHelper.group({
            header: "Точка",
            columns: [
                columnHelper.accessor("latitude", {
                    header: "Широта"
                }),
                columnHelper.accessor("longtitude", {
                    header: "Долгота"
                })
            ],
        },),
        columnHelper.accessor("country", { header: "Страна" }),
        columnHelper.accessor("region", { header: "Регион", size: 250 }),
        columnHelper.accessor("geo_comment", {
            header: "Геокомментарий",
            size: 270,
            cell: info => <ExpandableText>{info.getValue()}</ExpandableText> // TODO
        }),
        ]
    },),
    columnHelper.group({
        header: "Ваучер",
        columns: [
            columnHelper.accessor("voucher_institute", {
                header: "Институт"
            }),
            columnHelper.accessor("voucher_id", {
                header: "ID"
            })
        ]
    }),
    columnHelper.accessor("tags", {
        header: "Тэги",
        cell: info => {
            let tags = info.getValue()
            return <> {tags?.map((tag) => <Tag color="blue" key={(tag as unknown as Tag).id}>{(tag as unknown as Tag).name}</Tag>)}
            </>
        }
    }),
    columnHelper.accessor("comment", {
        header: "Комментарий",
        cell: info => <>{info.getValue()}</>
    })



]



interface CollectionTableProps {
    data: FormattedBasicView[]

}



/**
 *  Таблица коллекции
 * 
 */
function CollectionTable({ data }: CollectionTableProps) {

    const windowSize = useWindowSize()
    const tableContainerRef = useRef<HTMLDivElement>(null)

    const height = useMemo(() => {
        return windowSize.height - 60
    }, [windowSize.height])


    const table = useReactTable({
        columns: columns,
        data: data,
        getCoreRowModel: getCoreRowModel(),
        debugTable: true,
        defaultColumn: {
            minSize: 60,
            maxSize: 800,
        },
    })

    return <>
        <div ref={tableContainerRef} style={{
            overflow: 'auto', //our scrollable table container
            position: 'relative', //needed for sticky header,
            height: height
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
    const supabase = useClient()

    const { data, isPending } = useQuery({
        queryKey: ['collection'], queryFn: () =>
            getCollection(supabase)
    })

    if (isPending) {
        return <Skeleton active />
    }

    return <div className="h-full">
        <CollectionTable data={data ?? []} />
        <FloatButton.Group shape="square" trigger="hover" icon={<MoreOutlined />}>
            <FloatButton icon={<VerticalAlignBottomOutlined />} />
            <FloatButton icon={<PlusOutlined />} />

        </FloatButton.Group>
    </div>
}
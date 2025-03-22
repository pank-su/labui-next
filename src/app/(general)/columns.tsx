"use client"

import ExpandableText from "@/app/components/expand-text"
import { formatDate } from "@/utils/formatDate"
import { useClient } from "@/utils/supabase/client"
import { useQuery, useUpdateMutation } from "@supabase-cache-helpers/postgrest-react-query"
import { CellContext, createColumnHelper, RowData } from "@tanstack/react-table"
import { Checkbox, Select, Tag } from "antd"
import { useState } from "react"
import { EditableCell } from "../components/data-table/editable"
import { useUser } from "../components/header"
import { FormattedBasicView, GenomRow } from "./models"


const columnHelper = createColumnHelper<FormattedBasicView>()

declare module '@tanstack/react-table' {
    //allows us to define custom properties for our columns
    export interface ColumnMeta<TData extends RowData, TValue> {
        filterVariant?: 'index' | 'date-range' | 'select'
    }
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



function SelectEdit<R, T>({ data, value }: { data?: { id: number, name: string | null }[] | null, value: string, onValueChange: (id: number, name: string) => void }) {
    return <Select className="w-full"
        defaultValue={data?.find((el) => el.name == value)?.id}
        showSearch
        filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        options={(data ?? []).map(item => ({
            value: item.id,
            label: item.name
        }))}
    />
}



export default function getColumns() {
    const [editedGenomRow, setEditedGenomRow] = useState<GenomRow | null>(null)
    const supabase = useClient()
    const { user } = useUser()


    const { mutateAsync: update } = useUpdateMutation(
        supabase.from("collection"),
        ['id']
    );


    return [
        columnHelper.display({
            id: 'select-col',
            size: 33,
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllRowsSelected()}
                    indeterminate={table.getIsSomeRowsSelected()}
                    onChange={table.getToggleAllRowsSelectedHandler()}
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    disabled={!row.getCanSelect()}
                    onChange={row.getToggleSelectedHandler()}
                />
            )
        }),


        columnHelper.accessor('id', {
            cell: info => <>{info.getValue()}</>,
            header: "ID",
            size: 60,
            enableColumnFilter: true,
            meta: {
                filterVariant: "index"
            },
            filterFn: (row, id, filterValue) => {
                if ((filterValue as number[])[0] == -1) return true
                const value = row.getValue(id) as number
                return (filterValue as number[]).includes(value)
            }
        }),

        columnHelper.accessor('collect_id', {
            cell: info => <EditableCell cellValue={info.getValue()}
                onSave={(value) => update({ id: info.row.getValue("id"), collect_id: value })}
                user={user} />
            ,
            header: "collect id",
            size: 120
        }),

        columnHelper.group({
            header: "Топология",
            columns: [
                columnHelper.accessor('order', {
                    cell: info => {
                        const { data } = useQuery(supabase.from("order").select("id,name"))
                        const isEdit = editedGenomRow?.rowId == info.row.getValue("id")


                        return <>
                            {isEdit ? <SelectEdit data={data} value={editedGenomRow?.order ?? ""} onValueChange={
                                (id, name) => {
                                    
                                }
                            } /> : <div className={"cursor-pointer w-full"} onDoubleClick={(e) => {
                                setEditedGenomRow({
                                    rowId: info.row.getValue("id"),
                                    order: info.getValue(),
                                    family: info.row.getValue("family"),
                                    genus: info.row.getValue("genus")
                                })
                                e.preventDefault()
                            }}>{info.getValue()}</div>
                            }
                        </>
                    },
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
            header: "Возраст",
            size: 70
        }),
        columnHelper.accessor("sex", {
            cell: info => <>{formatSex(info.getValue())}</>,
            header: "Пол",
            size: 60
        }),
        columnHelper.group({
            header: "Позиция",
            columns: [
                columnHelper.accessor("latitude", {
                    header: "Широта"
                }),
                columnHelper.accessor("longtitude", {
                    header: "Долгота"
                }),
                columnHelper.accessor("country", { header: "Страна" }),
                columnHelper.accessor("region", {
                    header: "Регион",
                    size: 250,
                    cell: info => <ExpandableText >{info.getValue()}</ExpandableText>
                }
                ),
                columnHelper.accessor("geo_comment", {
                    header: "Геокомментарий",
                    size: 270,
                    cell: info => <EditableCell cellValue={info.getValue()}
                        onSave={(value) => update({ id: info.row.getValue("id"), geo_comment: value })}
                        user={user} />
                }),
            ]
        },),
        columnHelper.group({
            header: "Ваучер",
            columns: [
                columnHelper.accessor("voucher_institute", {
                    header: "Институт",
                    cell: info => <ExpandableText >{info.getValue()}</ExpandableText>
                }),
                columnHelper.accessor("voucher_id", {
                    header: "ID",
                    cell: info => <ExpandableText >{info.getValue()}</ExpandableText>

                })
            ]
        }),
        columnHelper.accessor("tags", {
            header: "Тэги",
            cell: info => {
                let tags = info.getValue()
                return <> {tags?.map((tag) => <Tag color="blue" key={(tag as unknown as Tag).id}>{(tag as unknown as Tag).name}</Tag>)}
                </>
            },
            size: 100
        }),
        columnHelper.accessor("comment", {
            header: "Комментарий",
            cell: info => <EditableCell cellValue={info.getValue()}
                onSave={(value) => update({ id: info.row.getValue("id"), comment: value })}
                user={user} />,
            size: 400

        })
    ]
}
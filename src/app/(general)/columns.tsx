"use client"

import ExpandableText from "@/app/components/expand-text"
import { formatDate } from "@/utils/formatDate"
import { useClient } from "@/utils/supabase/client"
import { useQuery, useUpdateMutation } from "@supabase-cache-helpers/postgrest-react-query"
import { CellContext, createColumnHelper, RowData } from "@tanstack/react-table"
import { Checkbox, Select, Tag } from "antd"
import { useMemo, useState } from "react"
import { EditableCell } from "../components/data-table/editable"
import { useUser } from "../components/header"
import { FormattedBasicView, GenomRow, toGenomRow, Topology } from "./models"
import { TopologyCell } from "./TopologyCell"


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



function SelectEdit<R, T>({ data, value, onValueChange }: { data?: { id: number, name: string | null }[] | null, value: string, onValueChange: (id: number, name: string | null) => void }) {
    return <Select className="w-full"
        defaultValue={data?.find((el) => el.name == value)?.id}
        showSearch
        filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        onSelect={(id, item) => {
            onValueChange(id, item.label)
        }

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

    const { data: orders } = useQuery(supabase.from("order").select("id,name"));

    const { data: families } = useQuery(
        supabase.from("family").select("id,name")
            .eq('order_id', editedGenomRow?.order?.id || -1),
        { enabled: !!editedGenomRow?.order?.id }
    );
    const { data: genera } = useQuery(
        supabase.from("genus").select("id,name")
            .eq('family_id', editedGenomRow?.family?.id || -1),
        { enabled: !!editedGenomRow?.family?.id }
    );
    const { data: kinds } = useQuery(
        supabase.from("kind").select("id,name")
            .eq('genus_id', editedGenomRow?.genus?.id || -1),
        { enabled: !!editedGenomRow?.genus?.id }
    );

    const handleFieldChange = (field: string, value: Topology | undefined) => {
        if (!editedGenomRow) return;

        const updatedRow = { ...editedGenomRow };
        switch (field) {
            case 'order':
                updatedRow.order = value;
                updatedRow.family = undefined;
                updatedRow.genus = undefined;
                updatedRow.kind = undefined;
                break;
            case 'family':
                updatedRow.family = value;
                updatedRow.genus = undefined;
                updatedRow.kind = undefined;
                break;
            case 'genus':
                updatedRow.genus = value;
                updatedRow.kind = undefined;
                break;
            case 'kind':
                updatedRow.kind = value;
                break;
        }

        setEditedGenomRow(updatedRow);
    };

    const handleSave = () => {
        if (editedGenomRow) {
            // TODO:
        }
    };

    const handleCancel = () => {
        setEditedGenomRow(null);
    };

    const getFieldProps = (field: 'order' | 'family' | 'genus' | 'kind') => {
        let options: { id: number, name: string | null }[] = [];
        let isDisabled = false;

        switch (field) {
            case 'order':
                options = orders || [];
                break;
            case 'family':
                options = families || [];
                isDisabled = !editedGenomRow?.order;
                break;
            case 'genus':
                options = genera || [];
                isDisabled = !editedGenomRow?.family;
                break;
            case 'kind':
                options = kinds || [];
                isDisabled = !editedGenomRow?.genus;
                break;
        }

        return { options, isDisabled };
    };


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
                        const { options, isDisabled } = getFieldProps('order');
                        
                        const isEditing = info.row.getValue("id") == editedGenomRow?.rowId

                        return (
                            <TopologyCell
                                genomRow={isEditing ? editedGenomRow! : toGenomRow(info.row.original)}
                                field="order"
                                value={info.getValue()}
                                isEditing={isEditing}
                                options={options}
                                isDisabled={isDisabled}
                                onEdit={setEditedGenomRow}
                                onChange={handleFieldChange}
                                showActions={false}
                                onSave={handleSave}
                                onCancel={handleCancel}
                            />
                        );
                    },
                    header: "Отряд",
                    size: 120
                }),
                columnHelper.accessor('family', {
                    cell: info => {
                        const { options, isDisabled } = getFieldProps('family');
                        const isEditing = info.row.getValue("id") == editedGenomRow?.rowId

                        return (
                            <TopologyCell
                                genomRow={isEditing ? editedGenomRow! : toGenomRow(info.row.original)}
                                field="family"
                                value={info.getValue()}
                                isEditing={isEditing}
                                options={options}
                                isDisabled={isDisabled}
                                onEdit={setEditedGenomRow}
                                onChange={handleFieldChange}
                                showActions={false}
                                onSave={handleSave}
                                onCancel={handleCancel}
                            />
                        );
                    },
                    header: "Семейство",
                    size: 120
                }),
                columnHelper.accessor('genus', {
                    cell: info => {
                        const { options, isDisabled } = getFieldProps('genus');
                        const isEditing = info.row.getValue("id") == editedGenomRow?.rowId

                        return (
                            <TopologyCell
                                genomRow={isEditing ? editedGenomRow! : toGenomRow(info.row.original)}
                                field="genus"
                                value={info.getValue()}
                                isEditing={isEditing}
                                options={options}
                                isDisabled={isDisabled}
                                onEdit={setEditedGenomRow}
                                onChange={handleFieldChange}
                                showActions={false}
                                onSave={handleSave}
                                onCancel={handleCancel}
                            />
                        );
                    },                    header: "Род",
                    size: 130
                }),
                columnHelper.accessor('kind', {
                    cell: info => {
                        const { options, isDisabled } = getFieldProps('kind');
                        const isEditing = info.row.getValue("id") == editedGenomRow?.rowId

                        return (
                            <TopologyCell
                                genomRow={isEditing ? editedGenomRow! : toGenomRow(info.row.original)}
                                field="kind"
                                value={info.getValue()}
                                isEditing={isEditing}
                                options={options}
                                isDisabled={isDisabled}
                                onEdit={setEditedGenomRow}
                                onChange={handleFieldChange}
                                showActions={false}
                                onSave={handleSave}
                                onCancel={handleCancel}
                            />
                        );
                    },                    header: "Вид",
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
                return <> {tags?.map((tag) => <Tag color="blue" key={(tag).id}>{(tag).name}</Tag>)}
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
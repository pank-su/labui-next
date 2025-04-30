"use client"

import ExpandableText from "@/app/components/expand-text"
import {formatDate} from "@/utils/formatDate"
import {useClient} from "@/utils/supabase/client"
import {useQuery, useUpdateMutation} from "@supabase-cache-helpers/postgrest-react-query"
import {createColumnHelper, RowData} from "@tanstack/react-table"
import {Checkbox, Tag} from "antd"
import {useState} from "react"
import {EditableCell} from "../../components/data-table/editable"
import {useUser} from "../../components/header"
import {FormattedBasicView, GenomRow, toGenomRow, Topology} from "../models"
import {TopologyCell} from "../../components/data-table/topology-cell"
import {DataCell} from "../../components/data-table/data-cell"
import {SelectCell} from "../../components/data-table/select-cell"
import {loadOrders} from "@/app/(general)/queries";


const columnHelper = createColumnHelper<FormattedBasicView>()

declare module '@tanstack/react-table' {
    //allows us to define custom properties for our columns
    export interface ColumnMeta<TData extends RowData, TValue> {
        filterVariant?: 'index' | 'input' | 'date-range' | 'select'
    }
}

const selectFilter = (row: { getValue: (arg0: any) => string | null }, id: any, filterValue: string | null) => {
    const value = row.getValue(id) as string | null
    return filterValue === " " && value === null || filterValue === value
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
        case "adult":
            return "ad"
        case "juvenile":
            return "juv"
        case "subadult":
            return "sad"
        default:
            return age ?? ""
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


export default function getColumns() {
    const [editedGenomRow, setEditedGenomRow] = useState<GenomRow | null>(null)
    const supabase = useClient()
    const {user} = useUser()


    const {mutateAsync: update} = useUpdateMutation(
        supabase.from("collection"),
        ['id']
    );

    const {data: orders, isLoading: isOrdersLoading} = useQuery(loadOrders(supabase));

    const {data: families, isLoading: isFamiliesLoading} = useQuery(
        supabase.from("family").select("id,name").not('name', 'is', null)
            .eq('order_id', editedGenomRow?.order?.id || -1),
        {enabled: !!editedGenomRow?.order?.id}
    );
    const {data: genera, isLoading: isGeneraLoading} = useQuery(
        supabase.from("genus").select("id,name").not('name', 'is', null)
            .eq('family_id', editedGenomRow?.family?.id || -1),
        {enabled: !!editedGenomRow?.family?.id}
    );
    const {data: kinds, isLoading: isKindsLoading} = useQuery(
        supabase.from("kind").select("id,name").not('name', 'is', null)
            .eq('genus_id', editedGenomRow?.genus?.id || -1),
        {enabled: !!editedGenomRow?.genus?.id}
    );

    const handleFieldChange = (field: string, value: Topology | undefined) => {
        if (!editedGenomRow) return;

        const updatedRow = {...editedGenomRow};
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

    const handleSave = async () => {
        if (editedGenomRow) {
            console.log(editedGenomRow)
            await supabase.rpc("update_collection_taxonomy_by_ids", {
                col_id: editedGenomRow.rowId!,
                order_id: editedGenomRow.order?.id ?? undefined,
                family_id: editedGenomRow.family?.id ?? undefined,
                genus_id: editedGenomRow.genus?.id ?? undefined,
                kind_id: editedGenomRow.kind?.id ?? undefined
            })
            setEditedGenomRow(null)

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
                isDisabled = !editedGenomRow?.order?.id;
                break;
            case 'genus':
                options = genera || [];
                isDisabled = !editedGenomRow?.family?.id;
                break;
            case 'kind':
                options = kinds || [];
                isDisabled = !editedGenomRow?.genus?.id;
                break;
        }

        return {options, isDisabled};
    };


    return [
        columnHelper.display({
            id: 'select-col',
            size: 33,
            header: ({table}) => (
                <Checkbox
                    checked={table.getIsAllRowsSelected()}
                    indeterminate={table.getIsSomeRowsSelected()}
                    onChange={table.getToggleAllRowsSelectedHandler()}
                />
            ),
            cell: ({row}) => (
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
            enableGlobalFilter: true,
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
                                        onSave={(value) => update({id: info.row.getValue("id"), collect_id: value})}
                                        user={user}/>
            ,
            header: "collect id",
            size: 150,
            filterFn: "includesString",
            meta: {
                filterVariant: "input"
            }
        }),

        columnHelper.group({
            header: "Классификация",
            columns: [
                columnHelper.accessor('order.name', {
                    cell: info => {
                        const {options, isDisabled} = getFieldProps('order');

                        const isEditing = !!(info.row.getValue("id") == editedGenomRow?.rowId && user)

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
                                isLoading={isOrdersLoading}
                                onCancel={handleCancel}
                            />
                        );
                    },
                    header: "Отряд",
                    size: 150,
                    meta: {
                        filterVariant: "select"
                    },
                    filterFn: selectFilter

                }),
                columnHelper.accessor('family.name', {
                    cell: info => {
                        const {options, isDisabled} = getFieldProps('family');
                        const isEditing = !!(info.row.getValue("id") == editedGenomRow?.rowId && user)

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
                                isLoading={isFamiliesLoading}

                                onCancel={handleCancel}
                            />
                        );
                    },
                    header: "Семейство",
                    size: 150,
                    meta: {
                        filterVariant: "select"
                    },
                    filterFn: selectFilter

                }),
                columnHelper.accessor('genus.name', {
                    cell: info => {
                        const {options, isDisabled} = getFieldProps('genus');
                        const isEditing = !!(info.row.getValue("id") == editedGenomRow?.rowId && user)

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
                                isLoading={isGeneraLoading}

                                onCancel={handleCancel}
                            />
                        );
                    }, header: "Род",
                    size: 150,
                    meta: {
                        filterVariant: "select"
                    },
                    filterFn: selectFilter

                }),
                columnHelper.accessor('kind.name', {
                    cell: info => {
                        const {options, isDisabled} = getFieldProps('kind');
                        const isEditing = !!(info.row.getValue("id") == editedGenomRow?.rowId && user)

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
                                showActions={true}
                                onSave={handleSave}
                                isLoading={isKindsLoading}

                                onCancel={handleCancel}
                            />
                        );
                    }, header: "Вид",
                    size: 150,
                    meta: {
                        filterVariant: "select"
                    },
                    filterFn: selectFilter

                }),
            ]
        }),
        columnHelper.accessor(row => formatDate(row.year, row.month, row.day), {
            id: "date",
            header: "Дата",
            size: 160,
            cell: info => {
                const rowId = info.row.getValue("id") as number;
                const isEditing = !!user;
                const year = info.row.original.year;
                const month = info.row.original.month;
                const day = info.row.original.day;
                const value = info.getValue() as string;

                return (
                    <DataCell
                        value={value}
                        year={year}
                        month={month}
                        day={day}
                        rowId={rowId}
                        isEditing={isEditing}
                        onSave={async (rowId, year, month, day) => {
                            await update({
                                id: rowId,
                                year: year,
                                month: month,
                                day: day
                            });
                        }}
                        onCancel={() => {
                        }}
                        disabled={!user}
                    />
                );
            }
        }),
        columnHelper.accessor("age", {
            cell: info => {
                const rowId = info.row.getValue("id") as number;
                const isEditing = !!user;
                const value = info.getValue() as string | null;
                const displayValue = formatAge(value);

                // Опции для возраста
                const ageOptions = [
                    {value: 1, label: 'juvenile'},
                    {value: 2, label: 'subadult'},
                    {value: 3, label: 'adult'},
                    {value: null, label: 'Не указано'}
                ];


                return (
                    <SelectCell
                        value={ageOptions.find((data) => data.label == value)?.value}
                        displayValue={displayValue}
                        options={ageOptions}
                        rowId={rowId}
                        isEditing={isEditing}
                        onSave={async (rowId, value) => {
                            await update({
                                id: rowId,
                                age_id: value
                            });
                        }}
                        onCancel={() => {
                        }}
                        placeholder="Выберите возраст"
                    />
                );
            },
            header: "Возраст",
            size: 110,
            meta: {
                filterVariant: "select"
            },
            filterFn: selectFilter

        }),
        columnHelper.accessor("sex", {
            cell: info => <>{formatSex(info.getValue())}</>,
            header: "Пол",
            size: 60,
            meta: {
                filterVariant: "select"
            },
            filterFn: selectFilter

        }),
        columnHelper.group({
            header: "Позиция",
            columns: [
                columnHelper.accessor("latitude", {
                    header: "Широта",
                    enableGlobalFilter: false
                }),
                columnHelper.accessor("longitude", {
                    header: "Долгота",
                    enableGlobalFilter: false
                }),
                columnHelper.accessor("country", {
                    header: "Страна", cell: info => <ExpandableText>{info.getValue()}</ExpandableText>,
                    meta: {
                        filterVariant: "select"
                    }
                }),
                columnHelper.accessor("region", {
                        header: "Регион",
                        size: 250,
                        cell: info => <ExpandableText>{info.getValue()}</ExpandableText>,
                        meta: {
                            filterVariant: "select"
                        }
                    }
                ),
                columnHelper.accessor("geo_comment", {
                    header: "Геокомментарий",
                    size: 270,
                    cell: info => <EditableCell cellValue={info.getValue()}
                                                onSave={(value) => update({
                                                    id: info.row.getValue("id"),
                                                    geo_comment: value
                                                })}
                                                user={user}/>,
                    meta: {
                        filterVariant: "input"
                    }
                }),
            ]
        },),
        columnHelper.group({
            header: "Ваучер",
            columns: [
                columnHelper.accessor("voucher_institute", {
                    header: "Институт",
                    cell: info => <ExpandableText>{info.getValue()}</ExpandableText>,
                    meta: {
                        filterVariant: "select"
                    }
                }),
                columnHelper.accessor("voucher_id", {
                    header: "ID",
                    cell: info => <ExpandableText>{info.getValue()}</ExpandableText>,
                    meta: {
                        filterVariant: "input"
                    }
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
                                        onSave={(value) => update({id: info.row.getValue("id"), comment: value})}
                                        user={user}/>,
            size: 400,
            meta: {
                filterVariant: "input"
            }
        })
    ]
}
"use client"

import ExpandableText from "@/app/components/expand-text"
import ExpandableTags from "@/app/components/expandable-tags"
import {date} from "@/utils/date"
import {createColumnHelper, Row, RowData} from "@tanstack/react-table"
import {Avatar, Tag, Tooltip} from "antd"
import {EditableCell} from "../../components/data-table/editable"
import {FormattedBasicView, GenomRow, toGenomRow, Topology} from "../models"
import {TopologyCell} from "../../components/data-table/topology-cell"
import {DataCell} from "../../components/data-table/data-cell"
import {SelectCell} from "../../components/data-table/select-cell"
import {FilterDate} from "@/app/components/data-table/filters/date-filter";
import {FilterGeo} from "@/app/components/data-table/filters/geo-filter";


const columnHelper = createColumnHelper<FormattedBasicView>()

declare module '@tanstack/react-table' {
    export interface ColumnMeta<TData extends RowData, TValue> {
        filterVariant?: 'index' | 'input' | 'date' | 'select' | 'geo' | "checkbox" | "multiple-select"
    }
}

const selectFilter = (row: { getValue: (arg0: any) => string | null }, id: any, filterValue: string | null) => {
    const value = row.getValue(id) as string | null
    return filterValue === " " && value === null || filterValue === value
}


const geoFilterFn = (
    row: Row<FormattedBasicView>,
    columnId: string,
    filterValue: any,
): boolean => {
    const value = row.getValue(columnId) as number | null | undefined

    if (filterValue === null || filterValue === undefined) {
        return true
    }
    if (value === null || value === undefined) {
        return false
    }

    const geoFilter = filterValue as FilterGeo
    const {from, to} = geoFilter

    const passesFrom = from === null || value >= from
    const passesTo = to === null || value <= to

    return passesFrom && passesTo
}

// Утилиты форматирования
const formatAge = (age: string | null): string => {
    const ageMap: Record<string, string> = {
        "adult": "ad",
        "juvenile": "juv", 
        "subadult": "sad"
    }
    return age ? ageMap[age] ?? age : ""
}

const formatSex = (sex: string | null): string => {
    if (!sex) return ""
    return sex[0] + (sex.endsWith("?") ? "?" : "")
}

const formatLastModified = (lastModified: string | null): string => {
    if (!lastModified) return ""
    try {
        return new Date(lastModified).toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    } catch {
        return ""
    }
}



export default function getColumns(options: {
    user: any;
    editedGenomRow: GenomRow | null;
    orders: any[];
    families: any[];
    genera: any[];
    kinds: any[];
    isOrdersLoading: boolean;
    isFamiliesLoading: boolean;
    isGeneraLoading: boolean;
    isKindsLoading: boolean;
    onEdit: (row: FormattedBasicView) => void;
    onFieldChange: (field: string, value: Topology | undefined) => void;
    onSave: () => void;
    onCancel: () => void;
    onUpdate: (payload: any) => Promise<any>;
    onStartEditing: (rowId: number, fieldName: string) => void;
    onStopEditing: (rowId: number, fieldName: string) => void;
    isFieldEditing: (rowId: number, fieldName: string) => boolean;
}) {

    const {
        user,
        editedGenomRow,
        orders,
        families,
        genera,
        kinds,
        isOrdersLoading,
        isFamiliesLoading,
        isGeneraLoading,
        isKindsLoading,
        onEdit,
        onFieldChange,
        onSave,
        onCancel,
        onUpdate: update,
        onStartEditing,
        onStopEditing,
        isFieldEditing,
    } = options;


    // Хелперы для создания колонок
    const getFieldProps = (field: 'order' | 'family' | 'genus' | 'kind') => {
        const fieldMap = {
            order: { options: orders || [], isDisabled: false },
            family: { 
                options: families || [], 
                isDisabled: !editedGenomRow?.order?.id || !editedGenomRow?.order?.name?.trim()
            },
            genus: { 
                options: genera || [], 
                isDisabled: !editedGenomRow?.family?.id || !editedGenomRow?.family?.name?.trim()
            },
            kind: { 
                options: kinds || [], 
                isDisabled: !editedGenomRow?.genus?.id || !editedGenomRow?.genus?.name?.trim()
            }
        }
        return fieldMap[field]
    }

    const createEditableCell = (fieldName: string, savePayload: (value: string | null, rowId: number) => any) => 
        (info: any) => (
            <EditableCell 
                cellValue={info.getValue()}
                onSave={(value) => update(savePayload(value, info.row.getValue("id")))}
                user={user}
                rowId={info.row.getValue("id") as number}
                fieldName={fieldName}
                onStartEditing={onStartEditing}
                onStopEditing={onStopEditing}
                isFieldEditing={isFieldEditing}
            />
        )

    const createTopologyCell = (field: 'order' | 'family' | 'genus' | 'kind', loadingState: boolean) => 
        (info: any) => {
            const {options, isDisabled} = getFieldProps(field)
            const isEditing = !!(info.row.getValue("id") == editedGenomRow?.rowId && user)

            return (
                <TopologyCell
                    genomRow={isEditing ? editedGenomRow! : toGenomRow(info.row.original)}
                    field={field}
                    value={info.getValue()}
                    isEditing={isEditing}
                    options={options}
                    isDisabled={isDisabled}
                    onEdit={() => onEdit(info.row.original)}
                    onChange={onFieldChange}
                    showActions={field === 'kind' && isEditing}
                    onSave={onSave}
                    isLoading={loadingState}
                    onCancel={onCancel}
                />
            )
        }

    return [
        /* Вернуть, когда будет смысл
        columnHelper.display({
            id: 'select',
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
            ),
            meta:{
                filterVariant: "checkbox"
            }
        }),
         */


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
            cell: createEditableCell("collect_id", (value, rowId) => ({id: rowId, collect_id: value})),
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
                    cell: createTopologyCell('order', isOrdersLoading),
                    header: "Отряд",
                    size: 150,
                    meta: {
                        filterVariant: "select"
                    },
                    filterFn: selectFilter
                }),
                columnHelper.accessor('family.name', {
                    cell: createTopologyCell('family', isFamiliesLoading),
                    header: "Семейство",
                    size: 150,
                    meta: {
                        filterVariant: "select"
                    },
                    filterFn: selectFilter
                }),
                columnHelper.accessor('genus.name', {
                    cell: createTopologyCell('genus', isGeneraLoading),
                    header: "Род",
                    size: 150,
                    meta: {
                        filterVariant: "select"
                    },
                    filterFn: selectFilter
                }),
                columnHelper.accessor('kind.name', {
                    cell: createTopologyCell('kind', isKindsLoading),
                    header: "Вид",
                    size: 150,
                    meta: {
                        filterVariant: "select"
                    },
                    filterFn: selectFilter
                }),
            ]
        }),
        columnHelper.accessor(row => date(row.year, row.month, row.day), {
            id: "date",
            header: "Дата",
            size: 220,
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
            },
            filterFn: (row, id, filterValue) => {
                const key = (y: number, m: number, d: number) => y * 10_000 + m * 100 + d;
                const filter = filterValue as FilterDate;

                if (!filter.from && !filter.to) return true;

                // 2) у строки даже года нет – сразу мимо
                const y = row.original.year;
                if (y == null) return false;

                // 3) «кодируем» дату строки. Если месяца/дня нет – берём минимумы
                const rowKey = key(y, row.original.month ?? 1, row.original.day ?? 1);

                // 4) то же для from / to
                const fromKey = filter.from
                    ? key(filter.from.year,
                        filter.from.month ?? 1,
                        filter.from.day ?? 1)                   // earliest
                    : null;

                const toKey = filter.to
                    ? key(filter.to.year,
                        filter.to.month ?? 12,
                        filter.to.day ?? 31)                    // latest (31 ок, нам важно только «максимум»)
                    : null;

                return (fromKey === null || rowKey >= fromKey) &&
                    (toKey === null || rowKey <= toKey);
            },
            meta: {
                filterVariant: "date"
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
            cell: info => {
                const rowId = info.row.getValue("id") as number;
                const isEditing = !!user;
                const value = info.getValue() as string | null;
                const displayValue = formatSex(value);

                // Опции для пола
                const sexOptions = [
                    {value: 1, label: 'female'},
                    {value: 2, label: 'male'},
                    {value: null, label: 'Не указано'}
                ];

                return (
                    <SelectCell
                        value={sexOptions.find((data) => data.label == value)?.value}
                        displayValue={displayValue}
                        options={sexOptions}
                        rowId={rowId}
                        isEditing={isEditing}
                        onSave={async (rowId, value) => {
                            await update({
                                id: rowId,
                                sex_id: value
                            });
                        }}
                        onCancel={() => {
                        }}
                        placeholder="Выберите пол"
                    />
                );
            },
            header: "Пол",
            size: 85,
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
                    enableGlobalFilter: false,
                    meta: {
                        filterVariant: "geo"
                    },
                    filterFn: geoFilterFn
                }),
                columnHelper.accessor("longitude", {
                    header: "Долгота",
                    enableGlobalFilter: false,
                    meta: {
                        filterVariant: "geo"
                    },
                    filterFn: geoFilterFn
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
                    cell: createEditableCell("geo_comment", (value, rowId) => ({id: rowId, geo_comment: value})),
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
        columnHelper.accessor("collectors", {
            header: "Коллекторы",
            cell: info => {
                const collectors = info.getValue()
                if (!collectors || collectors.length === 0) return null
                
                return (
                    <ExpandableTags>
                        {collectors.map((collector, index) => {
                            const surname = collector.last_name || ""
                            const firstInitial = collector.first_name ? collector.first_name.charAt(0) + "." : ""
                            const secondInitial = collector.second_name ? collector.second_name.charAt(0) + "." : ""
                            const displayName = `${surname} ${firstInitial}${secondInitial}`.trim()
                            
                            return (
                                <Tag key={index} className="text-xs">
                                    {displayName}
                                </Tag>
                            )
                        })}
                    </ExpandableTags>
                )
            },
            meta: {
                filterVariant: "multiple-select"
            }
        }),
        columnHelper.accessor("tags", {
            header: "Тэги",
            cell: info => {
                let tags = info.getValue()
                return (
                    <ExpandableTags>
                        {tags?.map((tag) => (
                            <Tooltip key={(tag).id} title={(tag.description)} color={tag.color ?? "blue"}>
                                <Tag color={tag.color ?? "blue"}>{(tag).name}</Tag>
                            </Tooltip>
                        ))}
                    </ExpandableTags>
                )
            },
            size: 120.0,
            meta: {
                filterVariant: "multiple-select"
            }
        }),

        columnHelper.accessor("comment", {
            header: "Комментарий",
            cell: createEditableCell("comment", (value, rowId) => ({id: rowId, comment: value})),
            size: 400,
            meta: {
                filterVariant: "input"
            }
        }),

        columnHelper.group({
            header: "Последнее изменение",
            columns: [
                columnHelper.accessor("last_modified", {
                    header: "Дата",
                    cell: info => {
                        const lastModified = info.getValue()
                        return <span className="text-xs text-gray-600">
                            {formatLastModified(lastModified)}
                        </span>
                    },
                    size: 120,
                    meta: {
                        filterVariant: "input"
                    }
                }),
                columnHelper.accessor("edit_users", {
                    id: "edit_users",
                    header: "Пользователи",
                    cell: info => {
                        const editUsers = info.getValue()


                        if (!editUsers || editUsers.length === 0) return null

                        return (
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                {editUsers.map((user: any, index: number) => {
                                    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim()
                                    
                                    return (
                                        <Tooltip key={user.id || index} title={fullName || 'Пользователь'}>
                                            <Avatar 
                                                src={user.avatar} 
                                                size="small"
                                                style={{ cursor: 'pointer' }}
                                            />
                                        </Tooltip>
                                    )
                                })}
                            </div>
                        )
                    },
                    size: 150,
                    meta: {
                        filterVariant: "input"
                    }
                })
            ]
        }),

    ]
}
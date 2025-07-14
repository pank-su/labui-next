"use client"

import Expandable from "@/app/components/expandable"
import {date} from "@/utils/date"
import {createColumnHelper, Row, RowData} from "@tanstack/react-table"
import {Avatar, Tooltip} from "antd"
import {EditableCell} from "../../components/data-table/editable"
import {FormattedBasicView, GenomRow, toGenomRow, Topology, CoordinateRow, toCoordinateRow, LocationRow, toLocationRow} from "../models"
import {TopologyCell} from "../../components/data-table/topology-cell"
import {DataCell} from "../../components/data-table/data-cell"
import {SelectCell} from "../../components/data-table/select-cell"
import {CoordinateCell} from "../../components/data-table/coordinate-cell"
import {LocationCell} from "../../components/data-table/location-cell"
import CollectorsCell from "../../components/data-table/collectors-cell"
import TagsCell from "../../components/data-table/tags-cell"
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
    editedCoordinateRow: CoordinateRow | null;
    editedLocationRow: LocationRow | null;
    orders: any[];
    families: any[];
    genera: any[];
    kinds: any[];
    countries: any[];
    regions: any[];
    voucherInstitutes: any[];
    isOrdersLoading: boolean;
    isFamiliesLoading: boolean;
    isGeneraLoading: boolean;
    isKindsLoading: boolean;
    isCountriesLoading: boolean;
    isRegionsLoading: boolean;
    isVoucherInstitutesLoading: boolean;
    onEdit: (row: FormattedBasicView) => void;
    onCoordinateEdit: (row: CoordinateRow) => void;
    onLocationEdit: (row: LocationRow) => void;
    onFieldChange: (field: string, value: Topology | undefined) => void;
    onCoordinateChange: (field: 'latitude' | 'longitude', value: number | null) => void;
    onLocationChange: (countryName: string | null, regionName: string | null) => void;
    onSave: () => void;
    onCoordinateSave: () => void;
    onLocationSave: (countryName: string | null, regionName: string | null) => void;
    onCancel: () => void;
    onCoordinateCancel: () => void;
    onLocationCancel: () => void;
    onUpdate: (payload: any) => Promise<any>;
    onStartEditing: (rowId: number, fieldName: string) => void;
    onStopEditing: (rowId: number, fieldName: string) => void;
    isFieldEditing: (rowId: number, fieldName: string) => boolean;
    onMapSelect: (rowId: number) => void;
}) {

    const {
        user,
        editedGenomRow,
        editedCoordinateRow,
        editedLocationRow,
        orders,
        families,
        genera,
        kinds,
        countries,
        regions,
        voucherInstitutes,
        isOrdersLoading,
        isFamiliesLoading,
        isGeneraLoading,
        isKindsLoading,
        isCountriesLoading,
        isRegionsLoading,
        isVoucherInstitutesLoading,
        onEdit,
        onCoordinateEdit,
        onLocationEdit,
        onFieldChange,
        onCoordinateChange,
        onLocationChange,
        onSave,
        onCoordinateSave,
        onLocationSave,
        onCancel,
        onCoordinateCancel,
        onLocationCancel,
        onUpdate: update,
        onStartEditing,
        onStopEditing,
        isFieldEditing,
        onMapSelect,
    } = options;


    // Хелперы для создания колонок
    const getFieldProps = (field: 'order' | 'family' | 'genus' | 'kind') => {
        const fieldMap = {
            order: {options: orders || [], isDisabled: false},
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
                    isEditable={!!user}
                />
            )
        }

    const createCoordinateCell = (field: 'latitude' | 'longitude') =>
        (info: any) => {
            const isEditing = !!(info.row.getValue("id") == editedCoordinateRow?.rowId && user)
            const coordinateRow = isEditing ? editedCoordinateRow! : toCoordinateRow(info.row.original)
            const value = isEditing ? coordinateRow[field] : info.getValue()

            return (
                <div className={`${user ? 'cursor-pointer' : ''} w-full h-full`}>
                    <CoordinateCell
                        coordinateRow={coordinateRow}
                        field={field}
                        value={value}
                        isEditing={isEditing}
                        onEdit={() => onCoordinateEdit(toCoordinateRow(info.row.original))}
                        onChange={onCoordinateChange}
                        showActions={field === 'longitude' && isEditing}
                        onSave={onCoordinateSave}
                        onCancel={onCoordinateCancel}
                        onMapSelect={onMapSelect}
                    />
                </div>
            )
        }

    const createLocationCell = (field: 'country' | 'region') =>
        (info: any) => {
            const isEditing = !!(info.row.getValue("id") == editedLocationRow?.rowId && user)
            const locationRow = isEditing ? editedLocationRow! : toLocationRow(info.row.original)
            const value = info.getValue()

            return (
                <LocationCell
                    locationRow={locationRow}
                    value={value}
                    countries={countries}
                    regions={regions}
                    isEditing={isEditing}
                    isLoading={field === 'country' ? isCountriesLoading : isRegionsLoading}
                    onEdit={() => onLocationEdit(toLocationRow(info.row.original))}
                    onSave={onLocationSave}
                    onCancel={onLocationCancel}
                    latitude={info.row.original.latitude}
                    longitude={info.row.original.longitude}
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
            cell: info => <Expandable>{info.getValue()}</Expandable>,
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
                        isEditable={isEditing}
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
                        isEditable={isEditing}
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
                    cell: createCoordinateCell('latitude'),
                    header: "Широта",
                    enableGlobalFilter: false,
                    meta: {
                        filterVariant: "geo"
                    },
                    filterFn: geoFilterFn
                }),
                columnHelper.accessor("longitude", {
                    cell: createCoordinateCell('longitude'),
                    header: "Долгота",
                    enableGlobalFilter: false,
                    meta: {
                        filterVariant: "geo"
                    },
                    filterFn: geoFilterFn
                }),
                columnHelper.accessor("country", {
                    cell: createLocationCell('country'),
                    header: "Страна",
                    meta: {
                        filterVariant: "select"
                    },
                    filterFn: selectFilter
                }),
                columnHelper.accessor("region", {
                    cell: createLocationCell('region'),
                    header: "Регион",
                    size: 250,
                    meta: {
                        filterVariant: "select"
                    },
                    filterFn: selectFilter
                }),
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
                    cell: info => {
                        const rowId = info.row.getValue("id") as number;
                        const isEditing = !!user;
                        const value = info.getValue() as string | null;

                        // Формируем опции для институтов из загруженных данных
                        const instituteOptions = [
                            {value: null, label: 'Не указано'},
                            ...(voucherInstitutes || []).map((institute: any) => ({
                                value: institute.id,
                                label: institute.name
                            }))
                        ];

                        // Находим текущее значение по имени института
                        const currentOption = voucherInstitutes?.find((institute: any) => institute.name === value);

                        return (
                            <SelectCell
                                value={currentOption?.id || null}
                                displayValue={value || ''}
                                options={instituteOptions}
                                rowId={rowId}
                                isEditing={isEditing}
                                isEditable={isEditing}
                                onSave={async (rowId, value) => {
                                    await update({
                                        id: rowId,
                                        vouch_inst_id: value
                                    });
                                }}
                                onCancel={() => {
                                }}
                                placeholder="Выберите институт"
                            />
                        );
                    },
                    meta: {
                        filterVariant: "select"
                    },
                    filterFn: selectFilter
                }),
                columnHelper.accessor("voucher_id", {
                    header: "ID",
                    cell: createEditableCell("voucher_id", (value, rowId) => ({id: rowId, vouch_id: value})),
                    meta: {
                        filterVariant: "input"
                    }
                })
            ]
        }),
        columnHelper.accessor("collectors", {
            header: "Коллекторы",
            size: 200,
            cell: info => (
                <CollectorsCell
                    collectors={info.getValue()}
                    user={user}
                    rowId={info.row.getValue("id") as number}
                    onSave={async (collectors) => {
                        // Обновление происходит через новую функцию в компоненте
                    }}
                    onStartEditing={onStartEditing}
                    onStopEditing={onStopEditing}
                    isFieldEditing={isFieldEditing}
                />
            ),
            meta: {
                filterVariant: "multiple-select"
            }
        }),
        columnHelper.accessor("tags", {
            header: "Тэги",
            size: 200,
            cell: info => (
                <TagsCell
                    tags={info.getValue()}
                    user={user}
                    rowId={info.row.getValue("id") as number}
                    onSave={async (tags) => {
                        // Обновление происходит через новую функцию в компоненте
                    }}
                    onStartEditing={onStartEditing}
                    onStopEditing={onStopEditing}
                    isFieldEditing={isFieldEditing}
                />
            ),
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
                        return <Expandable>
                            {formatLastModified(lastModified)}
                        </Expandable>
                    },
                    size: 155,
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

                        const avatars = editUsers.map((user: any, index: number) => {
                            const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim()

                            return (
                                <Tooltip key={user.id || index} title={fullName || 'Пользователь'}>
                                    <Avatar
                                        src={user.avatar || undefined}
                                        size="small"
                                        style={{cursor: 'pointer'}}
                                    >
                                        {!user.avatar && (fullName ? fullName.charAt(0).toUpperCase() : 'П')}
                                    </Avatar>
                                </Tooltip>
                            )
                        })

                        return avatars.length > 0 ? (
                            <Avatar.Group max={{count: 5}}>
                                {avatars}
                            </Avatar.Group>
                        ) : null
                    },
                    size: 120,
                    meta: {
                        filterVariant: "input"
                    }
                })
            ]
        }),

    ]
}
import { createColumnHelper, SortDirection } from "@tanstack/react-table"
import { FormattedBasicView } from "../models"
import { formatDate } from "@/utils/formatDate"
import ExpandableText from "@/app/components/expand-text"
import { Checkbox, Tag } from "antd"
import { SortAscendingOutlined, SortDescendingOutlined } from "@ant-design/icons"

const columnHelper = createColumnHelper<FormattedBasicView>()

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







export const columns = [
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
                cell: info => <ExpandableText>{info.getValue()}</ExpandableText>
            }
            ),
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
                header: "Институт",
                cell: info => <ExpandableText>{info.getValue()}</ExpandableText>
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
        cell: info => <ExpandableText>{info.getValue()}</ExpandableText>
    })



]

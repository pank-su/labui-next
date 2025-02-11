"use client"

import { FloatButton, } from "antd"
import { createClient } from "../../utils/supabase/client"
import { useEffect, useMemo, useRef, useState } from "react";
import { Tables } from "@/src/utils/supabase/gen-types";
import useWindowSize from "@/src/utils/useWindowSize";
import { TableProps, TableColumnType } from "antd/lib";
import { badDateToDate, formatDate } from "@/src/utils/formatDate";
import { CalendarOutlined, MoreOutlined, PlusOutlined, SearchOutlined, VerticalAlignBottomOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"

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


type FormattedBasicView = Tables<"basic_view"> & { key: number | null, date: Dayjs | null };


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



const rowSelection: TableProps<FormattedBasicView>['rowSelection'] = {
    onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    },
    getCheckboxProps: (record) => ({
        name: record.id?.toString(),
    }),
    columnWidth: 30,
}


/**
 * Кнопка для скролла вверх или вниз
 */
function BottomOrTopButton() {

}


/**
 *  Таблица коллекции
 * 
 */
export default function CollectionTable() {
    
    const windowSize = useWindowSize()
    const [loading, setLoading] = useState(true)

    const [data, setData] = useState<FormattedBasicView[] | null>(null)
    const [columns, setColumns] = useState<any>()
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




    return <div className="h-full">

        <FloatButton.Group shape="square" trigger="hover" icon={<MoreOutlined />}>
            <FloatButton icon={<VerticalAlignBottomOutlined />} />
            <FloatButton icon={<PlusOutlined />} />

        </FloatButton.Group>
    </div>
}



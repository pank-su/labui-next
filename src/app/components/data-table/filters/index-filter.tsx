import { Input } from "antd";
import { useEffect, useMemo, useState } from "react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import { parseIndexFilter } from "@/utils/parseIndexFilter";
import {Column} from "@tanstack/react-table";


/**
 * Фильтр индекса
 *
 *
 * @param column колонку которую необходимо фильтровать
 *
 */
export default function IndexFilter({ column }: { column: Column<any, unknown> }) {
    const router = useRouter();
    const pathname = usePathname()

    const searchParams = useSearchParams()
    const columnId = column.id;
    const idValue = searchParams.get(columnId) ?? "";

    const filterValue = column.getFilterValue()
    const minMax = column.getFacetedMinMaxValues()

    const [value, setValue] = useState(idValue)

    // Если максимальное значение обновилось
    useEffect(() => {
        const params = new URLSearchParams(searchParams);

        if (value.trim() === "") {
            column.setFilterValue(undefined)
            params.delete(columnId)
        }else {
            const filter = parseIndexFilter(value, 1, minMax?.[1] ?? 9999)
            column.setFilterValue(filter)
            params.set(columnId, value);
        }
        router.push(pathname + "?" + params.toString());
    }, [minMax?.[1], value])

    // Если фильтр был сброшен, то очищаем поле
    useEffect(() => {
        if (idValue.trim() === "") {
            setValue("")
        }
    }, [idValue])

    return (
        <Input
            placeholder="1,3-5"
            size="small"
            value={value}
            onChange={e => {
                setValue(e.target.value)
            }}
        />
    )
}

import {Column} from "@tanstack/react-table";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {useEffect, useState} from "react";
import {Input} from "antd";

export function InputFilter({column}: { column: Column<any, unknown> }) {
    const router = useRouter();
    const pathname = usePathname()

    const searchParams = useSearchParams()
    const columnId = column.id;
    const idValue = searchParams.get(columnId) ?? "";

    const [value, setValue] = useState(idValue)
    useEffect(() => {
        const params = new URLSearchParams(searchParams);

        if (value.trim() === "") {
            column.setFilterValue(undefined)
            params.delete(columnId)
        } else {
            column.setFilterValue(value)
            params.set(columnId, value);
        }
        router.push(pathname + "?" + params.toString());

    }, [value])

    return (
        <Input value={value} onChange={e => {
            setValue(e.target.value)

        }}/>
    )
}
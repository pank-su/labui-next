import {DependencyList, useEffect, useState} from "react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";


export function useFilterQuery(id: string, setFilter: (value: string) => void, resetFilter: () => void, deps: DependencyList = []) {
    const router = useRouter();
    const pathname = usePathname()

    const searchParams = useSearchParams()

    const queryValue = searchParams.get(id) ?? "";

    const [value, setValue] = useState(queryValue)


    useEffect(() => {
        if (searchParams.has(id, value)) {
            setFilter(value)
            return;
        }
        const params = new URLSearchParams(searchParams);


        if (value.trim() === "") {
            resetFilter()
            params.delete(id)
        } else {
            setFilter(value)
            params.set(id, value);
        }

        if (params.size != 0) router.push(pathname + "?" + params.toString());
        else router.push(pathname)
    }, [...deps, value])

    // Если фильтр был сброшен, то очищаем поле
    useEffect(() => {
        if (queryValue.trim() === "") {
            setValue("")
        }
    }, [queryValue])

    return {
        value,
        setValue
    }
}


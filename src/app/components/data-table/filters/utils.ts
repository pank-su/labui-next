import {DependencyList, useEffect, useState} from "react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";


export function useFilterQuery(id: string, setFilter: (value: string) => void, resetFilter: () => void, deps: DependencyList = []) {
    const router = useRouter();
    const pathname = usePathname()

    const searchParams = useSearchParams()

    const queryValue = searchParams.get(id) ?? "";

    const [value, setValue] = useState<string>(queryValue)


    useEffect(() => {
        if (searchParams.has(id, value)) {
            setFilter(value)
            return;
        }

        const params = new URLSearchParams(searchParams);


        if (value.trim() === "" && value != " ") {
            resetFilter()
            if (!searchParams.has(id)) {
                return;
            }
            params.delete(id)
        } else {
            setFilter(value)
            params.set(id, value);
        }

        if (params.size != 0) router.push(pathname + "?" + params.toString());
        else {
            console.log(id)
            router.push(pathname)
        }
    }, [...deps, value])

    // Если фильтр был сброшен, то очищаем поле
    useEffect(() => {
        console.log(queryValue)
        if (queryValue.trim() === "" && queryValue != " ") {
            setValue("")
        }
    }, [queryValue])

    return {
        value,
        setValue
    }
}


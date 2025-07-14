import {DependencyList, useEffect, useState} from "react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";

/**
 * Упрощение для создания фильтров с query
 *
 * @param id используется для определения в query
 * @param setFilter установка фильтра
 * @param resetFilter сброс фильтра
 * @param isInvalid дополнительные фильтры для проверки корректного ввода
 * @param deps дополнительные зависимости
 */
export function useFilterQuery(id: string, setFilter: (value: string) => void, resetFilter: () => void, deps: DependencyList = [], isInvalid: (value: string) => boolean = (_) => true) {
    const router = useRouter();
    const pathname = usePathname()

    const searchParams = useSearchParams()

    const queryValue = searchParams.get(id) ?? "";

    const [value, setValue] = useState<string>(queryValue)

    const [debouncedValue, setDebouncedValue] = useState<string>(queryValue);

    // Эффект для debounce: обновляет debouncedValue через 0.5с после изменения inputValue
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, 700); // 0.7 секунды

        // Очистка таймера, если value изменился до истечения 0.5с
        return () => {
            clearTimeout(handler);
        };
    }, [value]);

    useEffect(() => {

        const params = new URLSearchParams(searchParams);


        if (value.trim() === "" && isInvalid(debouncedValue)) {
            //resetFilter()
            if (!searchParams.has(id)) {
                return;
            }
            params.delete(id)
        } else {
            //setFilter(debouncedValue)
            params.set(id, debouncedValue);
        }

        if (params.size != 0) router.push(pathname + "?" + params.toString());
        else {
            router.replace(pathname)
        }
    }, [...deps, debouncedValue])

    // Если фильтр был сброшен, то очищаем поле
    useEffect(() => {
        setValue(queryValue)
    }, [queryValue])

    return {
        value,
        setValue
    }
}




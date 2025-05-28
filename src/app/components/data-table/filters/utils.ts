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
        if (searchParams.has(id, debouncedValue)) {
            setFilter(debouncedValue)
            return;
        }

        const params = new URLSearchParams(searchParams);


        if (value.trim() === "" && isInvalid(debouncedValue)) {
            resetFilter()
            if (!searchParams.has(id)) {
                return;
            }
            params.delete(id)
        } else {
            setFilter(debouncedValue)
            params.set(id, debouncedValue);
        }

        if (params.size != 0) router.push(pathname + "?" + params.toString());
        else {
            router.replace(pathname)
        }
    }, [...deps, debouncedValue])

    // Если фильтр был сброшен, то очищаем поле
    useEffect(() => {
        if (queryValue.trim() === "" && isInvalid(queryValue)) {
            setValue("")
        }
    }, [queryValue])

    return {
        value,
        setValue
    }
}


export type ParsedDate =
    | { year: number; month?: undefined; day?: undefined }
    | { year: number; month: number; day?: undefined }
    | { year: number; month: number; day: number };

export function parseDate(dateStr: string): ParsedDate | null {
    // Полный формат dd.mm.yyyy
    const fullRe = /^(?<day>\d{2})\.(?<month>\d{2})\.(?<year>\d{4})$/;
    // mm.yyyy
    const mYRe = /^(?<month>\d{2})\.(?<year>\d{4})$/;
    // yyyy
    const yRe = /^(?<year>\d{4})$/;

    let m: RegExpExecArray | null;

    if (m = fullRe.exec(dateStr)) {
        const day = Number(m.groups!.day);
        const month = Number(m.groups!.month);
        const year = Number(m.groups!.year);
        if (month < 1 || month > 12 || day < 1 || day > 31) {
            throw new Error(`Некорректная дата: "${dateStr}"`);
        }
        return {year, month, day};
    }

    if (m = mYRe.exec(dateStr)) {
        const month = Number(m.groups!.month);
        const year = Number(m.groups!.year);
        if (month < 1 || month > 12) {
            throw new Error(`Некорректный месяц: "${dateStr}"`);
        }
        return {year, month};
    }

    if (m = yRe.exec(dateStr)) {
        const year = Number(m.groups!.year);
        return {year};
    }

    return null;
}


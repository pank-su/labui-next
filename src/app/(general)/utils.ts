import {ParsedDate} from "@/utils/date";

export interface DateFilterConfig {
    yearComparison: "gt" | "lt"; // 'gt' для fromDate, 'lt' для toDate
    monthComparison: "gt" | "lt"; // 'gt' для fromDate, 'lt' для toDate
    dayComparison: "gte" | "lte"; // 'gte' для fromDate, 'lte' для toDate
}

/**
 * Строит строку фильтра для PostgREST на основе разобранной даты и конфигурации сравнения.
 * @param dateParts Разобранная дата (год, месяц, день).
 * @param config Операторы сравнения для года, месяца и дня.
 * @returns Строка фильтра для метода .or() в Supabase.
 */
export function buildDateFilterString(
    dateParts: ParsedDate,
    config: DateFilterConfig
): string {
    const {year, month, day} = dateParts;
    const orConditions: string[] = [];

    // Условие 1: Год строго больше/меньше указанного в фильтре
    // Пример: для fromDate '10.2003', это будет 'year.gt.2003'
    orConditions.push(`year.${config.yearComparison}.${year}`);

    // Условие 2: Год равен указанному в фильтре, дальнейшие проверки по месяцу/дню
    if (month === undefined) {
        // Если в фильтре указан только год (например, fromDate = "2003")
        // то нам также нужны записи, где год равен этому году.
        // Вместе с предыдущим условием это дает (year > YYYY) OR (year = YYYY)
        orConditions.push(`year.eq.${year}`);
    } else {
        // Если указан месяц (и, возможно, день)
        const monthDayConditions: string[] = [];

        // Условие 2а: Год равен, месяц строго больше/меньше указанного в фильтре
        // Пример: для fromDate '11.10.2003', это будет 'month.gt.10'
        monthDayConditions.push(`month.${config.monthComparison}.${month}`);

        if (day === undefined) {
            // Если в фильтре указан только год и месяц (например, fromDate = "10.2003")
            // то нам также нужны записи, где год и месяц равны указанным.
            monthDayConditions.push(`month.eq.${month}`);
        } else {
            // Если указан полный день (например, fromDate = "11.10.2003")
            // Условие 2б: Год равен, месяц равен, день больше/равен (или меньше/равен) указанному
            monthDayConditions.push(
                `and(month.eq.${month},day.not.is.null,day.${config.dayComparison}.${day})`
            );
        }

        // Собираем условия для случая, когда год равен:
        // year = YYYY AND month IS NOT NULL AND ( (month > MM) OR (month = MM AND day >= DD) )
        orConditions.push(
            `and(year.eq.${year},month.not.is.null,or(${monthDayConditions.join(",")}))`
        );
    }

    return orConditions.join(",");
}


// Скачивание csv файла
export const downloadCSV = (csvString: string, filename: string) => {
    // Создаем Blob с CSV данными
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });

    // Создаем URL для blob
    const url = URL.createObjectURL(blob);

    // Создаем временную ссылку для скачивания
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";

    // Добавляем в DOM, кликаем и удаляем
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Освобождаем память
    URL.revokeObjectURL(url);
};
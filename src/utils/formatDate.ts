/**
 * Форматирует дату из отдельных nullable полей
 * @param year Год
 * @param month Месяц
 * @param day День
 * @returns Отформатированная строка даты или '' если все поля null
 */
export function formatDate(year: number | null, month: number | null, day: number | null): string {
    const parts: string[] = [];

    if (day !== null) {
        parts.push(day.toString().padStart(2, '0'));
    }
    if (month !== null) {
        parts.push(month.toString().padStart(2, '0'));
    }
    if (year !== null) {
        parts.push(year.toString());
    }

    return parts.length > 0 ? parts.join('.') : '';
};


export function badDateToDate(year: number | null, month: number | null, day: number | null): Date | null {
    if (year === null) {
        return null;
    }

    if (month === null) {
        return new Date(year, 0);
    }
    if (day === null) {
        return new Date(year, month - 1);
    }
    return new Date(year, month - 1, day);
}
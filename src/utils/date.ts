/**
 * Форматирует дату из отдельных nullable полей
 * @param year Год
 * @param month Месяц
 * @param day День
 * @returns Отформатированная строка даты или '' если все поля null
 */
export function date(year: number | null, month: number | null, day: number | null): string {
    const parts: string[] = [];

    if (day) {
        parts.push(day.toString().padStart(2, '0'));
    }
    if (month) {
        parts.push(month.toString().padStart(2, '0'));
    }
    if (year) {
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

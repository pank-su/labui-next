/**
 * Парсит строку с номерами (и диапазонами) страниц в формате:
 *    - "1,2,3-5,10-12"
 *    - "3-"      -> от 3 до maxPage
 *    - "-5"      -> от minPage до 5
 *    - "-"       -> от minPage до maxPage
 * и возвращает отсортированный массив уникальных номеров.
 *
 * @param input    Строка с фильтром, например: "3-, -5, 10-12"
 * @param minPage  Минимально возможный номер (по умолчанию 1)
 * @param maxPage  Максимально возможный номер (нужно передавать извне)
 * @returns        Отсортированный массив уникальных номеров
 */
export function parseIndexFilter(
    input: string,
    minPage: number = 1,
    maxPage: number
): number[] {
    // Убираем все пробелы
    const sanitizedInput = input.replace(/\s+/g, '');

    // Массив для сбора всех номеров страниц
    const pages: number[] = [];

    // Разделяем строку по запятым
    const parts = sanitizedInput.split(',');

    for (const part of parts) {
        // Проверяем, не является ли часть диапазоном (например "3-10" или "3-" или "-5" или просто "-")
        if (part.includes('-')) {
            const [startStr, endStr] = part.split('-');

            // Парсим начало
            let start = parseInt(startStr);
            if (Number.isNaN(start)) {
                // Если startStr пустая строка (или что-то непонятное), берём minPage
                start = minPage;
            }

            // Парсим конец
            let end = parseInt(endStr);
            if (Number.isNaN(end)) {
                // Если endStr пустая строка, берём maxPage
                end = maxPage;
            }

            // Убедимся, что start <= end (в противном случае — пропускаем)
            if (start <= end) {
                for (let i = start; i <= end; i++) {
                    pages.push(i);
                }
            }
        } else {
            // Иначе это одиночная страница, если она валидна — добавляем
            const page = parseInt(part);
            if (!Number.isNaN(page) && page >= minPage && page <= maxPage) {
                pages.push(page);
            }
        }
    }

    // Убираем дубликаты и сортируем по возрастанию
    return Array.from(new Set(pages)).sort((a, b) => a - b);
}

export function parseIndexFilterToSupabaseFilter(input: string, fieldName: string = "id"){
    const sanitizedInput = input.replace(/\s+/g, '');
    const parts = sanitizedInput.split(',');

    const rez: string[] = []


    for (const part of parts) {
        // Проверяем, не является ли часть диапазоном (например "3-10" или "3-" или "-5" или просто "-")
        if (part.includes('-')) {
            const [startStr, endStr] = part.split('-');
            let cond = "";

            let start = parseInt(startStr);
            let end = parseInt(endStr);

            const hasStart = !Number.isNaN(start);
            const hasEnd = !Number.isNaN(end);

            if (hasStart && hasEnd) {
                cond = `and(${fieldName}.gte.${start},${fieldName}.lte.${end})`;
            } else if (hasStart) {
                cond = `${fieldName}.gte.${start}`;
            } else if (hasEnd) {
                cond = `${fieldName}.lte.${end}`;
            }

            if (cond !== "") {
                rez.push(cond);
            }

        } else {
            // Иначе это одиночная страница, если она валидна — добавляем
            const page = parseInt(part);
            if (!Number.isNaN(page)) {
                rez.push(`${fieldName}.eq.${page}`);
            }
        }
    }

    return `${rez.join(',')}`;

}

/**
 * Преобразует массив ID в компактную строку с диапазонами
 * Например: [1,2,3,5,6,7,10] -> "1-3,5-7,10"
 */
export function compressIdsToRanges(ids: number[]): string {
    if (ids.length === 0) return '';
    
    // Сортируем и убираем дубликаты
    const sortedIds = Array.from(new Set(ids)).sort((a, b) => a - b);
    
    const ranges: string[] = [];
    let start = sortedIds[0];
    let end = sortedIds[0];
    
    for (let i = 1; i < sortedIds.length; i++) {
        const currentId = sortedIds[i];
        
        // Если текущий ID следующий по порядку, продолжаем диапазон
        if (currentId === end + 1) {
            end = currentId;
        } else {
            // Заканчиваем текущий диапазон и начинаем новый
            if (start === end) {
                ranges.push(start.toString());
            } else {
                ranges.push(`${start}-${end}`);
            }
            start = currentId;
            end = currentId;
        }
    }
    
    // Добавляем последний диапазон
    if (start === end) {
        ranges.push(start.toString());
    } else {
        ranges.push(`${start}-${end}`);
    }
    
    return ranges.join(',');
}
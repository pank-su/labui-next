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
        let start = parseInt(startStr, 10);
        if (Number.isNaN(start)) {
          // Если startStr пустая строка (или что-то непонятное), берём minPage
          start = minPage;
        }
  
        // Парсим конец
        let end = parseInt(endStr, 10);
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
        const page = parseInt(part, 10);
        if (!Number.isNaN(page) && page >= minPage && page <= maxPage) {
          pages.push(page);
        }
      }
    }
  
    // Убираем дубликаты и сортируем по возрастанию
    const uniqueSortedPages = Array.from(new Set(pages)).sort((a, b) => a - b);
  
    return uniqueSortedPages;
  }
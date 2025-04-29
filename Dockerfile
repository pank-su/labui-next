# Stage 1: Сборка приложения
FROM oven/bun:latest AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы зависимостей (убедитесь, что bun.lockb находится рядом с package.json)
COPY package.json bun.lock ./

# Устанавливаем зависимости через bun
RUN bun install

# Копируем исходный код приложения
COPY . .

# Собираем приложение Next.js (команда "next build" должна быть прописана в package.json)
RUN bun run build


# Stage 2: Финальный образ для продакшена
FROM oven/bun:latest

WORKDIR /app

# Копируем собранное приложение из предыдущего этапа
COPY --from=builder /app ./

# Открываем порт 3000 (по умолчанию Next.js использует этот порт)
EXPOSE 3000

# Запускаем приложение
CMD ["bun", "run", "start"]

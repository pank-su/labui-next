# LabUI Next

Современный интерфейс для Лаборатории Геномики и Палеогеномики ЗИН РАН

## Обзор

LabUI Next - это веб-интерфейс нового поколения, построенный на Next.js, специально разработанный для Лаборатории Геномики и Палеогеномики Зоологического института Российской академии наук (ЗИН РАН).

## Технологии

- Next.js
- React
- TypeScript
- Bun

## Начало работы

### 1. Клонирование

```bash
git clone https://github.com/pank-su/labui-next
cd labui-next
```

### 2.1 Docker

```sh
docker build . -t labui-next
docker run -p 3000:3000 -d labui-next
```

### 2.2 Нативно

```sh
bun install
bun run start
```

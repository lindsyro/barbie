# 🦢 GOOSE Fashion House

Интернет-магазин электронных PDF-выкроек одежды для кукол

## 🚀 Быстрый запуск проекта одной командой

В корневой директории проекта выполните:

```bash
# Запуск и бэкенда (порт 3001), и фронтенда (порт 5173) одновременно:
npm run dev
```

(или `npm start`).

- **Фронтенд (Vite + React)**: [http://localhost:5173/barbie/](http://localhost:5173/barbie/)
- **Бэкенд (Express + PostgreSQL)**: [http://localhost:3001](http://localhost:3001)
- Логи обоих серверов выводятся в одну консоль с цветными префиксами `[backend]` и `[frontend]`.
- Остановка обоих серверов: `Ctrl + C`.

---

## 🛠 Полезные команды из корня

| Команда | Описание |
|---|---|
| `npm run dev` | Запуск бэкенда и фронтенда параллельно |
| `npm run dev:frontend` | Запуск только фронтенда (Vite) |
| `npm run dev:backend` | Запуск только бэкенда (Express с автоперезагрузкой) |
| `npm run build` | Продакшн-сборка фронтенда |
| `npm run lint` | Проверка кода линтером (`oxlint`) |
| `npm run install:all` | Установка зависимостей в корне, бэкенде и фронтенде |
| `npm run db:migrate` | Применение миграций Prisma к базе данных PostgreSQL |
| `npm run db:seed` | Наполнение базы данных начальными данными |
| `npm run db:studio` | Запуск графического веб-клиента к БД (Prisma Studio) |

---

## 📁 Структура проекта

- **`frontend/`** — клиентская часть на React 19, TypeScript, Vite.
- **`backend/`** — серверная часть на Express 5, Prisma ORM, PostgreSQL.

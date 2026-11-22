# GOOSE Fashion House

Интернет-магазин электронных PDF-выкроек одежды для кукол.

## Технологический стек

### Frontend
- React 19
- TypeScript
- Vite 8
- Oxlint (быстрый линтер на Rust)
- Кастомные стили (Vanilla CSS с дизайн-системой на CSS Variables)
- Hash-навигация и адаптивная вёрстка (Desktop, Tablet, Mobile Drawer)

### Backend
- Node.js (ES Modules, режим разработки с встроенным `node --watch`)
- Express 5
- Prisma ORM 6
- SQLite (`prisma/dev.db`)
- Авторизация: кастомная сессионная авторизация по токенам (scrypt + salt)
- CORS, dotenv

### CI/CD и инфраструктура
- GitHub Actions: автоматизированная сборка и деплой статической версии на GitHub Pages
- Concurrently 9: параллельный запуск сервисов одной командой из корня

## Быстрый запуск

### 1. Установка зависимостей

Установка зависимостей одновременно для корня, бэкенда и фронтенда:

```bash
npm run install:all
```

### 2. Запуск в режиме разработки

Запуск бэкенда (порт 3001) и фронтенда (порт 5173) одной командой:

```bash
npm run dev
```

(или `npm start`).

Логи обоих процессов выводятся в одну консоль с префиксами `[backend]` и `[frontend]`.

### Адреса сервисов
- Фронтенд (Vite): [http://localhost:5173/barbie/](http://localhost:5173/barbie/)
- API бэкенда (Express): [http://localhost:3001](http://localhost:3001)
- Проверка здоровья API: [http://localhost:3001/api/health](http://localhost:3001/api/health)

Остановка серверов: комбинация клавиш `Ctrl + C`.

## Команды проекта

Все основные команды выполняются из корневой директории:

| Команда | Описание |
|---|---|
| `npm run dev` | Одновременный запуск бэкенда и фронтенда в режиме разработки |
| `npm run dev:frontend` | Запуск только фронтенд-сервера (Vite) |
| `npm run dev:backend` | Запуск только бэкенд-сервера (Node.js с `--watch`) |
| `npm run build` | Продакшн-сборка фронтенда (`tsc -b && vite build`) |
| `npm run lint` | Проверка кода линтером (`oxlint`) |
| `npm run install:all` | Установка зависимостей в корне, в `backend/` и в `frontend/` |
| `npm run db:migrate` | Применение миграций Prisma к базе данных SQLite |
| `npm run db:seed` | Наполнение базы данных тестовыми данными (куклы, категории, выкройки, отзывы, меню) |
| `npm run db:studio` | Запуск веб-интерфейса Prisma Studio для просмотра и редактирования БД |
| `npm run db:export-seed` | Экспорт текущих данных из базы SQLite обратно в файл сидов `seed.js` |
| `npm run db:backup` | Создание снимка базы данных в папку `backend/prisma/backups/` |
| `npm run db:restore` | Восстановление базы данных из последнего снимка (`latest.db`) |

## Структура проекта

```text
barbie/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Workflow сборки и деплоя фронтенда на GitHub Pages
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Схема моделей Prisma (SQLite)
│   │   ├── migrations/         # История SQL-миграций
│   │   ├── seed.js             # Начальные данные для базы
│   │   ├── export-seed.js      # Скрипт экспорта данных из SQLite в seed.js
│   │   ├── backup.js           # Утилита создания и восстановления бэкапов базы
│   │   └── dev.db              # База данных SQLite
│   ├── src/
│   │   ├── middleware/         # Middleware авторизации
│   │   ├── routes/             # Маршруты API (auth, patterns, dolls, cart, wishlist, orders, reviews, menu)
│   │   └── db.js               # Клиент Prisma ORM
│   ├── index.js                # Точка входа Express-сервера
│   └── package.json            # Зависимости и скрипты бэкенда
├── frontend/
│   ├── src/
│   │   ├── api/                # API-клиенты для взаимодействия с бэкендом
│   │   ├── components/         # React-компоненты (Header, Menu, Footer, модальные окна, карточки)
│   │   ├── hooks/              # Пользовательские хуки (useAsyncData и др.)
│   │   ├── pages/              # Страницы приложения (Catalog, ChooseDoll, Cart, Wishlist, Account)
│   │   ├── router/             # Маршрутизатор приложения
│   │   └── types/              # TypeScript-интерфейсы и типы
│   ├── vite.config.ts          # Конфигурация сборщика Vite
│   └── package.json            # Зависимости и скрипты фронтенда
├── package.json                # Корневой package.json для координации проекта
└── README.md                   # Документация проекта
```

## Работа с базой данных

База данных работает на SQLite под управлением Prisma ORM.

1. **Создание и применение миграций:**
   ```bash
   npm run db:migrate
   ```

2. **Заполнение начальными данными:**
   ```bash
   npm run db:seed
   ```

3. **Просмотр через веб-интерфейс:**
   ```bash
   npm run db:studio
   ```

4. **Резервное копирование и восстановление:**
   - Создать бэкап: `npm run db:backup`
   - Восстановить из `latest.db`: `npm run db:restore`

## Деплой

Фронтенд автоматически развёртывается на GitHub Pages при каждом пуше в ветку `main` с помощью workflow `.github/workflows/deploy.yml`. Процесс разбит на два независимых шага (сборка `build` и публикация `deploy`), что гарантирует надёжность выгрузки артефактов.

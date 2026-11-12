# GOOSE Fashion House — Backend API (Express + PostgreSQL + Prisma)

Бэкенд-сервер для интернет-магазина PDF-выкроек одежды для кукол GOOSE Fashion House.

## Стек технологий
- **Node.js** (ES Modules, `node:crypto`)
- **Express 5** — веб-фреймворк
- **PostgreSQL** — реляционная база данных (база `goose`)
- **Prisma ORM** — схема данных, миграции и типобезопасный клиент к БД
- **CORS** — поддержка междоменных запросов (от фронтенда на Vite)

---

## Настройка и запуск

### 1. Переменные окружения (`.env`)
В файле `backend/.env` указана строка подключения к базе данных:
```env
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DATABASE_URL="postgresql://postgres:password@localhost:5432/goose"
```

### 2. Миграции и наполнение базы (Seed)
```bash
cd backend

# Применить миграции к PostgreSQL:
npm run db:migrate

# Запустить сидирование (добавление выкроек, категорий, отзывов, демо-пользователя):
npm run seed

# Открыть визуальный веб-интерфейс к базе данных (Prisma Studio):
npm run db:studio
```

### 3. Запуск сервера
```bash
# Запуск в режиме разработки (с автоперезагрузкой при изменении файлов)
npm run dev

# Либо обычный продакшн запуск
npm start
```

Сервер запускается по адресу: **`http://localhost:3001`**

---

## Список эндпоинтов

### Базовые
- `GET /` — сводка API и список всех маршрутов
- `GET /api/health` — проверка статуса сервера и подключения к PostgreSQL (`database: "connected"`)

### Авторизация (`/api/auth`)
- `POST /api/auth/register` — регистрация (`{ name, email, password }`)
- `POST /api/auth/login` — вход (`{ email, password }`)
  - Демо-аккаунт: `demo@goose.ru` / `password123`
- `GET /api/auth/me` — профиль текущего пользователя (`Authorization: Bearer <token>`)
- `POST /api/auth/logout` — выход из системы (удаление сессии из БД)

### Каталог выкроек (`/api/patterns`)
- `GET /api/patterns` — список всех выкроек из PostgreSQL. Параметры:
  - `?category=barbie-std` — фильтр по категории
  - `?scale=1/6` — фильтр по масштабу (1/6, 1/4, kids)
  - `?doll=барби` — фильтр по кукле
  - `?q=боди` — полнотекстовый поиск по названию и описанию
  - `?featured=true` — только хиты продаж
  - `?sort=price_asc|price_desc|rating_desc|newest` — сортировка
- `GET /api/patterns/featured` — популярные выкройки
- `GET /api/patterns/:id` — карточка выкройки по ID

### Категории (`/api/categories`)
- `GET /api/categories` — список категорий с подсчетом количества выкроек

### Корзина (`/api/cart`)
> **Примечание**: Так как выкройки являются цифровыми PDF-товарами, каждый товар хранится в одном экземпляре (количество не увеличивается).
- `GET /api/cart` — содержимое корзины с подсчетом общей суммы
- `POST /api/cart` — добавление выкройки (`{ patternId: 1 }`). Повторный вызов возвращает `alreadyInCart: true`
- `DELETE /api/cart/:patternId` — удаление выкройки из корзины
- `DELETE /api/cart` — очистка корзины

### Избранное (`/api/wishlist`)
- `GET /api/wishlist` — список избранных выкроек
- `POST /api/wishlist/toggle` — добавить/удалить из избранного (`{ patternId: 1 }`)
- `DELETE /api/wishlist/:patternId` — удаление из избранного

### Заказы (`/api/orders`)
- `POST /api/orders` — создание заказа из текущей корзины (требуется авторизация). Очищает корзину и сохраняет заказ в PostgreSQL
- `GET /api/orders` — список заказов пользователя со ссылками на скачивание PDF

### Отзывы и подписка
- `GET /api/reviews` — список отзывов
- `POST /api/reviews` — добавление отзыва (`{ author, doll, patternTitle, rating, text }`)
- `POST /api/subscribe` — подписка на email-рассылку со скидочным промокодом `GOOSE10`

# GOOSE Fashion House — Backend API (Express)

Бэкенд-сервер для интернет-магазина PDF-выкроек одежды для кукол GOOSE Fashion House.

## Стек технологий
- **Node.js** (ES Modules, `node:crypto`)
- **Express 5** — веб-фреймворк
- **CORS** — поддержка междоменных запросов (от фронтенда на Vite)

---

## Быстрый запуск

```bash
# 1. Перейдите в папку backend
cd backend

# 2. Установите зависимости (если еще не установлены)
npm install

# 3. Запустите в режиме разработки (с автоперезагрузкой)
npm run dev

# Либо обычный запуск
npm start
```

Сервер запустится по адресу: `http://localhost:3001`

---

## Список эндпоинтов

### Базовые
- `GET /` — краткая информация о сервере и доступных маршрутах
- `GET /api/health` — проверка статуса сервера (uptime, timestamp)

### Авторизация (`/api/auth`)
- `POST /api/auth/register` — регистрация (`{ name, email, password }`)
- `POST /api/auth/login` — вход (`{ email, password }`)
  - Демо-аккаунт: `demo@goose.ru` / `password123`
- `GET /api/auth/me` — профиль текущего пользователя (`Authorization: Bearer <token>`)
- `POST /api/auth/logout` — выход из системы

### Каталог выкроек (`/api/patterns`)
- `GET /api/patterns` — список всех выкроек. Поддерживает query-параметры:
  - `?category=barbie-std` — фильтр по категории
  - `?scale=1/6` — фильтр по масштабу (1/6, 1/4, kids)
  - `?doll=барби` — фильтр по кукле
  - `?q=боди` — поиск по названию и описанию
  - `?featured=true` — только хиты продаж
  - `?sort=price_asc|price_desc|rating_desc|newest` — сортировка
- `GET /api/patterns/featured` — популярные выкройки
- `GET /api/patterns/:id` — карточка выкройки по ID

### Категории (`/api/categories`)
- `GET /api/categories` — список категорий с подсчетом количества выкроек

### Корзина (`/api/cart`)
> **Примечание**: Так как выкройки являются цифровыми PDF-товарами, каждый товар приобретается в одном экземпляре (количество не увеличивается).
- `GET /api/cart` — содержимое корзины с подсчетом общей суммы
- `POST /api/cart` — добавление выкройки (`{ patternId: 1 }`). Если товар уже в корзине, сервер сообщает `alreadyInCart: true`
- `DELETE /api/cart/:patternId` — удаление выкройки из корзины
- `DELETE /api/cart` — очистка корзины

### Избранное (`/api/wishlist`)
- `GET /api/wishlist` — список избранных выкроек
- `POST /api/wishlist/toggle` — добавить/удалить из избранного (`{ patternId: 1 }`)
- `DELETE /api/wishlist/:patternId` — удаление из избранного

### Заказы (`/api/orders`)
- `POST /api/orders` — создание заказа из текущей корзины (требуется авторизация)
- `GET /api/orders` — список заказов пользователя

### Отзывы и подписка
- `GET /api/reviews` — список отзывов
- `POST /api/reviews` — добавление отзыва (`{ author, doll, patternTitle, rating, text }`)
- `POST /api/subscribe` — подписка на email-рассылку со скидкой (`{ email }`)

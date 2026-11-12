/**
 * Модуль взаимодействия с API авторизации (PostgreSQL Backend)
 */

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiErrorResponse {
  error?: string;
  message?: string;
}

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3001"
    : "");

const TOKEN_KEY = "goose_token";
const USER_KEY = "goose_user";

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export function removeStoredToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User): void {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // ignore
  }
}

export function removeStoredUser(): void {
  try {
    localStorage.removeItem(USER_KEY);
  } catch {
    // ignore
  }
}

/**
 * Вход пользователя по email и паролю
 */
export async function loginUser(credentials: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const data: AuthResponse & ApiErrorResponse = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Неверный email или пароль");
  }

  if (data.token && data.user) {
    setStoredToken(data.token);
    setStoredUser(data.user);
  }

  return data;
}

/**
 * Регистрация нового пользователя
 */
export async function registerUser(userData: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data: AuthResponse & ApiErrorResponse = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Ошибка при регистрации");
  }

  if (data.token && data.user) {
    setStoredToken(data.token);
    setStoredUser(data.user);
  }

  return data;
}

/**
 * Проверка текущей сессии пользователя через PostgreSQL
 */
export async function fetchCurrentUser(): Promise<User | null> {
  const token = getStoredToken();
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE}/api/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // Токен невалиден или сессия истекла
      removeStoredToken();
      removeStoredUser();
      return null;
    }

    const data: { user: User } = await response.json();
    if (data.user) {
      setStoredUser(data.user);
      return data.user;
    }

    return null;
  } catch {
    // Если сервер временно недоступен, возвращаем локально сохраненного пользователя
    return getStoredUser();
  }
}

/**
 * Выход из системы с удалением сессии в PostgreSQL
 */
export async function logoutUser(): Promise<void> {
  const token = getStoredToken();
  if (token) {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // ignore
    }
  }

  removeStoredToken();
  removeStoredUser();
}

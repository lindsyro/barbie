/**
 * Модуль взаимодействия с API авторизации (PostgreSQL Backend + Graceful Fallback)
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

function isStaticHosting(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.hostname.endsWith("github.io") || window.location.protocol === "file:";
}

function fallbackLogin(credentials: { email: string; password: string }): AuthResponse {
  const email = credentials.email.trim();
  const name = email === "demo@goose.ru" ? "Ирина" : email.split("@")[0];
  const user: User = {
    id: `demo-user-${Date.now()}`,
    email,
    name,
    createdAt: new Date().toISOString(),
  };
  const token = `demo-token-${Date.now()}`;
  setStoredToken(token);
  setStoredUser(user);
  return {
    message: "Вход выполнен успешно",
    token,
    user,
  };
}

function fallbackRegister(userData: { name: string; email: string; password: string }): AuthResponse {
  const user: User = {
    id: `user-${Date.now()}`,
    email: userData.email.trim(),
    name: userData.name.trim(),
    createdAt: new Date().toISOString(),
  };
  const token = `token-${Date.now()}`;
  setStoredToken(token);
  setStoredUser(user);
  return {
    message: "Регистрация прошла успешно",
    token,
    user,
  };
}

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
  // Если сайт на GitHub Pages и внешний бэкенд не настроен — сразу используем клиентский режим
  if (isStaticHosting() && !import.meta.env.VITE_API_URL) {
    return fallbackLogin(credentials);
  }

  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    // 405 Method Not Allowed означает, что статический сервер (GitHub Pages) не поддерживает POST
    if (response.status === 405) {
      return fallbackLogin(credentials);
    }

    const data: AuthResponse & ApiErrorResponse = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Неверный email или пароль");
    }

    if (data.token && data.user) {
      setStoredToken(data.token);
      setStoredUser(data.user);
    }

    return data;
  } catch (err) {
    if (isStaticHosting()) {
      return fallbackLogin(credentials);
    }
    throw err;
  }
}

/**
 * Регистрация нового пользователя
 */
export async function registerUser(userData: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  // Если сайт на GitHub Pages и внешний бэкенд не настроен — сразу используем клиентский режим
  if (isStaticHosting() && !import.meta.env.VITE_API_URL) {
    return fallbackRegister(userData);
  }

  try {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (response.status === 405) {
      return fallbackRegister(userData);
    }

    const data: AuthResponse & ApiErrorResponse = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Ошибка при регистрации");
    }

    if (data.token && data.user) {
      setStoredToken(data.token);
      setStoredUser(data.user);
    }

    return data;
  } catch (err) {
    if (isStaticHosting()) {
      return fallbackRegister(userData);
    }
    throw err;
  }
}

/**
 * Проверка текущей сессии пользователя
 */
export async function fetchCurrentUser(): Promise<User | null> {
  const token = getStoredToken();
  if (!token) {
    return null;
  }

  // На GitHub Pages без внешнего бэкенда возвращаем сохраненного пользователя
  if (isStaticHosting() && !import.meta.env.VITE_API_URL) {
    return getStoredUser();
  }

  try {
    const response = await fetch(`${API_BASE}/api/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 405) {
      return getStoredUser();
    }

    if (!response.ok) {
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
    return getStoredUser();
  }
}

/**
 * Выход из системы
 */
export async function logoutUser(): Promise<void> {
  const token = getStoredToken();
  if (token && !isStaticHosting()) {
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

import React from "react";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs.tsx";
import { PagePlaceholder } from "../../components/PagePlaceholder/PagePlaceholder.tsx";
import "../pages.css";

export interface AccountProps {
  onBackToMain?: () => void;
  user?: { email: string; name?: string } | null;
  onLogout?: () => void;
  onOpenLogin?: () => void;
}

export const Account: React.FC<AccountProps> = ({
  onBackToMain,
  user,
  onLogout,
  onOpenLogin,
}) => {
  return (
    <div className="page-container">
      {/* Хлебные крошки */}
      <Breadcrumbs current="Личный кабинет" onBackToMain={onBackToMain} />

      {/* Заголовок страницы */}
      <div className="page-header">
        <span className="page-header__subtitle">
          {user ? `Добро пожаловать, ${user.name || user.email}` : "Персональный раздел"}
        </span>
        <h1 className="page-header__title">Личный кабинет</h1>
        <div className="page-header__line" />
      </div>

      {/* Содержимое страницы */}
      {user ? (
        <div className="page-placeholder">
          <div className="page-placeholder__icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="page-placeholder__title">Вы авторизованы</h2>
          <p className="page-placeholder__desc">
            Аккаунт: <strong>{user.email}</strong>. Разделы заказов и файлов выкроек готовятся к запуску.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
            <a href="#main" onClick={onBackToMain} className="page-placeholder__btn">
              ← На главную
            </a>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="page-placeholder__btn"
                style={{ backgroundColor: "var(--color-chocolate)" }}
              >
                Выйти из аккаунта
              </button>
            )}
          </div>
        </div>
      ) : (
        <PagePlaceholder
          icon={
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
          title="Вход не выполнен"
          description="Войдите или зарегистрируйтесь, чтобы получить доступ к купленным выкройкам и персональным бонусам."
          buttonText="Войти в аккаунт"
          onButtonClick={onOpenLogin}
        />
      )}
    </div>
  );
};

export default Account;

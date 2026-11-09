import React from "react";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs.tsx";
import { PagePlaceholder } from "../../components/PagePlaceholder/PagePlaceholder.tsx";
import "../pages.css";

export interface AccountProps {
  onBackToMain?: () => void;
}

export const Account: React.FC<AccountProps> = ({ onBackToMain }) => {
  return (
    <div className="page-container">
      {/* Хлебные крошки */}
      <Breadcrumbs current="Личный кабинет" onBackToMain={onBackToMain} />

      {/* Заголовок страницы */}
      <div className="page-header">
        <span className="page-header__subtitle">Персональный раздел</span>
        <h1 className="page-header__title">Личный кабинет</h1>
        <div className="page-header__line" />
      </div>

      {/* Заглушка страницы */}
      <PagePlaceholder
        icon={
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
        title="Личный кабинет в разработке"
        description="Здесь будут доступны купленные PDF-выкройки, история заказов, ссылки на скачивание лекал и персональные накопительные скидки."
        onButtonClick={onBackToMain}
      />
    </div>
  );
};

export default Account;

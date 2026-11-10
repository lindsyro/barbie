import React from "react";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs.tsx";
import { PagePlaceholder } from "../../components/PagePlaceholder/PagePlaceholder.tsx";
import "../pages.css";

export interface ShoppingTermsProps {
  onBackToMain?: () => void;
}

export const ShoppingTerms: React.FC<ShoppingTermsProps> = ({ onBackToMain }) => {
  return (
    <div className="page-container">
      {/* Хлебные крошки */}
      <Breadcrumbs current="Условия покупки" onBackToMain={onBackToMain} />

      {/* Заголовок страницы */}
      <div className="page-header">
        <span className="page-header__subtitle">Порядок оформления и доставки</span>
        <h1 className="page-header__title">Условия покупки</h1>
        <div className="page-header__line" />
      </div>

      {/* Заглушка страницы */}
      <PagePlaceholder
        icon={
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="2" y="5" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="2" y1="10" x2="22" y2="10" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="7" cy="15" r="1" fill="currentColor" />
          </svg>
        }
        title="Информация для покупателей"
        description="Здесь будут описаны правила оформления заказов, безопасные способы онлайн-оплаты, моментальная доставка PDF-файлов на email и условия техподдержки."
        onButtonClick={onBackToMain}
      />
    </div>
  );
};

export default ShoppingTerms;

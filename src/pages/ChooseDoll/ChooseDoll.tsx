import React from "react";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs.tsx";
import { PagePlaceholder } from "../../components/PagePlaceholder/PagePlaceholder.tsx";
import "../pages.css";

export interface ChooseDollProps {
  onBackToMain?: () => void;
}

export const ChooseDoll: React.FC<ChooseDollProps> = ({ onBackToMain }) => {
  return (
    <div className="page-container">
      {/* Хлебные крошки */}
      <Breadcrumbs current="Выбрать куклу" onBackToMain={onBackToMain} />

      {/* Заголовок страницы */}
      <div className="page-header">
        <span className="page-header__subtitle">Гид по типам кукол</span>
        <h1 className="page-header__title">Выбрать куклу</h1>
        <div className="page-header__line" />
      </div>

      {/* Заглушка страницы */}
      <PagePlaceholder
        icon={
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M19 11l2 2-2 2M5 11l-2 2 2 2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
        title="Гид по выбору куклы в разработке"
        description="Здесь появится наглядный справочник по форматам кукол (Барби Стандарт, Пышка, Петит, Кен, MiniFee, Блайз) с рекомендациями по подбору подходящих выкроек."
        onButtonClick={onBackToMain}
      />
    </div>
  );
};

export default ChooseDoll;

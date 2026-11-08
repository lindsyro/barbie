import React from "react";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs.tsx";
import { PagePlaceholder } from "../../components/PagePlaceholder/PagePlaceholder.tsx";
import "../pages.css";

export interface UsefulProps {
  onBackToMain?: () => void;
}

export const Useful: React.FC<UsefulProps> = ({ onBackToMain }) => {
  return (
    <div className="page-container">
      <Breadcrumbs current="Полезное" onBackToMain={onBackToMain} />

      <div className="page-header">
        <span className="page-header__subtitle">Статьи, таблицы и мерки</span>
        <h1 className="page-header__title">Полезные материалы</h1>
        <div className="page-header__line" />
      </div>

      <PagePlaceholder
        icon={
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
        title="Полезные статьи в процессе написания"
        description="Таблицы параметров и мерок кукол, советы по выбору трикотажа, миниатюрной фурнитуры, тонких игл и технологии работы с микро-деталями."
        onButtonClick={onBackToMain}
      />
    </div>
  );
};

export default Useful;

import React from "react";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs.tsx";
import { PagePlaceholder } from "../../components/PagePlaceholder/PagePlaceholder.tsx";
import "../pages.css";

export interface TutorialsProps {
  onBackToMain?: () => void;
}

export const Tutorials: React.FC<TutorialsProps> = ({ onBackToMain }) => {
  return (
    <div className="page-container">
      <Breadcrumbs current="Видеоуроки" onBackToMain={onBackToMain} />

      <div className="page-header">
        <span className="page-header__subtitle">Мастер-классы</span>
        <h1 className="page-header__title">Видеоуроки</h1>
        <div className="page-header__line" />
      </div>

      <PagePlaceholder
        icon={
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="2" y="4" width="20" height="16" rx="3" />
            <path d="M10 9l6 3-6 3V9z" fill="currentColor" stroke="none" />
          </svg>
        }
        title="Видеоуроки готовятся к публикации"
        description="Подробные пошаговые видеоинструкции по раскрою, пошиву сложных узлов и финишной отделке кукольного гардероба от мастеров GOOSE Fashion House."
        onButtonClick={onBackToMain}
      />
    </div>
  );
};

export default Tutorials;

import React from "react";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs.tsx";
import { PageHeader } from "../../components/PageHeader/PageHeader.tsx";
import { PagePlaceholder } from "../../components/PagePlaceholder/PagePlaceholder.tsx";
import "../pages.css";

export interface MeasurementsProps {
  onBackToMain?: () => void;
}

export const Measurements: React.FC<MeasurementsProps> = ({ onBackToMain }) => {
  return (
    <div className="page-container">
      {/* Хлебные крошки */}
      <Breadcrumbs current="Мерки кукол" onBackToMain={onBackToMain} />

      {/* Заголовок страницы */}
      <PageHeader title="Мерки кукол" subtitle="Таблицы параметров" />

      {/* Заглушка страницы */}
      <PagePlaceholder
        icon={
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M21 6H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1z" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="6" y1="6" x2="6" y2="10" />
            <line x1="10" y1="6" x2="10" y2="12" />
            <line x1="14" y1="6" x2="14" y2="10" />
            <line x1="18" y1="6" x2="18" y2="12" />
          </svg>
        }
        title="Таблицы мерок готовятся к публикации"
        description="Здесь будут представлены подробные мерки всех типов кукол (обхват груди, талии, бёдер, длина рукава и брюк) с инструкциями по корректной примерке."
        onButtonClick={onBackToMain}
      />
    </div>
  );
};

export default Measurements;

import React from "react";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs.tsx";
import { PagePlaceholder } from "../../components/PagePlaceholder/PagePlaceholder.tsx";
import "../pages.css";

export interface KidsProps {
  onBackToMain?: () => void;
}

export const Kids: React.FC<KidsProps> = ({ onBackToMain }) => {
  return (
    <div className="page-container">
      <Breadcrumbs current="Для детей" onBackToMain={onBackToMain} />

      <div className="page-header">
        <span className="page-header__subtitle">Миниатюрные куклы</span>
        <h1 className="page-header__title">Выкройки для детей</h1>
        <div className="page-header__line" />
      </div>

      <PagePlaceholder
        icon={
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 10h.01M15 10h.01" strokeWidth="2" strokeLinecap="round" />
            <path d="M9.5 15a3.5 3.5 0 0 0 5 0" strokeLinecap="round" />
          </svg>
        }
        title="Раздел детских выкроек в разработке"
        description="Здесь появятся выкройки одежды для Челси (Chelsea), Lati Yellow, Middie Blythe и Obitsu 11."
        onButtonClick={onBackToMain}
      />
    </div>
  );
};

export default Kids;

import React from "react";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs.tsx";
import { PagePlaceholder } from "../../components/PagePlaceholder/PagePlaceholder.tsx";
import "../pages.css";

export interface GuysProps {
  onBackToMain?: () => void;
}

export const Guys: React.FC<GuysProps> = ({ onBackToMain }) => {
  return (
    <div className="page-container">
      <Breadcrumbs current="Для парней" onBackToMain={onBackToMain} />

      <div className="page-header">
        <span className="page-header__subtitle">Мужская кукольная мода</span>
        <h1 className="page-header__title">Выкройки для парней</h1>
        <div className="page-header__line" />
      </div>

      <PagePlaceholder
        icon={
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
        title="Раздел мужских выкроек в разработке"
        description="Здесь появятся выкройки одежды для Кена (Standard, Broad), Adonis 2.0, IT Homme и MiniFee Boy."
        onButtonClick={onBackToMain}
      />
    </div>
  );
};

export default Guys;

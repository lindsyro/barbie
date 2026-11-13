import React from "react";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs.tsx";
import { PageHeader } from "../../components/PageHeader/PageHeader.tsx";
import { PagePlaceholder } from "../../components/PagePlaceholder/PagePlaceholder.tsx";
import "../pages.css";

export interface CatalogProps {
  onBackToMain?: () => void;
}

export const Catalog: React.FC<CatalogProps> = ({ onBackToMain }) => {
  return (
    <div className="page-container">
      <Breadcrumbs current="Каталог выкроек" onBackToMain={onBackToMain} />

      <PageHeader
        title="Каталог выкроек"
        subtitle="Авторские лекала"
      />

      <PagePlaceholder
        icon={
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 2a3 3 0 0 0-3 3c0 .8.3 1.5.8 2.1L2 14v2h20v-2l-7.8-6.9c.5-.6.8-1.3.8-2.1a3 3 0 0 0-3-3z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 16l3 6h14l3-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
        title="Каталог выкроек наполняется"
        description="Здесь будут представлены все коллекции PDF-выкроек с фильтрами по куклам (Барби, Кен, MiniFee, Блайз), типам одежды и уровням сложности."
        onButtonClick={onBackToMain}
      />
    </div>
  );
};

export default Catalog;

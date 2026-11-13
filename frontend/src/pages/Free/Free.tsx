import React from "react";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs.tsx";
import { PageHeader } from "../../components/PageHeader/PageHeader.tsx";
import { PagePlaceholder } from "../../components/PagePlaceholder/PagePlaceholder.tsx";
import "../pages.css";

export interface FreeProps {
  onBackToMain?: () => void;
}

export const Free: React.FC<FreeProps> = ({ onBackToMain }) => {
  return (
    <div className="page-container">
      <Breadcrumbs current="Бесплатно" onBackToMain={onBackToMain} />

      <PageHeader title="Бесплатные материалы" subtitle="Подарки и пробные уроки" />

      <PagePlaceholder
        icon={
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <polyline points="20 12 20 22 4 22 4 12" />
            <rect x="2" y="7" width="20" height="5" />
            <line x1="12" y1="22" x2="12" y2="7" />
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
          </svg>
        }
        title="Бесплатные выкройки готовятся"
        description="В этом разделе будут выложены бесплатные базовые PDF-выкройки топов, юбок и аксессуаров для тестирования лекал и знакомства с брендом."
        onButtonClick={onBackToMain}
      />
    </div>
  );
};

export default Free;

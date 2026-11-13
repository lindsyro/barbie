import React from "react";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs.tsx";
import { PageHeader } from "../../components/PageHeader/PageHeader.tsx";
import { PagePlaceholder } from "../../components/PagePlaceholder/PagePlaceholder.tsx";
import "../pages.css";

export interface AboutProps {
  onBackToMain?: () => void;
}

export const About: React.FC<AboutProps> = ({ onBackToMain }) => {
  return (
    <div className="page-container">
      <Breadcrumbs current="О нас" onBackToMain={onBackToMain} />

      <PageHeader title="О GOOSE Fashion House" subtitle="История бренда" />

      <PagePlaceholder
        icon={
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
        title="История создания модного дома"
        description="GOOSE Fashion House — мастерская кукольного от-кутюр. Мы разрабатываем точные выкройки, обучаем шитью и делимся любовью к искусству кукольной моды."
        onButtonClick={onBackToMain}
      />
    </div>
  );
};

export default About;

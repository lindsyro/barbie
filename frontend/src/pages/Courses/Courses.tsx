import React from "react";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs.tsx";
import { PageHeader } from "../../components/PageHeader/PageHeader.tsx";
import { PagePlaceholder } from "../../components/PagePlaceholder/PagePlaceholder.tsx";
import "../pages.css";

export interface CoursesProps {
  onBackToMain?: () => void;
}

export const Courses: React.FC<CoursesProps> = ({ onBackToMain }) => {
  return (
    <div className="page-container">
      <Breadcrumbs current="Курсы" onBackToMain={onBackToMain} />

      <PageHeader title="Курсы" subtitle="Обучение шитью кукольной одежды" />

      <PagePlaceholder
        icon={
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
        title="Программа курсов в разработке"
        description="Комплексные обучающие курсы от базового конструирования до создания кутюрных кукольных коллекций со спикерами и обратной связью."
        onButtonClick={onBackToMain}
      />
    </div>
  );
};

export default Courses;

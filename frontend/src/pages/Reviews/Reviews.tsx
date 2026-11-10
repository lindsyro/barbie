import React from "react";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs.tsx";
import { PagePlaceholder } from "../../components/PagePlaceholder/PagePlaceholder.tsx";
import "../pages.css";

export interface ReviewsProps {
  onBackToMain?: () => void;
}

export const Reviews: React.FC<ReviewsProps> = ({ onBackToMain }) => {
  return (
    <div className="page-container">
      {/* Хлебные крошки */}
      <Breadcrumbs current="Отзывы мастериц" onBackToMain={onBackToMain} />

      {/* Заголовок страницы */}
      <div className="page-header">
        <span className="page-header__subtitle">Галерея готовых работ</span>
        <h1 className="page-header__title">Отзывы мастериц</h1>
        <div className="page-header__line" />
      </div>

      {/* Заглушка страницы */}
      <PagePlaceholder
        icon={
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <polygon
              points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
        title="Отзывы и работы покупателей"
        description="Здесь появятся искренние отзывы рукодельниц, фотографии кукол в нарядах, сшитых по нашим выкройкам, и возможность оставить свой отзыв."
        onButtonClick={onBackToMain}
      />
    </div>
  );
};

export default Reviews;

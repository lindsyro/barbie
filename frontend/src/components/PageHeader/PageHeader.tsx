import React from "react";
import "./pageHeader.css";

export interface PageHeaderProps {
  /** Главный заголовок страницы (H1) */
  title: React.ReactNode;
  /** Отображать ли золотую декоративную полоску снизу (по умолчанию true) */
  showLine?: boolean;
  /** Дополнительный CSS-класс */
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  showLine = true,
  className = "",
}) => {
  return (
    <div className={`page-header ${className}`.trim()}>
      <h1 className="page-header__title">{title}</h1>
      {showLine && <div className="page-header__line" />}
    </div>
  );
};

export default PageHeader;

import React from "react";
import "./pageHeader.css";

export interface PageHeaderProps {
  /** Главный заголовок страницы (H1) */
  title: React.ReactNode;
  /** Верхний аккуратный подзаголовок золотым цветом (uppercase) */
  subtitle?: React.ReactNode;
  /** Отображать ли золотую декоративную полоску снизу (по умолчанию true) */
  showLine?: boolean;
  /** Дополнительный CSS-класс */
  className?: string;
  /** Дополнительное содержимое под заголовком */
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showLine = true,
  className = "",
  children,
}) => {
  return (
    <div className={`page-header ${className}`.trim()}>
      {subtitle && <span className="page-header__subtitle">{subtitle}</span>}
      <h1 className="page-header__title">{title}</h1>
      {showLine && <div className="page-header__line" />}
      {children && <div className="page-header__extra">{children}</div>}
    </div>
  );
};

export default PageHeader;

import React from "react";
import "./pagePlaceholder.css";

export interface PagePlaceholderProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  buttonText?: string;
  buttonHref?: string;
  onButtonClick?: () => void;
  className?: string;
}

export const PagePlaceholder: React.FC<PagePlaceholderProps> = ({
  icon,
  title,
  description,
  buttonText = "← Вернуться на главную",
  buttonHref = "#main",
  onButtonClick,
  className = "",
}) => {
  return (
    <div className={`page-placeholder ${className}`}>
      {icon && <div className="page-placeholder__icon">{icon}</div>}
      <h2 className="page-placeholder__title">{title}</h2>
      <p className="page-placeholder__desc">{description}</p>
      <a
        href={buttonHref}
        onClick={onButtonClick}
        className="page-placeholder__btn"
      >
        {buttonText}
      </a>
    </div>
  );
};

export default PagePlaceholder;

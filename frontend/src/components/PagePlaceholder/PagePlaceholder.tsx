import React from "react";
import "./pagePlaceholder.css";

export interface PagePlaceholderProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  buttonText?: string;
  buttonHref?: string;
  onButtonClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
  children?: React.ReactNode;
}

export const PagePlaceholder: React.FC<PagePlaceholderProps> = ({
  icon,
  title,
  description,
  buttonText = "← Вернуться на главную",
  buttonHref = "#main",
  onButtonClick,
  className = "",
  children,
}) => {
  const hasActions = Boolean(buttonText) || Boolean(children);

  return (
    <div className={`page-placeholder ${className}`.trim()}>
      {icon && (
        <div className="page-placeholder__icon" aria-hidden="true">
          {icon}
        </div>
      )}
      <h2 className="page-placeholder__title">{title}</h2>
      {description && <p className="page-placeholder__desc">{description}</p>}
      {hasActions && (
        <div className="page-placeholder__actions">
          {buttonText && (
            <a
              href={buttonHref}
              onClick={onButtonClick}
              className="page-placeholder__btn"
            >
              {buttonText}
            </a>
          )}
          {children}
        </div>
      )}
    </div>
  );
};

export default PagePlaceholder;

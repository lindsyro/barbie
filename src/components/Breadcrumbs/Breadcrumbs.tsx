import React from "react";
import "./breadcrumbs.css";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  current?: string;
  onBackToMain?: () => void;
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  current,
  onBackToMain,
  className = "",
}) => {
  const trail: BreadcrumbItem[] = items ?? [
    { label: "Главная", href: "#main", onClick: onBackToMain },
  ];

  return (
    <nav className={`breadcrumbs ${className}`} aria-label="Хлебные крошки">
      {trail.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="breadcrumbs__sep">/</span>}
          <a
            href={item.href ?? "#"}
            onClick={item.onClick}
            className="breadcrumbs__link"
          >
            {item.label}
          </a>
        </React.Fragment>
      ))}
      {current && (
        <>
          <span className="breadcrumbs__sep">/</span>
          <span className="breadcrumbs__current">{current}</span>
        </>
      )}
    </nav>
  );
};

export default Breadcrumbs;

import React from "react";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs.tsx";
import { PageHeader } from "../../components/PageHeader/PageHeader.tsx";
import { PagePlaceholder } from "../../components/PagePlaceholder/PagePlaceholder.tsx";
import "../pages.css";

export interface Girls14Props {
  onBackToMain?: () => void;
}

export const Girls14: React.FC<Girls14Props> = ({ onBackToMain }) => {
  return (
    <div className="page-container">
      <Breadcrumbs current="Для девушек 1/4" onBackToMain={onBackToMain} />

      <PageHeader
        title="Выкройки для девушек 1/4"
        subtitle="Масштаб 1/4"
      />

      <PagePlaceholder
        icon={
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 2a3 3 0 0 0-3 3c0 .8.3 1.5.8 2.1L2 14v2h20v-2l-7.8-6.9c.5-.6.8-1.3.8-2.1a3 3 0 0 0-3-3z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 16l3 6h14l3-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
        title="Раздел выкроек 1/4 в разработке"
        description="Здесь появятся выкройки одежды для шарнирных кукол формата MSD и MiniFee (40–42 см)."
        onButtonClick={onBackToMain}
      />
    </div>
  );
};

export default Girls14;

import React from "react";
import type { MenuItem } from "../types.ts";
import { ChevronRightIcon } from "../../icons/index.ts";
import { getItemId } from "../menuUtils.ts";

export interface MegaPanelProps {
  categories: MenuItem[];
  activeCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  onClose: () => void;
}

export const MegaPanel: React.FC<MegaPanelProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
  onClose,
}) => {
  const selectedCat = categories.find(
    (c) => getItemId(c) === activeCategoryId && c.children?.length,
  );

  return (
    <div className={`mega ${selectedCat ? "mega--has-active-sub" : ""}`}>
      {/* Левая колонка: категории */}
      <div className="mega__left">
        <ul className="mega__categories">
          {categories.map((cat) => {
            const catId = getItemId(cat);
            const hasKids = Boolean(cat.children?.length);
            const isSelected = activeCategoryId === catId;
            return (
              <li
                key={catId}
                className={`mega__cat-item ${isSelected ? "mega__cat-item--active" : ""}`}
              >
                {hasKids ? (
                  <button
                    type="button"
                    className="mega__cat-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCategory(isSelected ? null : catId);
                    }}
                  >
                    <span className="mega__cat-label">{cat.label}</span>
                    <ChevronRightIcon className="menu__chevron-right" />
                  </button>
                ) : (
                  <a
                    href={cat.href || "#catalog"}
                    className="mega__cat-btn"
                    onClick={onClose}
                  >
                    <span className="mega__cat-label">{cat.label}</span>
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Правая колонка: появляется сбоку ТОЛЬКО при клике на категорию */}
      {selectedCat && selectedCat.children && (
        <div className="mega__right">
          <div className="mega__right-header">
            <span className="mega__right-title">{selectedCat.label}</span>
            <span className="mega__right-count">
              {selectedCat.children.length}
            </span>
          </div>
          <ul className="mega__sub-list">
            {selectedCat.children.map((sub) => {
              const subId = getItemId(sub);
              return (
                <li key={subId} className="mega__sub-item">
                  <a
                    href={sub.href}
                    className="mega__sub-link"
                    onClick={onClose}
                  >
                    <span className="mega__sub-label">{sub.label}</span>
                    {sub.description && (
                      <span className="mega__sub-desc">
                        {sub.description}
                      </span>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MegaPanel;

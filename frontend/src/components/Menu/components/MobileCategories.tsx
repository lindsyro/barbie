import React from "react";
import type { MenuItem } from "../types.ts";
import { getItemId } from "../menuUtils.ts";

export interface MobileCategoriesProps {
  categories: MenuItem[];
  expandedIds: string[];
  onToggle: (id: string, e: React.MouseEvent) => void;
  onClose: () => void;
}

export const MobileCategories: React.FC<MobileCategoriesProps> = ({
  categories,
  expandedIds,
  onToggle,
  onClose,
}) => {
  return (
    <ul className="mobile-cats">
      {categories.map((cat) => {
        const catId = getItemId(cat);
        const hasKids = Boolean(cat.children?.length);
        const isOpen = expandedIds.includes(catId);
        return (
          <li key={catId} className="mobile-cats__item">
            {hasKids ? (
              <button
                type="button"
                className={`mobile-cats__btn ${isOpen ? "mobile-cats__btn--open" : ""}`}
                onClick={(e) => onToggle(catId, e)}
              >
                <span>{cat.label}</span>
                <span
                  className={`mobile-cats__toggle ${isOpen ? "mobile-cats__toggle--open" : ""}`}
                >
                  {isOpen ? "−" : "+"}
                </span>
              </button>
            ) : (
              <a
                href={cat.href || "#catalog"}
                className="mobile-cats__btn"
                onClick={onClose}
              >
                <span>{cat.label}</span>
              </a>
            )}
            {hasKids && isOpen && cat.children && (
              <ul className="mobile-cats__sub">
                {cat.children.map((sub) => {
                  const subId = getItemId(sub);
                  const isAllLink = subId.endsWith("-all");
                  return (
                    <li key={subId} className={isAllLink ? "mobile-cats__sub-item--all" : ""}>
                      <a
                        href={sub.href}
                        className={`mobile-cats__sub-link ${isAllLink ? "mobile-cats__sub-link--all" : ""}`}
                        onClick={onClose}
                      >
                        {sub.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default MobileCategories;

import React from "react";
import { CloseIcon } from "../../icons/index.ts";

export interface MenuDrawerProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  return (
    <div
      className={`menu-drawer-wrapper ${isOpen ? "menu-drawer-wrapper--open" : ""}`}
    >
      <div
        className="menu-drawer__backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="menu-drawer__content"
        role="dialog"
        aria-modal="true"
        aria-label="Мобильное меню"
      >
        <div className="menu-drawer__header">
          <span className="menu-drawer__title">Каталог и навигация</span>
          <button
            type="button"
            className="menu-drawer__close-btn"
            onClick={onClose}
            aria-label="Закрыть меню"
          >
            <CloseIcon size={20} />
          </button>
        </div>
        <div className="menu-drawer__body">{children}</div>
        <div className="menu-drawer__footer">
          <p className="menu-drawer__phone">+7 (999) 000-00-00</p>
          <p className="menu-drawer__note">
            PDF отправляется мгновенно после оплаты
          </p>
        </div>
      </div>
    </div>
  );
};

export default MenuDrawer;

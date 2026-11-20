import React from "react";
import { ExclamationIcon } from "@/components/icons/index.ts";
import "./wishlistGuestBanner.css";

export interface WishlistGuestBannerProps {
  onOpenLogin?: () => void;
  className?: string;
}

export const WishlistGuestBanner: React.FC<WishlistGuestBannerProps> = ({
  onOpenLogin,
  className = "",
}) => {
  return (
    <div className={`wishlist-guest-banner ${className}`.trim()}>
      <div className="wishlist-guest-banner__content">
        <ExclamationIcon size={16} aria-hidden="true" />
        <span>
          Войдите в аккаунт, чтобы сохранить избранное на всех устройствах
        </span>
      </div>
      {onOpenLogin && (
        <button
          type="button"
          onClick={onOpenLogin}
          className="wishlist-guest-banner__btn"
        >
          Войти
        </button>
      )}
    </div>
  );
};

export default WishlistGuestBanner;

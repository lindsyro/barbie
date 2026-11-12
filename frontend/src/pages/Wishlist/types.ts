import type { WishlistPattern } from "../../api/wishlist.ts";

export type { WishlistPattern };

export interface WishlistProps {
  items: WishlistPattern[];
  isLoading?: boolean;
  isLoggedIn?: boolean;
  onRemoveFromWishlist: (id: number) => void;
  onAddToCart: (title: string) => void;
  onAddAllToCart?: () => void;
  onBackToMain?: () => void;
  onOpenLogin?: () => void;
}

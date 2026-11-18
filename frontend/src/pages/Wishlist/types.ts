import type { WishlistPattern } from "../../api/wishlist.ts";
import type { CartItemType } from "../Cart/types.ts";

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
  cartItems?: CartItemType[];
}

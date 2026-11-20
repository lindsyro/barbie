import { createContext, useContext } from "react";
import type { WishlistPattern } from "@/api/wishlist.ts";

export interface WishlistContextType {
  wishlist: WishlistPattern[];
  wishlistCount: number;
  wishlistIds: number[];
  wishlistIdsSet: Set<number>;
  isWishlistLoading: boolean;
  isFavorite: (id: number) => boolean;
  refreshWishlist: () => Promise<void>;
  toggleWishlist: (
    patternId: number,
    customPayload?: Partial<WishlistPattern>,
  ) => Promise<void>;
  removeFromWishlist: (patternId: number) => Promise<void>;
}

export const WishlistContext = createContext<WishlistContextType | null>(null);

export function useWishlist(): WishlistContextType {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}

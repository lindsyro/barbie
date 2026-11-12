export interface CartItemType {
  id: number;
  title: string;
  doll: string;
  price: number;
  priceFormatted: string;
  image: string;
  tag?: string;
  format?: string;
  scale?: string;
}

export interface CartProps {
  items: CartItemType[];
  onRemoveItem: (id: number) => void;
  onClearCart?: () => void;
  onCheckout: () => void;
  onContinueShopping?: () => void;
  onBackToMain?: () => void;
  isLoggedIn?: boolean;
}

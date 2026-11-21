export interface MenuItem {
  id?: string;
  label: string;
  href: string;
  badge?: string;
  description?: string;
  children?: MenuItem[];
  target?: string;
  isDynamic?: boolean;
}

export interface MenuProps {
  variant?: "horizontal" | "vertical" | "drawer";
  isOpen?: boolean;
  onClose?: () => void;
  items?: MenuItem[];
  activeHref?: string;
  className?: string;
}

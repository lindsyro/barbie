import type { ReactNode } from "react";

export interface PatternItem {
  id: number;
  title: string;
  tag: string;
  doll: string;
  price: string;
  image: string;
}

export interface AdvantageItem {
  id: string;
  icon: ReactNode;
  title: string;
  description: string;
}

export interface QuickCategoryItem {
  id: string;
  name: string;
  count: string;
}

export interface MainProps {
  onAddToCart?: (title: string) => void;
  onSelectCategory?: (category: string) => void;
}

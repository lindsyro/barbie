import type { DollItem } from "../ChooseDoll/types.ts";

export interface CatalogPatternItem {
  id: number;
  title: string;
  doll: string;
  category: "girls-1-6" | "girls-1-4" | "guys" | "kids";
  price: number;
  image: string;
  images: string[];
  dolls?: DollItem[];
}

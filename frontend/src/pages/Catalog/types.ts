import type { DollItem } from "../ChooseDoll/types.ts";

export interface CatalogPatternItem {
  id: number;
  title: string;
  doll: string;
  price: number;
  image: string;
  images: string[];
  dolls: DollItem[];
}

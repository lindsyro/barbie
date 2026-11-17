export interface DollCategory {
  id: number;
  slug: string;
  name: string;
  order: number;
  dolls?: DollItem[];
}

export interface DollItem {
  id: number;
  fileName: string;
  nameEn: string;
  nameRu: string;
  height: number;
  measurementsFileName?: string;
  categoryId: number;
  category?: DollCategory;
}

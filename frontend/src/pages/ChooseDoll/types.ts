export interface DollItem {
  id: number;
  fileName: string;
  nameEn: string;
  nameRu: string;
  category: "Девушки 1/6" | "Девушки 1/4" | "Парни" | "Дети";
  height: number;
  measurementsFileName?: string;
}

import { createContext, useContext } from "react";

export interface RouterContextType {
  currentPage: string;
  catalogCategory: string;
  catalogDollId: number | null;
  navigateTo: (page: string) => void;
}

export const RouterContext = createContext<RouterContextType | null>(null);

export function useRouter(): RouterContextType {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error("useRouter must be used within a RouterProvider");
  }
  return context;
}

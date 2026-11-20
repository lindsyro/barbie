import React, { useState, useEffect, useCallback } from "react";
import { RouterContext } from "./RouterContext.ts";
import { KNOWN_PAGES, parseCatalogRoute } from "./routes.ts";

export interface RouterProviderProps {
  children: React.ReactNode;
}

export const RouterProvider: React.FC<RouterProviderProps> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<string>("main");
  const [catalogCategory, setCatalogCategory] = useState<string>("all");
  const [catalogDollId, setCatalogDollId] = useState<number | null>(null);

  const navigateTo = useCallback((page: string) => {
    window.location.hash = page;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash.replace("#", "").trim();
      if (!rawHash) {
        setCurrentPage("main");
        return;
      }

      const catalogRoute = parseCatalogRoute(rawHash);
      if (catalogRoute) {
        setCurrentPage("catalog");
        setCatalogCategory(catalogRoute.category);
        setCatalogDollId(catalogRoute.dollId);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const pageKey = KNOWN_PAGES[rawHash] || rawHash;
      setCurrentPage(pageKey);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <RouterContext.Provider
      value={{
        currentPage,
        catalogCategory,
        catalogDollId,
        navigateTo,
      }}
    >
      {children}
    </RouterContext.Provider>
  );
};

/**
 * Маршруты и параметры страниц
 */

export const KNOWN_PAGES: Record<string, string> = {
  main: "main",
  catalog: "catalog",
  "all-patterns": "catalog",
  tutorials: "tutorials",
  courses: "courses",
  free: "free",
  useful: "useful",
  about: "about",
  account: "account",
  profile: "account",
  "choose-doll": "choose-doll",
  dolls: "choose-doll",
  measurements: "measurements",
  "a4-print": "measurements",
  "shopping-terms": "shopping-terms",
  faq: "shopping-terms",
  delivery: "shopping-terms",
  reviews: "reviews",
  cart: "cart",
  basket: "cart",
  wishlist: "wishlist",
  favorites: "wishlist",
};

export interface CatalogRouteParams {
  category: string;
  dollId: number | null;
}

export function parseCatalogRoute(hash: string): CatalogRouteParams | null {
  const raw = hash.replace("#", "").trim();
  if (!raw) return null;

  const [pathPart, queryPart] = raw.split("?");
  const cleanPath = pathPart.toLowerCase().trim();

  const searchParams = new URLSearchParams(queryPart || "");
  const dollParam = searchParams.get("doll");
  const parsedDollId = dollParam ? parseInt(dollParam, 10) : null;
  const dollId =
    parsedDollId !== null && !isNaN(parsedDollId) ? parsedDollId : null;

  if (cleanPath === "catalog" || cleanPath === "all-patterns") {
    return { category: "all", dollId };
  }

  const validCategories = ["girls-1-6", "guys", "girls-1-4", "kids"];
  if (validCategories.includes(cleanPath)) {
    return { category: cleanPath, dollId };
  }

  return null;
}

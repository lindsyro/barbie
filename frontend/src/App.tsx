import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Header,
  Footer,
  LoginModal,
  RegisterModal,
} from "@/components/index.ts";
import {
  type User,
  getStoredUser,
  fetchCurrentUser,
  logoutUser,
} from "@/api/auth.ts";
import {
  fetchWishlist,
  toggleWishlist,
  removeFromWishlist,
  getGuestWishlist,
  toggleGuestWishlist,
  removeFromGuestWishlist,
  syncGuestWishlistWithDatabase,
  type WishlistPattern,
} from "@/api/wishlist.ts";
import {
  fetchPatterns,
  findCachedPatternById,
  findCachedPatternByTitle,
} from "@/api/patterns.ts";
import { getPatternImages } from "@/utils/patternImages.ts";
import { useAsyncData } from "@/hooks/index.ts";
import {
  Main,
  Catalog,
  Tutorials,
  Courses,
  Free,
  Useful,
  About,
  Account,
  ChooseDoll,
  Measurements,
  ShoppingTerms,
  Reviews,
  Cart,
  type CartItemType,
  Wishlist,
} from "@/pages/index.ts";
import "./App.css";

const KNOWN_PAGES: Record<string, string> = {
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

const CART_STORAGE_KEY = "goose_cart";

function getStoredCart(): CartItemType[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItemType[]) : [];
  } catch {
    return [];
  }
}

function parseCatalogRoute(
  hash: string,
): { category: string; dollId: number | null } | null {
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

function App() {
  const [currentPage, setCurrentPage] = useState<string>("main");
  const [catalogCategory, setCatalogCategory] = useState<string>("all");
  const [catalogDollId, setCatalogDollId] = useState<number | null>(null);

  // Загрузка всех выкроек из базы данных
  const { data: patterns = [], isLoading: isPatternsLoading } = useAsyncData(
    fetchPatterns,
    {
      initialData: [],
    },
  );

  const [cart, setCart] = useState<CartItemType[]>(() => getStoredCart());
  const cartCount = cart.length;
  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    getStoredUser(),
  );
  const [wishlist, setWishlist] = useState<WishlistPattern[]>(() => {
    const user = getStoredUser();
    return user ? [] : getGuestWishlist();
  });
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const wishlistCount = wishlist.length;
  const wishlistIds = useMemo(() => wishlist.map((it) => it.id), [wishlist]);
  const [notification, setNotification] = useState<string | null>(null);
  const notificationTimeoutRef = useRef<number | null>(null);
  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null);
  const [pendingAction, setPendingAction] = useState<
    "cart" | "wishlist" | null
  >(null);

  // Сохранение состояния корзины в localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (err) {
      console.error("Ошибка сохранения корзины в localStorage:", err);
    }
  }, [cart]);

  // Очистка таймера уведомлений при размонтировании
  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        window.clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  const refreshWishlist = useCallback(async () => {
    try {
      setIsWishlistLoading(true);
      const data = await fetchWishlist();
      setWishlist(data.items || []);
    } catch (err) {
      console.error("Ошибка загрузки избранного из БД:", err);
    } finally {
      setIsWishlistLoading(false);
    }
  }, []);

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    if (notificationTimeoutRef.current) {
      window.clearTimeout(notificationTimeoutRef.current);
    }
    notificationTimeoutRef.current = window.setTimeout(() => {
      setNotification(null);
    }, 3000);
  }, []);

  const navigateTo = useCallback((page: string) => {
    window.location.hash = page;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    // Проверка актуальности токена сессии в базе данных
    fetchCurrentUser().then((verifiedUser) => {
      setCurrentUser(verifiedUser);
    });

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

  // Загрузка и синхронизация избранного для авторизованного пользователя
  useEffect(() => {
    if (!currentUser) return;
    let ignore = false;
    const guestItems = getGuestWishlist();

    if (guestItems.length > 0) {
      syncGuestWishlistWithDatabase(guestItems)
        .then((synced) => {
          if (!ignore) {
            setWishlist(synced.items || []);
          }
        })
        .catch(() => {
          fetchWishlist().then((data) => {
            if (!ignore) setWishlist(data.items || []);
          });
        });
    } else {
      fetchWishlist()
        .then((data) => {
          if (!ignore) {
            setWishlist(data.items || []);
          }
        })
        .catch((err) => {
          console.error("Ошибка загрузки избранного из БД:", err);
        });
    }

    return () => {
      ignore = true;
    };
  }, [currentUser]);

  const handleAddToCart = useCallback(
    (title: string) => {
      const alreadyInCart = cart.some((it) => it.title === title);
      if (alreadyInCart) {
        setCart((prev) => prev.filter((it) => it.title !== title));
        showNotification(`Выкройка «${title}» удалена из корзины`);
        return;
      }

      const found =
        patterns.find((p) => p.title === title) ||
        findCachedPatternByTitle(title);

      const numPrice = found
        ? typeof found.price === "number"
          ? found.price
          : parseInt(String(found.price).replace(/\D/g, ""), 10) || 490
        : 490;

      const newItem: CartItemType = {
        id: found ? found.id : Date.now(),
        title,
        doll: found ? found.doll : "Барби",
        price: numPrice,
        priceFormatted: `${numPrice} ₽`,
        image:
          found?.image ||
          (found?.id ? getPatternImages(found.id)[0] : "") ||
          "",
        tag:
          found && "tag" in found && typeof found.tag === "string"
            ? found.tag
            : "Выкройка",
        format:
          found && "format" in found && typeof found.format === "string"
            ? found.format
            : "PDF (А4 + инструкции)",
      };

      setCart((prev) => [...prev, newItem]);
      showNotification(`Выкройка «${title}» добавлена в корзину`);
    },
    [cart, patterns, showNotification],
  );

  const handleRemoveFromCart = useCallback(
    (id: number) => {
      setCart((prev) => prev.filter((it) => it.id !== id));
      showNotification("Выкройка удалена из корзины");
    },
    [showNotification],
  );

  const handleClearCart = useCallback(() => {
    setCart([]);
    showNotification("Корзина очищена");
  }, [showNotification]);

  const handleCheckout = useCallback(() => {
    if (!currentUser) {
      setPendingAction("cart");
      showNotification("Для оформления заказа необходимо войти в аккаунт");
      setAuthModal("login");
      return;
    }
    const orderNum = `ORD-${Date.now().toString().slice(-6)}`;
    setCart([]);
    showNotification(
      `Заказ #${orderNum} успешно оформлен! Ссылки на PDF отправлены на email.`,
    );
    navigateTo("account");
  }, [currentUser, navigateTo, showNotification]);

  const handleSelectCategory = useCallback(
    (categoryId: string) => {
      setCatalogCategory(categoryId);
      setCatalogDollId(null);
      navigateTo(categoryId === "all" ? "catalog" : categoryId);
    },
    [navigateTo],
  );

  const handleToggleWishlist = useCallback(
    async (patternId: number) => {
      const found =
        patterns.find((p) => p.id === patternId) ||
        findCachedPatternById(patternId);
      const numPrice = found
        ? typeof found.price === "number"
          ? found.price
          : parseInt(String(found.price).replace(/\D/g, ""), 10) || 490
        : 490;
      const payload: WishlistPattern = {
        id: patternId,
        title: found ? found.title : `Выкройка #${patternId}`,
        doll: found ? found.doll : "Барби",
        price: numPrice,
        tag:
          found && "tag" in found && typeof found.tag === "string"
            ? found.tag
            : "Выкройка",
        image: found?.image || getPatternImages(patternId)[0] || "",
        format:
          found && "format" in found && typeof found.format === "string"
            ? found.format
            : "PDF (А4 + инструкции)",
      };

      // 1. Для неавторизованного пользователя — сохраняем в localStorage с мягким уведомлением
      if (!currentUser) {
        const res = toggleGuestWishlist(payload);
        setWishlist(res.items);
        if (res.inWishlist) {
          showNotification(
            "Выкройка добавлена в избранное. Войдите в аккаунт, чтобы не потерять подборку.",
          );
        } else {
          showNotification("Выкройка удалена из избранного");
        }
        return;
      }

      // 2. Для авторизованного пользователя — сохраняем в базе данных
      try {
        const res = await toggleWishlist(patternId, payload);
        setWishlist(res.wishlist.items);
        showNotification(res.message);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Не удалось обновить избранное";
        showNotification(msg);
      }
    },
    [currentUser, patterns, showNotification],
  );

  const handleRemoveFromWishlist = useCallback(
    async (patternId: number) => {
      // 1. Если пользователь гость — удаляем из localStorage
      if (!currentUser) {
        const updated = removeFromGuestWishlist(patternId);
        setWishlist(updated);
        showNotification("Выкройка удалена из избранного");
        return;
      }

      // 2. Для авторизованного пользователя — удаляем из базы данных
      try {
        const res = await removeFromWishlist(patternId);
        setWishlist(res.items);
        showNotification("Выкройка удалена из избранного");
      } catch {
        showNotification("Не удалось удалить выкройку из избранного");
      }
    },
    [currentUser, showNotification],
  );

  const handleAddAllWishlistToCart = useCallback(() => {
    if (wishlist.length === 0) return;
    let added = 0;
    setCart((prev) => {
      const existingTitles = new Set(prev.map((it) => it.title));
      const newItems: CartItemType[] = [];

      for (const w of wishlist) {
        if (!existingTitles.has(w.title)) {
          newItems.push({
            id: w.id,
            title: w.title,
            doll: w.doll,
            price: w.price,
            priceFormatted: `${w.price} ₽`,
            image: w.image,
            tag: w.tag,
            format: w.format || "PDF (А4 + инструкции)",
          });
          added++;
        }
      }
      return [...prev, ...newItems];
    });

    if (added > 0) {
      showNotification(`Добавлено в корзину: ${added} выкройки(ек)`);
    } else {
      showNotification("Все выкройки из избранного уже в вашей корзине");
    }
  }, [wishlist, showNotification]);

  const handleBackToMain = useCallback(() => {
    navigateTo("main");
  }, [navigateTo]);

  const handleOpenLoginForWishlist = useCallback(() => {
    setPendingAction("wishlist");
    setAuthModal("login");
  }, []);

  const handleCartClick = useCallback(() => {
    navigateTo("cart");
  }, [navigateTo]);

  const handleWishlistClick = useCallback(() => {
    navigateTo("wishlist");
  }, [navigateTo]);

  const handleAuthClick = useCallback(() => {
    if (currentUser) {
      navigateTo("account");
    } else {
      setAuthModal("login");
    }
  }, [currentUser, navigateTo]);

  const handleLogout = useCallback(async () => {
    await logoutUser();
    setCurrentUser(null);
    setWishlist(getGuestWishlist());
    showNotification("Вы успешно вышли из аккаунта");
    navigateTo("main");
  }, [navigateTo, showNotification]);

  // Синхронизация и слияние гостевого избранного из localStorage с базой данных
  const syncWishlistOnAuth = useCallback(
    async (user: User) => {
      const guestItems = getGuestWishlist();
      if (guestItems.length > 0) {
        try {
          const synced = await syncGuestWishlistWithDatabase(guestItems);
          setWishlist(synced.items || []);
          showNotification(
            `Добро пожаловать, ${user.name}! Избранное синхронизировано с вашим аккаунтом.`,
          );
          return;
        } catch (err) {
          console.error("Ошибка объединения избранного:", err);
        }
      }
      await refreshWishlist();
    },
    [refreshWishlist, showNotification],
  );

  const handleLoginSuccess = useCallback(
    async (user: User) => {
      setCurrentUser(user);
      await syncWishlistOnAuth(user);

      if (pendingAction === "cart") {
        showNotification(
          `Добро пожаловать, ${user.name}! Переходим в корзину.`,
        );
        setPendingAction(null);
        navigateTo("cart");
      } else if (pendingAction === "wishlist") {
        showNotification(
          `Добро пожаловать, ${user.name}! Переходим в избранное.`,
        );
        setPendingAction(null);
        navigateTo("wishlist");
      } else {
        showNotification(`Добро пожаловать в личный кабинет, ${user.name}!`);
        navigateTo("account");
      }
    },
    [navigateTo, pendingAction, showNotification, syncWishlistOnAuth],
  );

  const handleRegisterSuccess = useCallback(
    async (user: User) => {
      setCurrentUser(user);
      await syncWishlistOnAuth(user);

      if (pendingAction === "cart") {
        showNotification("Регистрация успешна! Переходим в корзину.");
        setPendingAction(null);
        navigateTo("cart");
      } else if (pendingAction === "wishlist") {
        showNotification("Регистрация успешна! Переходим в избранное.");
        setPendingAction(null);
        navigateTo("wishlist");
      } else {
        showNotification(
          `Регистрация успешна! Добро пожаловать, ${user.name}!`,
        );
        navigateTo("account");
      }
    },
    [navigateTo, pendingAction, showNotification, syncWishlistOnAuth],
  );

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "catalog":
        return (
          <Catalog
            key={`${catalogCategory}_${catalogDollId ?? "all"}`}
            patterns={patterns}
            isLoading={isPatternsLoading}
            initialCategory={catalogCategory}
            initialDollId={catalogDollId}
            onBackToMain={handleBackToMain}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
            cartItems={cart}
          />
        );
      case "tutorials":
        return <Tutorials onBackToMain={handleBackToMain} />;
      case "courses":
        return <Courses onBackToMain={handleBackToMain} />;
      case "free":
        return <Free onBackToMain={handleBackToMain} />;
      case "useful":
        return <Useful onBackToMain={handleBackToMain} />;
      case "about":
        return <About onBackToMain={handleBackToMain} />;
      case "account":
        return (
          <Account
            user={currentUser}
            onBackToMain={handleBackToMain}
            onLogout={handleLogout}
            onOpenLogin={() => setAuthModal("login")}
            onNavigateToCatalog={() => navigateTo("catalog")}
          />
        );
      case "choose-doll":
        return (
          <ChooseDoll
            onBackToMain={handleBackToMain}
            onNavigateToCatalog={(hash) => navigateTo(hash || "catalog")}
          />
        );
      case "measurements":
        return <Measurements onBackToMain={handleBackToMain} />;
      case "shopping-terms":
        return <ShoppingTerms onBackToMain={handleBackToMain} />;
      case "reviews":
        return <Reviews onBackToMain={handleBackToMain} />;
      case "cart":
        return (
          <Cart
            items={cart}
            onRemoveItem={handleRemoveFromCart}
            onClearCart={handleClearCart}
            onCheckout={handleCheckout}
            onContinueShopping={() => navigateTo("catalog")}
            onBackToMain={handleBackToMain}
            isLoggedIn={Boolean(currentUser)}
          />
        );
      case "wishlist":
        return (
          <Wishlist
            items={wishlist}
            isLoading={isWishlistLoading}
            isLoggedIn={Boolean(currentUser)}
            onRemoveFromWishlist={handleRemoveFromWishlist}
            onAddToCart={handleAddToCart}
            onAddAllToCart={handleAddAllWishlistToCart}
            onBackToMain={handleBackToMain}
            cartItems={cart}
            onOpenLogin={handleOpenLoginForWishlist}
          />
        );
      case "main":
      default:
        return (
          <Main
            patterns={patterns}
            onAddToCart={handleAddToCart}
            onSelectCategory={handleSelectCategory}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
            cartItems={cart}
          />
        );
    }
  };

  return (
    <div className="app-layout">
      {/* Шапка сайта */}
      <Header
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        activeHref={`#${currentPage}`}
        isLoggedIn={Boolean(currentUser)}
        userName={currentUser?.name || currentUser?.email}
        onCartClick={handleCartClick}
        onWishlistClick={handleWishlistClick}
        onSearchSubmit={(q) => showNotification(`Поиск выкройки: "${q}"`)}
        onAuthClick={handleAuthClick}
        onLogout={handleLogout}
      />

      {/* Всплывающее уведомление */}
      {notification && <div className="app-toast">{notification}</div>}

      {/* Основной контент страниц */}
      <main className="app-main">{renderCurrentPage()}</main>

      {/* Модальные окна авторизации */}
      <LoginModal
        isOpen={authModal === "login"}
        onClose={() => {
          setAuthModal(null);
          setPendingAction(null);
        }}
        onSwitchToRegister={() => setAuthModal("register")}
        onForgotPassword={() =>
          showNotification("Ссылка для сброса пароля отправлена на почту")
        }
        onLoginSuccess={handleLoginSuccess}
      />

      <RegisterModal
        isOpen={authModal === "register"}
        onClose={() => {
          setAuthModal(null);
          setPendingAction(null);
        }}
        onSwitchToLogin={() => setAuthModal("login")}
        onRegisterSuccess={handleRegisterSuccess}
      />

      {/* Подвал сайта */}
      <Footer
        onSubscribe={(email) =>
          showNotification(
            `Подписка оформлена для ${email}! Скидка активирована.`,
          )
        }
      />
    </div>
  );
}

export default App;

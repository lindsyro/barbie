import { useState, useEffect, useCallback } from "react";
import Header from "./components/Header/Header.tsx";
import Footer from "./components/Footer/Footer.tsx";
import { LoginModal, RegisterModal } from "./components/index.ts";
import {
  type User,
  getStoredUser,
  fetchCurrentUser,
  logoutUser,
} from "./api/auth.ts";
import {
  fetchWishlist,
  toggleWishlist,
  removeFromWishlist,
  getGuestWishlist,
  toggleGuestWishlist,
  removeFromGuestWishlist,
  syncGuestWishlistWithDatabase,
  type WishlistPattern,
} from "./api/wishlist.ts";
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
  Girls16,
  Girls14,
  Guys,
  Kids,
  Cart,
  type CartItemType,
  Wishlist,
  FEATURED_PATTERNS,
} from "./pages/index.ts";
import "./App.css";

const KNOWN_PAGES: Record<string, string> = {
  main: "main",
  catalog: "catalog",
  "all-patterns": "catalog",
  // 1/6
  "girls-1-6": "girls-1-6",
  barbie: "girls-1-6",
  "barbie-standard": "girls-1-6",
  "barbie-curvy": "girls-1-6",
  "barbie-petite": "girls-1-6",
  "barbie-tall": "girls-1-6",
  "barbie-90s": "girls-1-6",
  "poppy-parker": "girls-1-6",
  blythe: "girls-1-6",
  // 1/4
  "girls-1-4": "girls-1-4",
  barbie2: "girls-1-4",
  "girls-1": "girls-1-4",
  "girls-2": "girls-1-4",
  "girls-3": "girls-1-4",
  // Guys
  guys: "guys",
  ken: "guys",
  "ken-standard": "guys",
  "ken-broad": "guys",
  "adonis-2-0": "guys",
  "it-homme": "guys",
  "minifee-boy": "guys",
  "guys-outerwear": "guys",
  // Kids
  kids: "kids",
  children: "kids",
  chelsea: "kids",
  "lati-yellow": "kids",
  "middie-obitsu": "kids",
  // Other pages
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
  reviews: "reviews",
  cart: "cart",
  basket: "cart",
  wishlist: "wishlist",
  favorites: "wishlist",
};

const BASE = import.meta.env.BASE_URL;

const INITIAL_CART: CartItemType[] = [
  {
    id: 1,
    title: "Водолазка-боди для Барби",
    doll: "Барби / Made to Move",
    price: 490,
    priceFormatted: "490 ₽",
    image: `${BASE}1.png`,
    tag: "Хит продаж",
    format: "PDF (А4 + инструкции)",
  },
  {
    id: 2,
    title: "Боди-бюстье «Афродита»",
    doll: "Барби Standard & Curvy",
    price: 550,
    priceFormatted: "550 ₽",
    image: `${BASE}2.png`,
    tag: "Новинка",
    format: "PDF (А4 + инструкции)",
  },
];

function App() {
  const [currentPage, setCurrentPage] = useState<string>("main");
  const [cart, setCart] = useState<CartItemType[]>(INITIAL_CART);
  const cartCount = cart.length;
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser());
  const [wishlist, setWishlist] = useState<WishlistPattern[]>(() => {
    const user = getStoredUser();
    return user ? [] : getGuestWishlist();
  });
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const wishlistCount = wishlist.length;
  const wishlistIds = wishlist.map((it) => it.id);
  const [notification, setNotification] = useState<string | null>(null);
  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null);
  const [pendingAction, setPendingAction] = useState<"cart" | "wishlist" | null>(null);

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

  useEffect(() => {
    // Проверка актуальности токена сессии в PostgreSQL
    fetchCurrentUser().then((verifiedUser) => {
      setCurrentUser(verifiedUser);
    });

    const handleHashChange = () => {
      const rawHash = window.location.hash.replace("#", "").trim();
      if (!rawHash) {
        setCurrentPage("main");
        return;
      }
      const pageKey = KNOWN_PAGES[rawHash] || (rawHash.startsWith("barbie") || rawHash.startsWith("ken") || rawHash.startsWith("girls") ? "catalog" : rawHash);
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

  const navigateTo = (page: string) => {
    window.location.hash = page;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddToCart = (title: string) => {
    const alreadyInCart = cart.some((it) => it.title === title);
    if (alreadyInCart) {
      showNotification(`Выкройка «${title}» уже в вашей корзине`);
      return;
    }

    const found = FEATURED_PATTERNS.find((p) => p.title === title);
    const numPrice = found ? parseInt(found.price.replace(/\D/g, ""), 10) || 490 : 490;
    const newItem: CartItemType = {
      id: found ? found.id : Date.now(),
      title,
      doll: found ? found.doll : "Барби",
      price: numPrice,
      priceFormatted: found ? found.price : `${numPrice} ₽`,
      image: found ? found.image : `${BASE}1.png`,
      tag: found?.tag || "Выкройка",
      format: "PDF (А4 + инструкции)",
    };

    setCart((prev) => [...prev, newItem]);
    showNotification(`Выкройка «${title}» добавлена в корзину`);
  };

  const handleRemoveFromCart = (id: number) => {
    setCart((prev) => prev.filter((it) => it.id !== id));
    showNotification("Выкройка удалена из корзины");
  };

  const handleClearCart = () => {
    setCart([]);
    showNotification("Корзина очищена");
  };

  const handleCheckout = () => {
    if (!currentUser) {
      setPendingAction("cart");
      showNotification("Для оформления заказа необходимо войти в аккаунт");
      setAuthModal("login");
      return;
    }
    const orderNum = `ORD-${Date.now().toString().slice(-6)}`;
    setCart([]);
    showNotification(`Заказ #${orderNum} успешно оформлен! Ссылки на PDF отправлены на email.`);
    navigateTo("account");
  };

  const handleSelectCategory = (categoryId: string) => {
    showNotification(`Выбрана категория: ${categoryId}`);
    navigateTo("catalog");
  };

  const handleToggleWishlist = async (patternId: number) => {
    const found = FEATURED_PATTERNS.find((p) => p.id === patternId);
    const numPrice = found ? parseInt(found.price.replace(/\D/g, ""), 10) || 490 : 490;
    const payload: WishlistPattern = {
      id: patternId,
      title: found ? found.title : `Выкройка #${patternId}`,
      doll: found ? found.doll : "Барби",
      price: numPrice,
      tag: found?.tag || "Выкройка",
      image: found?.image || `${BASE}1.png`,
      format: "PDF (А4 + инструкции)",
    };

    // 1. Для неавторизованного пользователя — сохраняем в localStorage с мягким уведомлением
    if (!currentUser) {
      const res = toggleGuestWishlist(payload);
      setWishlist(res.items);
      if (res.inWishlist) {
        showNotification("Выкройка добавлена в избранное. Войдите в аккаунт, чтобы не потерять подборку.");
      } else {
        showNotification("Выкройка удалена из избранного");
      }
      return;
    }

    // 2. Для авторизованного пользователя — сохраняем в PostgreSQL
    try {
      const res = await toggleWishlist(patternId, payload);
      setWishlist(res.wishlist.items);
      showNotification(res.message);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Не удалось обновить избранное";
      showNotification(msg);
    }
  };

  const handleRemoveFromWishlist = async (patternId: number) => {
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
  };

  const handleAddAllWishlistToCart = () => {
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
  };

  const handleCartClick = () => {
    navigateTo("cart");
  };

  const handleWishlistClick = () => {
    navigateTo("wishlist");
  };

  const handleAuthClick = () => {
    if (currentUser) {
      navigateTo("account");
    } else {
      setAuthModal("login");
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setWishlist(getGuestWishlist());
    showNotification("Вы успешно вышли из аккаунта");
    navigateTo("main");
  };

  // Синхронизация и слияние гостевого избранного из localStorage с PostgreSQL
  const syncWishlistOnAuth = async (user: User) => {
    const guestItems = getGuestWishlist();
    if (guestItems.length > 0) {
      try {
        const synced = await syncGuestWishlistWithDatabase(guestItems);
        setWishlist(synced.items || []);
        showNotification(`Добро пожаловать, ${user.name}! Избранное синхронизировано с вашим аккаунтом.`);
        return;
      } catch (err) {
        console.error("Ошибка объединения избранного:", err);
      }
    }
    await refreshWishlist();
  };

  const handleLoginSuccess = async (user: User) => {
    setCurrentUser(user);
    await syncWishlistOnAuth(user);

    if (pendingAction === "cart") {
      showNotification(`Добро пожаловать, ${user.name}! Переходим в корзину.`);
      setPendingAction(null);
      navigateTo("cart");
    } else if (pendingAction === "wishlist") {
      showNotification(`Добро пожаловать, ${user.name}! Переходим в избранное.`);
      setPendingAction(null);
      navigateTo("wishlist");
    } else {
      showNotification(`Добро пожаловать в личный кабинет, ${user.name}!`);
      navigateTo("account");
    }
  };

  const handleRegisterSuccess = async (user: User) => {
    setCurrentUser(user);
    await syncWishlistOnAuth(user);

    if (pendingAction === "cart") {
      showNotification(`Регистрация успешна! Переходим в корзину.`);
      setPendingAction(null);
      navigateTo("cart");
    } else if (pendingAction === "wishlist") {
      showNotification(`Регистрация успешна! Переходим в избранное.`);
      setPendingAction(null);
      navigateTo("wishlist");
    } else {
      showNotification(`Регистрация успешна! Добро пожаловать, ${user.name}!`);
      navigateTo("account");
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "catalog":
        return <Catalog onBackToMain={() => navigateTo("main")} />;
      case "tutorials":
        return <Tutorials onBackToMain={() => navigateTo("main")} />;
      case "courses":
        return <Courses onBackToMain={() => navigateTo("main")} />;
      case "free":
        return <Free onBackToMain={() => navigateTo("main")} />;
      case "useful":
        return <Useful onBackToMain={() => navigateTo("main")} />;
      case "about":
        return <About onBackToMain={() => navigateTo("main")} />;
      case "account":
        return (
          <Account
            user={currentUser}
            onBackToMain={() => navigateTo("main")}
            onLogout={handleLogout}
            onOpenLogin={() => setAuthModal("login")}
            onNavigateToCatalog={() => navigateTo("catalog")}
          />
        );
      case "choose-doll":
        return <ChooseDoll onBackToMain={() => navigateTo("main")} />;
      case "measurements":
        return <Measurements onBackToMain={() => navigateTo("main")} />;
      case "shopping-terms":
        return <ShoppingTerms onBackToMain={() => navigateTo("main")} />;
      case "reviews":
        return <Reviews onBackToMain={() => navigateTo("main")} />;
      case "girls-1-6":
        return <Girls16 onBackToMain={() => navigateTo("main")} />;
      case "girls-1-4":
        return <Girls14 onBackToMain={() => navigateTo("main")} />;
      case "guys":
        return <Guys onBackToMain={() => navigateTo("main")} />;
      case "kids":
        return <Kids onBackToMain={() => navigateTo("main")} />;
      case "cart":
        return (
          <Cart
            items={cart}
            onRemoveItem={handleRemoveFromCart}
            onClearCart={handleClearCart}
            onCheckout={handleCheckout}
            onContinueShopping={() => navigateTo("catalog")}
            onBackToMain={() => navigateTo("main")}
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
            onBackToMain={() => navigateTo("main")}
            onOpenLogin={() => {
              setPendingAction("wishlist");
              setAuthModal("login");
            }}
          />
        );
      case "main":
      default:
        return (
          <Main
            onAddToCart={handleAddToCart}
            onSelectCategory={handleSelectCategory}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
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
          showNotification(`Подписка оформлена для ${email}! Скидка активирована.`)
        }
      />
    </div>
  );
}

export default App;

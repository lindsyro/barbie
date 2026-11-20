import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  type User,
  getStoredUser,
  fetchCurrentUser,
  logoutUser,
} from "@/api/auth.ts";
import { useNotification } from "./NotificationContext.tsx";

export interface AuthContextType {
  currentUser: User | null;
  isLoggedIn: boolean;
  authModal: "login" | "register" | null;
  pendingAction: "cart" | "wishlist" | null;
  openLogin: (action?: "cart" | "wishlist") => void;
  openRegister: (action?: "cart" | "wishlist") => void;
  closeAuthModal: () => void;
  setPendingAction: (action: "cart" | "wishlist" | null) => void;
  logout: () => Promise<void>;
  handleLoginSuccess: (user: User) => void;
  handleRegisterSuccess: (user: User) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    getStoredUser(),
  );
  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null);
  const [pendingAction, setPendingAction] = useState<"cart" | "wishlist" | null>(
    null,
  );
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchCurrentUser().then((verified) => {
      setCurrentUser(verified);
    });
  }, []);

  const openLogin = useCallback((action?: "cart" | "wishlist") => {
    if (action) {
      setPendingAction(action);
    }
    setAuthModal("login");
  }, []);

  const openRegister = useCallback((action?: "cart" | "wishlist") => {
    if (action) {
      setPendingAction(action);
    }
    setAuthModal("register");
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModal(null);
    setPendingAction(null);
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setCurrentUser(null);
    showNotification("Вы успешно вышли из аккаунта");
  }, [showNotification]);

  const handleLoginSuccess = useCallback(
    (user: User) => {
      setCurrentUser(user);
    },
    [],
  );

  const handleRegisterSuccess = useCallback(
    (user: User) => {
      setCurrentUser(user);
    },
    [],
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoggedIn: Boolean(currentUser),
        authModal,
        pendingAction,
        openLogin,
        openRegister,
        closeAuthModal,
        setPendingAction,
        logout,
        handleLoginSuccess,
        handleRegisterSuccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

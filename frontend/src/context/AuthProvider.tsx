import React, { useState, useEffect, useCallback } from "react";
import {
  type User,
  getStoredUser,
  fetchCurrentUser,
  logoutUser,
} from "@/api/auth.ts";
import { AuthContext } from "./AuthContext.ts";
import { useNotification } from "./NotificationContext.ts";

export interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
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

  const handleLoginSuccess = useCallback((user: User) => {
    setCurrentUser(user);
  }, []);

  const handleRegisterSuccess = useCallback((user: User) => {
    setCurrentUser(user);
  }, []);

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

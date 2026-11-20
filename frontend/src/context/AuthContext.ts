import { createContext, useContext } from "react";
import type { User } from "@/api/auth.ts";

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

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

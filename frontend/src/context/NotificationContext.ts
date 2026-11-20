import { createContext, useContext } from "react";

export interface NotificationContextType {
  notification: string | null;
  showNotification: (msg: string) => void;
}

export const NotificationContext =
  createContext<NotificationContextType | null>(null);

export function useNotification(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
}

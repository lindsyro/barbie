import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";

export interface NotificationContextType {
  notification: string | null;
  showNotification: (msg: string) => void;
}

export const NotificationContext =
  createContext<NotificationContextType | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notification, setNotification] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      setNotification(null);
    }, 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ notification, showNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotification(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
}

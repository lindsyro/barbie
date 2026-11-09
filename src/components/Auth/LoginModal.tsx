import React, { useState } from "react";
import Modal from "../Modal/Modal.tsx";
import "./authModal.css";

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
  onForgotPassword?: () => void;
  onLoginSuccess?: (email: string) => void;
  className?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSwitchToRegister,
  onForgotPassword,
  onLoginSuccess,
  className = "",
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Пожалуйста, введите ваш email");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Введите корректный адрес электронной почты");
      return;
    }
    if (!password) {
      setError("Пожалуйста, введите пароль");
      return;
    }

    setIsLoading(true);

    // Имитация успешной авторизации
    setTimeout(() => {
      setIsLoading(false);
      if (onLoginSuccess) {
        onLoginSuccess(trimmedEmail);
      }
      setEmail("");
      setPassword("");
      onClose();
    }, 400);
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Вход в личный кабинет"
      className={className}
      maxWidth="440px"
    >
      <div className="auth-modal">
        {/* Шапка формы */}
        <div className="auth-modal__header">
          <span className="auth-modal__badge">Личный кабинет</span>
          <h2 className="auth-modal__title">Вход в аккаунт</h2>
          <p className="auth-modal__subtitle">
            Доступ к купленным PDF-выкройкам, видеоурокам и закрытым бонусам
          </p>
        </div>

        {/* Форма входа */}
        <form onSubmit={handleSubmit} className="auth-modal__form" noValidate>
          {/* Поле Email */}
          <div className="auth-modal__field">
            <label htmlFor="login-email" className="auth-modal__label">
              Электронная почта
            </label>
            <div className="auth-modal__input-wrapper">
              <input
                id="login-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                className={`auth-modal__input ${error && !email ? "auth-modal__input--error" : ""}`}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Поле Пароль */}
          <div className="auth-modal__field">
            <label htmlFor="login-password" className="auth-modal__label">
              Пароль
            </label>
            <div className="auth-modal__input-wrapper">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                className={`auth-modal__input ${error && !password ? "auth-modal__input--error" : ""}`}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="auth-modal__password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
              >
                {showPassword ? (
                  /* Иконка закрытого глаза */
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  /* Иконка открытого глаза */
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {error && <span className="auth-modal__error-msg">{error}</span>}
          </div>

          {/* Опции: Запомнить меня и Забыли пароль */}
          <div className="auth-modal__row-options">
            <label className="auth-modal__checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="auth-modal__checkbox"
              />
              <span>Запомнить меня</span>
            </label>
            <button
              type="button"
              className="auth-modal__forgot-link"
              onClick={() => {
                onForgotPassword?.();
              }}
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", font: "inherit" }}
            >
              Забыли пароль?
            </button>
          </div>

          {/* Кнопка входа */}
          <button
            type="submit"
            className="auth-modal__submit-btn"
            disabled={isLoading}
          >
            {isLoading ? "Входим..." : "Войти"}
          </button>
        </form>

        {/* Подвал с переключением на регистрацию */}
        <div className="auth-modal__footer">
          <span>Ещё нет аккаунта?</span>{" "}
          <button
            type="button"
            className="auth-modal__switch-btn"
            onClick={onSwitchToRegister}
          >
            Зарегистрироваться
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default LoginModal;

import React, { useState } from "react";
import Modal from "../Modal/Modal.tsx";
import { registerUser, type User } from "../../api/auth.ts";
import "./authModal.css";

export interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
  onRegisterSuccess?: (user: User) => void;
  className?: string;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin,
  onRegisterSuccess,
  className = "",
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError("Пожалуйста, укажите ваше имя");
      return;
    }

    if (!trimmedEmail) {
      setError("Пожалуйста, введите ваш email");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Введите корректный адрес электронной почты");
      return;
    }

    if (!password) {
      setError("Пожалуйста, задайте пароль");
      return;
    }

    if (password.length < 6) {
      setError("Пароль должен содержать не менее 6 символов");
      return;
    }

    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    if (!acceptTerms) {
      setError("Необходимо согласиться с условиями обработки данных");
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerUser({
        name: trimmedName,
        email: trimmedEmail,
        password,
      });

      setIsLoading(false);
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      onClose();

      if (onRegisterSuccess) {
        onRegisterSuccess(result.user);
      }
    } catch (err) {
      setIsLoading(false);
      const message = err instanceof Error ? err.message : "Ошибка при регистрации";
      setError(message);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Регистрация в GOOSE Fashion House"
      className={className}
      maxWidth="460px"
    >
      <div className="auth-modal">
        {/* Шапка формы */}
        <div className="auth-modal__header">
          <span className="auth-modal__badge">Новый аккаунт</span>
          <h2 className="auth-modal__title">Регистрация</h2>
          <p className="auth-modal__subtitle">
            Создайте профиль для быстрого оформления заказов и сохранения выкроек
          </p>
        </div>

        {/* Общее сообщение об ошибке сервера */}
        {error && <div className="auth-modal__alert-error">{error}</div>}

        {/* Форма регистрации */}
        <form onSubmit={handleSubmit} className="auth-modal__form" noValidate style={{ marginTop: error ? "0.75rem" : 0 }}>
          {/* Поле Имя */}
          <div className="auth-modal__field">
            <label htmlFor="register-name" className="auth-modal__label">
              Ваше имя
            </label>
            <div className="auth-modal__input-wrapper">
              <input
                id="register-name"
                type="text"
                placeholder="Как к вам обращаться"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                className={`auth-modal__input ${error && !name ? "auth-modal__input--error" : ""}`}
                autoComplete="name"
                required
              />
            </div>
          </div>

          {/* Поле Email */}
          <div className="auth-modal__field">
            <label htmlFor="register-email" className="auth-modal__label">
              Электронная почта
            </label>
            <div className="auth-modal__input-wrapper">
              <input
                id="register-email"
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
            <label htmlFor="register-password" className="auth-modal__label">
              Пароль
            </label>
            <div className="auth-modal__input-wrapper">
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                placeholder="Не менее 6 символов"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                className={`auth-modal__input ${error && !password ? "auth-modal__input--error" : ""}`}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="auth-modal__password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Поле Повторите пароль */}
          <div className="auth-modal__field">
            <label htmlFor="register-confirm-password" className="auth-modal__label">
              Повторите пароль
            </label>
            <div className="auth-modal__input-wrapper">
              <input
                id="register-confirm-password"
                type={showPassword ? "text" : "password"}
                placeholder="Повторите заданный пароль"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError(null);
                }}
                className={`auth-modal__input ${error && password !== confirmPassword ? "auth-modal__input--error" : ""}`}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          {/* Чекбокс согласия с условиями */}
          <div className="auth-modal__field">
            <label className="auth-modal__checkbox-label">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => {
                  setAcceptTerms(e.target.checked);
                  if (error) setError(null);
                }}
                className="auth-modal__checkbox"
              />
              <span className="auth-modal__terms-text">
                Я согласен с{" "}
                <a href="#privacy" className="auth-modal__terms-link" onClick={(e) => e.stopPropagation()}>
                  Политикой конфиденциальности
                </a>{" "}
                и условиями оферты
              </span>
            </label>
          </div>

          {/* Кнопка регистрации */}
          <button
            type="submit"
            className="auth-modal__submit-btn"
            disabled={isLoading}
          >
            {isLoading ? "Регистрация..." : "Зарегистрироваться"}
          </button>
        </form>

        {/* Подвал с переключением на вход */}
        <div className="auth-modal__footer">
          <span>Уже зарегистрированы?</span>{" "}
          <button
            type="button"
            className="auth-modal__switch-btn"
            onClick={onSwitchToLogin}
          >
            Войти
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RegisterModal;

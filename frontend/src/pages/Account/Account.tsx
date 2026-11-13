import React, { useState, useEffect } from "react";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs.tsx";
import { PagePlaceholder } from "../../components/PagePlaceholder/PagePlaceholder.tsx";
import {
  fetchPurchasedPatterns,
  type PurchasedPattern,
} from "../../api/orders.ts";
import "./account.css";
import "../pages.css";

export interface AccountProps {
  onBackToMain?: () => void;
  user?: { email: string; name?: string } | null;
  onLogout?: () => void;
  onOpenLogin?: () => void;
  onNavigateToCatalog?: () => void;
}

export const Account: React.FC<AccountProps> = ({
  onBackToMain,
  user,
  onLogout,
  onOpenLogin,
  onNavigateToCatalog,
}) => {
  const [purchased, setPurchased] = useState<PurchasedPattern[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(() => Boolean(user));

  useEffect(() => {
    if (!user) return;
    let ignore = false;

    fetchPurchasedPatterns()
      .then((res) => {
        if (!ignore) {
          setPurchased(res.items || []);
        }
      })
      .catch((err) => {
        console.error("Ошибка при получении купленных выкроек:", err);
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [user]);

  const handleDownload = (item: PurchasedPattern) => {
    // Скачивание файла выкройки
    const link = document.createElement("a");
    link.href = item.downloadUrl || item.image;
    link.download = `${item.title}.pdf`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Недавно";
    try {
      return new Date(dateString).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="page-container">
      {/* Хлебные крошки */}
      <Breadcrumbs current="Личный кабинет" onBackToMain={onBackToMain} />

      {/* Заголовок страницы */}
      <div className="page-header">
        <span className="page-header__subtitle">
          {user
            ? `Добро пожаловать, ${user.name || user.email}`
            : "Персональный раздел"}
        </span>
        <h1 className="page-header__title">Личный кабинет</h1>
        <div className="page-header__line" />
      </div>

      {/* Если пользователь не авторизован */}
      {!user ? (
        <PagePlaceholder
          icon={
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="12"
                cy="7"
                r="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
          title="Вход не выполнен"
          description="Войдите или зарегистрируйтесь, чтобы получить доступ к купленным выкройкам и персональной коллекции лекал."
          buttonText="Войти в аккаунт"
          onButtonClick={onOpenLogin}
        />
      ) : (
        <div className="account-layout">
          {/* 1. Карточка профиля */}
          <div className="account-profile-card">
            <div className="account-profile-card__left">
              <div className="account-avatar">
                {(user.name || user.email || "U").charAt(0).toUpperCase()}
              </div>
              <div className="account-user-info">
                <h2 className="account-user-name">{user.name || "Покупатель"}</h2>
                <p className="account-user-email">{user.email}</p>
              </div>
            </div>

            <div className="account-profile-card__actions">
              <div className="account-stat-pill">
                <span>Куплено выкроек:</span>
                <span className="account-stat-pill__count">{purchased.length}</span>
              </div>

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="account-logout-btn"
                  title="Выйти из аккаунта"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>Выйти</span>
                </button>
              )}
            </div>
          </div>

          {/* 2. Раздел: Купленные выкройки */}
          <section className="account-section" aria-label="Купленные выкройки">
            <div className="account-section__header">
              <div className="account-section__title-group">
                <h3 className="account-section__title">Купленные выкройки</h3>
                <span className="account-section__badge">
                  {purchased.length}
                </span>
              </div>
            </div>

            {isLoading ? (
              <div className="purchased-empty">
                <p className="purchased-empty__desc">
                  Загрузка ваших выкроек из базы данных...
                </p>
              </div>
            ) : purchased.length === 0 ? (
              /* Пустой раздел */
              <div className="purchased-empty">
                <div className="purchased-empty__icon">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M9 3v18" />
                    <path d="M14 9h4" />
                    <path d="M14 15h4" />
                  </svg>
                </div>
                <h4 className="purchased-empty__title">
                  У вас пока нет купленных выкроек
                </h4>
                <p className="purchased-empty__desc">
                  Все приобретённые лекала сохраняются здесь бессрочно и
                  доступны для скачивания в любое время.
                </p>
                <a
                  href="#catalog"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigateToCatalog) onNavigateToCatalog();
                    else if (onBackToMain) onBackToMain();
                  }}
                  className="purchased-empty__btn"
                >
                  Перейти в каталог выкроек
                </a>
              </div>
            ) : (
              /* Сетка купленных выкроек */
              <div className="purchased-grid">
                {purchased.map((item) => (
                  <article key={item.id} className="purchased-card">
                    <div className="purchased-card__top">
                      <div className="purchased-card__img-box">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="purchased-card__img"
                        />
                      </div>
                      <div className="purchased-card__meta">
                        <span className="purchased-card__doll">
                          {item.doll}
                        </span>
                        <h4 className="purchased-card__title">{item.title}</h4>
                        <span className="purchased-card__format-tag">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          {item.format || "PDF на А4 • Проверено"}
                        </span>
                      </div>
                    </div>

                    <div className="purchased-card__footer">
                      <div className="purchased-card__order-info">
                        <span>
                          Заказ:{" "}
                          <strong className="purchased-card__order-id">
                            #{item.orderId}
                          </strong>
                        </span>
                        <span>{formatDate(item.purchasedAt)}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDownload(item)}
                        className="purchased-card__download-btn"
                        title={`Скачать файл выкройки «${item.title}»`}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        <span>Скачать PDF (выкройка)</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* 3. Памятка по печати выкроек */}
          <div className="printing-tip-box">
            <div className="printing-tip-box__icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <div>
              <h4 className="printing-tip-box__title">
                Как правильно распечатать PDF-выкройку:
              </h4>
              <p className="printing-tip-box__text">тут интрукция</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;

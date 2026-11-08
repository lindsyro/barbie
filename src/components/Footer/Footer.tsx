import React, { useState } from "react";
import "./footer.css";

export interface FooterProps {
  className?: string;
  onSubscribe?: (email: string) => void;
}

const CURRENT_YEAR = new Date().getFullYear();

export const Footer: React.FC<FooterProps> = ({
  className = "",
  onSubscribe,
}) => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      if (onSubscribe) {
        onSubscribe(email.trim());
      }
      setIsSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className={`footer ${className}`}>
      {/* Декоративная золотая разделительная линия */}
      <div className="footer__divider-accent" />

      {/* Блок подписки на новинки */}
      <div className="footer__newsletter">
        <div className="footer__container">
          <div className="footer__newsletter-content">
            <div className="footer__newsletter-info">
              <h3 className="footer__newsletter-title">
                Узнавайте первыми о новых выкройках
              </h3>
              <p className="footer__newsletter-desc">
                Подпишитесь на закрытые промокоды, бесплатные мастер-классы и
                релизы новых коллекций для кукол.
              </p>
            </div>
            <div className="footer__newsletter-form-wrapper">
              {isSubscribed ? (
                <div className="footer__newsletter-success">
                  ✓ Спасибо! Мы отправили вам промокод на скидку 10% на первый
                  заказ.
                </div>
              ) : (
                <form
                  onSubmit={handleSubscribeSubmit}
                  className="footer__newsletter-form"
                >
                  <input
                    type="email"
                    required
                    placeholder="Введите ваш e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="footer__newsletter-input"
                  />
                  <button type="submit" className="footer__newsletter-btn">
                    Подписаться
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Основная часть футера с колонками */}
      <div className="footer__main">
        <div className="footer__container footer__grid">
          {/* Колонка 1: Бренд и миссия */}
          <div className="footer__col footer__col--brand">
            <div className="footer__logo-group">
              <span className="footer__logo-title">GOOSE</span>
              <span className="footer__logo-sub">FASHION HOUSE</span>
            </div>
            <div className="footer__brand-text">
              <p>Искусство кукольной моды.</p>
              <p>
                Создавайте стильную одежду для любимых кукол с нашими
                PDF-выкройками и подробными видеоуроками.
              </p>
              <p>От первой строчки до маленького шедевра — вместе с GOOSE.</p>
            </div>
          </div>

          {/* Колонка 2: Каталог выкроек */}
          <div className="footer__col">
            <h4 className="footer__col-title">Выкройки кукол</h4>
            <ul className="footer__list">
              <li>
                <a href="#girls-1-6" className="footer__link">
                  Для девушек 1/6
                </a>
              </li>
              <li>
                <a href="#girls-1-4" className="footer__link">
                  Для девушек 1/4
                </a>
              </li>
              <li>
                <a href="#guys" className="footer__link">
                  Для парней
                </a>
              </li>
              <li>
                <a href="#kids" className="footer__link">
                  Для детей
                </a>
              </li>
              <li>
                <a href="#all-patterns" className="footer__link">
                  Все выкройки каталога
                </a>
              </li>
            </ul>
          </div>

          {/* Колонка 3: Покупателям */}
          <div className="footer__col">
            <h4 className="footer__col-title">Покупателям</h4>
            <ul className="footer__list">
              <li>
                <a href="#measurements" className="footer__link">
                  Выбрать куклу
                </a>
              </li>
              <li>
                <a href="#a4-print" className="footer__link">
                  Мерки кукол
                </a>
              </li>
              <li>
                <a href="#tutorials" className="footer__link">
                  Личный кабинет
                </a>
              </li>
              <li>
                <a href="#faq" className="footer__link">
                  Условия покупки
                </a>
              </li>
              <li>
                <a href="#reviews" className="footer__link">
                  Отзывы мастериц
                </a>
              </li>
            </ul>
          </div>

          {/* Колонка 4: Контакты и сервис */}
          <div className="footer__col footer__col--contacts">
            <h4 className="footer__col-title">Контакты</h4>
            <div className="footer__contacts-wrap">
              {/* Смысловой блок 1: Соцсети и каналы */}
              <div className="footer__contact-block">
                <span className="footer__contact-label">МЫ В СЕТИ</span>
                <ul className="footer__contact-links">
                  <li>
                    <a
                      href="https://vk.com"
                      target="_blank"
                      rel="noreferrer"
                      className="footer__link"
                    >
                      ВКонтакте
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://ozon.ru"
                      target="_blank"
                      rel="noreferrer"
                      className="footer__link"
                    >
                      Ozon
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://rutube.ru"
                      target="_blank"
                      rel="noreferrer"
                      className="footer__link"
                    >
                      Rutube
                    </a>
                  </li>
                </ul>
              </div>

              {/* Смысловой блок 2: Поддержка и обратная связь */}
              <div className="footer__contact-block">
                <span className="footer__contact-label">СЛУЖБА ЗАБОТЫ</span>
                <a
                  href="mailto:support@goose-fashion.ru"
                  className="footer__contact-email"
                >
                  support@goose-fashion.ru
                </a>
                <span className="footer__contact-hint">
                  Отвечаем ежедневно с 10:00 до 20:00
                </span>
              </div>

              {/* Смысловой блок 3: Доставка и гарантия */}
              {/* <div className="footer__guarantee">
                <span className="footer__guarantee-icon">⚡</span>
                <span className="footer__guarantee-text">
                  PDF-файлы высылаются автоматически сразу после подтверждения оплаты
                </span>
              </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Нижняя полоса с копирайтом */}
      <div className="footer__bottom">
        <div className="footer__container footer__bottom-inner">
          <p className="footer__copyright">
            © {CURRENT_YEAR} GOOSE Fashion House. Все права защищены.
          </p>
          <div className="footer__legal">
            <a href="#privacy" className="footer__legal-link">
              Политика конфиденциальности
            </a>
            <span className="footer__legal-sep">•</span>
            <a href="#terms" className="footer__legal-link">
              Договор публичной оферты
            </a>
            <span className="footer__legal-sep">•</span>
            <a href="#cookies" className="footer__legal-link">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

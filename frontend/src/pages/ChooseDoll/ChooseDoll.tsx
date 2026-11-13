import React, { useState, useMemo } from "react";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs.tsx";
import { DOLLS_DATA, type DollItem } from "./dollsData.ts";
import "./chooseDoll.css";
import "../pages.css";

export interface ChooseDollProps {
  onBackToMain?: () => void;
  onNavigateToCatalog?: (categoryOrHash?: string) => void;
}

type CategoryType = "all" | "girls" | "guys" | "curvy" | "collectible" | "bjd";

const BASE = import.meta.env.BASE_URL;

export const ChooseDoll: React.FC<ChooseDollProps> = ({
  onBackToMain,
  onNavigateToCatalog,
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDoll, setSelectedDoll] = useState<DollItem | null>(null);

  // Категории с подсчётом количества
  const categories: { id: CategoryType; label: string; count: number }[] = useMemo(() => {
    return [
      { id: "all", label: "Все куклы", count: DOLLS_DATA.length },
      { id: "girls", label: "Девушки 1/6", count: DOLLS_DATA.filter((d) => d.category === "girls").length },
      { id: "guys", label: "Парни / Кен", count: DOLLS_DATA.filter((d) => d.category === "guys").length },
      { id: "curvy", label: "Пышки (Curvy)", count: DOLLS_DATA.filter((d) => d.category === "curvy").length },
      { id: "collectible", label: "Коллекционные", count: DOLLS_DATA.filter((d) => d.category === "collectible").length },
      { id: "bjd", label: "BJD / Авторские", count: DOLLS_DATA.filter((d) => d.category === "bjd").length },
      { id: "child", label: "Дети", count: DOLLS_DATA.filter((d) => d.category === "child").length },
    ];
  }, []);

  // Фильтрация и поиск
  const filteredDolls = useMemo(() => {
    return DOLLS_DATA.filter((doll) => {
      // 1. Фильтр по категории
      if (activeCategory !== "all" && doll.category !== activeCategory) {
        return false;
      }
      // 2. Поиск по тексту
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const inName = doll.name.toLowerCase().includes(query);
        const inType = doll.dollType.toLowerCase().includes(query);
        const inFeatures = doll.features.toLowerCase().includes(query);
        const inTag = doll.tag.toLowerCase().includes(query);
        return inName || inType || inFeatures || inTag;
      }
      return true;
    });
  }, [activeCategory, searchQuery]);

  const handleSelectDollPatterns = (doll: DollItem) => {
    if (onNavigateToCatalog) {
      onNavigateToCatalog(doll.catalogHash);
    } else {
      window.location.hash = doll.catalogHash;
    }
  };

  return (
    <div className="page-container choose-doll-page">
      {/* Хлебные крошки */}
      <Breadcrumbs current="Выбрать куклу" onBackToMain={onBackToMain} />

      {/* Заголовок страницы */}
      <div className="page-header">
        <span className="page-header__subtitle">Анатомический справочник GOOSE</span>
        <h1 className="page-header__title">Выбрать куклу</h1>
        <div className="page-header__line" />
      </div>

      {/* Панель фильтров и поиска */}
      <div className="choose-doll-toolbar">
        {/* Поисковая строка */}
        <div className="choose-doll-search-row">
          <div className="choose-doll-search">
            <svg
              className="choose-doll-search__icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="choose-doll-search__input"
              placeholder="Поиск куклы по названию, типу тела или молду (например, Made to Move, Broad, Curvy, Silkstone)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Табы категорий */}
        <div className="choose-doll-filters">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`choose-doll-filter-btn ${activeCategory === cat.id ? "choose-doll-filter-btn--active" : ""}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span>{cat.label}</span>
              <span className="choose-doll-filter-btn__count">{cat.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Сетка кукол */}
      {filteredDolls.length === 0 ? (
        <div className="dolls-empty">
          <h3 className="dolls-empty__title">Куклы не найдены</h3>
          <p className="dolls-empty__desc">
            По запросу «{searchQuery}» ничего не найдено. Попробуйте изменить параметры поиска или сбросить фильтры.
          </p>
          <button
            type="button"
            className="dolls-empty__reset-btn"
            onClick={() => {
              setSearchQuery("");
              setActiveCategory("all");
            }}
          >
            Сбросить поиск
          </button>
        </div>
      ) : (
        <div className="dolls-grid">
          {filteredDolls.map((doll) => (
            <article key={doll.id} className="doll-card">
              {/* Фото куклы в купальнике */}
              <div
                className="doll-card__img-box"
                onClick={() => setSelectedDoll(doll)}
                title="Нажмите для просмотра крупным планом"
              >
                <img
                  src={`${BASE}dolls/${encodeURI(doll.fileName)}`}
                  alt={doll.name}
                  className="doll-card__img"
                  loading="lazy"
                />
                <span className="doll-card__tag">{doll.tag}</span>
                <span className="doll-card__scale-badge">{doll.scale}</span>
              </div>

              {/* Информация о кукле */}
              <div className="doll-card__body">
                <div className="doll-card__cat-row">
                  <span>{doll.categoryLabel}</span>
                  <span>{doll.height}</span>
                </div>

                <h3 className="doll-card__title">{doll.name}</h3>
                <p className="doll-card__type">{doll.dollType}</p>

                {/* Мерки фигуры */}
                <div className="doll-card__measurements">
                  <span>
                    ОГ: <strong>{doll.measurements.bust}</strong>
                  </span>
                  <span>
                    ОТ: <strong>{doll.measurements.waist}</strong>
                  </span>
                  <span>
                    ОБ: <strong>{doll.measurements.hips}</strong>
                  </span>
                </div>

                <p className="doll-card__features">{doll.features}</p>

                {/* Кнопки действий */}
                <div className="doll-card__footer">
                  <button
                    type="button"
                    className="doll-card__btn-patterns"
                    onClick={() => handleSelectDollPatterns(doll)}
                  >
                    <span>Выкройки</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="doll-card__btn-details"
                    onClick={() => setSelectedDoll(doll)}
                    title="Подробные мерки куклы"
                  >
                    Мерки
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Модальное окно крупного просмотра куклы */}
      {selectedDoll && (
        <div className="doll-modal-overlay" onClick={() => setSelectedDoll(null)}>
          <div className="doll-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="doll-modal__close-btn"
              onClick={() => setSelectedDoll(null)}
              aria-label="Закрыть"
            >
              ×
            </button>

            <div className="doll-modal__img-box">
              <img
                src={`${BASE}dolls/${encodeURI(selectedDoll.fileName)}`}
                alt={selectedDoll.name}
                className="doll-modal__img"
              />
            </div>

            <div className="doll-modal__body">
              <span className="doll-modal__badge">{selectedDoll.categoryLabel} • {selectedDoll.scale}</span>
              <h2 className="doll-modal__title">{selectedDoll.name}</h2>
              <p className="doll-modal__type">{selectedDoll.dollType}</p>

              <table className="doll-modal__table">
                <tbody>
                  <tr>
                    <td>Рост куклы:</td>
                    <td>{selectedDoll.height}</td>
                  </tr>
                  <tr>
                    <td>Обхват груди (ОГ):</td>
                    <td>{selectedDoll.measurements.bust}</td>
                  </tr>
                  <tr>
                    <td>Обхват талии (ОТ):</td>
                    <td>{selectedDoll.measurements.waist}</td>
                  </tr>
                  <tr>
                    <td>Обхват бёдер (ОБ):</td>
                    <td>{selectedDoll.measurements.hips}</td>
                  </tr>
                  <tr>
                    <td>Особенности посадки:</td>
                    <td>{selectedDoll.tag}</td>
                  </tr>
                </tbody>
              </table>

              <p style={{ fontSize: "0.85rem", color: "var(--color-taupe)", lineHeight: 1.5, margin: 0 }}>
                {selectedDoll.features}
              </p>

              <div className="doll-modal__actions">
                <button
                  type="button"
                  className="doll-modal__cta-btn"
                  onClick={() => {
                    handleSelectDollPatterns(selectedDoll);
                    setSelectedDoll(null);
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1" fill="currentColor" />
                    <circle cx="20" cy="21" r="1" fill="currentColor" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  <span>Смотреть выкройки для этой куклы</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChooseDoll;

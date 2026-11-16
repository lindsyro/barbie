import React, { useState, useMemo } from "react";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs.tsx";
import { PageHeader } from "../../components/PageHeader/PageHeader.tsx";
import { DOLLS_DATA, type DollItem } from "./dollsData.ts";
import { searchDolls } from "./searchDolls.ts";
import "./chooseDoll.css";
import "../pages.css";

export interface ChooseDollProps {
  onBackToMain?: () => void;
  onNavigateToCatalog?: (categoryOrHash?: string) => void;
}

const BASE = import.meta.env.BASE_URL;

export const ChooseDoll: React.FC<ChooseDollProps> = ({
  onBackToMain,
  onNavigateToCatalog,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDoll, setSelectedDoll] = useState<DollItem | null>(null);

  // Фильтрация и поиск
  const filteredDolls = useMemo(() => {
    return searchDolls(DOLLS_DATA, searchQuery);
  }, [searchQuery]);

  const handleSelectDollPatterns = (doll: DollItem) => {
    if (onNavigateToCatalog) {
      onNavigateToCatalog(doll.catalogHash);
    } else {
      window.location.hash = doll.catalogHash;
    }
  };

  return (
    <div className="page-container choose-doll-page">
      {/* Верхняя строка: хлебные крошки слева, компактный поиск справа */}
      <div className="choose-doll-top-bar">
        <Breadcrumbs current="Выбрать куклу" onBackToMain={onBackToMain} />

        <div className="choose-doll-compact-search">
          <svg
            className="choose-doll-compact-search__icon"
            width="15"
            height="15"
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
            className="choose-doll-compact-search__input"
            placeholder="Поиск куклы..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="choose-doll-compact-search__clear"
              onClick={() => setSearchQuery("")}
              title="Очистить поиск"
              aria-label="Очистить поиск"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Заголовок страницы */}
      <PageHeader
        title="Выбрать куклу"
        subtitle="Анатомический справочник GOOSE"
      />

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
              <div className="doll-card__img-box">
                <img
                  src={`${BASE}dolls/${encodeURI(doll.fileName.normalize("NFC"))}`}
                  alt={doll.name}
                  className="doll-card__img"
                  loading="lazy"
                />
              </div>

              {/* Информация о кукле */}
              <div className="doll-card__body">
                <div className="doll-card__cat-row">
                  <span>{doll.category}</span>
                  <span>{doll.height}</span>
                </div>

                <h3 className="doll-card__title">{doll.name}</h3>

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
                    title="Мерки куклы"
                  >
                    Мерки
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Модальное окно: только фото мерок и кнопка смотреть выкройки */}
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

            {/* Фото мерок */}
            <div className="doll-modal__measurements-box">
              {selectedDoll.measurementsFileName ? (
                <img
                  src={`${BASE}measurements/${encodeURI(selectedDoll.measurementsFileName)}`}
                  alt={`Мерки ${selectedDoll.name}`}
                  className="doll-modal__measurements-img"
                />
              ) : (
                <div className="doll-modal__measurements-empty">
                  <p>Таблица мерок для этой модели куклы готовится к публикации.</p>
                </div>
              )}
            </div>

            {/* Кнопка смотреть выкройки */}
            <div className="doll-modal__footer-btn-box">
              <button
                type="button"
                className="doll-modal__cta-btn"
                onClick={() => {
                  handleSelectDollPatterns(selectedDoll);
                  setSelectedDoll(null);
                }}
              >
                <span>Смотреть выкройки</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChooseDoll;

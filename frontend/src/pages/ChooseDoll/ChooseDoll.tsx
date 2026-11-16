import React, { useState, useMemo } from "react";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs.tsx";
import { PageHeader } from "../../components/PageHeader/PageHeader.tsx";
import { Modal } from "../../components/Modal/Modal.tsx";
import { SearchIcon, ArrowRightIcon } from "../../components/icons/index.ts";
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
          <SearchIcon className="choose-doll-compact-search__icon" size={15} />
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
                    <ArrowRightIcon size={14} />
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

      {/* Модальное окно мерок куклы */}
      <Modal
        isOpen={Boolean(selectedDoll)}
        onClose={() => setSelectedDoll(null)}
        title={selectedDoll ? `Мерки куклы ${selectedDoll.name}` : "Мерки куклы"}
        className="doll-modal"
        maxWidth="540px"
      >
        {selectedDoll && (
          <>
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
                <ArrowRightIcon size={16} />
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default ChooseDoll;

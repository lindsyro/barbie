import React, { useState, useMemo, useCallback } from "react";
import { Breadcrumbs, PageHeader, SearchInput } from "@/components/index.ts";
import { useAsyncData } from "@/hooks/index.ts";
import { fetchDolls } from "@/api/dolls.ts";
import { DollCard, DollMeasurementsModal } from "./components/index.ts";
import type { DollItem } from "./types.ts";
import { searchDolls } from "./searchDolls.ts";
import "./chooseDoll.css";

export interface ChooseDollProps {
  onBackToMain?: () => void;
  onNavigateToCatalog?: (categoryOrHash?: string) => void;
}

export const ChooseDoll: React.FC<ChooseDollProps> = ({
  onBackToMain,
  onNavigateToCatalog,
}) => {
  // Универсальная загрузка кукол из базы данных PostgreSQL
  const { data: dolls = [], isLoading } = useAsyncData(fetchDolls, {
    initialData: [],
  });

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDoll, setSelectedDoll] = useState<DollItem | null>(null);

  // Фильтрация и поиск
  const filteredDolls = useMemo(() => {
    return searchDolls(dolls, searchQuery);
  }, [dolls, searchQuery]);

  const handleSelectDollPatterns = useCallback(
    (_doll: DollItem) => {
      // Временная заглушка: переход ко всем выкройкам каталога
      if (onNavigateToCatalog) {
        onNavigateToCatalog("catalog");
      } else {
        window.location.hash = "catalog";
      }
    },
    [onNavigateToCatalog]
  );

  const handleCloseModal = useCallback(() => {
    setSelectedDoll(null);
  }, []);

  return (
    <div className="page-container choose-doll-page">
      {/* Верхняя строка: хлебные крошки слева, компактный поиск справа */}
      <div className="page-top-bar">
        <Breadcrumbs current="Выбрать куклу" onBackToMain={onBackToMain} />
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Поиск куклы..."
        />
      </div>

      {/* Заголовок страницы */}
      <PageHeader
        title="Выбрать куклу"
        subtitle="Анатомический справочник GOOSE"
      />

      {/* Индикатор загрузки или сетка кукол */}
      {isLoading ? (
        <div className="dolls-empty">
          <p className="dolls-empty__desc">Загрузка кукол из базы данных...</p>
        </div>
      ) : filteredDolls.length === 0 ? (
        <div className="dolls-empty">
          <h3 className="dolls-empty__title">Куклы не найдены</h3>
          <p className="dolls-empty__desc">
            По запросу «{searchQuery}» ничего не найдено. Попробуйте изменить
            параметры поиска или сбросить фильтры.
          </p>
        </div>
      ) : (
        <div className="dolls-grid">
          {filteredDolls.map((doll) => (
            <DollCard
              key={doll.id}
              doll={doll}
              onSelectPatterns={handleSelectDollPatterns}
              onOpenMeasurements={setSelectedDoll}
            />
          ))}
        </div>
      )}

      {/* Модальное окно мерок куклы */}
      <DollMeasurementsModal
        doll={selectedDoll}
        onClose={handleCloseModal}
        onSelectPatterns={handleSelectDollPatterns}
      />
    </div>
  );
};

export default ChooseDoll;

import React, { useState, useMemo } from "react";
import { Breadcrumbs, PageHeader } from "@/components/index.ts";
import {
  ChooseDollSearch,
  DollCard,
  DollMeasurementsModal,
} from "./components/index.ts";
import { DOLLS_DATA, type DollItem } from "./dollsData.ts";
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
        <ChooseDollSearch value={searchQuery} onChange={setSearchQuery} />
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
        onClose={() => setSelectedDoll(null)}
        onSelectPatterns={handleSelectDollPatterns}
      />
    </div>
  );
};

export default ChooseDoll;

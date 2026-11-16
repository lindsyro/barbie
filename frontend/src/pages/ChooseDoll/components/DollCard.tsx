import React from "react";
import { ArrowRightIcon } from "@/components/icons/index.ts";
import type { DollItem } from "../dollsData.ts";

export interface DollCardProps {
  doll: DollItem;
  onSelectPatterns: (doll: DollItem) => void;
  onOpenMeasurements: (doll: DollItem) => void;
}

const BASE = import.meta.env.BASE_URL;

export const DollCard: React.FC<DollCardProps> = React.memo(({
  doll,
  onSelectPatterns,
  onOpenMeasurements,
}) => {
  return (
    <article className="doll-card">
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
            onClick={() => onSelectPatterns(doll)}
          >
            <span>Выкройки</span>
            <ArrowRightIcon size={14} />
          </button>

          <button
            type="button"
            className="doll-card__btn-details"
            onClick={() => onOpenMeasurements(doll)}
            title="Мерки куклы"
          >
            Мерки
          </button>
        </div>
      </div>
    </article>
  );
});

DollCard.displayName = "DollCard";

export default DollCard;

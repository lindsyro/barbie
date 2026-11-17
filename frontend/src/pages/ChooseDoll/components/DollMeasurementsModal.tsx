import React from "react";
import { Modal } from "@/components/Modal/Modal.tsx";
import { ArrowRightIcon } from "@/components/icons/index.ts";
import type { DollItem } from "../dollsData.ts";

export interface DollMeasurementsModalProps {
  doll: DollItem | null;
  onClose: () => void;
  onSelectPatterns: (doll: DollItem) => void;
}

const BASE = import.meta.env.BASE_URL;

export const DollMeasurementsModal: React.FC<DollMeasurementsModalProps> = ({
  doll,
  onClose,
  onSelectPatterns,
}) => {
  return (
    <Modal
      isOpen={Boolean(doll)}
      onClose={onClose}
      title={doll ? `Мерки куклы ${doll.nameEn} (${doll.nameRu})` : "Мерки куклы"}
      className="doll-modal"
      maxWidth="540px"
    >
      {doll && (
        <>
          {/* Фото мерок */}
          <div className="doll-modal__measurements-box">
            {doll.measurementsFileName ? (
              <img
                src={`${BASE}measurements/${encodeURI(doll.measurementsFileName)}`}
                alt={`Мерки ${doll.nameEn}`}
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
                onSelectPatterns(doll);
                onClose();
              }}
            >
              <span>Смотреть выкройки</span>
              <ArrowRightIcon size={16} />
            </button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default DollMeasurementsModal;

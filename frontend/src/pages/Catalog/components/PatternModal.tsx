import React, { useState, useEffect } from "react";
import { Modal } from "@/components/Modal/Modal.tsx";
import type { CatalogPatternItem } from "../types.ts";

export interface PatternModalProps {
  pattern: CatalogPatternItem | null;
  isOpen?: boolean;
  onClose: () => void;
  onAddToCart?: (title: string) => void;
}

interface PatternModalContentProps {
  pattern: CatalogPatternItem;
}

const PatternModalContent: React.FC<PatternModalContentProps> = ({
  pattern,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  const images =
    pattern.images && pattern.images.length > 0
      ? pattern.images
      : [pattern.image];
  const currentImage = images[activeImageIndex] || pattern.image;

  // Управление галереей с клавиатуры (стрелки влево/вправо)
  useEffect(() => {
    if (images.length <= 1) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setActiveImageIndex((prev) =>
          prev > 0 ? prev - 1 : images.length - 1,
        );
      } else if (e.key === "ArrowRight") {
        setActiveImageIndex((prev) =>
          prev < images.length - 1 ? prev + 1 : 0,
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length]);

  return (
    <div className="catalog-modal__gallery">
      {/* Крупное фото */}
      <div className="catalog-modal__img-box">
        <img
          src={currentImage}
          alt={`${pattern.title} - фото ${activeImageIndex + 1}`}
          className="catalog-modal__img"
        />

        {/* Навигация стрелками и счетчик */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              className="catalog-modal__nav-btn catalog-modal__nav-btn--prev"
              onClick={() =>
                setActiveImageIndex((prev) =>
                  prev > 0 ? prev - 1 : images.length - 1,
                )
              }
              aria-label="Предыдущее фото"
            >
              ‹
            </button>
            <button
              type="button"
              className="catalog-modal__nav-btn catalog-modal__nav-btn--next"
              onClick={() =>
                setActiveImageIndex((prev) =>
                  prev < images.length - 1 ? prev + 1 : 0,
                )
              }
              aria-label="Следующее фото"
            >
              ›
            </button>
            <span className="catalog-modal__counter">
              {activeImageIndex + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {/* Лента миниатюр (если фото больше одного) */}
      {images.length > 1 && (
        <div className="catalog-modal__thumbs">
          {images.map((imgSrc, idx) => (
            <button
              key={idx}
              type="button"
              className={`catalog-modal__thumb ${idx === activeImageIndex ? "catalog-modal__thumb--active" : ""}`}
              onClick={() => setActiveImageIndex(idx)}
              title={`Фото ${idx + 1}`}
              aria-label={`Переключить на фото ${idx + 1}`}
            >
              <img src={imgSrc} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const PatternModal: React.FC<PatternModalProps> = ({
  pattern,
  isOpen,
  onClose,
}) => {
  const isModalOpen = isOpen ?? Boolean(pattern);

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={onClose}
      className="catalog-modal"
      maxWidth="fit-content"
      showCloseButton={true}
    >
      {pattern && <PatternModalContent key={pattern.id} pattern={pattern} />}
    </Modal>
  );
};

export default PatternModal;

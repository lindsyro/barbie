import React from "react";
import { SearchIcon } from "../../../components/icons/index.ts";

export interface ChooseDollSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const ChooseDollSearch: React.FC<ChooseDollSearchProps> = ({
  value,
  onChange,
  placeholder = "Поиск куклы...",
  className = "",
}) => {
  return (
    <div className={`choose-doll-compact-search ${className}`.trim()}>
      <SearchIcon className="choose-doll-compact-search__icon" size={15} />
      <input
        type="text"
        className="choose-doll-compact-search__input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          type="button"
          className="choose-doll-compact-search__clear"
          onClick={() => onChange("")}
          title="Очистить поиск"
          aria-label="Очистить поиск"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default ChooseDollSearch;

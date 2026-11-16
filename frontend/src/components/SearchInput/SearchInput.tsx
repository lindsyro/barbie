import React from "react";
import { SearchIcon } from "@/components/icons/index.ts";
import "./searchInput.css";

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Поиск...",
  className = "",
  autoFocus = false,
}) => {
  return (
    <div className={`search-input ${className}`.trim()}>
      <SearchIcon className="search-input__icon" size={15} />
      <input
        type="text"
        className="search-input__field"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
      />
      {value && (
        <button
          type="button"
          className="search-input__clear"
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

export default SearchInput;

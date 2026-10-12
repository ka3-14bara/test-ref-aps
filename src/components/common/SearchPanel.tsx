import React, { useState, useEffect } from "react";
import { Header } from "../../types/table";

interface SearchPanelProps {
  searchTerm: string;
  onSearch: (value: string) => void;
  headers: Header[];
  isServerSearch?: boolean;
  toggleServerSearch?: () => void;
  onSearchSubmit?: (term?: string) => void;
  selectedColumn?: string;
  onColumnChange?: (columnKey: string) => void;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  searchTerm,
  onSearch,
  headers,
  isServerSearch = false,
  toggleServerSearch,
  onSearchSubmit,
  selectedColumn = "all",
  onColumnChange,
}) => {
  const [localTerm, setLocalTerm] = useState<string>(searchTerm);

  useEffect(() => {
    setLocalTerm(searchTerm);
  }, [searchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalTerm(val);
    onSearch(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearchSubmit) {
      onSearchSubmit(localTerm);
    }
  };

  const handleClear = () => {
    setLocalTerm("");
    onSearch("");
    if (isServerSearch && onSearchSubmit) {
      onSearchSubmit("");
    }
  };

  return (
    <div className="d-flex align-items-center gap-2">
      <div className="input-group" style={{ minWidth: "260px" }}>
        <span className="input-group-text bg-white border-end-0">
          <i className="bi bi-search text-muted"></i>
        </span>
        <input
          type="text"
          className="form-control border-start-0"
          placeholder={
            isServerSearch
              ? "Серверный поиск (Enter)..."
              : selectedColumn === "all"
                ? "Локальный поиск по всем колонкам..."
                : "Поиск по выбранному столбцу..."
          }
          value={localTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        {localTerm && (
          <button
            className="btn btn-outline-secondary border-start-0"
            type="button"
            onClick={handleClear}
            title="Очистить"
          >
            <i className="bi bi-x"></i>
          </button>
        )}
      </div>

      {/* Селектор доступен строго при локальном поиске */}
      <select
        className="form-select w-auto"
        value={isServerSearch ? "all" : selectedColumn}
        disabled={isServerSearch}
        title={
          isServerSearch
            ? "Выбор конкретного столбца доступен только при локальном поиске"
            : undefined
        }
        onChange={(e) => onColumnChange && onColumnChange(e.target.value)}
      >
        <option value="all">Все столбцы</option>
        {headers
          .filter((h) => !h.key.startsWith("none") && h.key !== "id")
          .map((h) => (
            <option key={h.key} value={h.key}>
              {h.label}
            </option>
          ))}
      </select>

      {toggleServerSearch && (
        <div className="form-check form-switch ms-2 mb-0 d-flex align-items-center text-nowrap">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="serverSearchSwitch"
            checked={isServerSearch}
            onChange={toggleServerSearch}
          />
          <label
            className="form-check-label ms-2 small user-select-none"
            htmlFor="serverSearchSwitch"
          >
            Серверный поиск
          </label>
        </div>
      )}
    </div>
  );
};

export default SearchPanel;

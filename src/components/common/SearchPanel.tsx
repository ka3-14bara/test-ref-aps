import React, { useState } from "react";
import { Header } from "../../types/table";

interface SearchPanelProps {
  searchTerm: string;
  onSearch: (value: string) => void;
  headers: Header[];
  isServerSearch?: boolean;
  toggleServerSearch?: () => void;
  onSearchSubmit?: (field: string, term: string) => void;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  searchTerm,
  onSearch,
  headers,
  isServerSearch = false,
  toggleServerSearch,
  onSearchSubmit,
}) => {
  const [selectedField, setSelectedField] = useState<string>("all");
  const [localTerm, setLocalTerm] = useState<string>(searchTerm);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalTerm(val);
    onSearch(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearchSubmit) {
      onSearchSubmit(selectedField, localTerm);
    }
  };

  return (
    <div className="d-flex align-items-center gap-2">
      <div className="input-group">
        <span className="input-group-text bg-white border-end-0">
          <i className="bi bi-search text-muted"></i>
        </span>
        <input
          type="text"
          className="form-control border-start-0"
          placeholder="Поиск по таблице..."
          value={localTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        {localTerm && (
          <button
            className="btn btn-outline-secondary border-start-0"
            type="button"
            onClick={() => {
              setLocalTerm("");
              onSearch("");
            }}
          >
            <i className="bi bi-x"></i>
          </button>
        )}
      </div>

      <select
        className="form-select w-auto"
        value={selectedField}
        onChange={(e) => setSelectedField(e.target.value)}
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

import React, { useEffect } from "react";
import { Header } from "./Types";

interface SearchPanelProps {
  searchTerm: string;
  onSearch: (term: string, columnId?: string) => void;
  headers: Header[];
  isServerSearch: boolean;
  toggleServerSearch: () => void;
  onSearchSubmit: (term?: string) => void;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  searchTerm,
  onSearch,
  headers,
  isServerSearch,
  toggleServerSearch,
  onSearchSubmit,
}) => {
  const [selectedColumn, setSelectedColumn] = React.useState<string>("all");

  // Эффект срабатывает каждый раз при изменении положения переключателя
  useEffect(() => {
    // 1. Сбрасываем выбранную колонку в дефолтное состояние "Все колонки"
    setSelectedColumn("all");
    
    // 2. Передаем наружу пустую строку для очистки стейта searchTerm в родительском компоненте
    onSearch("", undefined);
    
    // 3. Вызываем функцию отправки запроса с пустой строкой
    onSearchSubmit("");
    
  }, [isServerSearch]); // Следим за изменением переключателя

  const searchableHeaders = headers.filter(
    (h) => h.label && !h.key.startsWith("none_") && h.row === 1,
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    onSearch(value, selectedColumn === "all" ? undefined : selectedColumn);

    if (isServerSearch && value.trim() === "") {
      onSearchSubmit(value);
    }
  };

  return (
    <div className="search-panel d-flex align-items-center gap-2 mb-0">
      {isServerSearch ? (
        <>
          <input
            type="text"
            id="search-field"
            className="form-control"
            style={{ width: "300px" }}
            placeholder="Поиск по всей таблице..."
            onKeyDown={(e) => e.key === "Enter" && onSearchSubmit(searchTerm)}
            value={searchTerm}
            onChange={handleInputChange}
          />
          <button
            className="btn btn-primary"
            onClick={() => onSearchSubmit(searchTerm)} // Передаем актуальный searchTerm при клике
            disabled={!searchTerm.trim()}
          >
            Найти
          </button>
        </>
      ) : (
        <>
          <select
            className="form-select w-25"
            id="select-column"
            value={selectedColumn}
            onChange={(e) => {
              setSelectedColumn(e.target.value);
              onSearch("", undefined);
            }}
          >
            <option value="all">Все колонки</option>
            {searchableHeaders.map((h) => (
              <option key={h.key} value={h.key}>
                {h.label}
              </option>
            ))}
          </select>

          <input
            type="text"
            id="search-field"
            placeholder={
              selectedColumn === "all"
                ? "Поиск на странице..."
                : "Поиск по полю на странице..."
            }
            value={searchTerm}
            onChange={handleInputChange}
            className="form-control"
            style={{ width: "200px" }}
          />
        </>
      )}

      <div className="form-check form-switch ms-2">
        <input
          className="form-check-input"
          type="checkbox"
          role="switch"
          id="searchModeSwitch"
          checked={isServerSearch}
          onChange={toggleServerSearch}
        />
        <label className="form-check-label ms-2" htmlFor="searchModeSwitch">
          {isServerSearch ? "Глобальный поиск" : "Локальный поиск"}
        </label>
      </div>
    </div>
  );
};

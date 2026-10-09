import React, { useState, useEffect, useRef, useCallback } from "react";
import { axiosInstance } from "../../api/client";

interface SearchableInputProps<T> {
  endpoint: string;
  onItemSelected: (item: T) => void;
  inputId: string;
  searchAndShowParam?: keyof T | string;
  commentParam?: keyof T | string | ((item: T) => string);
  style?: React.CSSProperties;
  isRequired?: boolean;
  isDisabled?: boolean;
  showAfterReload?: string;
  placeholder?: string;
}

export function SearchableInput<T extends Record<string, any>>({
  endpoint,
  onItemSelected,
  inputId,
  searchAndShowParam = "title",
  commentParam = "comment",
  style,
  isRequired = false,
  isDisabled = false,
  showAfterReload = "",
  placeholder = "Начните ввод для поиска...",
}: SearchableInputProps<T>) {
  const [searchTerm, setSearchTerm] = useState<string>(showAfterReload);
  const [items, setItems] = useState<T[]>([]);
  const [filteredItems, setFilteredItems] = useState<T[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSelected, setIsSelected] = useState(Boolean(showAfterReload));

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showAfterReload) {
      setSearchTerm(showAfterReload);
      setIsSelected(true);
    }
  }, [showAfterReload]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get<T[]>(endpoint);
      setItems(res.data || []);
    } catch (err) {
      console.error(`Ошибка загрузки данных из ${endpoint}:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPropertyValue = (
    item: T,
    param: keyof T | string | ((i: T) => string),
  ): string => {
    if (typeof param === "function") return param(item) || "";
    const key = String(param);
    if (key.includes(".")) {
      return key.split(".").reduce((acc, part) => acc?.[part], item) ?? "";
    }
    return item[key] ?? "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setIsSelected(false);

    if (!isOpen && items.length === 0) {
      loadData();
    }

    if (!term.trim()) {
      setFilteredItems(items);
      setIsOpen(true);
      return;
    }

    const filtered = items.filter((item) => {
      const mainVal = String(
        getPropertyValue(item, searchAndShowParam),
      ).toLowerCase();
      const commVal = String(
        getPropertyValue(item, commentParam),
      ).toLowerCase();
      const search = term.toLowerCase();
      return mainVal.includes(search) || commVal.includes(search);
    });

    setFilteredItems(filtered);
    setIsOpen(true);
  };

  const handleFocus = () => {
    if (items.length === 0) {
      loadData();
    }
    setFilteredItems(items);
    setIsOpen(true);
  };

  const handleSelect = (item: T) => {
    const mainVal = String(getPropertyValue(item, searchAndShowParam));
    setSearchTerm(mainVal);
    setIsSelected(true);
    setIsOpen(false);
    onItemSelected(item);
  };

  const handleClear = () => {
    setSearchTerm("");
    setIsSelected(false);
    onItemSelected(null as any);
  };

  return (
    <div ref={wrapperRef} className="position-relative w-100">
      <div className="input-group">
        <input
          type="text"
          id={inputId}
          className={`form-control ${isRequired && !isSelected ? "is-invalid" : ""}`}
          placeholder={placeholder}
          value={searchTerm}
          disabled={isDisabled}
          style={style}
          onChange={handleInputChange}
          onFocus={handleFocus}
          autoComplete="off"
          required={isRequired}
        />
        {searchTerm && !isDisabled && (
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleClear}
            title="Очистить"
          >
            <i className="bi bi-x"></i>
          </button>
        )}
      </div>

      {isOpen && !isDisabled && (
        <ul
          className="dropdown-menu show w-100 shadow-sm mt-1 overflow-auto"
          style={{ maxHeight: "240px", zIndex: 1050 }}
        >
          {isLoading ? (
            <li className="dropdown-item text-muted text-center py-2">
              <span className="spinner-border spinner-border-sm me-2"></span>{" "}
              Загрузка...
            </li>
          ) : filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => {
              const mainText = getPropertyValue(item, searchAndShowParam);
              const commentText = getPropertyValue(item, commentParam);
              return (
                <li key={item.id ?? idx}>
                  <button
                    type="button"
                    className="dropdown-item d-flex justify-content-between align-items-center py-2"
                    onClick={() => handleSelect(item)}
                  >
                    <span className="fw-medium text-truncate">{mainText}</span>
                    {commentText && (
                      <span className="text-muted small ms-2 text-truncate">
                        {commentText}
                      </span>
                    )}
                  </button>
                </li>
              );
            })
          ) : (
            <li className="dropdown-item text-muted text-center py-2">
              Ничего не найдено
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

export default SearchableInput;

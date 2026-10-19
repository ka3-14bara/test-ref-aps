import React, { useState, useEffect, useRef, useCallback } from "react";
import Modal from "react-modal";
import { axiosInstance } from "../../api/client";

Modal.setAppElement("#root");

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

  // Состояние модального окна со всем списком ("...")
  const [isFullListModalOpen, setIsFullListModalOpen] = useState(false);
  const [modalSearchTerm, setModalSearchTerm] = useState("");

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchTerm(showAfterReload || "");
    setIsSelected(Boolean(showAfterReload));
  }, [showAfterReload]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get<T[]>(endpoint);
      setItems(res.data || []);
      setFilteredItems(res.data || []);
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
    if (!item) return "";
    if (typeof param === "function") return param(item) || "";
    const key = String(param);
    if (key.includes(".")) {
      const resolved = key
        .split(".")
        .reduce<any>(
          (acc, part) => (acc != null ? acc[part] : undefined),
          item,
        );
      return resolved != null ? String(resolved) : "";
    }
    return item[key] != null ? String(item[key]) : "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setIsSelected(false);

    if (items.length === 0) {
      loadData();
    }

    if (!term.trim()) {
      setFilteredItems(items);
      setIsOpen(true);
      return;
    }

    const search = term.toLowerCase();
    const filtered = items.filter((item) => {
      const mainVal = String(
        getPropertyValue(item, searchAndShowParam),
      ).toLowerCase();
      const commVal = String(
        getPropertyValue(item, commentParam),
      ).toLowerCase();
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
    setIsFullListModalOpen(false);
    onItemSelected(item);
  };

  const handleClear = () => {
    setSearchTerm("");
    setIsSelected(false);
    onItemSelected(null as any);
  };

  const handleOpenFullList = () => {
    if (items.length === 0) {
      loadData();
    }
    setModalSearchTerm("");
    setIsFullListModalOpen(true);
    setIsOpen(false);
  };

  const modalFilteredItems = items.filter((item) => {
    if (!modalSearchTerm.trim()) return true;
    const search = modalSearchTerm.toLowerCase();
    const mainVal = String(
      getPropertyValue(item, searchAndShowParam),
    ).toLowerCase();
    const commVal = String(getPropertyValue(item, commentParam)).toLowerCase();
    return mainVal.includes(search) || commVal.includes(search);
  });

  return (
    <div ref={wrapperRef} className="position-relative flex-grow-1">
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

        {/* Кнопка "..." для открытия модалки полного списка */}
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={handleOpenFullList}
          disabled={isDisabled}
          title="Открыть полный список"
        >
          <i className="bi bi-three-dots"></i>
        </button>
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

      {/* Модальное окно выбора из полного списка */}
      {isFullListModalOpen && (
        <Modal
          isOpen={isFullListModalOpen}
          onRequestClose={() => setIsFullListModalOpen(false)}
          className="app-modal"
          overlayClassName="app-modal-overlay"
        >
          <div className="app-modal__header">
            <h5 className="app-modal__title">
              <i className="bi bi-list-ul me-2"></i> Выбор элемента из списка
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => setIsFullListModalOpen(false)}
            />
          </div>

          <div className="app-modal__body">
            <div className="mb-3">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Фильтр в списке..."
                  value={modalSearchTerm}
                  onChange={(e) => setModalSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div
              className="list-group overflow-auto"
              style={{ maxHeight: "50vh" }}
            >
              {modalFilteredItems.length > 0 ? (
                modalFilteredItems.map((item, idx) => {
                  const mainText = getPropertyValue(item, searchAndShowParam);
                  const commentText = getPropertyValue(item, commentParam);
                  const statusText = item.deleted ? "Удалено" : "Активно";
                  return (
                    <button
                      key={item.id ?? idx}
                      type="button"
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2"
                      onClick={() => handleSelect(item)}
                    >
                      <span className="fw-medium">{mainText}</span>
                      {commentText && (
                        <span className="badge bg-light text-secondary border">
                          {commentText}
                        </span>
                      )}
                        <span className={`badge ${item.deleted ? "text-bg-danger" : "text-bg-success" } text-white border`}>
                          {statusText}
                        </span>
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-4 text-muted">
                  Записей не найдено
                </div>
              )}
            </div>
          </div>

          <div className="app-modal__footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsFullListModalOpen(false)}
            >
              Закрыть
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default SearchableInput;

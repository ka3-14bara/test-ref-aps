import React, {
  useState,
  useEffect,
  useRef,
  CSSProperties,
  useCallback,
  useMemo,
} from "react";
import { axiosInstance, useAxiosInterceptor } from "../api/axios";
import { getCachedData } from "../utils/apiCache";

interface ItemData {
  [key: string]: any;
  id?: number | null;
  deleted?: boolean;
}

type Accessor<T> = (obj: T) => string;

interface SearchableInputProps<T extends ItemData> {
  endpoint: string;
  inputId: string;
  style?: CSSProperties;
  onItemSelected?: (item: T) => void;
  isRequired?: boolean;
  isDisabled?: boolean;
  searchAndShowParam?: keyof T | Accessor<T>;
  commentParam?: keyof T | Accessor<T>;
  showAfterReload?: string;
}

const SearchableInput = <T extends ItemData>({
  endpoint,
  inputId,
  style,
  isRequired,
  isDisabled = false,
  onItemSelected,
  searchAndShowParam = "title" as keyof T | Accessor<T>,
  commentParam = "comment" as keyof T | Accessor<T>,
  showAfterReload = "",
}: SearchableInputProps<T>) => {
  const [searchTerm, setSearchTerm] = useState<string>(showAfterReload || "");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>(searchTerm);
  const [allItems, setAllItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSelected, setIsSelected] = useState<boolean>(!!showAfterReload);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalFilter, setModalFilter] = useState<string>("");

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useAxiosInterceptor();

  // Вспомогательная функция для получения значения по ключу или accessor
  const getValue = useCallback(
    (item: T, param: keyof T | Accessor<T>): string => {
      if (typeof param === "function") {
        return String(param(item) ?? "");
      }
      if (typeof param === "string" && param.includes(".")) {
        const value = param
          .split(".")
          .reduce((acc, part) => acc && acc[part], item);
        return String(value ?? "");
      }
      return String(item[param] ?? "");
    },
    [],
  );

  const getSearchValue = useCallback(
    (item: T): string => getValue(item, searchAndShowParam).toLowerCase(),
    [searchAndShowParam, getValue],
  );

  const getCommentValue = useCallback(
    (item: T): string => getValue(item, commentParam).toLowerCase(),
    [commentParam, getValue],
  );

  // Загрузка данных
  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getCachedData<T>(endpoint, async () => {
        const response = await axiosInstance.get<T[]>(endpoint);
        return response.data || [];
      });
      setAllItems(data || []);
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
      setAllItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    setSearchTerm(showAfterReload)
  }, [showAfterReload])

  // Debounce для поискового запроса
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setDebouncedSearchTerm("");
      return;
    }
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Фильтрация подсказок (мемоизация)
  const filteredSuggestions = useMemo(() => {
    if (isSelected || debouncedSearchTerm.trim() === "") {
      return [];
    }
    const lowerSearch = debouncedSearchTerm.toLowerCase();
    return allItems
      .filter((item) => !item.deleted)
      .filter((item) => {
        const main = getSearchValue(item);
        const comment = getCommentValue(item);
        return main.includes(lowerSearch) || comment.includes(lowerSearch);
      })
      .slice(0, 10);
  }, [debouncedSearchTerm, allItems, isSelected, getSearchValue, getCommentValue]);

  // Открытие/закрытие выпадающего списка
  useEffect(() => {
    setIsDropdownOpen(filteredSuggestions.length > 0 && !isSelected);
  }, [filteredSuggestions, isSelected]);

  // Управление классом валидации
  useEffect(() => {
    const inputArea = document.getElementById(inputId);
    if (inputArea && isRequired) {
      inputArea.className = searchTerm === "" ? "form-control is-invalid" : "form-control";
    }
  }, [searchTerm, isRequired, inputId]);

  // Закрытие по клику вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current !== event.target
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Обработчики событий
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchTerm(value);
      if (isSelected) {
        onItemSelected?.(null as unknown as T);
        setIsSelected(false);
      }
    },
    [isSelected, onItemSelected],
  );

  const handleClear = useCallback(() => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setIsSelected(false);
    setIsDropdownOpen(false);
    onItemSelected?.(null as unknown as T);
    inputRef.current?.focus();
  }, [onItemSelected]);

  const handleInputFocus = useCallback(() => {
    if (!isSelected && searchTerm.trim() !== "") {
      setIsDropdownOpen(true);
    }
  }, [isSelected, searchTerm]);

  const handleInputBlur = useCallback(() => {
    // Не закрываем сразу, даём время на клик по элементам
    setTimeout(() => {
      setIsDropdownOpen(false);
    }, 150);
  }, []);

  const handleSelectFromDropdown = useCallback(
    (item: T) => {
      setSearchTerm(getValue(item, searchAndShowParam));
      setIsSelected(true);
      setIsDropdownOpen(false);
      onItemSelected?.(item);
    },
    [onItemSelected, searchAndShowParam, getValue],
  );

  // Модальное окно
  const handleOpenModal = useCallback(() => setIsModalOpen(true), []);
  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);

  const handleModalSearch = useCallback(
    (term: string) => setModalFilter(term),
    [],
  );

  // Фильтрация для модального окна (мемоизация)
  const filteredModalItems = useMemo(() => {
    const lowerTerm = modalFilter.toLowerCase();
    if (lowerTerm === "") return allItems;
    return allItems.filter(
      (item) =>
        !item.deleted &&
        (getSearchValue(item).includes(lowerTerm) ||
          getCommentValue(item).includes(lowerTerm)),
    );
  }, [modalFilter, allItems, getSearchValue, getCommentValue]);

  const handleSelectFromModal = useCallback(
    (item: T) => {
      setSearchTerm(getValue(item, searchAndShowParam));
      setIsSelected(true);
      setIsModalOpen(false);
      onItemSelected?.(item);
    },
    [onItemSelected, searchAndShowParam, getValue],
  );

  // Рендер пунктов выпадающего списка
  const renderDropdownItems = useMemo(
    () =>
      filteredSuggestions.map((item) => (
        <div
          key={item.id}
          onMouseDown={(e) => e.preventDefault()} // предотвращает потерю фокуса
          onClick={() => handleSelectFromDropdown(item)}
          className="dropdown-item cursor-pointer"
        >
          <div className="d-flex justify-content-between">
            <span className="fw-bold">{getValue(item, searchAndShowParam)}</span>
          </div>
          {commentParam && (
            <small className="text-muted d-block mt-1">
              {getValue(item, commentParam)}
            </small>
          )}
        </div>
      )),
    [
      filteredSuggestions,
      handleSelectFromDropdown,
      getValue,
      searchAndShowParam,
      commentParam,
    ],
  );

  return (
    <div className="container p-0">
      <div className="row">
        <div className="col-12">
          <div className="input-group" ref={dropdownRef}>
            <div className="position-relative flex-grow-1">
              <input
                ref={inputRef}
                id={inputId}
                type="text"
                value={searchTerm}
                autoComplete="off"
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder="Введите текст для поиска..."
                className={`form-control rounded-end-0 ${
                  isRequired && searchTerm === "" ? "is-invalid" : ""
                }`}
                style={{
                  ...style,
                  paddingRight: isSelected ? "2.5rem" : "initial",
                }}
                required={isRequired}
                disabled={isDisabled}
              />
              {isSelected && (
                <span
                  className="position-absolute top-50 translate-middle-y end-0 me-2 text-muted"
                  onClick={handleClear}
                  style={{ cursor: "pointer", zIndex: 5 }}
                  title="Очистить поле"
                >
                  <i className="bi bi-x-lg" />
                </span>
              )}
            </div>

            <button
              onClick={handleOpenModal}
              className="btn btn-secondary"
              type="button"
              style={style}
              disabled={isDisabled}
            >
              ...
            </button>

            {isDropdownOpen && (
              <div className="dropdown-menu show position-absolute w-100 mt-5 shadow">
                {renderDropdownItems}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Модальное окно */}
      {isModalOpen && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-scrollable modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Полный список элементов</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="Поиск..."
                    onChange={(e) => handleModalSearch(e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="list-group">
                  {isLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Загрузка...</span>
                      </div>
                    </div>
                  ) : filteredModalItems.length > 0 ? (
                    filteredModalItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectFromModal(item)}
                        className="list-group-item list-group-item-action cursor-pointer"
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1">
                              {getValue(item, searchAndShowParam)}
                            </h6>
                            {commentParam && (
                              <p className="mb-1 small text-muted">
                                {getValue(item, commentParam) ?? ""}
                              </p>
                            )}
                            <span
                              className={`badge ${
                                item.deleted ? "bg-danger" : "bg-success"
                              }`}
                            >
                              {item.deleted ? "Удалено" : "Активно"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted mb-0">Ничего не найдено</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableInput;
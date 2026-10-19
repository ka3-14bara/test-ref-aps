import { SearchPanel } from "../common/SearchPanel";
import { TableControlsProps } from "../../types/table";
import { useNavigate, useLocation } from "react-router-dom";

interface ExtendedControlsProps<T extends Record<string, any>> extends TableControlsProps<T> {
  selectedColumn?: string;
  onColumnChange?: (col: string) => void;
}

export const TableControls = <T extends Record<string, any>>({
  searchTerm,
  onSearch,
  headers,
  isShowAdd,
  pageName,
  isShowDeleted,
  onDelState,
  handleCreateNew,
  selectedRows,
  openActionModal,
  handleStatusChange,
  btnCreateNewText,
  drafts,
  handleDownload,
  isServerSearch,
  toggleServerSearch,
  onSearchSubmit,
  handleOpenViewerClick,
  selectedColumn = "all",
  onColumnChange,
}: ExtendedControlsProps<T>) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="table-controls mb-3 mt-2">
      {/* Хлебные крошки */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb mb-2">
          <li className="breadcrumb-item">
            <a href="/">Главная</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            <span>{pageName}</span>
          </li>
        </ol>
      </nav>

       {/* Главная управляющая строка */}
      <div className="d-flex align-items-center justify-content-between w-100">
        
        {/* 1. ЛЕВАЯ ЧАСТЬ: Поиск занимает ровно половину ширины (w-50) */}
        <div className="w-50">
          <SearchPanel
            searchTerm={searchTerm}
            onSearch={onSearch}
            headers={headers}
            isServerSearch={isServerSearch}
            onSearchSubmit={onSearchSubmit}
            toggleServerSearch={toggleServerSearch}
            selectedColumn={selectedColumn}
            onColumnChange={onColumnChange}
          />
        </div>

        {/* ПРАВЫЙ ОБЩИЙ КОНТЕЙНЕР ДЛЯ ВСЕХ КНОПОК */}
        {/* ms-auto прижимает весь этот блок к правому краю, а gap-4 делает большой отступ между группами кнопок */}
        <div className="d-flex align-items-center gap-4 ms-auto text-nowrap">
          
          {/* 2. ЦЕНТРАЛЬНАЯ ЧАСТЬ: Кнопки действий над строками с увеличенным gap-4 внутри */}
          {selectedRows.length > 0 && (
            <div className="d-flex align-items-center gap-4">
              <button
                onClick={openActionModal}
                className="btn btn-outline-primary"
              >
                {selectedRows.length === 1 ? "Изменить" : "Массовые действия"}
              </button>

              {selectedRows.length === 1 && !(selectedRows[0] as any).deleted && (
                <button
                  onClick={handleStatusChange}
                  className="btn btn-outline-danger"
                >
                  Удалить
                </button>
              )}

              {selectedRows.length === 1 && location.pathname === "/documents" && (
                <>
                  <button
                    onClick={handleDownload}
                    className="btn btn-outline-success"
                  >
                    Скачать документ
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    disabled={selectedRows.length !== 1}
                    onClick={handleOpenViewerClick}
                  >
                    Посмотреть файл
                  </button>
                </>
              )}

              {selectedRows.length === 1 && (selectedRows[0] as any).deleted && (
                <button
                  onClick={handleStatusChange}
                  className="btn btn-outline-success"
                >
                  Восстановить
                </button>
              )}
            </div>
          )}

          {/* 3. ПРАВАЯ ЧАСТЬ: Глобальные кнопки действий (стандартный gap-2 между ними) */}
          <div className="d-flex align-items-center gap-2">
            <button
              className={`btn ${isShowDeleted ? "btn-outline-warning" : "btn-outline-success"}`}
              onClick={() => onDelState(!isShowDeleted)}
            >
              {isShowDeleted ? "Убрать удалённые" : "Отобразить все"}
            </button>

            {drafts !== "" && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  navigate(drafts ?? "/");
                  window.localStorage.removeItem("addStation");
                }}
              >
                📋 Черновики
              </button>
            )}

            {isShowAdd && (
              <button
                onClick={handleCreateNew}
                className="btn btn-success"
              >
                {btnCreateNewText}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default TableControls;

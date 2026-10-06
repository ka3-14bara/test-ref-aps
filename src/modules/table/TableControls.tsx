import { SearchPanel } from "../SearchPanel";
import { TableControlsProps } from "../Types";
import { useNavigate, useLocation } from "react-router-dom";

export const TableControls = <T extends Record<string, any>>({
  // Используем генерик
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
  handleOpenViewerClick
}: TableControlsProps<T>) => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div className="table-controls items-center mb-0 mt-2">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="/">Главная</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            <a>{pageName}</a>
          </li>
        </ol>
      </nav>
      <div className="books-container-wrap flex flex-wrap gap-4 items-center">
        <div
          className="books-cont flex items-center justify-between w-full"
          style={{ justifyContent: "space-between" }}
        >
          <SearchPanel
            searchTerm={searchTerm}
            onSearch={onSearch}
            headers={headers}
            isServerSearch={isServerSearch}
            onSearchSubmit={onSearchSubmit}
            toggleServerSearch={toggleServerSearch}
          />
          <div className="flex gap-4">
            <button
              key={"ShowHideDelited"}
              className={`btn ${
                isShowDeleted
                  ? "btn btn-outline-warning"
                  : "btn-outline-success"
              }`}
              onClick={() => onDelState(!isShowDeleted)}
            >
              {isShowDeleted ? "Убрать удалённые" : "Отобразить удалённые"}
            </button>

            {drafts !== "" && (
              <button
                type="button"
                className="btn btn-outline-secondary space-x-4 text-sm w-64  ml-2"
                style={{ maxHeight: "38px" }}
                onClick={() => {
                  navigate(drafts);
                  window.localStorage.removeItem("addStation");
                }}
              >
                📋 Черновики
              </button>
            )}

            {isShowAdd && (
              <button
                key={"createNew"}
                onClick={handleCreateNew}
                className="space-x-4 text-sm w-64 btn btn-success ml-2"
              >
                {btnCreateNewText}
              </button>
            )}
          </div>
        </div>
        <div className="books-cont gap-2">
          {selectedRows.length > 0 && (
            <div className="ml-4 flex gap-2">
              <button
                onClick={openActionModal}
                className="btn btn-outline-primary"
              >
                {selectedRows.length === 1
                  ? "Изменить элемент"
                  : "Массовые действия"}
              </button>
              {selectedRows.length === 1 && !selectedRows[0].deleted && (
                <button
                  onClick={handleStatusChange}
                  className="btn btn-outline-danger ml-4"
                >
                  Удалить
                </button>
              )}
              {selectedRows.length === 1 &&
                location.pathname === "/documents" && (
                  <>
                    <button
                      onClick={handleDownload}
                      className="btn btn-outline-success ml-4"
                    >
                      Скачать документ
                    </button>
                    <button
                      className="btn btn-outline-secondary ml-4"
                      disabled={selectedRows.length !== 1}
                      onClick={handleOpenViewerClick}
                    >
                      Посмотреть файл
                    </button>
                  </>
                )}
              {selectedRows.length === 1 && selectedRows[0].deleted && (
                <button
                  onClick={handleStatusChange}
                  className="btn btn-outline-success ml-4"
                >
                  Восстановить
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

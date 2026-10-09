import React from "react";
import { useNavigate } from "react-router-dom";
import { TableControlsProps } from "../../types/table";
import SearchPanel from "../common/SearchPanel";
import ColumnVisibilityControl from "./ColumnVisibilityControl";

export const TableControls: React.FC<TableControlsProps> = ({
  searchTerm,
  onSearch,
  headers,
  isShowAdd = false,
  pageName,
  isShowDeleted,
  onDelState,
  handleCreateNew,
  selectedRows,
  openActionModal,
  handleStatusChange,
  table,
  btnCreateNewText = "Добавить",
  drafts,
  handleDownload,
  handleOpenViewerClick,
}) => {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
      {/* Левая группа: Поиск и переключатель видимости столбцов */}
      <div className="d-flex align-items-center gap-2 flex-grow-1 flex-md-grow-0">
        <SearchPanel
          searchTerm={searchTerm}
          onSearch={onSearch}
          headers={headers}
        />
        <ColumnVisibilityControl table={table} />
      </div>

      {/* Правая группа: Действия и переход по роутам */}
      <div className="d-flex align-items-center gap-2">
        {selectedRows.length === 1 && handleOpenViewerClick && (
          <button
            className="btn btn-outline-info btn-sm"
            onClick={handleOpenViewerClick}
          >
            <i className="bi bi-file-earmark-text me-1"></i> Документ
          </button>
        )}

        {selectedRows.length > 0 && (
          <div className="btn-group btn-group-sm">
            <button
              className="btn btn-outline-primary"
              onClick={openActionModal}
            >
              <i className="bi bi-pencil me-1"></i> Действия (
              {selectedRows.length})
            </button>
            <button
              className="btn btn-outline-danger"
              onClick={() => handleStatusChange(true)}
            >
              <i className="bi bi-trash"></i>
            </button>
            <button
              className="btn btn-outline-success"
              onClick={() => handleStatusChange(false)}
            >
              <i className="bi bi-arrow-counterclockwise"></i>
            </button>
          </div>
        )}

        {handleDownload && (
          <button
            className="btn btn-outline-success btn-sm"
            onClick={handleDownload}
            title="Экспорт"
          >
            <i className="bi bi-file-earmark-excel me-1"></i> Excel
          </button>
        )}

        <button
          className={`btn btn-sm ${isShowDeleted ? "btn-warning" : "btn-outline-secondary"}`}
          onClick={() => onDelState(!isShowDeleted)}
        >
          <i className="bi bi-eye me-1"></i>
          {isShowDeleted ? "Скрыть удаленные" : "Показать удаленные"}
        </button>

        {drafts && (
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate(drafts)}
          >
            <i className="bi bi-archive me-1"></i> Черновики
          </button>
        )}

        {isShowAdd && (
          <button
            className="btn btn-primary btn-sm fw-semibold"
            style={{
              backgroundColor: "#FFD369",
              borderColor: "#E5BD55",
              color: "#000",
            }}
            onClick={
              handleCreateNew
                ? handleCreateNew
                : () => navigate(`${pageName}/add`)
            }
          >
            <i className="bi bi-plus-lg me-1"></i> {btnCreateNewText}
          </button>
        )}
      </div>
    </div>
  );
};

export default TableControls;

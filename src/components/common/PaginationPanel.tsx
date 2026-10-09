import React from "react";
import { PaginationInfo } from "../../types/table";

interface PaginationPanelProps {
  pagination: PaginationInfo;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  isLoading?: boolean;
}

export const PaginationPanel: React.FC<PaginationPanelProps> = ({
  pagination,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
}) => {
  const { page, size, totalPages, totalElements } = pagination;

  const startElement = totalElements === 0 ? 0 : page * size + 1;
  const endElement = Math.min((page + 1) * size, totalElements);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);
      let start = Math.max(1, page - 1);
      let end = Math.min(totalPages - 2, page + 1);

      if (page <= 2) {
        start = 1;
        end = 3;
      } else if (page >= totalPages - 3) {
        start = totalPages - 4;
        end = totalPages - 2;
      }

      if (start > 1) pages.push("...");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 2) pages.push("...");
      pages.push(totalPages - 1);
    }
    return pages;
  };

  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 p-3 border-top bg-light">
      <div className="d-flex align-items-center gap-2">
        <span className="text-muted small">
          Показано {startElement}–{endElement} из {totalElements}
        </span>
        <div className="d-flex align-items-center gap-1 ms-3">
          <label htmlFor="pageSizeSelect" className="text-muted small mb-0">
            Строк:
          </label>
          <select
            id="pageSizeSelect"
            className="form-select form-select-sm"
            style={{ width: "80px" }}
            value={size}
            disabled={isLoading}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {[10, 25, 50, 100].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <nav aria-label="Пагинация таблицы">
        <ul className="pagination pagination-sm mb-0">
          <li
            className={`page-item ${page === 0 || isLoading ? "disabled" : ""}`}
          >
            <button
              className="page-link"
              onClick={() => onPageChange(0)}
              disabled={page === 0 || isLoading}
              title="Первая страница"
            >
              <i className="bi bi-chevron-double-left"></i>
            </button>
          </li>
          <li
            className={`page-item ${page === 0 || isLoading ? "disabled" : ""}`}
          >
            <button
              className="page-link"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0 || isLoading}
              title="Назад"
            >
              <i className="bi bi-chevron-left"></i>
            </button>
          </li>

          {getPageNumbers().map((p, idx) => (
            <li
              key={idx}
              className={`page-item ${p === page ? "active" : ""} ${p === "..." ? "disabled" : ""}`}
            >
              {p === "..." ? (
                <span className="page-link">…</span>
              ) : (
                <button
                  className="page-link"
                  disabled={isLoading}
                  onClick={() => onPageChange(Number(p))}
                >
                  {Number(p) + 1}
                </button>
              )}
            </li>
          ))}

          <li
            className={`page-item ${page >= totalPages - 1 || isLoading ? "disabled" : ""}`}
          >
            <button
              className="page-link"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1 || isLoading}
              title="Вперед"
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </li>
          <li
            className={`page-item ${page >= totalPages - 1 || isLoading ? "disabled" : ""}`}
          >
            <button
              className="page-link"
              onClick={() => onPageChange(totalPages - 1)}
              disabled={page >= totalPages - 1 || isLoading}
              title="Последняя страница"
            >
              <i className="bi bi-chevron-double-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default PaginationPanel;

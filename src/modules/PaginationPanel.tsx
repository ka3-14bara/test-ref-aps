import React, { useState, useEffect } from "react";
import { PaginationInfo } from "./Types";

interface PaginationPanelProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  isLoading: boolean;
}

export const PaginationPanel: React.FC<PaginationPanelProps> = ({
  pagination,
  onPageChange,
  onPageSizeChange,
  isLoading,
}) => {
  // Состояние для текстового поля ввода страницы
  const [inputPage, setInputPage] = useState((pagination.page + 1).toString());

  // Синхронизируем инпут, если страница изменилась извне
  useEffect(() => {
    setInputPage((pagination.page + 1).toString());
  }, [pagination.page]);

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onPageSizeChange(parseInt(e.target.value));
  };

  const handlePageClick = (page: number) => {
    onPageChange(page);
  };

  // Переход по введенному номеру
  const handleGoToPage = () => {
    const pageNum = parseInt(inputPage) - 1;
    if (!isNaN(pageNum) && pageNum >= 0 && pageNum < pagination.totalPages) {
      onPageChange(pageNum);
    } else {
      setInputPage((pagination.page + 1).toString()); // Сброс при некорректном вводе
    }
  };

  const getPageNumbers = () => {
    const pages: number[] = [0];
    const maxVisiblePages = 5;
    const totalPages = pagination.totalPages;

    if (totalPages > maxVisiblePages) {
      const startPage = Math.max(1, Math.min(pagination.page - 1, totalPages - maxVisiblePages + 1));
      const endPage = Math.min(startPage + maxVisiblePages - 3, totalPages - 2);
      for (let i = startPage; i <= endPage; i++) pages.push(i);
    } else {
      for (let i = 1; i < totalPages - 1; i++) pages.push(i);
    }
    if (totalPages > 1) pages.push(totalPages - 1);
    return [...new Set(pages)];
  };

  return (
    <div className="pagination-panel flex items-center justify-between mt-2 p-2 bg-gray-50 rounded-lg">
      <div className="page-info text-sm text-gray-600">
        Показано {pagination.page * pagination.size + 1} -{" "}
        {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)} из {pagination.totalElements}
      </div>

      <div className="page-controls flex items-center space-x-4">
        {/* Блок ввода страницы */}
        <div className="flex items-center space-x-2 text-sm">
          <span>Стр:</span>
          <input
            type="text"
            value={inputPage}
            onChange={(e) => setInputPage(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && handleGoToPage()}
            onBlur={handleGoToPage}
            className="border rounded py-1 text-center text-sm ms-1 me-1"
            style={{width: "45px"}}
            disabled={isLoading}
          />
          <span className="text-gray-400">из {pagination.totalPages}</span>
        </div>

        <div className="page-buttons flex space-x-1 items-center">
          <select
            value={pagination.size}
            onChange={handlePageSizeChange}
            className="border rounded px-2 py-1 text-sm mr-2"
          >
            {[10, 25, 50, 100].map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <button
            onClick={() => handlePageClick(pagination.page - 1)}
            disabled={pagination.page === 0 || isLoading}
            className="px-3 py-1 rounded itemsSearch"
          >
            Назад
          </button>

          {getPageNumbers().map((pageNumber) => (
            <button
              key={`page-${pageNumber}`}
              onClick={() => handlePageClick(pageNumber)}
              disabled={pagination.page === pageNumber || isLoading}
              className={`px-3 py-1 rounded ${pagination.page === pageNumber ? "page-selected" : "page"}`}
            >
              {pageNumber + 1}
            </button>
          ))}

          <button
            onClick={() => handlePageClick(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages - 1 || isLoading}
            className="px-3 py-1 rounded itemsSearch"
          >
            Вперед
          </button>
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { flexRender } from "@tanstack/react-table";
import { TableHeaderProps } from "../../types/table";

export const TableHeader: React.FC<TableHeaderProps> = ({
  visibleHeaderGroups,
  sort,
  direction,
  onSort,
}) => {
  const renderSortIcon = (columnId: string) => {
    if (sort !== columnId) {
      return (
        <i
          className="bi bi-arrow-down-up text-muted ms-1 opacity-25"
          style={{ fontSize: "0.8rem" }}
        ></i>
      );
    }
    return direction === "asc" ? (
      <i className="bi bi-sort-up-alt text-primary ms-1"></i>
    ) : (
      <i className="bi bi-sort-down text-primary ms-1"></i>
    );
  };

  return (
    <thead className="app-table__header">
      {visibleHeaderGroups.map((headerGroup) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header) => {
            const canSort = header.column.getCanSort();
            const colId = header.column.id;

            return (
              <th
                key={header.id}
                className="app-table__cell--header user-select-none"
                onClick={canSort ? () => onSort(colId) : undefined}
                style={{ cursor: canSort ? "pointer" : "default" }}
              >
                <div className="d-flex align-items-center justify-content-between gap-2">
                  <span>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </span>
                  {canSort && renderSortIcon(colId)}
                </div>
              </th>
            );
          })}
        </tr>
      ))}
    </thead>
  );
};

export default TableHeader;

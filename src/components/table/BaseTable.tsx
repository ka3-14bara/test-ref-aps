import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
} from "@tanstack/react-table";
import { ExtendedTableProps } from "../../types/table";
import TableWrapper from "./TableWrapper";
import TableHeader from "./TableHeader";
import TableBody from "./TableBody";
import PaginationPanel from "../common/PaginationPanel";

export const BaseTable: React.FC<ExtendedTableProps> = ({
  data,
  columns,
  pagination,
  onPageChange,
  onPageSizeChange,
  isLoading,
  sort,
  direction,
  onSort,
  onSearch,
}) => {
  const table = useReactTable({
    data,
    columns: columns as ColumnDef<any, any>[],
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: pagination.totalPages,
  });

  return (
    <div className="card shadow-sm border-0">
      <TableWrapper>
        <table className="app-table">
          <TableHeader
            visibleHeaderGroups={table.getHeaderGroups()}
            sort={sort}
            direction={direction}
            onSort={onSort}
            onSearch={onSearch}
          />
          <TableBody rows={table.getRowModel().rows} />
        </table>
      </TableWrapper>

      <PaginationPanel
        pagination={pagination}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        isLoading={isLoading}
      />
    </div>
  );
};

export default BaseTable;

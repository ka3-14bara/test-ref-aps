import React, {
  useMemo,
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from "react";
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  getFilteredRowModel,
  Table,
} from "@tanstack/react-table";
import { ExtendedTableProps } from "../../types/table";
import IndeterminateCheckbox from "../common/Checkbox";
import { TableHeader } from "./TableHeader";
import { TableBody } from "./TableBody";
import { TableWrapper } from "./TableWrapper";
import { PaginationPanel } from "../common/PaginationPanel";
import { ColumnVisibilityControl } from "./ColumnVisibilityControl";

export type TableInstanceRef<T extends Record<string, any>> = Table<T> | null;

interface BaseTablePropsWithSelectedCol<
  T extends Record<string, any>,
> extends ExtendedTableProps<T> {
  selectedColumn?: string;
}

export const BaseTable = forwardRef(
  <T extends Record<string, any>>(
    {
      data,
      headers,
      pagination,
      onPageChange,
      onPageSizeChange,
      onSort,
      searchTerm,
      rowSelection,
      onRowSelectionChange,
      showColumnVisibilityControl,
      sort,
      columnVisibility,
      onColumnVisibilityChange,
      direction,
      isLoading,
      isServerSearch,
      selectedColumn = "all",
    }: BaseTablePropsWithSelectedCol<T>,
    ref: React.Ref<TableInstanceRef<T>>,
  ) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const tableContainerRef = useRef<HTMLDivElement>(null);

    const prepareDataWithDeletedState = useMemo(() => {
      return data.map((item: any) => ({
        ...item,
        isDeleted: item.deleted === true || item.deleted === "true" || false,
      }));
    }, [data]);

    const columns = useMemo<ColumnDef<T>[]>(() => {
      if (!headers || headers.length === 0) return [];

      const row1 = headers.filter((h) => h.row === 1);
      const row2 = [...headers.filter((h) => h.row === 2)];

      const getSafeAccessor = (key: string) => {
        if (!key.includes("."))
          return {
            accessorKey: key,
            filterFn: "includesString" as const,
          };
        return {
          accessorFn: (row: any) =>
            key.split(".").reduce((acc, k) => acc?.[k], row) ?? "",
          filterFn: "includesString" as const,
        };
      };

      const dynamicColumns = row1.map((parent) => {
        const isGroup =
          (parent.colspan ?? 0) > 1 || parent.key.startsWith("none_");

        const groupConfig = {
          id: parent.key,
          header: parent.label,
          enableHiding: true,
        };

        if (isGroup) {
          const children = row2.splice(0, parent.colspan);
          return {
            ...groupConfig,
            columns: children.map((child) => ({
              id: child.key,
              header: child.label,
              ...getSafeAccessor(child.key),
            })),
          };
        } else {
          return {
            ...groupConfig,
            columns: [
              {
                id: `${parent.key}_child`,
                header: "__HIDDEN__",
                ...getSafeAccessor(parent.key),
              },
            ],
          };
        }
      });

      const selectionColumn = {
        id: "select_group",
        size: 24,
        minSize: 24,
        maxSize: 24,
        header: ({ table }: any) => (
          <div
            className="d-flex justify-content-center align-items-center w-100 h-100"
            onClick={(e) => e.stopPropagation()}
          >
            <IndeterminateCheckbox
              checked={table.getIsAllPageRowsSelected()}
              indeterminate={table.getIsSomePageRowsSelected()}
              onChange={table.getToggleAllPageRowsSelectedHandler()}
            />
          </div>
        ),
        columns: [
          {
            id: "select",
            size: 24,
            minSize: 24,
            maxSize: 24,
            header: "__HIDDEN__",
            cell: ({ row }: any) => (
              <div
                className="d-flex justify-content-center align-items-center w-100 h-100"
                onClick={(e) => e.stopPropagation()}
              >
                <IndeterminateCheckbox
                  checked={row.getIsSelected()}
                  disabled={!row.getCanSelect()}
                  onChange={row.getToggleSelectedHandler()}
                />
              </div>
            ),
          },
        ],
      } as ColumnDef<T>;

      return [selectionColumn, ...dynamicColumns];
    }, [headers]);

    const columnFilters = useMemo<ColumnFiltersState>(() => {
      if (isServerSearch || !searchTerm || selectedColumn === "all") {
        return [];
      }
      return [{ id: `${selectedColumn}_child`, value: searchTerm }];
    }, [isServerSearch, searchTerm, selectedColumn]);

    const table = useReactTable({
      data: prepareDataWithDeletedState,
      columns,
      onSortingChange: setSorting,
      getRowId: (row: any) => row.id || row.uuid,
      onColumnVisibilityChange,
      enableHiding: true,
      columnResizeMode: "onChange",
      getFilteredRowModel: getFilteredRowModel(),
      getCoreRowModel: getCoreRowModel(),
      onRowSelectionChange,
      state: {
        sorting,
        columnVisibility,
        globalFilter:
          !isServerSearch && selectedColumn === "all" ? searchTerm : undefined,
        rowSelection,
        columnFilters,
      },
      manualSorting: false,
    });

    useImperativeHandle(ref, () => table, [table]);

    const visibleHeaderGroups = table.getHeaderGroups();
    const rows = table.getRowModel().rows;

    const handleHeaderClick = useCallback(
      (columnKey: string) => {
        const cleanKey = columnKey.replace("_group", "");
        if (cleanKey !== "select" && cleanKey !== "select_group") {
          onSort(cleanKey);
        }
      },
      [onSort],
    );

    const handleColumnSearch = useCallback(
      (columnId: string, value: string) => {
        table.getColumn(columnId)?.setFilterValue(value);
      },
      [table],
    );

    const isHeadersNotReady = !headers || headers.length === 0;

    return (
      <div className="table-container-gen">
        {showColumnVisibilityControl && (
          <ColumnVisibilityControl table={table} />
        )}
        <div className="position-relative flex-grow-1 overflow-hidden d-flex flex-column min-vh-0">
          {/* Аккуратный оверлей-лоадер поверх таблицы во время сетевых запросов */}
          {isLoading && (
            <div
              className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.65)",
                zIndex: 20,
                backdropFilter: "blur(2px)",
              }}
            >
              <div className="spinner-border text-primary mb-2" role="status">
                <span className="visually-hidden">Загрузка...</span>
              </div>
              <span className="text-primary fw-semibold small">
                Загрузка данных...
              </span>
            </div>
          )}

          {/* Если заголовки еще не загрузились — показываем заглушку-спиннер вместо пустых строк */}
          {isHeadersNotReady ? (
            <div className="d-flex flex-column justify-content-center align-items-center flex-grow-1 bg-white border rounded">
              <div
                className="spinner-border text-secondary mb-2"
                role="status"
              ></div>
              <div className="text-muted small">
                Построение колонок реестра...
              </div>
            </div>
          ) : (
            <TableWrapper tableContainerRef={tableContainerRef}>
              <table className="table-el">
                <TableHeader<T>
                  onSort={handleHeaderClick}
                  onSearch={handleColumnSearch}
                  visibleHeaderGroups={visibleHeaderGroups}
                  sort={sort}
                  direction={direction}
                  rowSelection={table.getState().rowSelection}
                  columnVisibility={table.getState().columnVisibility}
                />
                <TableBody<T>
                  rows={rows}
                  rowSelection={table.getState().rowSelection}
                  columnVisibility={table.getState().columnVisibility}
                />
              </table>
            </TableWrapper>
          )}
        </div>
        <div className="flex-shrink-0">
          <PaginationPanel
            pagination={pagination}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            isLoading={isLoading}
          />
        </div>
      </div>
    );
  },
) as <T extends Record<string, any>>(
  props: BaseTablePropsWithSelectedCol<T> & {
    ref?: React.Ref<TableInstanceRef<T>>;
  },
) => React.ReactElement;

export default BaseTable;

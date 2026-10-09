import React, {
  useMemo,
  useState,
  useEffect,
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
    }: ExtendedTableProps<T>,
    ref: React.Ref<TableInstanceRef<T>>,
  ) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const prepareDataWithDeletedState = useMemo(() => {
      return data.map((item: any) => ({
        ...item,
        isDeleted: item.deleted === true || item.deleted === "true" || false,
      }));
    }, [data]);

    const columns = useMemo<ColumnDef<T>[]>(() => {
      const row1 = headers.filter((h) => h.row === 1);
      const row2 = [...headers.filter((h) => h.row === 2)];

      const getSafeAccessor = (key: string) => {
        if (!key.includes("."))
          return {
            accessorKey: key,
            filterFn: "includesString",
          };
        return {
          accessorFn: (row: any) =>
            key.split(".").reduce((acc, k) => acc?.[k], row) ?? "",
          filterFn: "includesString",
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
        header: ({ table }: any) => (
          <div onClick={(e) => e.stopPropagation()}>
            <IndeterminateCheckbox
              checked={table.getIsAllPageRowsSelected()}
              onChange={table.getToggleAllPageRowsSelectedHandler()}
              label=""
            />
          </div>
        ),
        columns: [
          {
            id: "select",
            header: "__HIDDEN__",
            cell: ({ row }: any) => (
              <IndeterminateCheckbox
                checked={row.getIsSelected()}
                disabled={!row.getCanSelect()}
                onChange={row.getToggleSelectedHandler()}
                label=""
              />
            ),
          },
        ],
      } as ColumnDef<T>;

      return [selectionColumn, ...dynamicColumns];
    }, [headers]);

    const table = useReactTable({
      data: prepareDataWithDeletedState,
      columns,
      onSortingChange: setSorting,
      getRowId: (row: any) => row.id || row.uuid,
      onColumnVisibilityChange: onColumnVisibilityChange,
      enableHiding: true,
      columnResizeMode: "onChange",
      onColumnFiltersChange: setColumnFilters,
      getFilteredRowModel: getFilteredRowModel(),
      getCoreRowModel: getCoreRowModel(),
      onRowSelectionChange: onRowSelectionChange,
      state: {
        sorting,
        columnVisibility,
        globalFilter: isServerSearch ? undefined : searchTerm,
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

    useEffect(() => {
      const updateTableHeight = () => {
        if (tableContainerRef.current) {
          tableContainerRef.current.style.height = "67vh";
        }
      };
      updateTableHeight();
      window.addEventListener("resize", updateTableHeight);
      return () => {
        window.removeEventListener("resize", updateTableHeight);
      };
    }, []);

    const isTableEmptyAndLoading = isLoading && rows.length === 0;

    return (
      <div className="table-container-gen">
        {showColumnVisibilityControl && (
          <ColumnVisibilityControl table={table} />
        )}
        <div style={{ position: "relative" }}>
          {isLoading && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                zIndex: 10,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(2px)",
              }}
            >
              <div className="position-fixed top-50 start-50 translate-middle d-flex flex-column align-items-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Загрузка...</span>
                </div>
              </div>
            </div>
          )}
          {!isTableEmptyAndLoading && (
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
        <PaginationPanel
          pagination={pagination}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          isLoading={isLoading}
        />
      </div>
    );
  },
) as <T extends Record<string, any>>(
  props: ExtendedTableProps<T> & { ref?: React.Ref<TableInstanceRef<T>> },
) => React.ReactElement;

export default BaseTable;

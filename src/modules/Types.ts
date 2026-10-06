import { RowSelectionState } from "@tanstack/react-table";
import { Table, VisibilityState, OnChangeFn } from "@tanstack/react-table";
import { HeaderGroup, Row } from "@tanstack/react-table";

export interface Header {
  key: string;
  label: string;
  colspan?: number;
  rowspan?: number;
  row?: number;
}

export interface CustomColumnMeta {
  row?: number;
  colspan?: number;
  rowspan?: number;
}

export interface ColumnConfig<TData> {
  header: string | React.ReactNode;
  accessorKey?: string;
  accessorFn?: (row: TData) => any;
  cell?: React.ReactNode | ((context: any) => React.ReactNode);
  enableSorting?: boolean;
  enableFiltering?: boolean;
  meta?: CustomColumnMeta;
}

export interface PaginationInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// Упрощаем ExtendedTableProps, убирая специфичные бизнес-пропсы (req, pageName, handleCreateNew, handleStatusChange, openActionModal)
// Эти функции теперь будут передаваться родителем напрямую в TableControls или ActionModal, минуя BaseTable
// Базовый интерфейс для универсальной таблицы
export interface ExtendedTableProps<T extends Record<string, any>> {
  data: T[];
  headers: Header[];
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSort: (columnKey: string) => void;
  onSearch: (term: string) => void;
  // onDelState: (state: boolean) => void; // Этот коллбэк относится к бизнес-логике "показать удаленные", его тоже убираем
  searchTerm: string;
  // Все остальные пропсы удалены из этого интерфейса
  rowSelection: RowSelectionState;
  sort?: string | null;
  direction?: SortDirection;
  isLoading: boolean;
  isServerSearch: boolean;
  onRowSelectionChange: (
    updater: RowSelectionState | ((old: RowSelectionState) => RowSelectionState)
  ) => void;
  showColumnVisibilityControl?: boolean;

}

// Интерфейс для панели управления (она специфична для ваших нужд)
export interface TableControlsProps<T extends Record<string, any>> {
  searchTerm: string;
  onSearch: (term: string) => void;
  headers: Header[];
  isShowAdd: boolean;
  pageName: string;
  isShowDeleted: boolean;
  onDelState: (state: boolean) => void;
  handleCreateNew: () => void;
  selectedRows: T[];
  openActionModal: () => void;
  handleStatusChange: () => void;
  handleDownload: () => void;
  handleOpenViewerClick: () => void;
  table: Table<T>;
  btnCreateNewText: string;
  drafts: string;
  // Новые пропсы
  isServerSearch: boolean;
  toggleServerSearch: () => void;
  onSearchSubmit: () => void;
}

export interface TableRowProps<T extends Record<string, any>> {
  row: Row<T>; // Строгая типизация
  index: number;
}

export type SortDirection = "none" | "asc" | "desc";

// Типизация для TanStack HeaderGroup
export interface TableHeaderProps<T extends Record<string, any>> {
  onSort: (columnKey: string) => void;
  onSearch: (columnId: string, value: string) => void;
  visibleHeaderGroups: HeaderGroup<T>[]; // Строгая типизация
  sort?: string | null;
  direction?: SortDirection;
}

export interface TableBodyProps<T extends Record<string, any>> {
  rows: Row<T>[]; // Строгая типизация (Rows из TanStack Table)
}

export interface TableWrapperProps {
  children: React.ReactNode;
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
}

// TableControlsProps теперь принимает генерик T и содержит только UI-логику
export interface TableControlsProps<T extends Record<string, any>> {
  searchTerm: string;
  onSearch: (term: string) => void;
  headers: Header[];
  isShowAdd: boolean;
  pageName: string;
  isShowDeleted: boolean;
  onDelState: (state: boolean) => void;
  handleCreateNew: () => void;
  selectedRows: T[]; // Строгая типизация
  openActionModal: () => void;
  handleStatusChange: () => void;
  table: Table<T>; // Строгая типизация
}

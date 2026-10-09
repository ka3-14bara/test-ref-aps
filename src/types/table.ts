import {
  RowSelectionState,
  Table,
  VisibilityState,
  OnChangeFn,
  HeaderGroup,
  Row,
} from "@tanstack/react-table";

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
  render?: (data: TData) => React.ReactNode;
}

export interface PaginationInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export type SortDirection = "none" | "asc" | "desc";

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
  searchTerm: string;
  rowSelection: RowSelectionState;
  sort?: string | null;
  direction?: SortDirection;
  isLoading: boolean;
  isServerSearch: boolean;
  onRowSelectionChange: (
    updater:
      | RowSelectionState
      | ((old: RowSelectionState) => RowSelectionState),
  ) => void;
  showColumnVisibilityControl?: boolean;
}

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
  handleDownload?: () => void;
  handleOpenViewerClick?: () => void;
  table: Table<T>;
  btnCreateNewText: string;
  drafts: string;
  isServerSearch?: boolean;
  toggleServerSearch?: () => void;
  onSearchSubmit?: (term?: string) => void;
}

export interface TableRowProps<T extends Record<string, any>> {
  row: Row<T>;
  index: number;
}

export interface TableHeaderProps<T extends Record<string, any>> {
  onSort: (columnKey: string) => void;
  onSearch: (columnId: string, value: string) => void;
  visibleHeaderGroups: HeaderGroup<T>[];
  sort?: string | null;
  direction?: SortDirection;
}

export interface TableBodyProps<T extends Record<string, any>> {
  rows: Row<T>[];
}

export interface TableWrapperProps {
  children: React.ReactNode;
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
}

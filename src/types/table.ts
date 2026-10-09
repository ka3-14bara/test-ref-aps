import { Table, Row, HeaderGroup } from "@tanstack/react-table";

export type SortDirection = "asc" | "desc";

export interface Header {
  key: string;
  label: string;
  placeholder?: string;
  isSearchable?: boolean;
}

export interface PaginationInfo {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}

export interface ColumnConfig<T> {
  header: string;
  render: (data: T) => React.ReactNode;
}

export interface TableWrapperProps {
  children: React.ReactNode;
  tableContainerRef?: React.RefObject<HTMLDivElement>;
}

export interface TableHeaderProps {
  visibleHeaderGroups: HeaderGroup<any>[];
  sort: string | null;
  direction: SortDirection;
  onSort: (columnId: string) => void;
  onSearch: (columnId: string, value: string) => void;
}

export interface TableBodyProps {
  rows: Row<any>[];
}

export interface TableRowProps {
  row: Row<any>;
  index: number;
}

export interface TableVisibilityControlProps {
  table: Table<any>;
}

export interface TableControlsProps {
  searchTerm: string;
  onSearch: (value: string) => void;
  headers: Header[];
  isShowAdd?: boolean;
  pageName: string;
  isShowDeleted: boolean;
  onDelState: (val: boolean) => void;
  handleCreateNew?: () => void;
  selectedRows: any[];
  openActionModal: () => void;
  handleStatusChange: (status: boolean) => void;
  table: Table<any>;
  btnCreateNewText?: string;
  drafts?: string;
  handleDownload?: () => void;
  handleOpenViewerClick?: () => void;
}

export interface ExtendedTableProps {
  data: any[];
  columns: any[];
  pagination: PaginationInfo;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  isLoading: boolean;
  sort: string | null;
  direction: SortDirection;
  onSort: (columnId: string) => void;
  onSearch: (columnId: string, value: string) => void;
  onRowSelect?: (selectedRows: any[]) => void;
  notShowedEdit?: string[];
}

import { axiosInstance, useAxiosInterceptor } from "../../api/client";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { BaseTable, TableInstanceRef } from "./BaseTable";
import { Header, PaginationInfo, SortDirection } from "../../types/table";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { TableControls } from "./TableControls";
import { ActionModal } from "../modals/ActionModal";
import { RowSelectionState, Table } from "@tanstack/react-table";
import { useDocumentViewer } from "../../hooks/useDocumentViewer";
import DocumentViewerModal from "../modals/DocumentViewerModal";

export interface DataRow {
  id: number;
  title: string;
  comment: string;
  deleted: boolean;
  [key: string]: any;
}

interface RequestCustom {
  req: string;
  pageTitle: string;
  isShowAdd: boolean;
  createText: string;
  notShowedEdit?: string[];
  draftPage?: string;
}

interface PaginationParams {
  page: number;
  size: number;
  sort?: string;
  direction?: SortDirection;
  deleted?: boolean;
  globalSearch?: string;
}

interface ApiResponse {
  content: DataRow[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const TableBuilder = ({
  req,
  isShowAdd,
  pageTitle,
  createText,
  notShowedEdit = [],
  draftPage = "",
}: RequestCustom) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  useAxiosInterceptor();

  // Инициализация состояний из URL Query параметров
  const initialPage = parseInt(searchParams.get("page") || "0", 10);
  const initialSize = parseInt(searchParams.get("size") || "10", 10);
  const initialSort = searchParams.get("sort") || "";
  const initialDirection = (searchParams.get("dir") as SortDirection) || "none";
  const initialSearch = searchParams.get("search") || "";
  const initialColumn = searchParams.get("col") || "all";
  const initialDeleted = searchParams.get("deleted") === "true";
  const initialServerSearch = searchParams.get("serverSearch") !== "false";

  const [tableData, setTableData] = useState<DataRow[]>([]);
  const [tableHeaders, setTableHeaders] = useState<Header[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [pagination, setPagination] = useState<PaginationInfo>({
    page: initialPage,
    size: initialSize,
    totalElements: 0,
    totalPages: 0,
  });

  const [sort, setSort] = useState<string | null>(initialSort);
  const [direction, setDirection] = useState<SortDirection>(initialDirection);
  const [searchTerm, setSearchTerm] = useState<string>(initialSearch);
  const [selectedColumn, setSelectedColumn] = useState<string>(initialColumn);
  const [isDeleted, setIsDeleted] = useState<boolean>(initialDeleted);
  const [isServerSearch, setIsServerSearch] =
    useState<boolean>(initialServerSearch);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<DataRow[]>([]);
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});

  const viewer = useDocumentViewer();
  const [tableInstance, setTableInstance] = useState<Table<DataRow> | null>(
    null,
  );
  const internalRef = useRef<TableInstanceRef<DataRow>>(null);
  const [rowSelectionState, setRowSelectionState] = useState<RowSelectionState>(
    {},
  );

  // Синхронизация состояния таблицы в Query параметры URL
  const updateUrlParams = useCallback(
    (updates: Record<string, string | null>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(updates).forEach(([key, val]) => {
            if (
              val === null ||
              val === "" ||
              val === "false" ||
              val === "none"
            ) {
              next.delete(key);
            } else {
              next.set(key, val);
            }
          });
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  // Скрытие датчиков с нулевыми значениями
  useEffect(() => {
    if (!tableData.length || !tableHeaders.length) return;

    const newVisibility: Record<string, boolean> = {};
    tableHeaders.forEach((header) => {
      if (header.key?.startsWith("detectorsValue.detector_")) {
        const getNestedValue = (obj: any, path: string) =>
          path.split(".").reduce((acc, part) => acc?.[part], obj);

        const hasData = tableData.some((row) => {
          const val = getNestedValue(row, header.key);
          return val !== 0 && val !== null && val !== undefined && val !== "";
        });

        newVisibility[header.key] = hasData;
      }
    });

    if (Object.keys(newVisibility).length > 0) {
      setColumnVisibility((prev) => ({
        ...prev,
        ...newVisibility,
      }));
    }
  }, [tableData, tableHeaders]);

  // Загрузка данных таблицы
  const fetchData = useCallback(
    async (params: PaginationParams) => {
      const currentReq = req;
      try {
        setLoading(true);
        const isToSort = params.direction && params.direction !== "none";

        // Формируем чистый объект query параметров без лишнего globalSearch
        const queryParams: Record<string, any> = {
          page: params.page,
          size: params.size,
          sort: isToSort ? params.sort : undefined,
          direction: isToSort ? params.direction : undefined,
          includeDeleted: params.deleted ? true : undefined,
        };

        // globalSearch добавляется СТРОГО при активном серверном поиске и наличии строки
        if (params.globalSearch && params.globalSearch.trim() !== "") {
          queryParams.globalSearch = params.globalSearch.trim();
        }

        const response = await axiosInstance.get<ApiResponse>(`${req}`, {
          params: queryParams,
        });

        if (currentReq !== req) return;
        setTableData(response.data.content);
        setPagination((prev) => {
          if (
            prev.page === response.data.number &&
            prev.size === response.data.size &&
            prev.totalElements === response.data.totalElements &&
            prev.totalPages === response.data.totalPages
          ) {
            return prev;
          }
          return {
            page: response.data.number,
            size: response.data.size,
            totalElements: response.data.totalElements,
            totalPages: response.data.totalPages,
          };
        });
      } catch (err) {
        console.error(err);
        setError("Ошибка при загрузке данных: " + err);
      } finally {
        if (currentReq === req && tableHeaders.length > 0) {
          setLoading(false);
        }
      }
    },
    [req, tableHeaders],
  );

  const memoizedHeaders = useMemo(() => tableHeaders, [tableHeaders]);

  // Загрузка заголовков
  useEffect(() => {
    let isCurrent = true;

    const loadInitialSetup = async () => {
      setLoading(true);
      try {
        const headersResponse = await axiosInstance.get<Header[]>(
          `${req}/headers`,
        );
        if (isCurrent) {
          setTableHeaders(headersResponse.data);
        }
      } catch (err) {
        if (isCurrent) {
          console.error(err);
          setError("Ошибка при загрузке заголовков: " + err);
          setLoading(false);
        }
      }
    };

    loadInitialSetup();

    return () => {
      isCurrent = false;
      setTableData([]);
      setTableHeaders([]);
    };
  }, [location.pathname, req]);

  // Загрузка строк таблицы
  useEffect(() => {
    if (tableHeaders.length === 0) return;

    fetchData({
      page: pagination.page,
      size: pagination.size,
      sort: sort && direction ? `${sort},${direction}` : undefined,
      direction,
      deleted: isDeleted,
      globalSearch: isServerSearch ? searchTerm : undefined,
    });
  }, [
    pagination.page,
    pagination.size,
    sort,
    direction,
    tableHeaders,
    fetchData,
    isDeleted,
    isServerSearch,
    searchTerm,
  ]);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
    updateUrlParams({ page: page > 0 ? page.toString() : null });
  };

  const handlePageSizeChange = (size: number) => {
    setPagination((prev) => ({ ...prev, size, page: 0 }));
    updateUrlParams({ size: size !== 10 ? size.toString() : null, page: null });
  };

  const handleSort = useCallback(
    (columnKey: string) => {
      const nextStep: Record<SortDirection, SortDirection> = {
        none: "asc",
        asc: "desc",
        desc: "none",
      };

      const newDirection =
        columnKey !== sort ? "asc" : nextStep[direction] || "asc";
      const newSort = newDirection === "none" ? "" : columnKey;

      setDirection(newDirection);
      setSort(newSort);
      setPagination((prev) => ({ ...prev, page: 0 }));

      updateUrlParams({
        sort: newSort || null,
        dir: newDirection !== "none" ? newDirection : null,
        page: null,
      });
    },
    [sort, direction, updateUrlParams],
  );

  const handleDeleted = (state: boolean) => {
    setIsDeleted(state);
    setPagination((prev) => ({ ...prev, page: 0 }));
    updateUrlParams({ deleted: state ? "true" : null, page: null });
  };

  const handleSearch = useCallback(
    (term: string) => {
      setSearchTerm(term);
      if (!isServerSearch) {
        updateUrlParams({ search: term || null });
      }
    },
    [isServerSearch, updateUrlParams],
  );

  const handleColumnChange = useCallback(
    (col: string) => {
      setSelectedColumn(col);
      updateUrlParams({ col: col !== "all" ? col : null });
    },
    [updateUrlParams],
  );

  const handleToggleServerSearch = useCallback(() => {
    setIsServerSearch((prev) => {
      const next = !prev;
      updateUrlParams({
        serverSearch: next ? null : "false",
        col: next ? null : selectedColumn !== "all" ? selectedColumn : null,
      });
      return next;
    });
  }, [updateUrlParams, selectedColumn]);

  const handleServerSearchSubmit = useCallback(
    (term?: string) => {
      if (isServerSearch) {
        const searchValue = typeof term === "string" ? term : searchTerm;
        setPagination((prev) => ({ ...prev, page: 0 }));
        updateUrlParams({ search: searchValue || null, page: null });
        fetchData({
          page: 0,
          size: pagination.size,
          sort: sort && direction ? `${sort},${direction}` : undefined,
          deleted: isDeleted,
          globalSearch: searchValue,
        });
      }
    },
    [
      isServerSearch,
      searchTerm,
      pagination.size,
      sort,
      direction,
      isDeleted,
      fetchData,
      updateUrlParams,
    ],
  );

  const handleOpenViewerClick = () => {
    if (selectedRows.length === 1) {
      viewer.openViewer(selectedRows[0]);
      setIsDocumentModalOpen(true);
    }
  };

  const handleCloseViewerModal = () => {
    setIsDocumentModalOpen(false);
    viewer.closeViewer();
  };

  const handleRowSelectionChange = useCallback(
    (
      updater:
        | RowSelectionState
        | ((old: RowSelectionState) => RowSelectionState),
    ) => {
      setRowSelectionState(updater);
    },
    [],
  );

  useEffect(() => {
    if (tableInstance) {
      const rows = tableInstance
        .getSelectedRowModel()
        .flatRows.map((row) => row.original);
      setSelectedRows(rows);
    }
  }, [rowSelectionState, tableInstance, tableData]);

  const handleCreateNew = useCallback(() => {
    window.localStorage.removeItem("objectOSFormData");
    window.localStorage.removeItem("addStation");
    window.localStorage.removeItem("trainFormData");
    navigate(`${req}/add`, { replace: true });
  }, [navigate, req]);

  const closeActionModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleRefreshData = useCallback(() => {
    fetchData({
      page: pagination.page,
      size: pagination.size,
      sort: sort && direction ? `${sort},${direction}` : undefined,
      deleted: isDeleted,
      globalSearch: isServerSearch ? searchTerm : undefined,
    });
  }, [
    fetchData,
    pagination,
    sort,
    direction,
    isDeleted,
    isServerSearch,
    searchTerm,
  ]);

  const handleStatusChange = useCallback(async () => {
    if (selectedRows.length !== 1) return;
    const ids = selectedRows[0].id;

    try {
      if (!selectedRows[0].deleted) {
        await axiosInstance.delete(`${req}`, { data: { ids: [ids] } });
        alert(`Элемент(ы) удалены.`);
      } else {
        await axiosInstance.patch(`${req}`, { ids: [ids] });
        alert(`Элемент(ы) восстановлены.`);
      }

      handleRefreshData();
      setRowSelectionState({});
    } catch (err) {
      console.error("Ошибка при изменении статуса:", err);
      alert("Произошла ошибка при выполнении операции.");
    }
  }, [selectedRows, req, handleRefreshData]);

  const handleDownloadDocument = useCallback(async () => {
    if (selectedRows.length !== 1) return;
    const id = selectedRows[0].id;
    const urlWithParams = `/documents/${id}/download`;

    try {
      const response = await axiosInstance.get(urlWithParams, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const contentDisposition = response.headers["content-disposition"];
      let finalFilename = `document-${id}.pdf`;

      if (contentDisposition) {
        const parts = contentDisposition.split("filename=");
        if (parts[1]) {
          finalFilename = decodeURIComponent(
            parts[1].replace(/['"]/g, "").split(";")[0].trim(),
          );
        }
      }

      link.setAttribute("download", finalFilename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      handleRefreshData();
      setRowSelectionState({});
    } catch (err) {
      console.error("Ошибка при скачивании:", err);
      alert("Произошла ошибка при скачивании файла.");
    }
  }, [selectedRows, handleRefreshData]);

  const openActionModal = useCallback(() => {
    if (selectedRows.length === 0) return;
    setIsModalOpen(true);
  }, [selectedRows.length]);

  if (loading && tableData.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "85vh",
          width: "100%",
        }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger m-3">{error}</div>;
  }

  const isTableReady = Boolean(tableInstance);

  return (
    <div className="container-fluid d-flex flex-column h-100 px-3 pb-2 pt-1 overflow-hidden">
      <div className="d-flex flex-column flex-grow-1 overflow-hidden">
        {isTableReady && (
          <>
            <TableControls<DataRow>
              searchTerm={searchTerm}
              onSearch={handleSearch}
              headers={tableHeaders}
              isShowAdd={isShowAdd}
              pageName={pageTitle}
              isShowDeleted={isDeleted}
              onDelState={handleDeleted}
              handleCreateNew={handleCreateNew}
              selectedRows={selectedRows}
              openActionModal={openActionModal}
              handleStatusChange={handleStatusChange}
              table={tableInstance!}
              btnCreateNewText={createText}
              drafts={draftPage}
              handleDownload={handleDownloadDocument}
              handleOpenViewerClick={handleOpenViewerClick}
              isServerSearch={isServerSearch}
              toggleServerSearch={handleToggleServerSearch}
              onSearchSubmit={handleServerSearchSubmit}
              selectedColumn={selectedColumn}
              onColumnChange={handleColumnChange}
            />
            <ActionModal<DataRow>
              isOpen={isModalOpen}
              onClose={closeActionModal}
              selectedItems={selectedRows}
              headers={tableHeaders}
              reqUrl={req}
              onSuccess={handleRefreshData}
              notShow={notShowedEdit}
            />

            <DocumentViewerModal
              isOpen={isDocumentModalOpen}
              onClose={handleCloseViewerModal}
              fileUrl={viewer.fileUrl}
              fileBuffer={viewer.fileBuffer}
              fileType={viewer.fileType}
              fileName={viewer.fileName}
              isLoading={viewer.isLoading}
              error={viewer.error}
            />
          </>
        )}
        <BaseTable<DataRow>
          ref={(refInstance) => {
            internalRef.current = refInstance;
            if (refInstance && tableInstance !== refInstance) {
              setTableInstance(refInstance);
            }
          }}
          data={tableData}
          headers={memoizedHeaders}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSort={handleSort}
          onSearch={handleSearch}
          rowSelection={rowSelectionState}
          onRowSelectionChange={handleRowSelectionChange}
          searchTerm={searchTerm}
          showColumnVisibilityControl={true}
          sort={sort}
          direction={direction}
          isLoading={loading}
          isServerSearch={isServerSearch}
          selectedColumn={selectedColumn}
        />
      </div>
    </div>
  );
};

export default TableBuilder;

import { axiosInstance, useAxiosInterceptor } from "../api/axios";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { BaseTable, TableInstanceRef } from "./table/BaseTable";
import { Header, PaginationInfo, SortDirection } from "./Types";
import { useLocation, useNavigate } from "react-router-dom";
import { TableControls } from "./table/TableControls";
import { ActionModal } from "./modal/ActionModal";
import { RowSelectionState, Table } from "@tanstack/react-table";
import { useDocumentViewer } from "../hooks/useDocumentViewer";
import DocumentViewerModal from "./modal/DocumentViewerModal";

export interface DataRow {
  id: number;
  title: string;
  comment: string;
  deleted: boolean;
}

interface RequestCustom {
  req: string;
  pageTitle: string;
  isShowAdd: boolean;
  createText: string;
  notShowedEdit: string[];
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

const TableBuilder = ({
  req,
  isShowAdd,
  pageTitle,
  createText,
  notShowedEdit,
  draftPage = "",
}: RequestCustom) => {
  const [tableData, setTableData] = useState<DataRow[]>([]);
  const [tableHeaders, setTableHeaders] = useState<Header[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });
  const [sort, setSort] = useState<string | null>("");
  const [direction, setDirection] = useState<SortDirection>("none");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isDeleted, setIsDeleted] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<DataRow[]>([]);
  const [isServerSearch, setIsServerSearch] = useState(true);
  const location = useLocation();

  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});

  const navigate = useNavigate();
  useAxiosInterceptor();

  // Подключаем кастомный хук отображения документов
  const viewer = useDocumentViewer();

  const [tableInstance, setTableInstance] = useState<Table<DataRow> | null>(
    null,
  );
  const internalRef = useRef<TableInstanceRef<DataRow>>(null);
  const [rowSelectionState, setRowSelectionState] = useState<RowSelectionState>(
    {},
  );

  // Автоматическое скрытие колонок датчиков, если во всех строках значение равно 0
  useEffect(() => {
    if (!tableData.length || !tableHeaders.length) return;

    const newVisibility: Record<string, boolean> = {};

    tableHeaders.forEach((header) => {
      if (header.key?.startsWith("detectorsValue.detector_")) {
        const getNestedValue = (obj: any, path: string) =>
          path.split(".").reduce((acc, part) => acc?.[part], obj);

        // Проверяем: есть ли хотя бы одно НЕ нулевое значение
        const hasData = tableData.some((row) => {
          const val = getNestedValue(row, header.key);
          return val !== 0 && val !== null && val !== undefined && val !== "";
        });

        // Явно записываем true или false
        newVisibility[header.key] = hasData;
      }
    });

    // Обновляем состояние целиком для датчиков
    if (Object.keys(newVisibility).length > 0) {
      setColumnVisibility((prev) => ({
        ...prev,
        ...newVisibility, // Теперь здесь будут и true, и false
      }));
    }
  }, [tableData, tableHeaders]);

  const fetchData = useCallback(
    async (params: PaginationParams) => {
      const currentReq = req;
      try {
        setLoading(true);
        const isToSort = params.direction && params.direction !== "none";
        const response = await axiosInstance.get<ApiResponse>(`${req}`, {
          params: {
            page: params.page,
            size: params.size,
            sort: isToSort ? params.sort : undefined,
            direction: isToSort ? params.direction : undefined,
            includeDeleted: params.deleted,
            globalSearch: params.globalSearch,
          },
        });
        if (currentReq !== req) return;
        setTableData(response.data.content);
        setPagination((prev) => {
          // Если данные идентичны текущим, возвращаем старый объект (ссылка не меняется)
          if (
            prev.page === response.data.number &&
            prev.size === response.data.size &&
            prev.totalElements === response.data.totalElements &&
            prev.totalPages === response.data.totalPages
          ) {
            return prev;
          }
          // Иначе обновляем
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
        if (currentReq === req) {
          if (tableHeaders.length > 0) {
            setLoading(false);
          }
        }
      }
    },
    [req, tableHeaders],
  );

  const memoizedHeaders = useMemo(() => tableHeaders, [tableHeaders]);

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
          setError("Ошибка при загрузке данных: " + err);
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

  useEffect(() => {
    if (tableHeaders.length === 0) return;
    fetchData({
      page: pagination.page,
      size: pagination.size,
      sort: sort && direction ? `${sort},${direction}` : undefined,
      direction: direction,
      deleted: isDeleted,
      globalSearch: searchTerm,
    });
  }, [
    pagination.page,
    pagination.size,
    sort,
    direction,
    tableHeaders,
    fetchData,
    isDeleted,
  ]);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (size: number) => {
    setPagination((prev) => ({ ...prev, size, page: 0 }));
  };

  const handleSort = useCallback(
    (columnKey: string) => {
      const nextStep: Record<SortDirection, SortDirection> = {
        none: "asc",
        asc: "desc",
        desc: "none",
      };

      setDirection((direction) => {
        return columnKey !== sort
          ? "asc"
          : nextStep[direction as SortDirection] || "asc";
      });

      setSort(columnKey);
      setPagination((prev) => ({ ...prev, page: 0 }));
    },
    [sort, direction],
  );

  const handleDeleted = (state: boolean) => {
    setIsDeleted(state);
  };

  const handleSearch = useCallback(
    (term: string) => {
      setSearchTerm(term);
    },
    [isServerSearch, tableInstance],
  );

  const handleServerSearchSubmit = useCallback(
    (term?: string) => {
      // Добавили term
      if (isServerSearch) {
        // Если term передан (например, пустая строка), берем его, иначе из стейта
        const searchValue = typeof term === "string" ? term : searchTerm;

        setPagination((prev) => ({ ...prev, page: 0 }));
        fetchData({
          page: 0,
          size: pagination.size,
          sort: sort && direction ? `${sort},${direction}` : undefined,
          deleted: isDeleted,
          globalSearch: searchValue,
        });
      } else {
        fetchData({
          page: 0,
          size: pagination.size,
          sort: sort && direction ? `${sort},${direction}` : undefined,
          deleted: isDeleted,
          globalSearch: "",
        });
      }
    },
    [
      isServerSearch,
      fetchData,
      pagination.size,
      sort,
      direction,
      isDeleted,
      searchTerm,
    ],
  );

  const handleOpenViewerClick = () => {
    if (selectedRows.length === 1) {
      // Передаем объект выделенной строки `{ id: 8, filePath: "...", title: "..." }`
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
    });
  }, [fetchData, pagination, sort, direction, isDeleted]);

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
    } catch (error) {
      console.error("Ошибка при изменении статуса:", error);
      alert("Произошла ошибка при выполнении операции.");
    }
  }, [selectedRows, req, axiosInstance]);

  const handleDownloadDocument = useCallback(async () => {
    if (selectedRows.length !== 1) return;
    const id = selectedRows[0].id;
    const urlWithParams = `/documents/${id}/download`;

    try {
      // 1. Указываем responseType: 'blob', чтобы axios не пытался парсить бинарник как текст
      const response = await axiosInstance.get(urlWithParams, {
        responseType: "blob",
      });

      // 2. Создаем ссылку на файл в памяти браузера
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const contentDisposition = response.headers["content-disposition"];
      const contentType = response.headers["content-type"]?.toString();

      // Словарь соответствия MIME-типов и расширений
      const mimeToExtension = {
        "application/pdf": ".pdf",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
          ".xlsx",
        "application/vnd.ms-excel": ".xls",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          ".docx",
        "application/msword": ".doc",
        "text/csv": ".csv",
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "application/zip": ".zip",
      };

      // Дефолтная база имени без расширения
      let filenameBase = `document-${id}`;
      let extension = ".pdf"; // Расширение по умолчанию, если ничего не нашли

      if (contentDisposition) {
        const normalizedStr = contentDisposition.replace(/;\s*/g, "&");
        const params = new URLSearchParams(normalizedStr);

        const filenameStar = params.get("filename*");
        const filenameNormal = params.get("filename");

        let fullFilename = "";

        if (filenameStar) {
          const cleanStar = filenameStar
            .replace(/^utf-8''/i, "")
            .replace(/['"]/g, "");
          fullFilename = decodeURIComponent(cleanStar);
        } else if (filenameNormal) {
          let cleanNormal = filenameNormal.replace(/['"]/g, "");

          if (cleanNormal.startsWith("=?")) {
            cleanNormal = cleanNormal
              .replace(/^=\?[^?]+\?[Qq]\?/, "")
              .replace(/\?=\s*$/, "")
              .replace(/=/g, "%");
            try {
              fullFilename = decodeURIComponent(cleanNormal);
            } catch (e) {
              fullFilename = cleanNormal;
            }
          } else {
            fullFilename = decodeURIComponent(cleanNormal);
          }
        }

        // Если из Disposition успешно достали имя, используем его целиком
        if (fullFilename) {
          filenameBase = fullFilename;
          extension = ""; // Сбрасываем дефолтное расширение, так как оно уже есть внутри fullFilename
        }
      } else if (contentType) {
        // Очищаем Content-Type от возможных параметров вроде "; charset=utf-8"
        const pureMimeType = contentType.trim().split(";")[0].toLowerCase();

        // Ищем расширение в нашей мапе. Если типа нет в словаре — останется дефолтный .pdf
        if (pureMimeType in mimeToExtension) {
          extension =
            mimeToExtension[pureMimeType as keyof typeof mimeToExtension];
        }
      }

      // Собираем итоговое имя файла
      const finalFilename = `${filenameBase}${extension}`;

      // Теперь запишется чистое: testFile.pdf
      link.setAttribute("download", finalFilename);

      document.body.appendChild(link);
      link.click();

      // 4. Чистим за собой
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      handleRefreshData();
      setRowSelectionState({});
    } catch (error) {
      console.error("Ошибка при скачивании:", error);
      alert("Произошла ошибка при скачивании файла.");
    }
  }, [selectedRows, axiosInstance, handleRefreshData]);

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
        {loading && (
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
              <span
                style={{
                  marginTop: "10px",
                  color: "#3b82f6",
                  fontWeight: "bold",
                }}
              >
                Загрузка...
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  const isTableReady = !!tableInstance;

  return (
    <div className="container-fluid">
      <div style={{ height: "calc(85vh - 25px)" }}>
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
              // Новые пропсы для переключателя и кнопки
              isServerSearch={isServerSearch}
              toggleServerSearch={() => setIsServerSearch((prev) => !prev)}
              onSearchSubmit={handleServerSearchSubmit}
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
        />
      </div>
    </div>
  );
};

export default TableBuilder;

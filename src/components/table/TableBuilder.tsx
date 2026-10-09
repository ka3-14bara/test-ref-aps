import React, { useState, useEffect, useMemo, useCallback } from "react";
import { axiosInstance, useAxiosInterceptor } from "../../api/client";
import { Header, PaginationInfo, SortDirection } from "../../types/table";
import BaseTable from "./BaseTable";
import TableControls from "./TableControls";
import ActionModal from "../modals/ActionModal";
import DocumentViewerModal from "../modals/DocumentViewerModal";
import { useDocumentViewer } from "../../hooks/useDocumentViewer";
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
} from "@tanstack/react-table";

interface TableBuilderProps {
  req: string;
  pageTitle: string;
  isShowAdd?: boolean;
  createText?: string;
  notShowedEdit?: string[];
  draftPage?: string;
}

export const TableBuilder: React.FC<TableBuilderProps> = ({
  req,
  pageTitle,
  isShowAdd = true,
  createText = "Создать",
  notShowedEdit = [],
  draftPage,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<Header[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isShowDeleted, setIsShowDeleted] = useState(false);
  const [sort, setSort] = useState<string | null>(null);
  const [direction, setDirection] = useState<SortDirection>("asc");
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });

  const {
    fileUrl,
    fileBuffer,
    fileType,
    fileName,
    isLoading: isDocLoading,
    error: docError,
    openViewer,
    closeViewer,
  } = useDocumentViewer();

  useAxiosInterceptor();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(req, {
        params: {
          page: pagination.page,
          size: pagination.size,
          sort: sort || undefined,
          direction: sort ? direction : undefined,
          searchTerm: searchTerm || undefined,
          includeDeleted: isShowDeleted,
        },
      });

      if (res.data?.content) {
        setData(res.data.content);
        setPagination((prev) => ({
          ...prev,
          totalPages: res.data.totalPages || 0,
          totalElements: res.data.totalElements || 0,
        }));
      } else if (Array.isArray(res.data)) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Ошибка загрузки данных таблицы:", err);
    } finally {
      setLoading(false);
    }
  }, [
    req,
    pagination.page,
    pagination.size,
    sort,
    direction,
    searchTerm,
    isShowDeleted,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Извлекаем ключи колонок из структуры первой строки
  useEffect(() => {
    if (data.length > 0 && headers.length === 0) {
      const first = data[0];
      const autoHeaders: Header[] = Object.keys(first).map((k) => ({
        key: k,
        label: k,
      }));
      setHeaders(autoHeaders);
    }
  }, [data, headers.length]);

  const columns = useMemo<ColumnDef<any>[]>(() => {
    const selectColumn: ColumnDef<any> = {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          className="form-check-input"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="form-check-input"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
      enableSorting: false,
    };

    const dataCols: ColumnDef<any>[] = headers
      .filter((h) => !h.key.startsWith("none"))
      .map((h) => ({
        id: h.key,
        accessorKey: h.key,
        header: h.label,
        cell: (info) => {
          const val = info.getValue();
          if (typeof val === "boolean") return val ? "Да" : "Нет";
          if (val === null || val === undefined) return "—";
          if (typeof val === "object")
            return (val as any).title || JSON.stringify(val);
          return String(val);
        },
      }));

    return [selectColumn, ...dataCols];
  }, [headers]);

  const table = useReactTable({
    data,
    columns,
    state: { rowSelection },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: pagination.totalPages,
  });

  const selectedRows = useMemo(() => {
    return Object.keys(rowSelection)
      .filter((k) => rowSelection[k])
      .map((idx) => data[Number(idx)])
      .filter(Boolean);
  }, [rowSelection, data]);

  const handleSort = (columnId: string) => {
    if (sort === columnId) {
      setDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSort(columnId);
      setDirection("asc");
    }
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const handleStatusChange = async (deleted: boolean) => {
    const ids = selectedRows.map((r) => r.id);
    if (ids.length === 0) return;

    try {
      if (deleted) {
        await axiosInstance.delete(req, { data: { ids } });
      } else {
        await axiosInstance.patch(req, { ids });
      }
      setRowSelection({});
      fetchData();
    } catch (err) {
      alert("Ошибка при изменении статуса записей");
    }
  };

  return (
    <div className="container-fluid px-4 py-2">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0 fw-bold">{pageTitle}</h4>
      </div>

      <TableControls
        searchTerm={searchTerm}
        onSearch={(term) => {
          setSearchTerm(term);
          setPagination((prev) => ({ ...prev, page: 0 }));
        }}
        headers={headers}
        isShowAdd={isShowAdd}
        pageName={req}
        isShowDeleted={isShowDeleted}
        onDelState={setIsShowDeleted}
        selectedRows={selectedRows}
        openActionModal={() => setIsModalOpen(true)}
        handleStatusChange={handleStatusChange}
        table={table}
        btnCreateNewText={createText}
        drafts={draftPage}
        handleOpenViewerClick={
          selectedRows.length === 1 && selectedRows[0]?.filePath
            ? () => openViewer(selectedRows[0])
            : undefined
        }
      />

      <BaseTable
        data={data}
        columns={columns}
        pagination={pagination}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
        onPageSizeChange={(size) =>
          setPagination((prev) => ({ ...prev, size, page: 0 }))
        }
        isLoading={loading}
        sort={sort}
        direction={direction}
        onSort={handleSort}
        onSearch={() => {}}
      />

      {isModalOpen && (
        <ActionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedItems={selectedRows}
          headers={headers}
          reqUrl={req}
          onSuccess={() => {
            setRowSelection({});
            fetchData();
          }}
          notShow={notShowedEdit}
        />
      )}

      <DocumentViewerModal
        isOpen={Boolean(fileUrl || fileBuffer)}
        onClose={closeViewer}
        fileUrl={fileUrl}
        fileBuffer={fileBuffer}
        fileType={fileType}
        fileName={fileName}
        isLoading={isDocLoading}
        error={docError}
      />
    </div>
  );
};

export default TableBuilder;

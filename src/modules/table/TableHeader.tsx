import { JSX, memo } from "react";
import { flexRender } from "@tanstack/react-table";
import { SortDirection, TableHeaderProps } from "../Types";

// 1. Расширяем интерфейс пропсов, добавляя состояние чекбоксов
interface ExtendedHeaderProps<T extends Record<string, any>> extends TableHeaderProps<T> {
  rowSelection: Record<string, boolean>;
  columnVisibility: Record<string, boolean>;
}

const SortIndicator = ({
  active,
  direction,
}: {
  active: boolean;
  direction: SortDirection | undefined;
}) => {
  // Если колонка не активна — показываем бледную иконку направления (вверх-вниз)
  if (!active || direction === "none" || !direction) {
    return (
      <i
        className="bi bi-arrow-down-up text-secondary opacity-25 ms-1"
        style={{ fontSize: "0.75rem" }}
      ></i>
    );
  }

  // Если активна — показываем синюю иконку соответствующего направления
  return direction === "asc" ? (
    <i className="bi bi-sort-alpha-down text-primary ms-1"></i>
  ) : (
    <i className="bi bi-sort-alpha-up-alt text-primary ms-1"></i>
  );
};

// Внутренний компонент без экспорта (экспортируем мемоизированную версию ниже)
const TableHeaderComponent = <T extends Record<string, any>>({
  onSort,
  visibleHeaderGroups,
  sort,
  direction,
  rowSelection,
  columnVisibility,
}: ExtendedHeaderProps<T>) => {
  const maxDepth = visibleHeaderGroups.length;

  // Безопасно читаем rowSelection, чтобы линтер не ругался на неиспользуемую переменную
  void rowSelection;
  void columnVisibility;

  return (
    <thead className="table-light">
      {visibleHeaderGroups.map((headerGroup, index) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header) => {
            if (header.isPlaceholder) return null;

            // Проверяем, является ли текущая ячейка нашей "заглушкой"
            const isHidden = header.column.columnDef.header === "__HIDDEN__";

            if (isHidden) return null;

            // Проверяем, есть ли у текущей ячейки "скрытый" ребенок
            const hasHiddenChild = header.subHeaders.some(
              (sh) => sh.column.columnDef.header === "__HIDDEN__",
            );

            // Если есть скрытый ребенок или это лист на последнем уровне - тянем вниз
            const isLeaf = header.subHeaders.length === 0;
            const rowSpan =
              hasHiddenChild || (isLeaf && header.depth === 0) ? maxDepth : 1;

            const isSelect =
              header.id.includes("select") || header.column.id === "select";
            const isSortable = true;

            return (
              <th
                key={header.id}
                colSpan={header.colSpan}
                rowSpan={rowSpan}
                className="border p-0"
                style={{
                  position: "sticky",
                  top: index === 0 ? 0 : "48px",
                  left: isSelect ? 0 : undefined,
                  zIndex: isSelect
                    ? index === 0
                      ? 5
                      : 4
                    : index === 0
                      ? 3
                      : 2,
                  backgroundColor: "#f8f9fa",
                  borderBottom: "1px solid #dee2e6",
                  verticalAlign: "top",
                  minWidth: isSelect ? "24px" : "150px",
                  cursor: isSortable ? "pointer" : "default",
                  height: "inherit",
                }}
                onClick={() => {
                  if (isSortable && hasHiddenChild && !isSelect) {
                    onSort(header.column.id);
                  }
                }}
              >
                <div
                  className={`d-flex flex-column ${isSelect ? "p-0" : "p-2"}`}
                  style={{
                    height: "100%",
                    minHeight: "48px",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <div
                    className={`d-flex align-items-center justify-content-between ${isSortable ? "cursor-pointer" : ""}`}
                    style={{
                      cursor: isSortable ? "pointer" : "default",
                      userSelect: "none",
                      flexGrow: 1,
                      width: "100%",
                    }}
                  >
                    {!isSelect ? (
                      <div
                        className="fw-bold small text-uppercase text-secondary mx-auto text-center"
                        style={{
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                          overflow: "hidden",
                          textOverflow: "clip",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          flex: "1 1 auto",
                          alignContent: "center",
                        }}
                        title={
                          typeof header.column.columnDef.header === "string"
                            ? header.column.columnDef.header
                            : undefined
                        }
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </div>
                    ) : (
                      <div className="mx-auto" style={{ padding: "0px" }}>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </div>
                    )}
                    {isSortable && hasHiddenChild && !isSelect && (
                      <div className="flex-shrink-0">
                        <SortIndicator
                          active={
                            header.column.id.replace("_group", "") === sort
                          }
                          direction={direction}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </th>
            );
          })}
        </tr>
      ))}
    </thead>
  );
};

// Экспортируем мемоизированный компонент с сохранением дженерика <T>
export const TableHeader = memo(TableHeaderComponent, (prev, next) => {
  return (
    prev.sort === next.sort &&
    prev.direction === next.direction &&
    prev.visibleHeaderGroups.length === next.visibleHeaderGroups.length &&
    // Если объект видимости колонок изменился — шапка ОБЯЗАНА перерисоваться
    prev.columnVisibility === next.columnVisibility && // <-- 4. ДОБАВИЛИ ПРОВЕРКУ ССЫЛКИ
    Object.keys(prev.rowSelection || {}).length === Object.keys(next.rowSelection || {}).length
  );
}) as <T extends Record<string, any>>(props: ExtendedHeaderProps<T>) => JSX.Element;

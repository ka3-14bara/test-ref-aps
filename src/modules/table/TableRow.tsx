import { JSX, memo } from "react";
import { flexRender } from "@tanstack/react-table";
import { TableRowProps } from "../Types";

interface ExtendedRowProps<
  T extends Record<string, any>,
> extends TableRowProps<T> {
  rowSelection: Record<string, boolean>;
  columnVisibility: Record<string, boolean>;
}

const TableRowComponent = <T extends Record<string, any>>({
  row,
  index,
  rowSelection,
  columnVisibility,
}: ExtendedRowProps<T>) => {
  const isDeleted = row.original.isDeleted;
  const isSelected = row.getIsSelected();

  let rowClasses = ["border"];

  // Определяем цвет фона для всей строки и её ячеек
  let rowBackgroundColor = "#fff";

  if (isDeleted) {
    rowClasses.push("bg-danger text-white");
    rowBackgroundColor = "#dc3545";
  } else if (isSelected) {
    rowBackgroundColor = "#cff4fc";
    rowClasses.push("text-dark fw-semibold");
  } else {
    rowBackgroundColor = index % 2 === 0 ? "#ffffff" : "#f9fafb"; 
  }

  const finalClasses = rowClasses.filter(Boolean).join(" ");

  void rowSelection;
  void columnVisibility;

  return (
    <tr
      id={row.id}
      className={`${finalClasses} cursor-pointer`}
      style={{ height: "44px", backgroundColor: rowBackgroundColor }}
      onClick={() => {
        if (row.getCanSelect()) {
          row.toggleSelected(!isSelected);
        }
      }}
    >
      {row.getVisibleCells().map((cell) => {
        const originalData = row.original;
        const columnId = cell.column.id
          .replace("_child", "")
          .replace(/\..*/g, "");
        const cellData = originalData[columnId];
        const tooltip =
          cellData && typeof cellData === "object"
            ? cellData.comment
            : undefined;

        const isSelectColumn = cell.column.id === "select";

        return (
          <td
            key={cell.id}
            className={`border p-0 ${
              isSelectColumn
                ? `px-2 ${cell.column.id}`
                : "px-2 py-1 text-center mx-auto fw-semibold small"
            } ${isDeleted ? "text-red-800" : ""}`}
            style={{
              height: "44px",
              backgroundColor: rowBackgroundColor,
              ...(isSelectColumn
                ? { position: "sticky", left: 0, zIndex: 1 }
                : {}),
            }}
            title={tooltip}
            onClick={(e) => {
              if (isSelectColumn) {
                e.stopPropagation();
              }
            }}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        );
      })}
    </tr>
  );
};

// Функция сравнения
export const TableRow = memo(TableRowComponent, (prev, next) => {
  if (prev.row.original !== next.row.original || prev.index !== next.index) {
    return false;
  }

  if (prev.rowSelection?.[prev.row.id] !== next.rowSelection?.[next.row.id]) {
    return false;
  }

  if (
    JSON.stringify(prev.columnVisibility) !==
    JSON.stringify(next.columnVisibility)
  ) {
    return false;
  }

  return true;
}) as <T extends Record<string, any>>(
  props: ExtendedRowProps<T>,
) => JSX.Element;

import React from "react";
import { flexRender } from "@tanstack/react-table";
import { TableRowProps } from "../../types/table";

export const TableRow: React.FC<TableRowProps> = ({ row }) => {
  const isDeleted = Boolean(row.original?.deleted);

  return (
    <tr
      className={`app-table__row ${isDeleted ? "app-table__row--deleted" : ""}`}
    >
      {row.getVisibleCells().map((cell) => (
        <td key={cell.id} className="app-table__cell">
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
};

export default React.memo(TableRow);

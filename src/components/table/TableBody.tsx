import React from "react";
import { TableBodyProps } from "../../types/table";
import TableRow from "./TableRow";

export const TableBody: React.FC<TableBodyProps> = ({ rows }) => {
  if (rows.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={100} className="text-center py-5 text-muted">
            <i className="bi bi-inbox fs-3 d-block mb-2"></i>
            Данные отсутствуют
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody>
      {rows.map((row, index) => (
        <TableRow key={row.id} row={row} index={index} />
      ))}
    </tbody>
  );
};

export default TableBody;

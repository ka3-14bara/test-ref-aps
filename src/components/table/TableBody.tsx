import { TableRow } from "./TableRow";
import { TableBodyProps } from "../../types/table";
import { Row } from "@tanstack/react-table";

interface ExtendedBodyProps<
  T extends Record<string, any>,
> extends TableBodyProps<T> {
  rowSelection: Record<string, boolean>;
  columnVisibility: Record<string, boolean>;
}

export const TableBody = <T extends Record<string, any>>({
  rows,
  rowSelection,
  columnVisibility,
}: ExtendedBodyProps<T>) => {
  return (
    <tbody className="table-body">
      {rows.map((row: Row<T>) => (
        <TableRow<T>
          key={row.id}
          row={row}
          index={row.index}
          rowSelection={rowSelection || {}}
          columnVisibility={columnVisibility || {}}
        />
      ))}
    </tbody>
  );
};

export default TableBody;

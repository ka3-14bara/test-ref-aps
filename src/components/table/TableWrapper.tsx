import React from "react";
import { TableWrapperProps } from "../../types/table";

export const TableWrapper: React.FC<TableWrapperProps> = ({
  children,
  tableContainerRef,
}) => {
  return (
    <div
      ref={tableContainerRef}
      className="app-table-wrapper border shadow-sm"
      style={{ height: "70vh" }}
    >
      {children}
    </div>
  );
};

export default TableWrapper;

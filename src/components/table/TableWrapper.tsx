import React from "react";
import { TableWrapperProps } from "../../types/table";

export const TableWrapper: React.FC<TableWrapperProps> = ({
  children,
  tableContainerRef,
}) => {
  return (
    <div ref={tableContainerRef as any} className="table-wrapper">
      <div className="table-body-container">{children}</div>
    </div>
  );
};

export default TableWrapper;

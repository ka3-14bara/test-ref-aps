import React from "react";
import { TableWrapperProps } from '../Types'

export const TableWrapper: React.FC<TableWrapperProps> = ({
  children,
  tableContainerRef
}) => {
  return (
    <div ref={tableContainerRef} className="table-wrapper">
      <div className="table-body-container">
        {children}
      </div>
    </div>
  );
};
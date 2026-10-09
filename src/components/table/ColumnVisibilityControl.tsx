import React from "react";
import { Dropdown } from "react-bootstrap";
import { TableVisibilityControlProps } from "../../types/table";
import Checkbox from "../common/Checkbox";

export const ColumnVisibilityControl: React.FC<TableVisibilityControlProps> = ({
  table,
}) => {
  const columns = table.getAllLeafColumns();

  const handleToggleAll = (visible: boolean) => {
    table.toggleAllColumnsVisible(visible);
  };

  return (
    <Dropdown>
      <Dropdown.Toggle
        variant="outline-secondary"
        size="sm"
        id="column-visibility-dropdown"
      >
        <i className="bi bi-columns-gap me-1"></i> Видимость столбцов
      </Dropdown.Toggle>

      <Dropdown.Menu
        className="p-3 shadow-sm"
        style={{ maxHeight: "350px", overflowY: "auto", minWidth: "240px" }}
      >
        <div className="d-flex justify-content-between mb-2 pb-2 border-bottom">
          <button
            type="button"
            className="btn btn-link btn-sm p-0 text-decoration-none"
            onClick={() => handleToggleAll(true)}
          >
            Показать все
          </button>
          <button
            type="button"
            className="btn btn-link btn-sm p-0 text-decoration-none text-danger"
            onClick={() => handleToggleAll(false)}
          >
            Скрыть все
          </button>
        </div>

        {columns.map((column) => {
          if (column.id === "select" || column.id === "actions") return null;
          const header = column.columnDef.header;
          const label = typeof header === "string" ? header : column.id;

          return (
            <div key={column.id} className="py-1">
              <Checkbox
                id={`col-vis-${column.id}`}
                label={label}
                checked={column.getIsVisible()}
                onChange={(checked) => column.toggleVisibility(checked)}
              />
            </div>
          );
        })}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ColumnVisibilityControl;

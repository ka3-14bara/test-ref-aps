import { Table } from "@tanstack/react-table";
import Checkbox from "../common/Checkbox";

interface ColumnVisibilityControlProps<T extends Record<string, any>> {
  table: Table<T>;
}

export function ColumnVisibilityControl<T extends Record<string, any>>({
  table,
}: ColumnVisibilityControlProps<T>) {
  return (
    <details className="p-2 col-visibility">
      <summary className="cursor-pointer font-semibold">
        Управление видимостью колонок
      </summary>
      <div className="inline-block border border-gray-300 rounded p-2 mt-2 bg-white shadow drop-col-names">
        <div>
          <label className="block mb-1 flex items-center space-x-2">
            <Checkbox
              checked={table.getIsAllColumnsVisible()}
              onChange={table.getToggleAllColumnsVisibilityHandler()}
              label="Показать/скрыть все"
            />
          </label>
        </div>
        <hr className="my-1" />
        {table.getAllColumns().map((column) => {
          if (column.depth > 0 || column.id === "select_group") return null;

          return (
            <div key={column.id} className="px-1">
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={column.getIsVisible()}
                  label={
                    typeof column.columnDef.header === "string"
                      ? column.columnDef.header
                      : column.id
                  }
                  onChange={(isVisible) => {
                    column.toggleVisibility(isVisible);
                    if (column.getCanHide()) {
                      column.getLeafColumns().forEach((leaf) => {
                        leaf.toggleVisibility(isVisible);
                      });
                    }
                  }}
                />
              </label>
            </div>
          );
        })}
      </div>
    </details>
  );
}

export default ColumnVisibilityControl;

import { Table } from "@tanstack/react-table";
import Checkbox from "../Checkbox";

interface ColumnVisibilityControlProps<T extends Record<string, any>> {
  table: Table<T>;
}

// Управляет видимостью колонок в таблице
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
            {/* Используем Checkbox для управления видимостью всех колонок */}
            <Checkbox
              {...{
                checked: table.getIsAllColumnsVisible(),
                // Управляет состоянием "все видимы" или "не все видимы, но некоторые видимы" (indeterminate)
                indeterminate:
                  table.getIsSomeColumnsVisible() &&
                  !table.getIsAllColumnsVisible(),
                onChange: table.getToggleAllColumnsVisibilityHandler(),
              }}
            />{" "}
            <span>Показать/скрыть все</span>
          </label>
        </div>
        <hr className="my-1" />
        {table.getAllColumns().map((column) => {
          // Показываем в списке ТОЛЬКО верхний уровень (группы)
          if (column.depth > 0 || column.id === "select_group") return null;

          return (
            <div key={column.id} className="px-1">
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={column.getIsVisible()}
                  onChange={(e) => {
                    e.stopPropagation();
                    const isVisible = e.target.checked;

                    // Скрываем саму колонку (группу)
                    column.toggleVisibility(isVisible);

                    // Если у колонки есть "дети" (подколонки), скрываем и их тоже
                    if (column.getCanHide()) {
                      column.getLeafColumns().forEach((leaf) => {
                        leaf.toggleVisibility(isVisible);
                      });
                    }
                  }}
                />
                <span>
                  {typeof column.columnDef.header === "string"
                    ? column.columnDef.header
                    : column.id}
                </span>
              </label>
            </div>
          );
        })}
      </div>
    </details>
  );
}

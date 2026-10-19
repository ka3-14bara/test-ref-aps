import React from "react";
import { Table } from "@tanstack/react-table";
import Checkbox from "../common/Checkbox";

interface ColumnVisibilityControlProps<T extends Record<string, any>> {
  table: Table<T>;
}

export function ColumnVisibilityControl<T extends Record<string, any>>({
  table,
}: ColumnVisibilityControlProps<T>) {
  const isAllVisible = table.getIsAllColumnsVisible();
  const isSomeVisible = table.getIsSomeColumnsVisible();

  // Обработчик для "Показать/скрыть все"
  const handleToggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const targetState = e.target.checked;
    table.toggleAllColumnsVisible(targetState);
  };

  return (
    <details className="p-2 col-visibility">
      <summary className="cursor-pointer font-semibold">
        Управление видимостью колонок
      </summary>
      <div className="inline-block border border-gray-300 rounded p-2 mt-2 bg-white shadow drop-col-names">
        <div>
          <label className="block mb-1 flex items-center space-x-2">
            <Checkbox
              checked={isAllVisible}
              indeterminate={isSomeVisible && !isAllVisible}
              onChange={handleToggleAll}
              label="Показать/скрыть все"
            />
          </label>
        </div>
        <hr className="my-1" />
        {table.getAllColumns().map((column) => {
          // Показываем в списке ТОЛЬКО верхний уровень (группы) и исключаем чекбокс выбора строк
          if (column.depth > 0 || column.id === "select_group") return null;

          const isChecked = column.getIsVisible();

          return (
            <div key={column.id} className="px-1">
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={isChecked}
                  label={
                    typeof column.columnDef.header === "string"
                      ? column.columnDef.header
                      : column.id
                  }
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    e.stopPropagation();
                    const newVisibility = e.target.checked;

                    // 1. Переключаем видимость самой группы
                    column.toggleVisibility(newVisibility);

                    // 2. Обязательно переключаем видимость всех дочерних колонок в группе
                    const leafCols = column.getLeafColumns();
                    leafCols.forEach((leaf) => {
                      leaf.toggleVisibility(newVisibility);
                    });
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

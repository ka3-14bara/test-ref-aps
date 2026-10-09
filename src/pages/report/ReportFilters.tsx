import React from "react";
import { searchableConfigs } from "../../utils/searchableConfig";
import SearchableInput from "../../components/common/SearchableInput";

interface ReportFiltersProps {
  fields: string[];
  values: Record<string, any>;
  onChange: (field: string, value: any) => void;
  placeHolder: Record<string, string>;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  fields,
  values,
  onChange,
  placeHolder,
}) => {
  return (
    <div className="row g-3">
      {fields.map((field) => {
        const isCheckbox = field.includes("includeDeleted");
        const isSearchable = field.includes("Id");
        const isDropdown = field.toLowerCase().includes("type");

        const inputType = field.includes("date")
          ? "date"
          : field.includes("Labor") ||
              field.includes("Capacity") ||
              field.includes("Normative")
            ? "number"
            : isCheckbox
              ? "checkbox"
              : "text";

        if (isCheckbox) {
          return (
            <div key={field} className="col-md-4 d-flex align-items-end">
              <div className="form-check mb-2">
                <input
                  id={field}
                  type="checkbox"
                  className="form-check-input"
                  checked={Boolean(values[field])}
                  onChange={(e) => onChange(field, e.target.checked)}
                />
                <label
                  htmlFor={field}
                  className="form-check-label user-select-none"
                >
                  {placeHolder[field] || field}
                </label>
              </div>
            </div>
          );
        }

        if (isDropdown) {
          let optionValues: Record<string, string> = {};
          if (field === "type") {
            optionValues = { FIRE: "ПС", SECURITY: "ОС", FIRE_SECURITY: "ОПС" };
          } else if (field === "documentType") {
            optionValues = {
              ADMIN: "Исполнительная документация",
              COMMISSION: "Акт ввода в эксплуатацию",
              PROJECT: "Проектная документация",
            };
          }

          return (
            <div key={field} className="col-md-4">
              <label htmlFor={field} className="form-label small fw-semibold">
                {placeHolder[field] || field}
              </label>
              <select
                id={field}
                className="form-select"
                value={values[field] ?? ""}
                onChange={(e) => onChange(field, e.target.value)}
              >
                <option value="">-- Все типы --</option>
                {Object.entries(optionValues).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        if (isSearchable) {
          const configKey = field.replace(
            "Id",
            "",
          ) as keyof typeof searchableConfigs;
          const config = searchableConfigs[configKey];
          if (!config) return null;

          return (
            <div key={field} className="col-md-4">
              <label htmlFor={field} className="form-label small fw-semibold">
                {placeHolder[field] || field}
              </label>
              <SearchableInput
                endpoint={config.endpoint}
                onItemSelected={(item: any) =>
                  onChange(field, item?.id ?? null)
                }
                inputId={`report-filter-${field}`}
                searchAndShowParam={config.searchAndShowParam}
                commentParam={config.commentParam}
              />
            </div>
          );
        }

        return (
          <div key={field} className="col-md-4">
            <label htmlFor={field} className="form-label small fw-semibold">
              {placeHolder[field] || field}
            </label>
            <input
              id={field}
              type={inputType}
              className="form-control"
              value={values[field] ?? ""}
              onChange={(e) => {
                const val =
                  inputType === "number" && e.target.value !== ""
                    ? Number(e.target.value)
                    : e.target.value;
                onChange(field, val);
              }}
              placeholder={`Введите ${placeHolder[field] || field}...`}
            />
          </div>
        );
      })}
    </div>
  );
};

export default ReportFilters;

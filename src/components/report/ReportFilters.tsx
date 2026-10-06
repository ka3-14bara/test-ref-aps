import React from "react";
import { searchableConfigs } from "../../utils/searchableConfig";
import SearchableInput from "../../modules/SearchableInput";

// Пример интерфейса для понимания структуры (замените своим при необходимости)
interface Props {
  fields: string[];
  values: Record<string, any>;
  onChange: (field: string, value: any) => void;
  placeHolder: Record<string, string>;
}

const ReportFilters: React.FC<Props> = ({
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

        // Определение типа инпута
        const inputType = field.includes("date")
          ? "date"
          : field.includes("Labor")
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
                  className="form-check-label text-capitalize ms-1"
                >
                  {placeHolder[field]}
                </label>
              </div>
            </div>
          );
        } else if (isDropdown) {
          let optionValues: Record<string, string> = {};

          if (field === "type") {
            optionValues = {
              FIRE: "ПС",
              SECURITY: "ОС",
              FIRE_SECURITY: "ОПС",
            };
          } else if (field === "documentType") {
            optionValues = {
              ADMIN: "Исполнительная документация",
              COMMISSION: "Акт ввода в эксплуатацию",
              PROJECT: "Проектная документация",
            };
          }

          return (
            <div key={field} className="col-md-4">
              <label htmlFor={field} className="form-label text-capitalize">
                {placeHolder[field]}
              </label>
              <select
                className="form-select"
                onChange={(e) => onChange(field, e.target.value)}
                id={field}
                value={values[field] ?? ""}
                required
              >
                <option value="">-- Не выбрано --</option>
                {Object.keys(optionValues).map((key) => (
                  <option key={key} value={key}>
                    {optionValues[key]}
                  </option>
                ))}
              </select>
            </div>
          );
        } else if (isSearchable) {
          const config =
            searchableConfigs[
              field.replace("Id", "") as keyof typeof searchableConfigs
            ];
          const searchParam = config.searchAndShowParam;
          const commentParam = config.commentParam;

          return (
            <div className="col-md-4" key={field + "div"}>
              <label className="form-label text-capitalize" htmlFor={field}>
                {placeHolder[field]}
              </label>
              <SearchableInput
                endpoint={config.endpoint}
                onItemSelected={(item: any) => {
                  // Если элемент сбросили/очистили — отправляем null
                  if (!item) {
                    onChange(field, null);
                    return;
                  }
                  // В родительский компонент уходит пара: [имяПоля]: [idОбъекта] (например, stationNameId: 5)
                  onChange(field, item.id);
                }}
                inputId={field}
                searchAndShowParam={searchParam}
                commentParam={commentParam}
                style={{ height: "38px" }}
                isRequired={false}
              />
            </div>
          );
        }

        // Стандартный текстовый/числовой инпут
        return (
          <div key={field} className="col-md-4">
            <label htmlFor={field} className="form-label text-capitalize">
              {placeHolder[field]}
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
              placeholder={`Введите ${placeHolder[field]}...`}
            />
          </div>
        );
      })}
    </div>
  );
};

export default ReportFilters;

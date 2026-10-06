// src/components/createPages/addObjectOS/CommonFieldsSelectorObjectOS.tsx
import React from "react";
import SearchableInput from "../../../modules/SearchableInput";
import {
  Organization,
  MaintenanceTeam,
  Document,
  FormDataStation,
  FormDataObjectOS,
} from "../AddTypes";

interface CommonFieldOption {
  key: keyof FormDataObjectOS;
  label: string;
  type: "string" | "number" | "date" | "select" | "object";
}

const COMMON_FIELD_OPTIONS: CommonFieldOption[] = [
  { key: "number", label: "Номер объекта", type: "number" },
  //{ key: "name", label: "Наименование объекта", type: "string" },
  { key: "coordinates", label: "Координаты", type: "string" },
  { key: "phone", label: "Номер телефона", type: "string" },
  { key: "dateEntered", label: "Дата ввода", type: "date" },
  { key: "dateAdjusted", label: "Дата корректировки", type: "date" },
  { key: "org", label: "Организация", type: "object" },
  { key: "mteam", label: "Обслуживающая бригада", type: "object" },
  { key: "station", label: "Номер прибора", type: "object" },
  { key: "adminStation", label: "Номер станции", type: "object" },
  { key: "projectDoc", label: "Проектная документация", type: "object" },
  { key: "commissionDoc", label: "Акт ввода", type: "object" },
  { key: "adminDoc", label: "Исполнительная документация", type: "object" },
];

interface CommonFieldsSelectorObjectOSProps {
  commonFields: (keyof FormDataObjectOS)[];
  commonFieldValues: Partial<FormDataObjectOS>;
  onToggleField: (field: keyof FormDataObjectOS) => void;
  onValueChange: (field: keyof FormDataObjectOS, value: any) => void;
}

const CommonFieldsSelectorObjectOS: React.FC<
  CommonFieldsSelectorObjectOSProps
> = ({ commonFields, commonFieldValues, onToggleField, onValueChange }) => {
  const handleCheckboxChange = (field: keyof FormDataObjectOS) => {
    if (commonFields.includes(field)) {
      onToggleField(field);
    } else {
      // Можно ограничить количество общих полей, если нужно
      onToggleField(field);
    }
  };

  const renderFieldInput = (field: keyof FormDataObjectOS) => {
    const value = commonFieldValues[field];
    const onChange = (val: any) => onValueChange(field, val);

    switch (field) {
      case "org":
        return (
          <SearchableInput<Organization>
            endpoint="/orgs/all"
            commentParam="shortTitle"
            onItemSelected={(item) => onChange(item)}
            inputId={`common-${field}`}
            style={{ height: "40px" }}
            isRequired={true}
          />
        );
      case "mteam":
        return (
          <SearchableInput<MaintenanceTeam>
            endpoint="/maintenance_teams/all"
            commentParam="orgShortTitle"
            onItemSelected={(item) => onChange(item)}
            inputId={`common-${field}`}
            style={{ height: "40px" }}
            isRequired={true}
          />
        );
      case "station":
      case "adminStation":
        return (
          <SearchableInput<FormDataStation>
            endpoint="/stations/all"
            onItemSelected={(item) => onChange(item)}
            inputId={`common-${field}`}
            searchAndShowParam="number"
            commentParam={(item) => item?.name?.title ?? "Без названия"}
            style={{ height: "40px" }}
          />
        );
      case "dateEntered":
      case "dateAdjusted":
        return (
          <input
            type="date"
            className="form-control"
            // Принудительно приводим к string, так как это дата
            value={
              value !== undefined &&
              value !== null &&
              typeof value !== "boolean"
                ? (value as string)
                : ""
            }
            onChange={(e) => onChange(e.target.value)}
            style={{ height: "40px" }}
          />
        );
      case "number":
        return (
          <input
            type="number"
            className="form-control required"
            value={
              value !== undefined && value !== null ? (value as number) : ""
            }
            onChange={(e) => onChange(parseFloat(e.target.value) || null)}
            placeholder="0"
            style={{ height: "40px" }}
            required={true}
          />
        );
      case "projectDoc":
      case "commissionDoc":
      case "adminDoc":
        return (
          <SearchableInput<Document>
            endpoint={`/documents/${field === "projectDoc" ? "project" : field === "commissionDoc" ? "comission" : "admin"}`}
            onItemSelected={(item) => onChange(item)}
            inputId={`common-${field}`}
            style={{ height: "40px" }}
          />
        );
      default:
        return (
          <input
            type="text"
            className="form-control"
            // Исключаем объекты из value нативного инпута
            value={(value as string | number) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            style={{ height: "40px" }}
          />
        );
    }
  };

  return (
    <div className="card mb-4 border-secondary">
      <div
        className="card-header border-secondary text-black"
        style={{ backgroundColor: "#FFD369" }}
      >
        <h5 className="mb-0">📋 Общие поля</h5>
      </div>
      <div className="card-body">
        <div className="row mb-3">
          <div className="col-12">
            <p className="text-muted small">
              Выберите поля, которые будут одинаковыми для всех создаваемых
              объектов
            </p>
          </div>
        </div>
        <div className="row g-3">
          {COMMON_FIELD_OPTIONS.map((option) => (
            <div key={option.key} className="col-md-4 col-lg-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`common-${option.key}-checkbox`}
                  checked={commonFields.includes(option.key)}
                  onChange={() => handleCheckboxChange(option.key)}
                />
                <label
                  className="form-check-label"
                  htmlFor={`common-${option.key}`}
                >
                  {option.label}
                </label>
              </div>
            </div>
          ))}
        </div>

        {commonFields.length > 0 && (
          <div className="mt-4 pt-3 border-top">
            <h6 className="mb-3">Значения общих полей:</h6>
            <div className="row g-3">
              {commonFields.map((fieldKey) => {
                const option = COMMON_FIELD_OPTIONS.find(
                  (o) => o.key === fieldKey,
                );
                if (!option) return null;
                return (
                  <div key={fieldKey} className="col-md-4">
                    <label className="form-label">{option.label}</label>
                    {renderFieldInput(fieldKey)}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommonFieldsSelectorObjectOS;

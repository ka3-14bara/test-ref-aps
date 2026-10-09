import React from "react";
import SearchableInput from "../../../components/common/SearchableInput";
import {
  Organization,
  MaintenanceTeam,
  Document,
  FormDataStation,
  FormDataObjectOS,
} from "../../../types/creation";

interface CommonFieldOption {
  key: keyof FormDataObjectOS;
  label: string;
}

const COMMON_FIELD_OPTIONS: CommonFieldOption[] = [
  { key: "number", label: "Номер объекта" },
  { key: "coordinates", label: "Координаты" },
  { key: "phone", label: "Номер телефона" },
  { key: "dateEntered", label: "Дата ввода" },
  { key: "dateAdjusted", label: "Дата корректировки" },
  { key: "org", label: "Организация" },
  { key: "mteam", label: "Обслуживающая бригада" },
  { key: "station", label: "Номер прибора" },
  { key: "adminStation", label: "Номер станции" },
  { key: "projectDoc", label: "Проектная документация" },
  { key: "commissionDoc", label: "Акт ввода" },
  { key: "adminDoc", label: "Исполнительная документация" },
];

interface CommonFieldsSelectorObjectOSProps {
  commonFields: (keyof FormDataObjectOS)[];
  commonFieldValues: Partial<FormDataObjectOS>;
  onToggleField: (field: keyof FormDataObjectOS) => void;
  onValueChange: (field: keyof FormDataObjectOS, value: any) => void;
}

export const CommonFieldsSelectorObjectOS: React.FC<
  CommonFieldsSelectorObjectOSProps
> = ({ commonFields, commonFieldValues, onToggleField, onValueChange }) => {
  const renderFieldInput = (field: keyof FormDataObjectOS) => {
    const value = commonFieldValues[field];
    const onChange = (val: any) => onValueChange(field, val);

    switch (field) {
      case "org":
        return (
          <SearchableInput<Organization>
            endpoint="/orgs/all"
            commentParam="shortTitle"
            onItemSelected={onChange}
            inputId={`common-obj-${field}`}
            isRequired={true}
          />
        );
      case "mteam":
        return (
          <SearchableInput<MaintenanceTeam>
            endpoint="/maintenance_teams/all"
            commentParam="orgShortTitle"
            onItemSelected={onChange}
            inputId={`common-obj-${field}`}
            isRequired={true}
          />
        );
      case "station":
      case "adminStation":
        return (
          <SearchableInput<FormDataStation>
            endpoint="/stations/all"
            onItemSelected={onChange}
            inputId={`common-obj-${field}`}
            searchAndShowParam="number"
            commentParam={(item) => item?.name?.title ?? "Без названия"}
          />
        );
      case "dateEntered":
      case "dateAdjusted":
        return (
          <input
            type="date"
            className="form-control"
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      case "number":
        return (
          <input
            type="number"
            className="form-control"
            value={value !== undefined && value !== null ? Number(value) : ""}
            onChange={(e) => onChange(parseFloat(e.target.value) || null)}
            placeholder="0"
            required={true}
          />
        );
      case "projectDoc":
      case "commissionDoc":
      case "adminDoc":
        return (
          <SearchableInput<Document>
            endpoint={`/documents/${field === "projectDoc" ? "project" : field === "commissionDoc" ? "comission" : "admin"}`}
            onItemSelected={onChange}
            inputId={`common-obj-${field}`}
          />
        );
      default:
        return (
          <input
            type="text"
            className="form-control"
            value={
              typeof value === "string" || typeof value === "number"
                ? value
                : ""
            }
            onChange={(e) => onChange(e.target.value)}
          />
        );
    }
  };

  return (
    <div className="card mb-4 border-warning shadow-sm">
      <div className="card-header bg-warning text-dark fw-bold d-flex align-items-center gap-2">
        <i className="bi bi-ui-checks"></i> Общие поля объектов ОС
      </div>
      <div className="card-body">
        <p className="text-muted small mb-3">
          Выберите поля, которые будут идентичными для всех создаваемых объектов
          ОС:
        </p>

        <div className="row g-2">
          {COMMON_FIELD_OPTIONS.map((option) => (
            <div key={option.key} className="col-md-4 col-lg-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`common-obj-${option.key}-check`}
                  checked={commonFields.includes(option.key)}
                  onChange={() => onToggleField(option.key)}
                />
                <label
                  className="form-check-label user-select-none"
                  htmlFor={`common-obj-${option.key}-check`}
                >
                  {option.label}
                </label>
              </div>
            </div>
          ))}
        </div>

        {commonFields.length > 0 && (
          <div className="mt-4 pt-3 border-top">
            <h6 className="fw-semibold mb-3">Значения общих полей:</h6>
            <div className="row g-3">
              {commonFields.map((fieldKey) => {
                const option = COMMON_FIELD_OPTIONS.find(
                  (o) => o.key === fieldKey,
                );
                if (!option) return null;
                return (
                  <div key={fieldKey} className="col-md-4">
                    <label className="form-label small fw-medium text-muted">
                      {option.label}
                    </label>
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

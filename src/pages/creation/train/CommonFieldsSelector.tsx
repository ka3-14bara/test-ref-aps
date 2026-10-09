import React from "react";
import SearchableInput from "../../../components/common/SearchableInput";
import {
  Organization,
  MaintenanceTeam,
  Document,
  FormDataStation,
  FormDataTrain,
} from "../../../types/creation";

interface CommonFieldOption {
  key: keyof FormDataTrain | "stationNumberValue";
  label: string;
}

const COMMON_FIELD_OPTIONS: CommonFieldOption[] = [
  { key: "stationNumberValue", label: "Номер станции" },
  { key: "org", label: "Организация" },
  { key: "mteam", label: "Обслуживающая бригада" },
  { key: "number", label: "Номер шлейфа" },
  { key: "length", label: "Длина шлейфа" },
  { key: "coordinates", label: "Координаты установки" },
  { key: "sectionNumber", label: "Номер раздела" },
  { key: "dateEntered", label: "Дата ввода в эксплуатацию" },
  { key: "dateAdjusted", label: "Дата корректировки" },
  { key: "projectDoc", label: "Проектная документация" },
  { key: "commissionDoc", label: "Акт ввода в эксплуатацию" },
  { key: "adminDoc", label: "Исполнительная документация" },
];

interface CommonFieldsSelectorProps {
  commonFields: string[];
  commonFieldValues: Record<string, any>;
  onToggleField: (field: string) => void;
  onValueChange: (field: string, value: any) => void;
}

export const CommonFieldsSelector: React.FC<CommonFieldsSelectorProps> = ({
  commonFields,
  commonFieldValues,
  onToggleField,
  onValueChange,
}) => {
  const handleCheckboxChange = (field: string) => {
    onToggleField(field);
  };

  const renderFieldInput = (field: string) => {
    const value = commonFieldValues[field];
    const onChange = (val: any) => onValueChange(field, val);

    switch (field) {
      case "org":
        return (
          <SearchableInput<Organization>
            endpoint="/orgs/all"
            commentParam="shortTitle"
            onItemSelected={onChange}
            inputId={`common-train-${field}`}
            isRequired={true}
          />
        );
      case "mteam":
        return (
          <SearchableInput<MaintenanceTeam>
            endpoint="/maintenance_teams/all"
            commentParam="orgShortTitle"
            onItemSelected={onChange}
            inputId={`common-train-${field}`}
            isRequired={true}
          />
        );
      case "stationNumberValue":
        return (
          <SearchableInput<FormDataStation>
            endpoint="/stations/all"
            onItemSelected={(item) => {
              onChange(item?.number?.toString() ?? "");
              onValueChange("stationNameValue", item?.name?.title ?? "");
              onValueChange("stationId", item?.id ?? null);
            }}
            inputId={`common-train-${field}`}
            searchAndShowParam="number"
            commentParam={(item) => item?.name?.title ?? "Без названия"}
            isRequired={true}
          />
        );
      case "dateEntered":
      case "dateAdjusted":
        return (
          <input
            type="date"
            className="form-control"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      case "sectionNumber":
      case "length":
        return (
          <input
            type="number"
            className="form-control"
            value={value ?? ""}
            onChange={(e) => onChange(parseInt(e.target.value, 10) || null)}
            placeholder="0"
          />
        );
      case "number":
        return (
          <input
            type="text"
            className="form-control"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value || null)}
            placeholder="0.000"
            required={true}
          />
        );
      case "adminDoc":
        return (
          <SearchableInput<Document>
            endpoint="/documents/admin"
            onItemSelected={onChange}
            inputId={`common-train-${field}`}
          />
        );
      case "commissionDoc":
        return (
          <SearchableInput<Document>
            endpoint="/documents/comission"
            onItemSelected={onChange}
            inputId={`common-train-${field}`}
          />
        );
      case "projectDoc":
        return (
          <SearchableInput<Document>
            endpoint="/documents/project"
            onItemSelected={onChange}
            inputId={`common-train-${field}`}
          />
        );
      default:
        return (
          <input
            type="text"
            className="form-control"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        );
    }
  };

  return (
    <div className="card mb-4 border-warning shadow-sm">
      <div className="card-header bg-warning text-dark fw-bold d-flex align-items-center gap-2">
        <i className="bi bi-ui-checks"></i> Общие поля для массового создания
      </div>
      <div className="card-body">
        <p className="text-muted small mb-3">
          Отметьте поля, значения которых будут автоматически скопированы во все
          создаваемые шлейфы:
        </p>

        <div className="row g-2">
          {COMMON_FIELD_OPTIONS.map((option) => (
            <div key={option.key} className="col-md-4 col-lg-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`common-train-${option.key}-check`}
                  checked={commonFields.includes(option.key)}
                  onChange={() => handleCheckboxChange(option.key)}
                />
                <label
                  className="form-check-label user-select-none"
                  htmlFor={`common-train-${option.key}-check`}
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

export default CommonFieldsSelector;

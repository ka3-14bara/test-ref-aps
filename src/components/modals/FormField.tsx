import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "../../types/table";
import SearchableInput from "../common/SearchableInput";
import {
  searchableConfigs,
  SearchableType,
  DATE,
  DETECTORS,
  INT_INPUTS,
  FLOAT_INPUTS,
} from "../../utils/searchableConfig";

interface FormFieldProps {
  header: Header;
  value: any;
  valueFrom?: any;
  valueTo?: any;
  itemValue?: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onIntChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFloatChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchableChange: <K extends keyof typeof searchableConfigs>(
    key: K,
    item: SearchableType<K>,
  ) => void;
}

export const FormField: React.FC<FormFieldProps> = ({
  header,
  value,
  valueFrom = "",
  valueTo = "",
  itemValue,
  onChange,
  onIntChange,
  onFloatChange,
  onSearchableChange,
}) => {
  const location = useLocation();
  const path = location.pathname;

  const rootKey = header.key.split(".")[0];
  const cleanKey = rootKey as keyof typeof searchableConfigs;

  const isCheckbox = typeof value === "boolean";
  const isDate = DATE.includes(header.key as any);
  const isDetector = DETECTORS.includes(rootKey as any);
  const isWorkType =
    rootKey === "workTypesValue" || rootKey === "stationTypesValue";
  const isFloat =
    FLOAT_INPUTS.includes(rootKey as any) ||
    (rootKey === "number" && path === "/subjects");
  const isInteger =
    INT_INPUTS.includes(rootKey as any) ||
    (rootKey === "number" && path === "/stations");
  const isSearchable =
    (cleanKey === "name" &&
      path === "/stations" &&
      cleanKey in searchableConfigs) ||
    (cleanKey !== "name" && cleanKey in searchableConfigs);
  const isDropdown =
    (rootKey === "typeDisplayValue" && path === "/stations") ||
    (rootKey === "documentType" && path === "/documents");
  const isSkip =
    rootKey === "documentTypeDisplayValue" && path === "/documents";
  const isNumbering = rootKey === "objectsNumbers" && path === "/stations";
  const isTrainLaboriousness =
    rootKey === "laboriousness" || rootKey === "trainLaboriousness";

  if (
    isDetector ||
    isWorkType ||
    isDropdown ||
    isTrainLaboriousness ||
    isSkip
  ) {
    return null;
  }

  const showAfterReload = useMemo(() => {
    if (!isSearchable || !itemValue) return "";
    const config = searchableConfigs[cleanKey];
    if (typeof itemValue === "object") {
      return itemValue[config.searchAndShowParam]?.toString() ?? "";
    }
    return String(itemValue);
  }, [isSearchable, cleanKey, itemValue]);

  if (isCheckbox) {
    return (
      <div className="form-check mb-3">
        <input
          type="checkbox"
          className="form-check-input"
          name={header.key}
          id={header.key}
          checked={Boolean(value)}
          onChange={onChange}
        />
        <label
          className="form-check-label user-select-none"
          htmlFor={header.key}
        >
          {header.label}
        </label>
      </div>
    );
  }

  if (isDate) {
    return (
      <div className="mb-3">
        <label htmlFor={header.key} className="form-label">
          {header.label}
        </label>
        <input
          type="date"
          className="form-control"
          name={header.key}
          id={header.key}
          value={value ? String(value) : ""}
          onChange={onChange}
          max="2099-12-31"
        />
      </div>
    );
  }

  if (isSearchable) {
    const config = searchableConfigs[cleanKey];
    return (
      <div className="mb-3">
        <label htmlFor={header.key} className="form-label">
          {header.label}
        </label>
        <SearchableInput
          endpoint={config.endpoint}
          onItemSelected={(item) => onSearchableChange(cleanKey, item)}
          inputId={header.key}
          searchAndShowParam={config.searchAndShowParam}
          commentParam={config.commentParam}
          showAfterReload={showAfterReload}
        />
      </div>
    );
  }

  if (isNumbering) {
    return (
      <div className="mb-3">
        <label className="form-label">{header.label}</label>
        <div className="input-group">
          <span className="input-group-text">От:</span>
          <input
            type="number"
            className="form-control"
            name="objectsNumberFrom"
            value={valueFrom}
            onChange={onIntChange}
            placeholder="0"
          />
          <span className="input-group-text">До:</span>
          <input
            type="number"
            className="form-control"
            name="objectsNumberTo"
            value={valueTo}
            onChange={onIntChange}
            placeholder="0"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-3">
      <label htmlFor={header.key} className="form-label">
        {header.label}
      </label>
      <input
        type={isInteger || isFloat ? "number" : "text"}
        step={isFloat ? "0.01" : undefined}
        className="form-control"
        id={header.key}
        name={header.key}
        value={value ?? ""}
        onChange={isInteger ? onIntChange : isFloat ? onFloatChange : onChange}
        placeholder={header.label}
      />
    </div>
  );
};

export default FormField;

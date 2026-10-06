import React, { useMemo } from "react";
import { Header } from "../Types";
import SearchableInput from "../SearchableInput";
import {
  searchableConfigs,
  SearchableType,
  DATE,
  DETECTORS,
  INT_INPUTS,
  FLOAT_INPUTS,
} from "../../utils/searchableConfig";
import { useLocation } from "react-router-dom";

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

const FormField: React.FC<FormFieldProps> = ({
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

  // Тип поля
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
  const isSkip = rootKey === "documentTypeDisplayValue" && path === "/documents"
  const isNumbering = rootKey === "objectsNumbers" && path === "/stations";
  const isTrainLaboriousness =
    rootKey === "laboriousness" || rootKey === "trainLaboriousness";

  // Ранний выход для полей, которые рендерятся в отдельных секциях
  if (isDetector || isWorkType || isDropdown || isTrainLaboriousness) {
    return null;
  }

  // Подготовка значения для SearchableInput (мемоизация, чтобы не менялась ссылка без нужды)
  const showAfterReload = useMemo(() => {
    if (!isSearchable || !itemValue) return "";
    const config = searchableConfigs[cleanKey];
    if (typeof itemValue === "object")
      return itemValue[config.searchAndShowParam]?.toString() ?? "";
    return itemValue;
  }, [isSearchable, cleanKey, itemValue]);

  if (isCheckbox) {
    return (
      <div className="form-group" key={header.key}>
        <label htmlFor={header.key}>{header.label}</label>
        <input
          type="checkbox"
          name={header.key}
          id={header.key}
          checked={!!value}
          onChange={onChange}
        />
      </div>
    );
  }

  if (isSkip) {
    return (<></>)
  }

  if (isDate) {
    return (
      <div className="form-group" key={header.key}>
        <label htmlFor={header.key}>{header.label}</label>
        <input
        type="date"
        name={header.key}
        id={header.key}
        value={value?.toString() || ""}
        onChange={onChange}
        className="form-control"
        max="2099-12-31"
      />
      </div>
    );
  }

  if (isSearchable) {
    const config = searchableConfigs[cleanKey];
    const searchParam = config.searchAndShowParam;
    const commentParam = config.commentParam;

    return (
      <div className="form-group" key={header.key}>
        <label htmlFor={header.key}>{header.label}</label>
        <SearchableInput
          endpoint={config.endpoint}
          onItemSelected={(item) => onSearchableChange(cleanKey, item as any)}
          inputId={header.key}
          searchAndShowParam={searchParam}
          commentParam={commentParam}
          style={{ height: "38px" }}
          isRequired={false}
          showAfterReload={showAfterReload}
        />
      </div>
    );
  }

  if (isInteger) {
    return (
      <div className="form-group" key={header.key}>
        <label htmlFor={header.key}>{header.label}</label>
        <input
          type="number"
          min="0"
          step="1"
          name={header.key}
          id={header.key}
          value={value?.toString() || ""}
          onChange={onIntChange}
          autoComplete="off"
          className="form-control"
          placeholder="0"
        />
      </div>
    );
  }

  if (isNumbering) {
    return (
      <div className="form-group" key={header.key}>
        <label htmlFor={header.key}>{header.label}</label>
        <div
          className="gap-4"
          style={{ display: "flex", alignItems: "center" }}
        >
          <div
            className="d-flex flex-column flex-grow-1"
            style={{ width: "50%" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0px" }}>
              <input
                className="form-control p-2"
                id="trainFromLabel" // Исправлен ID, чтобы не дублировался
                style={{
                  height: "38px",
                  width: "38px",
                  fontSize: "0.875rem",
                }}
                disabled
                value={"От:"}
              />
              <input
                type="number"
                min="0"
                step="1"
                name="objectsNumberFrom"
                id="objectsNumberFrom"
                onChange={onIntChange}
                autoComplete="off"
                value={valueFrom} // <-- Привязываем значение "От"
                className="form-control"
                placeholder="0"
              />
            </div>
          </div>
          <div
            className="d-flex flex-column flex-grow-1"
            style={{ width: "50%" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0px" }}>
              <input
                className="form-control p-2"
                id="trainToLabel" // Исправлен ID
                style={{
                  height: "38px",
                  width: "38px",
                  fontSize: "0.875rem",
                }}
                disabled
                value={"До:"}
              />
              <input
                type="number"
                min="0"
                step="1"
                name="objectsNumberTo"
                id="objectsNumberTo"
                onChange={onIntChange}
                autoComplete="off"
                value={valueTo} // <-- Привязываем значение "До"
                className="form-control"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isFloat) {
    return (
      <div className="form-group" key={header.key}>
        <label htmlFor={header.key}>{header.label}</label>
        <input
          type="number"
          min="0"
          step="0.01"
          name={header.key}
          id={header.key}
          value={value?.toString() || ""}
          onChange={onFloatChange}
          autoComplete="off"
          className="form-control"
          placeholder="0.000"
        />
      </div>
    );
  }

  // Обычный текст
  return (
    <div className="form-group" key={header.key}>
      <label htmlFor={header.key}>{header.label}</label>
      <input
        type="text"
        name={header.key}
        id={header.key}
        value={value?.toString() || ""}
        onChange={onChange}
        autoComplete="off"
        className="form-control"
        placeholder={header.label}
      />
    </div>
  );
};

export default React.memo(FormField);

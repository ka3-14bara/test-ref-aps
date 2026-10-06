// MassCreationFormItem.tsx
import React from "react";
import SearchableInput from "../../../modules/SearchableInput";
//import WorkTypesForm from "../../../modules/WorkTypesForm";
import {
  Organization,
  MaintenanceTeam,
  Document,
  DetectorItem,
  FormDataStation,
  //WorkTypes,
  SelectedDetector,
} from "../AddTypes";

interface MassCreationFormItemProps {
  form: any; // MassCreationForm
  index: number;
  commonFields: (keyof any)[];
  onUpdate: (updates: any) => void;
  onRemove: () => void;
  isRemovable: boolean;
}

const MassCreationFormItem: React.FC<MassCreationFormItemProps> = ({
  form,
  index,
  commonFields,
  onUpdate,
  onRemove,
  isRemovable,
}) => {
  const isDisabled = form.status === "success";

  const handleFieldChange = (field: string, value: any) => {
    if (isDisabled) return;
    onUpdate({
      formData: { ...form.formData, [field]: value },
    });
  };

  const handleHiddenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (isDisabled) return;
    onUpdate({
      formData: { ...form.formData, hidden: e.target.value === "true" },
    });
  };

  const handleDetectorAdd = () => {
    const newDetector: SelectedDetector = {
      rowId: Date.now() + Math.random() * 10000,
      detector: null,
      quantity: 1,
    };
    onUpdate({
      selectedDetectors: [...form.selectedDetectors, newDetector],
    });
  };

  const handleDetectorUpdate = (
    rowId: number,
    updates: Partial<SelectedDetector>,
  ) => {
    const updated = form.selectedDetectors.map((d: SelectedDetector) =>
      d.rowId === rowId ? { ...d, ...updates } : d,
    );
    onUpdate({ selectedDetectors: updated });
  };

  const handleDetectorRemove = (rowId: number) => {
    const updated = form.selectedDetectors.filter(
      (d: SelectedDetector) => d.rowId !== rowId,
    );
    onUpdate({ selectedDetectors: updated });
  };

  /* const handleWorkTypesChange = (data: WorkTypes[]) => {
    onUpdate({ resultData: data });
    onUpdate({
      formData: { ...form.formData, workTypes: data },
    });
  }; */

  const isCommonField = (field: keyof any) => commonFields.includes(field);

  return (
    <div
      className={`card mb-4 ${
        form.status === "error"
          ? "border-danger"
          : form.status === "success"
            ? "border-success"
            : "border-secondary"
      }`}
    >
      <div
        className={`card-header d-flex justify-content-between align-items-center ${
          form.status === "success"
            ? "bg-success text-white"
            : form.status === "error"
              ? "bg-danger text-white"
              : "bg-secondary text-white"
        }`}
      >
        <span>📝 Шлейф #{index + 1}</span>
        <div className="d-flex gap-2">
          {form.status === "success" && (
            <span className="badge bg-light text-dark">✓ Создан</span>
          )}
          {form.status === "error" && (
            <span className="badge bg-light text-dark">✗ Ошибка</span>
          )}
          {form.status === "submitting" && (
            <span className="badge bg-light text-dark">⏳ Отправка...</span>
          )}
          {isRemovable && !isDisabled && (
            <button
              type="button"
              className="btn btn-sm btn-outline-light"
              onClick={onRemove}
            >
              ✕
            </button>
          )}
        </div>
      </div>
      <div className="card-body">
        {form.errorMessage && (
          <div className="alert alert-danger mb-3">{form.errorMessage}</div>
        )}

        <div className="row g-3">
          <div className="col-md-4">
            <label htmlFor={`stationNumber-${form.id}`} className="form-label">
              Номер станции
            </label>
            <SearchableInput<FormDataStation>
              endpoint="/stations/all"
              onItemSelected={(e) => {
                const stationName = e?.name?.title ?? "";
                const stationNumber = e?.number ?? "";
                const stationId = e?.id ?? null;
                handleFieldChange(
                  "stationNumberValue",
                  stationNumber.toString(),
                );
                handleFieldChange("stationNameValue", stationName);
                handleFieldChange("stationId", stationId);
              }}
              inputId={`stationNumber-${form.id}`}
              style={{ height: "50px" }}
              searchAndShowParam="number"
              commentParam={(item) => item?.name?.title ?? "Нет комментария"}
              isRequired={!isDisabled || !isCommonField("stationNumberValue")}
              isDisabled={isDisabled || isCommonField("stationNumberValue")}
              showAfterReload={form.formData.stationNumberValue ?? ""}
            />
          </div>

          <div className="col-md-4">
            <label htmlFor={`organization-${form.id}`} className="form-label">
              Организация или подразделение
            </label>
            <SearchableInput<Organization>
              endpoint="/orgs/all"
              commentParam="shortTitle"
              onItemSelected={(item) => handleFieldChange("org", item)}
              inputId={`organization-${form.id}`}
              style={{ height: "50px" }}
              isRequired={!isDisabled || !isCommonField("org")}
              isDisabled={isDisabled || isCommonField("org")}
              showAfterReload={form.formData.org?.title ?? ""}
            />
          </div>

          <div className="col-md-4">
            <label
              htmlFor={`maintenanceTeams-${form.id}`}
              className="form-label"
            >
              Обслуживающая бригада
            </label>
            <SearchableInput<MaintenanceTeam>
              endpoint="/maintenance_teams/all"
              commentParam="orgShortTitle"
              onItemSelected={(item) => handleFieldChange("mteam", item)}
              inputId={`maintenanceTeams-${form.id}`}
              style={{ height: "50px" }}
              isRequired={!isDisabled || !isCommonField("mteam")}
              isDisabled={isDisabled || isCommonField("mteam")}
              showAfterReload={form.formData.mteam?.title ?? ""}
            />
          </div>
        </div>

        <div className="row g-3 mt-1">
          <div className="col-md-4">
            <label htmlFor={`number-${form.id}`} className="form-label">
              Номер шлейфа <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id={`number-${form.id}`}
              className={`form-control ${form.formData.number ? "" : "is-invalid"}`}
              required
              value={form.formData.number ?? ""}
              onChange={(e) => {
                const value = e.target.value === "" ? null : e.target.value;
                handleFieldChange("number", value);
              }}
              placeholder="0"
              style={{ height: "50px" }}
              disabled={isDisabled || isCommonField("number")}
            />
          </div>
          <div className="col-md-4">
            <label htmlFor={`length-${form.id}`} className="form-label">
              Длина шлейфа
            </label>
            <input
              type="number"
              min="0"
              step="1"
              id={`length-${form.id}`}
              className="form-control"
              value={form.formData.length ?? ""}
              onChange={(e) => {
                const value =
                  e.target.value === "" ? null : parseInt(e.target.value, 10);
                handleFieldChange("length", value);
              }}
              autoComplete="off"
              placeholder="0"
              style={{ height: "50px" }}
              disabled={isDisabled || isCommonField("length")}
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="hidden" className="form-label">
              Под потолком
            </label>
            <select
              id="hidden"
              className="form-select"
              onChange={handleHiddenChange}
              value={String(form.formData.hidden)}
              style={{ height: "50px" }}
            >
              <option value="false">Нет</option>
              <option value="true">Да</option>
            </select>
          </div>
        </div>

        <div className="row g-3 mt-1">
          <div className="col-md-6" style={{ width: "50%" }}>
            <label htmlFor={`location-${form.id}`} className="form-label">
              Место установки
            </label>
            <input
              type="text"
              id={`location-${form.id}`}
              className="form-control"
              value={form.formData.location ?? ""}
              onChange={(e) => handleFieldChange("location", e.target.value)}
              autoComplete="off"
              placeholder="Место установки"
              style={{ height: "50px" }}
              disabled={isDisabled || isCommonField("location")}
            />
          </div>

          <div className="col-md-6" style={{ width: "50%" }}>
            <label htmlFor={`coordinates-${form.id}`} className="form-label">
              Координаты установки
            </label>
            <input
              type="text"
              id={`coordinates-${form.id}`}
              className="form-control"
              value={form.formData.coordinates ?? ""}
              onChange={(e) => handleFieldChange("coordinates", e.target.value)}
              autoComplete="off"
              placeholder="Координаты установки"
              style={{ height: "50px" }}
              disabled={isDisabled || isCommonField("coordinates")}
            />
          </div>
        </div>

        <div className="row g-3 mt-1">
          <div className="col-md-4">
            <label htmlFor={`sectionNumber-${form.id}`} className="form-label">
              Номер раздела
            </label>
            <input
              type="number"
              min="1"
              step="1"
              id={`sectionNumber-${form.id}`}
              className="form-control"
              value={form.formData.sectionNumber ?? ""}
              onChange={(e) => {
                const value =
                  e.target.value === "" ? null : parseInt(e.target.value, 10);
                handleFieldChange("sectionNumber", value);
              }}
              autoComplete="off"
              placeholder="0"
              style={{ height: "50px" }}
              disabled={isDisabled || isCommonField("sectionNumber")}
            />
          </div>
          <div className="col-md-4">
            <label htmlFor={`dateEntered-${form.id}`} className="form-label">
              Дата ввода в эксплуатацию
            </label>
            <input
              type="date"
              id={`dateEntered-${form.id}`}
              className="form-control"
              value={form.formData.dateEntered ?? ""}
              onChange={(e) => handleFieldChange("dateEntered", e.target.value)}
              style={{ height: "50px" }}
              disabled={isDisabled || isCommonField("dateEntered")}
            />
          </div>
          <div className="col-md-4">
            <label htmlFor={`dateAdjusted-${form.id}`} className="form-label">
              Дата корректировки
            </label>
            <input
              type="date"
              id={`dateAdjusted-${form.id}`}
              className="form-control"
              value={form.formData.dateAdjusted ?? ""}
              onChange={(e) =>
                handleFieldChange("dateAdjusted", e.target.value)
              }
              style={{ height: "50px" }}
              disabled={isDisabled || isCommonField("dateAdjusted")}
            />
          </div>
        </div>

        {/* Датчики */}
        <div className="mt-3">
          <div className="d-flex align-items-center mb-2">
            <label className="form-label mb-0">Датчики</label>
            <button
              type="button"
              className="btn btn-sm btn-outline-success mx-1"
              onClick={handleDetectorAdd}
              disabled={isDisabled}
            >
              + Добавить
            </button>
          </div>
          {form.selectedDetectors.map(
            (item: SelectedDetector, detIndex: number) => (
              <div key={item.rowId} className="row mb-2 align-items-end gx-2">
                <div className="col-md-8">
                  <label
                    htmlFor={`detector-${form.id}-${item.rowId}`}
                    className="form-label small"
                  >
                    Датчик #{detIndex + 1}
                  </label>
                  <SearchableInput<DetectorItem>
                    endpoint="/detectors/all"
                    onItemSelected={(data) =>
                      handleDetectorUpdate(item.rowId, { detector: data })
                    }
                    inputId={`detector-${form.id}-${item.rowId}`}
                    style={{ height: "40px" }}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label small">Количество</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={item.quantity === 0 ? "" : item.quantity}
                    onChange={(e) => {
                      const qty = parseInt(e.target.value) || 0;
                      handleDetectorUpdate(item.rowId, { quantity: qty });
                    }}
                    style={{ height: "40px" }}
                    disabled={isDisabled}
                  />
                </div>
                <div className="col-md-1">
                  <button
                    type="button"
                    className="btn btn-danger"
                    style={{ height: "40px" }}
                    onClick={() => handleDetectorRemove(item.rowId)}
                    disabled={isDisabled}
                  >
                    ×
                  </button>
                </div>
              </div>
            ),
          )}
        </div>

        {/* Типы работ */}
        <div className="mt-3">
          {/*  <WorkTypesForm onChange={handleWorkTypesChange} searchType="Шлейф" /> */}
        </div>

        <div className="row g-3 mt-1">
          <div className="col-md-4">
            <label htmlFor={`projectDoc-${form.id}`} className="form-label">
              Проектная документация
            </label>
            <SearchableInput
              endpoint="/documents/project"
              onItemSelected={(e: Document) =>
                handleFieldChange("projectDoc", e)
              }
              inputId={`projectDoc-${form.id}`}
              style={{ height: "50px" }}
              isDisabled={isDisabled || isCommonField("projectDoc")}
              showAfterReload={form.formData.projectDoc?.title ?? ""}
            />
          </div>
          <div className="col-md-4">
            <label htmlFor={`comissionAct-${form.id}`} className="form-label">
              Акт ввода в эксплуатацию
            </label>
            <SearchableInput
              endpoint="/documents/comission"
              onItemSelected={(e: Document) =>
                handleFieldChange("commissionDoc", e)
              }
              inputId={`comissionAct-${form.id}`}
              style={{ height: "50px" }}
              isDisabled={isDisabled || isCommonField("commissionDoc")}
              showAfterReload={form.formData.commissionDoc?.title ?? ""}
            />
          </div>
          <div className="col-md-4">
            <label htmlFor={`executiveDoc-${form.id}`} className="form-label">
              Исполнительная документация
            </label>
            <SearchableInput
              endpoint="/documents/admin"
              onItemSelected={(e: Document) => handleFieldChange("adminDoc", e)}
              inputId={`executiveDoc-${form.id}`}
              style={{ height: "50px" }}
              isDisabled={isDisabled || isCommonField("adminDoc")}
              showAfterReload={form.formData.adminDoc?.title ?? ""}
            />
          </div>
        </div>

        <div className="mt-3">
          <label htmlFor={`comment-${form.id}`} className="form-label">
            Комментарий
          </label>
          <textarea
            id={`comment-${form.id}`}
            className="form-control"
            rows={2}
            value={form.formData.comment ?? ""}
            onChange={(e) => handleFieldChange("comment", e.target.value)}
            autoComplete="off"
            placeholder="Комментарий"
            disabled={isDisabled}
          />
        </div>
      </div>
    </div>
  );
};

export default MassCreationFormItem;

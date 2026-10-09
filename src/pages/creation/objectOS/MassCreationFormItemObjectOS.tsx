import React from "react";
import SearchableInput from "../../../components/common/SearchableInput";
import {
  Organization,
  MaintenanceTeam,
  Document,
  DetectorItem,
  FormDataStation,
  SelectedDetector,
  FormDataObjectOS,
  MassCreationForm,
} from "../../../types/creation";

interface MassCreationFormItemObjectOSProps {
  form: MassCreationForm<FormDataObjectOS>;
  index: number;
  commonFields: (keyof FormDataObjectOS)[];
  onUpdate: (updates: Partial<MassCreationForm<FormDataObjectOS>>) => void;
  onRemove: () => void;
  isRemovable: boolean;
}

export const MassCreationFormItemObjectOS: React.FC<
  MassCreationFormItemObjectOSProps
> = ({ form, index, commonFields, onUpdate, onRemove, isRemovable }) => {
  const isDisabled = form.status === "success";

  const handleFieldChange = (field: keyof FormDataObjectOS, value: any) => {
    if (isDisabled) return;
    onUpdate({
      formData: { ...form.formData, [field]: value },
    });
  };

  const handleDetectorAdd = () => {
    const newDetector: SelectedDetector = {
      rowId: Date.now() + Math.random(),
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
    const updated = form.selectedDetectors.map((d) =>
      d.rowId === rowId ? { ...d, ...updates } : d,
    );
    onUpdate({ selectedDetectors: updated });
  };

  const handleDetectorRemove = (rowId: number) => {
    const updated = form.selectedDetectors.filter((d) => d.rowId !== rowId);
    onUpdate({ selectedDetectors: updated });
  };

  const isCommon = (field: keyof FormDataObjectOS) =>
    commonFields.includes(field);

  return (
    <div
      className={`card mb-3 shadow-sm ${
        form.status === "error"
          ? "border-danger"
          : form.status === "success"
            ? "border-success"
            : "border-secondary"
      }`}
    >
      <div
        className={`card-header d-flex justify-content-between align-items-center py-2 ${
          form.status === "success"
            ? "bg-success text-white"
            : form.status === "error"
              ? "bg-danger text-white"
              : "bg-light text-dark"
        }`}
      >
        <span className="fw-semibold">
          <i className="bi bi-building me-2"></i> Объект ОС #{index + 1}
        </span>
        <div className="d-flex align-items-center gap-2">
          {form.status === "success" && (
            <span className="badge bg-white text-success">✓ Создан</span>
          )}
          {form.status === "error" && (
            <span className="badge bg-white text-danger">✗ Ошибка</span>
          )}
          {form.status === "submitting" && (
            <span className="badge bg-warning text-dark">
              <span className="spinner-border spinner-border-sm me-1"></span>{" "}
              Отправка...
            </span>
          )}
          {isRemovable && !isDisabled && (
            <button
              type="button"
              className="btn btn-outline-danger btn-sm py-0 px-2"
              onClick={onRemove}
              title="Удалить карточку"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>
      </div>

      <div className="card-body">
        {form.errorMessage && (
          <div className="alert alert-danger py-2">{form.errorMessage}</div>
        )}

        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label fw-medium small">
              Номер объекта <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              className={`form-control ${form.formData.number == null ? "is-invalid" : ""}`}
              value={form.formData.number ?? ""}
              onChange={(e) =>
                handleFieldChange(
                  "number",
                  e.target.value === "" ? null : parseFloat(e.target.value),
                )
              }
              disabled={isDisabled || isCommon("number")}
              placeholder="000.00"
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-medium small">
              Наименование объекта <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${!form.formData.name ? "is-invalid" : ""}`}
              value={form.formData.name ?? ""}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              disabled={isDisabled || isCommon("name")}
              placeholder="Наименование"
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-medium small">Организация</label>
            <SearchableInput<Organization>
              endpoint="/orgs/all"
              commentParam="shortTitle"
              onItemSelected={(item) => handleFieldChange("org", item)}
              inputId={`obj-mass-org-${form.id}`}
              isDisabled={isDisabled || isCommon("org")}
              showAfterReload={form.formData.org?.title ?? ""}
              isRequired={true}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-medium small">
              Обслуживающая бригада
            </label>
            <SearchableInput<MaintenanceTeam>
              endpoint="/maintenance_teams/all"
              commentParam="orgShortTitle"
              onItemSelected={(item) => handleFieldChange("mteam", item)}
              inputId={`obj-mass-mteam-${form.id}`}
              isDisabled={isDisabled || isCommon("mteam")}
              showAfterReload={form.formData.mteam?.title ?? ""}
              isRequired={true}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-medium small">
              Номер прибора на объекте
            </label>
            <SearchableInput<FormDataStation>
              endpoint="/stations/all"
              onItemSelected={(item) => handleFieldChange("station", item)}
              inputId={`obj-mass-station-${form.id}`}
              searchAndShowParam="number"
              commentParam={(item) => item?.name?.title ?? ""}
              isDisabled={isDisabled || isCommon("station")}
              showAfterReload={form.formData.station?.number?.toString() ?? ""}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-medium small">Номер станции</label>
            <SearchableInput<FormDataStation>
              endpoint="/stations/all"
              onItemSelected={(item) => handleFieldChange("adminStation", item)}
              inputId={`obj-mass-admin-station-${form.id}`}
              searchAndShowParam="number"
              commentParam={(item) => item?.name?.title ?? ""}
              isDisabled={isDisabled || isCommon("adminStation")}
              showAfterReload={
                form.formData.adminStation?.number?.toString() ?? ""
              }
            />
          </div>

          <div className="col-md-4">
            <label className="form-label fw-medium small">Телефон</label>
            <input
              type="text"
              className="form-control"
              value={form.formData.phone ?? ""}
              onChange={(e) => handleFieldChange("phone", e.target.value)}
              disabled={isDisabled || isCommon("phone")}
              placeholder="Телефон"
            />
          </div>

          <div className="col-md-4">
            <label className="form-label fw-medium small">Координаты</label>
            <input
              type="text"
              className="form-control"
              value={form.formData.coordinates ?? ""}
              onChange={(e) => handleFieldChange("coordinates", e.target.value)}
              disabled={isDisabled || isCommon("coordinates")}
              placeholder="Координаты"
            />
          </div>

          <div className="col-md-4">
            <label className="form-label fw-medium small">Дата ввода</label>
            <input
              type="date"
              className="form-control"
              value={form.formData.dateEntered ?? ""}
              onChange={(e) => handleFieldChange("dateEntered", e.target.value)}
              disabled={isDisabled || isCommon("dateEntered")}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label fw-medium small">
              Дата корректировки
            </label>
            <input
              type="date"
              className="form-control"
              value={form.formData.dateAdjusted ?? ""}
              onChange={(e) =>
                handleFieldChange("dateAdjusted", e.target.value)
              }
              disabled={isDisabled || isCommon("dateAdjusted")}
            />
          </div>
        </div>

        {/* Датчики */}
        <div className="border rounded p-3 my-3 bg-light">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-semibold small">Датчики объекта</span>
            <button
              type="button"
              className="btn btn-outline-success btn-sm"
              onClick={handleDetectorAdd}
              disabled={isDisabled}
            >
              <i className="bi bi-plus-lg me-1"></i> Добавить датчик
            </button>
          </div>

          {form.selectedDetectors.map((item, detIdx) => (
            <div key={item.rowId} className="row g-2 align-items-end mb-2">
              <div className="col-md-7">
                <label className="form-label small text-muted mb-0">
                  Датчик #{detIdx + 1}
                </label>
                <SearchableInput<DetectorItem>
                  endpoint="/detectors/all"
                  onItemSelected={(data) =>
                    handleDetectorUpdate(item.rowId, { detector: data })
                  }
                  inputId={`obj-mass-det-${form.id}-${item.rowId}`}
                  isDisabled={isDisabled}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small text-muted mb-0">
                  Количество
                </label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  value={item.quantity === 0 ? "" : item.quantity}
                  onChange={(e) =>
                    handleDetectorUpdate(item.rowId, {
                      quantity: parseInt(e.target.value, 10) || 1,
                    })
                  }
                  disabled={isDisabled}
                />
              </div>
              <div className="col-md-2">
                <button
                  type="button"
                  className="btn btn-outline-danger w-100"
                  onClick={() => handleDetectorRemove(item.rowId)}
                  disabled={isDisabled}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Документы */}
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label small fw-medium">
              Проектная документация
            </label>
            <SearchableInput<Document>
              endpoint="/documents/project"
              onItemSelected={(item) => handleFieldChange("projectDoc", item)}
              inputId={`obj-mass-doc-proj-${form.id}`}
              isDisabled={isDisabled || isCommon("projectDoc")}
              showAfterReload={form.formData.projectDoc?.title ?? ""}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label small fw-medium">Акт ввода</label>
            <SearchableInput<Document>
              endpoint="/documents/comission"
              onItemSelected={(item) =>
                handleFieldChange("commissionDoc", item)
              }
              inputId={`obj-mass-doc-com-${form.id}`}
              isDisabled={isDisabled || isCommon("commissionDoc")}
              showAfterReload={form.formData.commissionDoc?.title ?? ""}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label small fw-medium">
              Исполнительная документация
            </label>
            <SearchableInput<Document>
              endpoint="/documents/admin"
              onItemSelected={(item) => handleFieldChange("adminDoc", item)}
              inputId={`obj-mass-doc-adm-${form.id}`}
              isDisabled={isDisabled || isCommon("adminDoc")}
              showAfterReload={form.formData.adminDoc?.title ?? ""}
            />
          </div>

          <div className="col-12">
            <label className="form-label small fw-medium">Комментарий</label>
            <textarea
              className="form-control"
              rows={2}
              value={form.formData.comment ?? ""}
              onChange={(e) => handleFieldChange("comment", e.target.value)}
              placeholder="Примечания..."
              disabled={isDisabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MassCreationFormItemObjectOS;

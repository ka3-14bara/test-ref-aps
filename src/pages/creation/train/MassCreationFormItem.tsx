import React from "react";
import SearchableInput from "../../../components/common/SearchableInput";
import {
  Organization,
  MaintenanceTeam,
  Document,
  DetectorItem,
  FormDataStation,
  SelectedDetector,
  FormDataTrain,
  MassCreationForm,
} from "../../../types/creation";

interface MassCreationFormItemProps {
  form: MassCreationForm<FormDataTrain>;
  index: number;
  commonFields: string[];
  onUpdate: (updates: Partial<MassCreationForm<FormDataTrain>>) => void;
  onRemove: () => void;
  isRemovable: boolean;
}

export const MassCreationFormItem: React.FC<MassCreationFormItemProps> = ({
  form,
  index,
  commonFields,
  onUpdate,
  onRemove,
  isRemovable,
}) => {
  const isDisabled = form.status === "success";

  const handleFieldChange = (field: keyof FormDataTrain, value: any) => {
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

  const isCommon = (field: string) => commonFields.includes(field);

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
          <i className="bi bi-card-text me-2"></i> Шлейф #{index + 1}
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
          <div className="col-md-4">
            <label className="form-label fw-medium small">Номер станции</label>
            <SearchableInput<FormDataStation>
              endpoint="/stations/all"
              onItemSelected={(stationItem) => {
                handleFieldChange(
                  "stationNumberValue",
                  stationItem?.number?.toString() ?? "",
                );
                handleFieldChange(
                  "stationNameValue",
                  stationItem?.name?.title ?? "",
                );
                handleFieldChange("stationId", stationItem?.id ?? null);
              }}
              inputId={`train-mass-station-${form.id}`}
              searchAndShowParam="number"
              commentParam={(item) => item?.name?.title ?? "Нет комментария"}
              isDisabled={isDisabled || isCommon("stationNumberValue")}
              showAfterReload={form.formData.stationNumberValue ?? ""}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label fw-medium small">Организация</label>
            <SearchableInput<Organization>
              endpoint="/orgs/all"
              commentParam="shortTitle"
              onItemSelected={(item) => handleFieldChange("org", item)}
              inputId={`train-mass-org-${form.id}`}
              isDisabled={isDisabled || isCommon("org")}
              showAfterReload={form.formData.org?.title ?? ""}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label fw-medium small">
              Обслуживающая бригада
            </label>
            <SearchableInput<MaintenanceTeam>
              endpoint="/maintenance_teams/all"
              commentParam="orgShortTitle"
              onItemSelected={(item) => handleFieldChange("mteam", item)}
              inputId={`train-mass-mteam-${form.id}`}
              isDisabled={isDisabled || isCommon("mteam")}
              showAfterReload={form.formData.mteam?.title ?? ""}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label fw-medium small">
              Номер шлейфа <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${!form.formData.number ? "is-invalid" : ""}`}
              value={form.formData.number ?? ""}
              onChange={(e) =>
                handleFieldChange("number", e.target.value || null)
              }
              disabled={isDisabled || isCommon("number")}
              placeholder="0"
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label fw-medium small">Длина шлейфа</label>
            <input
              type="number"
              min="0"
              className="form-control"
              value={form.formData.length ?? ""}
              onChange={(e) =>
                handleFieldChange(
                  "length",
                  parseInt(e.target.value, 10) || null,
                )
              }
              disabled={isDisabled || isCommon("length")}
              placeholder="0"
            />
          </div>

          <div className="col-md-4">
            <label className="form-label fw-medium small">Под потолком</label>
            <select
              className="form-select"
              value={String(form.formData.hidden)}
              onChange={(e) =>
                handleFieldChange("hidden", e.target.value === "true")
              }
              disabled={isDisabled}
            >
              <option value="false">Нет</option>
              <option value="true">Да</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label fw-medium small">
              Место установки
            </label>
            <input
              type="text"
              className="form-control"
              value={form.formData.location ?? ""}
              onChange={(e) => handleFieldChange("location", e.target.value)}
              disabled={isDisabled || isCommon("location")}
              placeholder="Место установки"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-medium small">
              Координаты установки
            </label>
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
            <label className="form-label fw-medium small">Номер раздела</label>
            <input
              type="number"
              className="form-control"
              value={form.formData.sectionNumber ?? ""}
              onChange={(e) =>
                handleFieldChange(
                  "sectionNumber",
                  parseInt(e.target.value, 10) || null,
                )
              }
              disabled={isDisabled || isCommon("sectionNumber")}
              placeholder="0"
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

        {/* Секция датчиков */}
        <div className="border rounded p-3 my-3 bg-light">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-semibold small">Датчики шлейфа</span>
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
                  inputId={`train-mass-det-${form.id}-${item.rowId}`}
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

        {/* Документация */}
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label small fw-medium">
              Проектная документация
            </label>
            <SearchableInput<Document>
              endpoint="/documents/project"
              onItemSelected={(doc) => handleFieldChange("projectDoc", doc)}
              inputId={`train-mass-doc-proj-${form.id}`}
              isDisabled={isDisabled || isCommon("projectDoc")}
              showAfterReload={form.formData.projectDoc?.title ?? ""}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-medium">Акт ввода</label>
            <SearchableInput<Document>
              endpoint="/documents/comission"
              onItemSelected={(doc) => handleFieldChange("commissionDoc", doc)}
              inputId={`train-mass-doc-com-${form.id}`}
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
              onItemSelected={(doc) => handleFieldChange("adminDoc", doc)}
              inputId={`train-mass-doc-adm-${form.id}`}
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

export default MassCreationFormItem;

import React, { useState } from "react";
import SearchableInput from "../../../components/common/SearchableInput";
import CreateItemModal from "../../../components/modals/CreateItemModal";
import CreateDocumentModal from "../../../components/modals/CreateDocumentModal";
import {
  Organization,
  MaintenanceTeam,
  Document,
  DetectorItem,
  FormDataStation,
  SelectedDetector,
  FormDataObjectOS,
} from "../../../types/creation";

interface ObjectOSFormProps {
  formData: FormDataObjectOS;
  setFormData: React.Dispatch<React.SetStateAction<FormDataObjectOS>>;
  selectedDetectors: SelectedDetector[];
  setSelectedDetectors: React.Dispatch<
    React.SetStateAction<SelectedDetector[]>
  >;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  onSaveAsDraft: () => void;
  onBack: () => void;
  loading: boolean;
  error?: string | null;

  isCreateModalOpenTeam: boolean;
  setIsCreateModalOpenTeam: (v: boolean) => void;
  isCreateModalOpenOrg: boolean;
  setIsCreateModalOpenOrg: (v: boolean) => void;
  isCreateModalOpenExecDoc: boolean;
  setIsCreateModalOpenExecDoc: (v: boolean) => void;
  isCreateModalOpenProjectDoc: boolean;
  setIsCreateModalOpenProjectDoc: (v: boolean) => void;
  isCreateModalOpenComissionDoc: boolean;
  setIsCreateModalOpenComissionDoc: (v: boolean) => void;
}

export const ObjectOSForm: React.FC<ObjectOSFormProps> = ({
  formData,
  setFormData,
  selectedDetectors,
  setSelectedDetectors,
  onSubmit,
  onReset,
  onSaveAsDraft,
  onBack,
  loading,
  error,
  isCreateModalOpenTeam,
  setIsCreateModalOpenTeam,
  isCreateModalOpenOrg,
  setIsCreateModalOpenOrg,
  isCreateModalOpenExecDoc,
  setIsCreateModalOpenExecDoc,
  isCreateModalOpenProjectDoc,
  setIsCreateModalOpenProjectDoc,
  isCreateModalOpenComissionDoc,
  setIsCreateModalOpenComissionDoc,
}) => {
  const [localIdCounter, setLocalIdCounter] = useState(1);

  const handleDetectorAdd = () => {
    setSelectedDetectors((prev) => [
      ...prev,
      { rowId: localIdCounter, detector: null, quantity: 1 },
    ]);
    setLocalIdCounter((c) => c + 1);
  };

  const handleDetectorUpdate = (rowId: number, detectorData: DetectorItem) => {
    setSelectedDetectors((prev) =>
      prev.map((item) =>
        item.rowId === rowId ? { ...item, detector: detectorData } : item,
      ),
    );
  };

  const handleQuantityChange = (rowId: number, val: string) => {
    const qty = parseInt(val, 10) || 0;
    setSelectedDetectors((prev) =>
      prev.map((item) =>
        item.rowId === rowId ? { ...item, quantity: qty } : item,
      ),
    );
  };

  const handleDetectorRemove = (rowId: number) => {
    setSelectedDetectors((prev) => prev.filter((item) => item.rowId !== rowId));
  };

  return (
    <form onSubmit={onSubmit}>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card shadow-sm border-0 p-4 mb-4">
        <div className="row g-3">
          <div className="col-md-6">
            <label htmlFor="numberObj" className="form-label fw-semibold">
              Номер объекта <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              id="numberObj"
              className={`form-control ${formData.number == null ? "is-invalid" : ""}`}
              value={formData.number ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  number:
                    e.target.value === "" ? null : parseFloat(e.target.value),
                }))
              }
              placeholder="000.00"
              required
            />
          </div>

          <div className="col-md-6">
            <label htmlFor="nameObj" className="form-label fw-semibold">
              Наименование объекта охраны <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="nameObj"
              className={`form-control ${!formData.name ? "is-invalid" : ""}`}
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Наименование"
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-semibold">
              Организация или подразделение{" "}
              <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <SearchableInput<Organization>
                endpoint="/orgs/all"
                commentParam="shortTitle"
                onItemSelected={(org) =>
                  setFormData((prev) => ({ ...prev, org }))
                }
                inputId="orgInputObj"
                isRequired={true}
                showAfterReload={formData.org?.title ?? ""}
              />
              <button
                type="button"
                className="btn btn-outline-success"
                onClick={() => setIsCreateModalOpenOrg(true)}
              >
                <i className="bi bi-plus-lg"></i>
              </button>
            </div>
          </div>

          <div className="col-md-6">
            <label className="form-label fw-semibold">
              Обслуживающая бригада <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <SearchableInput<MaintenanceTeam>
                endpoint="/maintenance_teams/all"
                commentParam="orgShortTitle"
                onItemSelected={(mteam) =>
                  setFormData((prev) => ({ ...prev, mteam }))
                }
                inputId="mteamInputObj"
                isRequired={true}
                showAfterReload={formData.mteam?.title ?? ""}
              />
              <button
                type="button"
                className="btn btn-outline-success"
                onClick={() => setIsCreateModalOpenTeam(true)}
              >
                <i className="bi bi-plus-lg"></i>
              </button>
            </div>
          </div>

          <div className="col-md-5">
            <label className="form-label fw-semibold">Номер станции</label>
            <SearchableInput<FormDataStation>
              endpoint="/stations/all"
              onItemSelected={(adminStation) =>
                setFormData((prev) => ({ ...prev, adminStation }))
              }
              inputId="adminStationInputObj"
              searchAndShowParam="number"
              commentParam={(item) => item?.name?.title ?? ""}
              showAfterReload={formData.adminStation?.number?.toString() ?? ""}
            />
          </div>

          <div className="col-md-5">
            <label className="form-label fw-semibold">
              Номер прибора на объекте
            </label>
            <SearchableInput<FormDataStation>
              endpoint="/stations/all"
              onItemSelected={(station) =>
                setFormData((prev) => ({ ...prev, station }))
              }
              inputId="stationInputObj"
              searchAndShowParam="number"
              commentParam={(item) => item?.name?.title ?? ""}
              showAfterReload={formData.station?.number?.toString() ?? ""}
            />
          </div>

          <div className="col-md-2">
            <label htmlFor="phoneObj" className="form-label fw-semibold">
              Телефон
            </label>
            <input
              type="text"
              id="phoneObj"
              className="form-control"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="Номер телефона"
            />
          </div>

          <div className="col-md-6">
            <label htmlFor="coordObj" className="form-label fw-semibold">
              Координаты объекта
            </label>
            <input
              type="text"
              id="coordObj"
              className="form-control"
              value={formData.coordinates}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  coordinates: e.target.value,
                }))
              }
              placeholder="Координаты"
            />
          </div>

          <div className="col-md-3">
            <label htmlFor="dateEnteredObj" className="form-label fw-semibold">
              Дата ввода
            </label>
            <input
              type="date"
              id="dateEnteredObj"
              className="form-control"
              value={formData.dateEntered}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  dateEntered: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-md-3">
            <label htmlFor="dateAdjustedObj" className="form-label fw-semibold">
              Дата корректировки
            </label>
            <input
              type="date"
              id="dateAdjustedObj"
              className="form-control"
              value={formData.dateAdjusted}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  dateAdjusted: e.target.value,
                }))
              }
            />
          </div>
        </div>

        {/* Датчики */}
        <div className="border rounded p-3 my-4 bg-light">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="fw-semibold mb-0">
              <i className="bi bi-broadcast me-2"></i> Установленные датчики
            </h6>
            <button
              type="button"
              className="btn btn-outline-success btn-sm"
              onClick={handleDetectorAdd}
            >
              <i className="bi bi-plus-lg me-1"></i> Добавить датчик
            </button>
          </div>

          {selectedDetectors.map((item, index) => (
            <div key={item.rowId} className="row g-2 align-items-end mb-2">
              <div className="col-md-7">
                <label className="form-label small text-muted mb-0">
                  Датчик #{index + 1}
                </label>
                <SearchableInput<DetectorItem>
                  endpoint="/detectors/all"
                  onItemSelected={(data) =>
                    handleDetectorUpdate(item.rowId, data)
                  }
                  inputId={`obj-det-${item.rowId}`}
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
                    handleQuantityChange(item.rowId, e.target.value)
                  }
                />
              </div>
              <div className="col-md-2">
                <button
                  type="button"
                  className="btn btn-outline-danger w-100"
                  onClick={() => handleDetectorRemove(item.rowId)}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Документы */}
        <div className="row g-3 mb-3">
          <div className="col-md-4">
            <label className="form-label fw-semibold">
              Проектная документация
            </label>
            <div className="input-group">
              <SearchableInput<Document>
                endpoint="/documents/project"
                onItemSelected={(doc) =>
                  setFormData((prev) => ({ ...prev, projectDoc: doc }))
                }
                inputId="objProjDoc"
              />
              <button
                type="button"
                className="btn btn-outline-success"
                onClick={() => setIsCreateModalOpenProjectDoc(true)}
              >
                <i className="bi bi-plus-lg"></i>
              </button>
            </div>
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold">
              Акт ввода в эксплуатацию
            </label>
            <div className="input-group">
              <SearchableInput<Document>
                endpoint="/documents/comission"
                onItemSelected={(doc) =>
                  setFormData((prev) => ({ ...prev, commissionDoc: doc }))
                }
                inputId="objComDoc"
              />
              <button
                type="button"
                className="btn btn-outline-success"
                onClick={() => setIsCreateModalOpenComissionDoc(true)}
              >
                <i className="bi bi-plus-lg"></i>
              </button>
            </div>
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold">
              Исполнительная документация
            </label>
            <div className="input-group">
              <SearchableInput<Document>
                endpoint="/documents/admin"
                onItemSelected={(doc) =>
                  setFormData((prev) => ({ ...prev, adminDoc: doc }))
                }
                inputId="objAdmDoc"
              />
              <button
                type="button"
                className="btn btn-outline-success"
                onClick={() => setIsCreateModalOpenExecDoc(true)}
              >
                <i className="bi bi-plus-lg"></i>
              </button>
            </div>
          </div>

          <div className="col-12">
            <label htmlFor="objCommentArea" className="form-label fw-semibold">
              Комментарий
            </label>
            <textarea
              id="objCommentArea"
              className="form-control"
              rows={3}
              value={formData.comment}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, comment: e.target.value }))
              }
              placeholder="Примечания к объекту..."
            />
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-success px-4"
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2"></span>
              ) : null}
              Сохранить
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onSaveAsDraft}
            >
              В черновик
            </button>
            <button
              type="button"
              className="btn btn-outline-warning"
              onClick={onReset}
            >
              Сбросить
            </button>
          </div>
          <button
            type="button"
            className="btn btn-secondary px-4"
            onClick={onBack}
          >
            Назад
          </button>
        </div>
      </div>

      <CreateItemModal<Organization>
        isOpen={isCreateModalOpenOrg}
        onClose={() => setIsCreateModalOpenOrg(false)}
        endPoint="/orgs"
        onSuccess={() => {}}
        headers={[
          { key: "title", label: "Полное наименование" },
          { key: "shortTitle", label: "Сокращенное наименование" },
          { key: "responsible", label: "Ответственный" },
          { key: "jobTitle", label: "Должность" },
          { key: "comment", label: "Комментарий" },
        ]}
        initialData={{
          title: "",
          shortTitle: "",
          responsible: "",
          jobTitle: "",
          comment: "",
          deleted: false,
        }}
        onCreated={(org) => setFormData((prev) => ({ ...prev, org }))}
      />

      <CreateItemModal<MaintenanceTeam>
        isOpen={isCreateModalOpenTeam}
        onClose={() => setIsCreateModalOpenTeam(false)}
        endPoint="/maintenance_teams"
        onSuccess={() => {}}
        headers={[
          { key: "title", label: "Бригада" },
          { key: "orgShortTitle", label: "Организация" },
          { key: "comment", label: "Комментарий" },
        ]}
        initialData={{ title: "", comment: "", deleted: false }}
        onCreated={(team) => setFormData((prev) => ({ ...prev, mteam: team }))}
      />

      <CreateDocumentModal
        isOpen={isCreateModalOpenProjectDoc}
        onClose={() => setIsCreateModalOpenProjectDoc(false)}
        endPoint="/documents"
        docType="PROJECT"
        onSuccess={() => {}}
        onCreated={(doc) =>
          setFormData((prev) => ({ ...prev, projectDoc: doc }))
        }
      />

      <CreateDocumentModal
        isOpen={isCreateModalOpenComissionDoc}
        onClose={() => setIsCreateModalOpenComissionDoc(false)}
        endPoint="/documents"
        docType="COMMISSION"
        onSuccess={() => {}}
        onCreated={(doc) =>
          setFormData((prev) => ({ ...prev, commissionDoc: doc }))
        }
      />

      <CreateDocumentModal
        isOpen={isCreateModalOpenExecDoc}
        onClose={() => setIsCreateModalOpenExecDoc(false)}
        endPoint="/documents"
        docType="ADMIN"
        onSuccess={() => {}}
        onCreated={(doc) => setFormData((prev) => ({ ...prev, adminDoc: doc }))}
      />
    </form>
  );
};

export default ObjectOSForm;

import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance, useAxiosInterceptor } from "../../../api/client";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import SearchableInput from "../../../components/common/SearchableInput";
import WorkTypesForm from "../dictionaries/WorkTypesForm";
import CreateItemModal from "../../../components/modals/CreateItemModal";
import CreateDocumentModal from "../../../components/modals/CreateDocumentModal";
import {
  FormDataStation,
  MaintenanceTeam,
  Document,
  WorkTypes,
  RequestCustom,
} from "../../../types/creation";
import GetInitialValue from "../../../utils/GetInitialValue";
import { searchableConfigs } from "../../../utils/searchableConfig";

const DRAFTS_STORAGE_KEY = "objectPsOsOps_drafts_list";

const emptyStationForm: FormDataStation = {
  name: { id: 0, title: "", comment: "", deleted: false },
  type: "",
  typeDisplayValue: "",
  number: null,
  capacity: null,
  objectsNumberFrom: null,
  objectsNumberTo: null,
  objectsNumbers: null,
  inventoryNumber: "",
  installationLocation: "",
  dateEntered: null,
  dateAdjusted: null,
  normative: null,
  comment: "",
  sound: null,
  light: null,
  voice: null,
  lightSound: null,
  commissionDoc: null,
  projectDoc: null,
  adminDoc: null,
  supplyFireAlarmQuantity: null,
  supplyWarningEvacuationControlQuantity: null,
  workTypes: null,
  deleted: false,
  objectsNumbersValue: "",
  stationTypesValue: {},
  mteam: null,
};

export const AddStations: React.FC<RequestCustom> = ({ endPoint }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Модальные окна
  const [isModalOpenTeam, setIsModalOpenTeam] = useState(false);
  const [isModalOpenName, setIsModalOpenName] = useState(false);
  const [isModalOpenExecDoc, setIsModalOpenExecDoc] = useState(false);
  const [isModalOpenProjectDoc, setIsModalOpenProjectDoc] = useState(false);
  const [isModalOpenComissionDoc, setIsModalOpenComissionDoc] = useState(false);

  const [formData, setFormData] = useLocalStorage<FormDataStation>(
    "addStation",
    GetInitialValue("addStation", emptyStationForm),
  );
  const [resultData, setResultData] = useState<WorkTypes[] | null>(null);

  const navigate = useNavigate();
  useAxiosInterceptor();

  useEffect(() => {
    const draftRaw = localStorage.getItem("temp_load_draft");
    if (draftRaw) {
      try {
        const parsed = JSON.parse(draftRaw);
        setFormData(parsed.formData);
        window.sessionStorage.setItem("current_draft_id", parsed.id.toString());
        localStorage.removeItem("temp_load_draft");
      } catch (e) {
        console.error("Ошибка чтения черновика:", e);
      }
    }
  }, [setFormData]);

  const handleSaveAsDraft = () => {
    const currentDrafts = JSON.parse(
      localStorage.getItem(DRAFTS_STORAGE_KEY) || "[]",
    );
    const newDraft = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      formData,
    };
    localStorage.setItem(
      DRAFTS_STORAGE_KEY,
      JSON.stringify([...currentDrafts, newDraft]),
    );
    alert("Станция успешно сохранена в черновики");
  };

  const handleWorkTypesChange = useCallback((data: WorkTypes[]) => {
    setResultData(data);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.number) {
      setError("Номер станции обязателен для заполнения");
      return;
    }
    if (!formData.type) {
      setError("Тип станции обязателен");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const finalData = {
        stationNameId: formData.name?.id || null,
        stationType: formData.type,
        maintenanceTeamId: formData.mteam || null,
        number: formData.number,
        capacity: formData.capacity || null,
        objectsNumberFrom: formData.objectsNumberFrom || null,
        objectsNumberTo: formData.objectsNumberTo || null,
        inventoryNumber: formData.inventoryNumber || "",
        installationLocation: formData.installationLocation || "",
        normative: formData.normative || null,
        comment: formData.comment || "",
        sound: formData.sound || null,
        light: formData.light || null,
        voice: formData.voice || null,
        lightSound: formData.lightSound || null,
        commissionDocId: formData.commissionDoc || null,
        projectDocId: formData.projectDoc || null,
        adminDocId: formData.adminDoc || null,
        supplyFireAlarmQuantity: formData.supplyFireAlarmQuantity || null,
        supplyWarningEvacuationControlQuantity:
          formData.supplyWarningEvacuationControlQuantity || null,
        workTypePeriodicity: resultData
          ? resultData.flatMap(
              (wt) =>
                wt.typeMonth?.map((tm) => ({
                  workTypeId: wt.workType?.id || null,
                  codeId: tm.code?.codeId || null,
                  startMonth: tm.startMonth || null,
                })) || [],
            )
          : [],
      };

      await axiosInstance.post(endPoint, finalData);

      const currentDraftId = window.sessionStorage.getItem("current_draft_id");
      if (currentDraftId) {
        const drafts = JSON.parse(
          localStorage.getItem(DRAFTS_STORAGE_KEY) || "[]",
        );
        const filtered = drafts.filter(
          (d: any) => d.id !== Number(currentDraftId),
        );
        localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(filtered));
        window.sessionStorage.removeItem("current_draft_id");
      }

      window.localStorage.removeItem("addStation");
      navigate("/stations");
    } catch (err: any) {
      console.error("Ошибка сохранения станции:", err);
      setError(err.response?.data?.message || "Ошибка сохранения станции");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    window.localStorage.removeItem("addStation");
    setFormData(emptyStationForm);
    setResultData(null);
    setError(null);
  };

  return (
    <div className="container mt-2">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="/">Главная</a>
          </li>
          <li className="breadcrumb-item">
            <a href="/stations">Учет станций ПС, ОС, ОПС</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Форма добавления
          </li>
        </ol>
      </nav>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Добавить новую станцию учета</h3>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => {
            navigate("/stations/add/drafts");
            window.localStorage.removeItem("addStation");
          }}
        >
          <i className="bi bi-archive me-1"></i> Черновики
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card shadow-sm border-0 p-4">
        <form onSubmit={handleSubmit}>
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label
                htmlFor="stationTypeSelect"
                className="form-label fw-semibold"
              >
                Тип станции <span className="text-danger">*</span>
              </label>
              <select
                id="stationTypeSelect"
                className={`form-select ${!formData.type ? "is-invalid" : ""}`}
                value={formData.type || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  const displayMap: Record<string, string> = {
                    FIRE: "ПС",
                    SECURITY: "ОС",
                    FIRE_SECURITY: "ОПС",
                  };
                  setFormData((prev) => ({
                    ...prev,
                    type: val,
                    typeDisplayValue: displayMap[val] || val,
                  }));
                }}
                required
              >
                <option value="" disabled>
                  -- Выберите тип --
                </option>
                <option value="FIRE">ПС</option>
                <option value="SECURITY">ОС</option>
                <option value="FIRE_SECURITY">ОПС</option>
              </select>
            </div>

            <div className="col-md-6">
              <label
                htmlFor="stationNumberInput"
                className="form-label fw-semibold"
              >
                Номер станции <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                id="stationNumberInput"
                className={`form-control ${!formData.number ? "is-invalid" : ""}`}
                value={formData.number ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    number: parseInt(e.target.value, 10) || null,
                  }))
                }
                placeholder="1-99999"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Обслуживающая бригада
              </label>
              <div className="input-group">
                <SearchableInput
                  endpoint={searchableConfigs.maintenanceTeam.endpoint}
                  onItemSelected={(item: MaintenanceTeam) =>
                    setFormData((prev) => ({
                      ...prev,
                      mteam: item?.id || null,
                    }))
                  }
                  commentParam={searchableConfigs.maintenanceTeam.commentParam}
                  inputId="stationMTeamInput"
                />
                <button
                  type="button"
                  className="btn btn-outline-success"
                  onClick={() => setIsModalOpenTeam(true)}
                >
                  <i className="bi bi-plus-lg"></i>
                </button>
              </div>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Наименование станции <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <SearchableInput
                  endpoint={searchableConfigs.stationName.endpoint}
                  onItemSelected={(item: any) =>
                    setFormData((prev) => ({ ...prev, name: item }))
                  }
                  commentParam={searchableConfigs.stationName.commentParam}
                  inputId="stationNameInput"
                  showAfterReload={formData.name?.title || ""}
                  isRequired={true}
                />
                <button
                  type="button"
                  className="btn btn-outline-success"
                  onClick={() => setIsModalOpenName(true)}
                >
                  <i className="bi bi-plus-lg"></i>
                </button>
              </div>
            </div>

            <div className="col-md-6">
              <label
                htmlFor="stationCapacity"
                className="form-label fw-semibold"
              >
                Ёмкость
              </label>
              <input
                type="number"
                id="stationCapacity"
                className="form-control"
                value={formData.capacity ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    capacity: parseInt(e.target.value, 10) || null,
                  }))
                }
                placeholder="0"
              />
            </div>

            <div className="col-md-6">
              <label
                htmlFor="stationNormative"
                className="form-label fw-semibold"
              >
                Норматив
              </label>
              <input
                type="number"
                step="0.01"
                id="stationNormative"
                className="form-control"
                value={formData.normative ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    normative: parseFloat(e.target.value) || null,
                  }))
                }
                placeholder="0.00"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Нумерация шлейфов
              </label>
              <div className="input-group">
                <span className="input-group-text">От:</span>
                <input
                  type="number"
                  className="form-control"
                  value={formData.objectsNumberFrom ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      objectsNumberFrom: parseInt(e.target.value, 10) || null,
                    }))
                  }
                  placeholder="От"
                />
                <span className="input-group-text">До:</span>
                <input
                  type="number"
                  className="form-control"
                  value={formData.objectsNumberTo ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      objectsNumberTo: parseInt(e.target.value, 10) || null,
                    }))
                  }
                  placeholder="До"
                />
              </div>
            </div>

            <div className="col-md-6">
              <label
                htmlFor="inventoryNumberInput"
                className="form-label fw-semibold"
              >
                Инвентарный номер
              </label>
              <input
                type="text"
                id="inventoryNumberInput"
                className="form-control"
                value={formData.inventoryNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    inventoryNumber: e.target.value,
                  }))
                }
                placeholder="Инвентарный номер"
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="locationInput" className="form-label fw-semibold">
                Место установки
              </label>
              <input
                type="text"
                id="locationInput"
                className="form-control"
                value={formData.installationLocation}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    installationLocation: e.target.value,
                  }))
                }
                placeholder="Адрес или помещение"
              />
            </div>

            <div className="col-md-3">
              <label
                htmlFor="dateEnteredInput"
                className="form-label fw-semibold"
              >
                Дата ввода
              </label>
              <input
                type="date"
                id="dateEnteredInput"
                className="form-control"
                value={formData.dateEntered ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    dateEntered: e.target.value,
                  }))
                }
              />
            </div>

            <div className="col-md-3">
              <label
                htmlFor="dateAdjustedInput"
                className="form-label fw-semibold"
              >
                Дата корректировки
              </label>
              <input
                type="date"
                id="dateAdjustedInput"
                className="form-control"
                value={formData.dateAdjusted ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    dateAdjusted: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          {/* Оповещатели */}
          <div className="border rounded p-3 mb-4 bg-light">
            <h6 className="fw-semibold mb-3">Оповещатели (количество)</h6>
            <div className="row g-3">
              <div className="col-md-3">
                <label
                  htmlFor="soundNotify"
                  className="form-label small text-muted"
                >
                  Звуковые
                </label>
                <input
                  type="number"
                  id="soundNotify"
                  className="form-control"
                  value={formData.sound ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sound: parseInt(e.target.value, 10) || null,
                    }))
                  }
                />
              </div>
              <div className="col-md-3">
                <label
                  htmlFor="lightSoundNotify"
                  className="form-label small text-muted"
                >
                  Свет-звук
                </label>
                <input
                  type="number"
                  id="lightSoundNotify"
                  className="form-control"
                  value={formData.lightSound ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lightSound: parseInt(e.target.value, 10) || null,
                    }))
                  }
                />
              </div>
              <div className="col-md-3">
                <label
                  htmlFor="voiceNotify"
                  className="form-label small text-muted"
                >
                  Речевые
                </label>
                <input
                  type="number"
                  id="voiceNotify"
                  className="form-control"
                  value={formData.voice ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      voice: parseInt(e.target.value, 10) || null,
                    }))
                  }
                />
              </div>
              <div className="col-md-3">
                <label
                  htmlFor="lightNotify"
                  className="form-label small text-muted"
                >
                  Световые
                </label>
                <input
                  type="number"
                  id="lightNotify"
                  className="form-control"
                  value={formData.light ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      light: parseInt(e.target.value, 10) || null,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Источники питания */}
          <div className="border rounded p-3 mb-4 bg-light">
            <h6 className="fw-semibold mb-3">
              Источники бесперебойного электропитания (ИБЭП)
            </h6>
            <div className="row g-3">
              <div className="col-md-6">
                <label
                  htmlFor="apsSupply"
                  className="form-label small text-muted"
                >
                  АПС (количество)
                </label>
                <input
                  type="number"
                  id="apsSupply"
                  className="form-control"
                  value={formData.supplyFireAlarmQuantity ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      supplyFireAlarmQuantity:
                        parseInt(e.target.value, 10) || null,
                    }))
                  }
                />
              </div>
              <div className="col-md-6">
                <label
                  htmlFor="soueSupply"
                  className="form-label small text-muted"
                >
                  СОУЭ (количество)
                </label>
                <input
                  type="number"
                  id="soueSupply"
                  className="form-control"
                  value={formData.supplyWarningEvacuationControlQuantity ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      supplyWarningEvacuationControlQuantity:
                        parseInt(e.target.value, 10) || null,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <WorkTypesForm
              onChange={handleWorkTypesChange}
              required={true}
              searchType="Станция"
            />
          </div>

          {/* Документы */}
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <label className="form-label fw-semibold">
                Проектная документация
              </label>
              <div className="input-group">
                <SearchableInput
                  endpoint="/documents/project"
                  onItemSelected={(doc: Document) =>
                    setFormData((prev) => ({
                      ...prev,
                      projectDoc: doc?.id || null,
                    }))
                  }
                  inputId="stationProjectDocInput"
                />
                <button
                  type="button"
                  className="btn btn-outline-success"
                  onClick={() => setIsModalOpenProjectDoc(true)}
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
                <SearchableInput
                  endpoint="/documents/comission"
                  onItemSelected={(doc: Document) =>
                    setFormData((prev) => ({
                      ...prev,
                      commissionDoc: doc?.id || null,
                    }))
                  }
                  inputId="stationCommissionDocInput"
                />
                <button
                  type="button"
                  className="btn btn-outline-success"
                  onClick={() => setIsModalOpenComissionDoc(true)}
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
                <SearchableInput
                  endpoint="/documents/admin"
                  onItemSelected={(doc: Document) =>
                    setFormData((prev) => ({
                      ...prev,
                      adminDoc: doc?.id || null,
                    }))
                  }
                  inputId="stationAdminDocInput"
                />
                <button
                  type="button"
                  className="btn btn-outline-success"
                  onClick={() => setIsModalOpenExecDoc(true)}
                >
                  <i className="bi bi-plus-lg"></i>
                </button>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="stationComment" className="form-label fw-semibold">
              Комментарий
            </label>
            <textarea
              id="stationComment"
              className="form-control"
              rows={3}
              value={formData.comment}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, comment: e.target.value }))
              }
              placeholder="Примечания..."
            />
          </div>

          <div className="d-flex justify-content-between align-items-center">
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
                onClick={handleSaveAsDraft}
              >
                В черновик
              </button>
              <button
                type="button"
                className="btn btn-outline-warning"
                onClick={handleReset}
              >
                Сбросить
              </button>
            </div>
            <button
              type="button"
              className="btn btn-secondary px-4"
              onClick={() => navigate("/stations")}
            >
              Назад
            </button>
          </div>
        </form>
      </div>

      {/* Модалки быстрого создания */}
      <CreateItemModal<MaintenanceTeam>
        isOpen={isModalOpenTeam}
        onClose={() => setIsModalOpenTeam(false)}
        endPoint="/maintenance_teams"
        onSuccess={() => {}}
        headers={[
          { key: "title", label: "Название бригады" },
          { key: "comment", label: "Комментарий" },
        ]}
        initialData={{ title: "", comment: "", deleted: false }}
        onCreated={(created) =>
          setFormData((prev) => ({ ...prev, mteam: created.id }))
        }
      />

      <CreateItemModal<any>
        isOpen={isModalOpenName}
        onClose={() => setIsModalOpenName(false)}
        endPoint="/station_names"
        onSuccess={() => {}}
        headers={[
          { key: "title", label: "Название станции" },
          { key: "comment", label: "Комментарий" },
        ]}
        initialData={{ title: "", comment: "", deleted: false }}
        onCreated={(created) =>
          setFormData((prev) => ({ ...prev, name: created }))
        }
      />

      <CreateDocumentModal
        isOpen={isModalOpenProjectDoc}
        onClose={() => setIsModalOpenProjectDoc(false)}
        endPoint="/documents"
        onSuccess={() => {}}
        docType="PROJECT"
        onCreated={(doc) =>
          setFormData((prev) => ({ ...prev, projectDoc: doc.id }))
        }
      />
      <CreateDocumentModal
        isOpen={isModalOpenComissionDoc}
        onClose={() => setIsModalOpenComissionDoc(false)}
        endPoint="/documents"
        onSuccess={() => {}}
        docType="COMMISSION"
        onCreated={(doc) =>
          setFormData((prev) => ({ ...prev, commissionDoc: doc.id }))
        }
      />
      <CreateDocumentModal
        isOpen={isModalOpenExecDoc}
        onClose={() => setIsModalOpenExecDoc(false)}
        endPoint="/documents"
        onSuccess={() => {}}
        docType="ADMIN"
        onCreated={(doc) =>
          setFormData((prev) => ({ ...prev, adminDoc: doc.id }))
        }
      />
    </div>
  );
};

export default AddStations;

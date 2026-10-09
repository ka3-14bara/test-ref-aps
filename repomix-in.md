# Repomix Packed Source Code (Part 4 - Remaining Modules)

## File: src/api/apiCache.ts

```typescript
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

class ApiCache {
  private cache = new Map<string, CacheItem<any>>();
  private ttl: number;

  constructor(ttlMinutes: number = 5) {
    this.ttl = ttlMinutes * 60 * 1000;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const apiCache = new ApiCache(10);
```

## File: src/utils/GetInitialValue.ts

```typescript
export default function GetInitialValue<T>(
  storageKey: string,
  initialValue: T,
): T {
  try {
    const item = window.localStorage.getItem(storageKey);
    return item ? JSON.parse(item) : initialValue;
  } catch (error) {
    console.error(
      `Ошибка чтения из localStorage ключа "${storageKey}":`,
      error,
    );
    return initialValue;
  }
}
```

## File: src/utils/prepareDetectors.ts

```typescript
export function prepareDetectorsPayload(selectedDetectors: any[]) {
  return selectedDetectors
    .filter((item) => item.detector && item.detector.id)
    .map((item) => ({
      detectorId: item.detector.id,
      quantity: Number(item.quantity) || 1,
    }));
}
```

## File: src/utils/prepareObjectOSData.ts

```typescript
export function validateObjectOS(formData: any): string[] {
  const missing: string[] = [];
  if (formData.number == null) missing.push("Номер объекта");
  if (!formData.name) missing.push("Наименование");
  if (!formData.org || !formData.org.id) missing.push("Организация");
  if (!formData.mteam || !formData.mteam.id) missing.push("Бригада");
  return missing;
}

export function prepareObjectOSData(formData: any, selectedDetectors: any[]) {
  return {
    number: formData.number,
    name: formData.name,
    coordinates: formData.coordinates || "",
    phone: formData.phone || "",
    dateEntered: formData.dateEntered || null,
    dateAdjusted: formData.dateAdjusted || null,
    comment: formData.comment || "",
    orgId: formData.org?.id || null,
    maintenanceTeamId: formData.mteam?.id || null,
    stationId: formData.station?.id || null,
    adminStationId: formData.adminStation?.id || null,
    projectDocId: formData.projectDoc?.id || null,
    commissionDocId: formData.commissionDoc?.id || null,
    adminDocId: formData.adminDoc?.id || null,
    detectors: selectedDetectors
      .filter((d) => d.detector && d.detector.id)
      .map((d) => ({
        detectorId: d.detector.id,
        quantity: Number(d.quantity) || 1,
      })),
    deleted: false,
  };
}
```

## File: src/utils/prepareTrainData.ts

```typescript
export function validateRequiredFields(formData: any): string[] {
  const missing: string[] = [];
  if (!formData.number) missing.push("Номер шлейфа");
  if (!formData.org || !formData.org.id) missing.push("Организация");
  if (!formData.mteam || !formData.mteam.id) missing.push("Бригада");
  if (!formData.stationId) missing.push("Номер станции");
  return missing;
}

export function prepareFinalData(formData: any, selectedDetectors: any[]) {
  return {
    number: formData.number
      ? String(formData.number).replace(/\*+$/, "")
      : null,
    sectionNumber: formData.sectionNumber
      ? Number(formData.sectionNumber)
      : null,
    location: formData.location || "",
    coordinates: formData.coordinates || "",
    length: formData.length ? Number(formData.length) : 0,
    dateEntered: formData.dateEntered || null,
    dateAdjusted: formData.dateAdjusted || null,
    comment: formData.comment || "",
    deleted: false,
    orgId: formData.org?.id || null,
    stationId: formData.stationId || null,
    maintenanceTeamId: formData.mteam?.id || null,
    commissionDocId: formData.commissionDoc?.id || null,
    projectDocId: formData.projectDoc?.id || null,
    adminDocId: formData.adminDoc?.id || null,
    detectors: selectedDetectors
      .filter((d) => d.detector && d.detector.id)
      .map((d) => ({
        detectorId: d.detector.id,
        quantity: Number(d.quantity) || 1,
      })),
  };
}
```

## File: src/utils/searchableConfig.ts

```typescript
export interface SearchableConfigItem {
  endpoint: string;
  searchAndShowParam: string;
  commentParam?: string | ((item: any) => string);
}

export const searchableConfigs = {
  org: {
    endpoint: "/orgs/all",
    searchAndShowParam: "title",
    commentParam: "shortTitle",
  },
  mteam: {
    endpoint: "/maintenance_teams/all",
    searchAndShowParam: "title",
    commentParam: "orgShortTitle",
  },
  maintenanceTeam: {
    endpoint: "/maintenance_teams/all",
    searchAndShowParam: "title",
    commentParam: "orgShortTitle",
  },
  stationName: {
    endpoint: "/station_names/all",
    searchAndShowParam: "title",
    commentParam: "comment",
  },
  stationNumberValue: {
    endpoint: "/stations/all",
    searchAndShowParam: "number",
    commentParam: (item: any) => item?.name?.title ?? "",
  },
  station: {
    endpoint: "/stations/all",
    searchAndShowParam: "number",
    commentParam: (item: any) => item?.name?.title ?? "",
  },
  adminStation: {
    endpoint: "/stations/all",
    searchAndShowParam: "number",
    commentParam: (item: any) => item?.name?.title ?? "",
  },
  type: {
    endpoint: "/detector_types/all",
    searchAndShowParam: "title",
  },
  projectDoc: {
    endpoint: "/documents/project",
    searchAndShowParam: "title",
  },
  commissionDoc: {
    endpoint: "/documents/comission",
    searchAndShowParam: "title",
  },
  adminDoc: {
    endpoint: "/documents/admin",
    searchAndShowParam: "title",
  },
};

export type SearchableType<K extends keyof searchableConfigs typeof> = any;

export const DATE = ["dateEntered", "dateAdjusted"];
export const DETECTORS = ["detectors", "detectorsValue"];
export const INT_INPUTS = ["number", "length", "sectionNumber", "capacity", "objectsNumberFrom", "objectsNumberTo"];
export const FLOAT_INPUTS = ["laboriousness", "normative", "trainLaboriousness"];
```

## File: src/features/admin/AdminPanel.tsx

```typescript
import { useEffect, useState } from "react";
import { axiosInstance } from "../../api/axios";
import { useAuth, User } from "../../hooks/useAuth";
import { PaginationInfo } from "../../types/table";
import PaginationPanel from "../../components/ui/PaginationPanel";

export interface RoleMatrix {
  roleName: string;
  permissions: string[];
}

export interface UsersResponse {
  content: User[];
  totalPages: number;
  totalElements: number;
  number: number;
}

const AdminPanel = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<RoleMatrix[]>([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });

  const [sortField, setSortField] = useState("id");
  const [direction, setDirection] = useState("asc");
  const [showModal, setShowModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get<UsersResponse>(
        `/users?page=${pagination.page}&size=${pagination.size}&sort=${sortField}&direction=${direction}`
      );
      const rolesRes = await axiosInstance.get<RoleMatrix[]>("/role/roles-matrix");

      setUsers(response.data.content || []);
      setRoles(rolesRes.data || []);
      setPagination((prev) => ({
        ...prev,
        totalPages: response.data.totalPages || 0,
        totalElements: response.data.totalElements || 0,
      }));
    } catch (err) {
      console.error("Ошибка загрузки пользователей:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.page, pagination.size, sortField, direction]);

  const handleSort = (field: string) => {
    const newDir = sortField === field && direction === "asc" ? "desc" : "asc";
    setSortField(field);
    setDirection(newDir);
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const handleRoleChange = async (username: string, newRole: string) => {
    try {
      await axiosInstance.patch(`/users/${username}/role`, { roleName: newRole });
      fetchData();
    } catch (err) {
      alert("Ошибка смены роли пользователя");
    }
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete("/users", { data: { ids: selectedIds } });
      setSelectedIds([]);
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert("Ошибка при удалении пользователей");
    }
  };

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h4 mb-0 fw-bold">Панель администратора</h2>
        <button
          type="button"
          className="btn btn-outline-danger d-flex align-items-center gap-1"
          onClick={() => setShowModal(true)}
          disabled={selectedIds.length === 0}
        >
          <i className="bi bi-person-x"></i> Удалить выбранных ({selectedIds.length})
        </button>
      </div>

      <div className="app-table-wrapper mb-3">
        <div className="app-table-wrapper__scroll-area">
          <table className="app-table table-hover">
            <thead className="app-table__head">
              <tr>
                <th className="app-table__th" style={{ width: "40px" }}></th>
                <th className="app-table__th" onClick={() => handleSort("id")} style={{ cursor: "pointer" }}>
                  ID
                </th>
                <th className="app-table__th" onClick={() => handleSort("username")} style={{ cursor: "pointer" }}>
                  Пользователь
                </th>
                <th className="app-table__th">Роль</th>
                <th className="app-table__th">Смена роли</th>
                <th className="app-table__th">Права доступа</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="app-table__row">
                  <td className="app-table__td">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selectedIds.includes(u.id)}
                      disabled={u.username === currentUser?.username}
                      onChange={() =>
                        setSelectedIds((prev) =>
                          prev.includes(u.id) ? prev.filter((i) => i !== u.id) : [...prev, u.id]
                        )
                      }
                    />
                  </td>
                  <td className="app-table__td">{u.id}</td>
                  <td className="app-table__td fw-medium">{u.username}</td>
                  <td className="app-table__td">
                    <span className="badge bg-primary">{u.role}</span>
                  </td>
                  <td className="app-table__td">
                    <select
                      className="form-select form-select-sm"
                      style={{ width: "150px" }}
                      value={(u.role || "").replace("ROLE_", "")}
                      disabled={u.username === currentUser?.username}
                      onChange={(e) => handleRoleChange(u.username, e.target.value)}
                    >
                      {roles.map((r) => (
                        <option key={r.roleName} value={r.roleName.replace("ROLE_", "")}>
                          {r.roleName.replace("ROLE_", "")}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="app-table__td">
                    <div className="d-flex flex-wrap gap-1">
                      {u.permissions?.map((p, idx) => (
                        <span key={idx} className="badge bg-light text-secondary border fw-normal" style={{ fontSize: "0.7rem" }}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PaginationPanel isLoading="{loading}" onPageChange="{(page)" pagination="{pagination}"> setPagination((p) => ({ ...p, page }))}
        onPageSizeChange={(size) => setPagination((p) => ({ ...p, size, page: 0 }))}
      />

      {showModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}>
          <div className="card shadow border-0 p-4" style={{ maxWidth: "400px", width: "100%" }}>
            <h5 className="fw-bold mb-3">Подтверждение удаления</h5>
            <p className="text-muted small mb-4">
              Удалить выбранных пользователей ({selectedIds.length})? Действие необратимо.
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                Отмена
              </button>
              <button type="button" className="btn btn-danger btn-sm" onClick={confirmDelete}>
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
```

## File: src/features/reports/ExcelViewer.tsx

```typescript
import React, { useState, useRef } from "react";
import { axiosInstance, useAxiosInterceptor } from "../../api/axios";
import { Organization, MaintenanceTeam } from "../../types/domain";
import SearchableInput from "../../components/ui/SearchableInput";
import { useLocation } from "react-router-dom";
import ExcelPreview from "./ExcelPreview";

interface ExcelViewerProps {
  req: string;
  header: string;
}

type SelectedTeams = {
  rowId: number;
  mteam: MaintenanceTeam | null;
};

const ExcelViewer: React.FC<ExcelViewerProps> = ({ req, header }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState("file.xlsx");
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer null |>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localIdCounter, setLocalIdCounter] = useState(1);

  const [selectedTeams, setSelectedTeams] = useState<SelectedTeams[]>([]);
  const [quarter, setQuarter] = useState<number>(0);
  const [year, setYear] = useState<string>("");

  const location = useLocation();
  useAxiosInterceptor();

  const loadExcelFromServer = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updatedMteams = selectedTeams.filter((item) => item.mteam).map((item) => item.mteam?.id);

    const finalData =
      location.pathname === "/schedules/train"
        ? { maintenanceTeamId: updatedMteams, year }
        : { maintenanceTeamIds: updatedMteams, year, quarter };

    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(req, {
        params: finalData,
        paramsSerializer: { indexes: null },
        responseType: "arraybuffer",
      });

      const contentDisposition = response.headers["content-disposition"];
      if (contentDisposition) {
        const parts = contentDisposition.split("filename=");
        let nameFileResponse = parts[1] ? parts[1].trim() : "file.xlsx";
        nameFileResponse = nameFileResponse.replace(/['"]/g, "").split(";")[0].trim();
        setFileName(decodeURIComponent(nameFileResponse));
      }

      setFileBuffer(response.data);
    } catch (err: any) {
      setError("Ошибка загрузки файла: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const addTeamRow = () => {
    setSelectedTeams([...selectedTeams, { rowId: localIdCounter, mteam: null }]);
    setLocalIdCounter((prev) => prev + 1);
  };

  const handleTeamSelect = (rowId: number, teamData: MaintenanceTeam) => {
    setSelectedTeams((prev) =>
      prev.map((item) => (item.rowId === rowId ? { ...item, mteam: teamData } : item))
    );
  };

  const removeTeamRow = (rowId: number) => {
    setSelectedTeams((prev) => prev.filter((item) => item.rowId !== rowId));
  };

  return (
    <div className="container-fluid py-3">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/" className="text-decoration-none">Главная</a></li>
          <li className="breadcrumb-item active" aria-current="page">График - {header}</li>
        </ol>
      </nav>

      <h2 className="h4 mb-3 fw-bold">Загрузка и просмотр Графика: {header}</h2>

      <div className="card shadow-sm border-0 mb-4 bg-white p-3">
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <button
            onClick={() => loadExcelFromServer()}
            disabled={loading}
            className="btn btn-primary d-flex align-items-center gap-1"
          >
            {loading ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-cloud-arrow-down"></i>}
            <span>Загрузить с сервера</span>
          </button>
        </div>

        {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}

        <div className="row mt-4 g-3">
          <div className="col-md-6">
            <label className="form-label fw-medium">Фильтр по бригадам:</label>
            <button
              type="button"
              className="btn btn-sm btn-outline-success mb-2 d-flex align-items-center gap-1"
              onClick={addTeamRow}
            >
              <i className="bi bi-plus"></i> Добавить бригаду
            </button>
            {selectedTeams.map((item, idx) => (
              <div key={item.rowId} className="row g-2 align-items-end mb-2">
                <div className="col">
                  <SearchableInput<MaintenanceTeam>
                    endpoint="/maintenance_teams/all"
                    commentParam="orgShortTitle"
                    onItemSelected={(data) => handleTeamSelect(item.rowId, data)}
                    inputId={`team-input-${item.rowId}`}
                  />
                </div>
                <div className="col-auto">
                  <button type="button" className="btn btn-outline-danger" onClick={() => removeTeamRow(item.rowId)}>
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="col-md-6">
            <div className="d-flex gap-3">
              {location.pathname === "/schedules/subject" && (
                <div className="flex-grow-1">
                  <label htmlFor="excel-quarter" className="form-label fw-medium">Квартал:</label>
                  <select
                    id="excel-quarter"
                    className="form-select"
                    onChange={(e) => setQuarter(parseInt(e.target.value, 10) || 0)}
                    value={quarter}
                  >
                    <option value={0}>Выберите квартал...</option>
                    <option value={1}>I квартал</option>
                    <option value={2}>II квартал</option>
                    <option value={3}>III квартал</option>
                    <option value={4}>IV квартал</option>
                  </select>
                </div>
              )}
              <div className="flex-grow-1">
                <label htmlFor="excel-year" className="form-label fw-medium">Год:</label>
                <input
                  id="excel-year"
                  type="text"
                  className="form-control"
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2026"
                  autoComplete="off"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ExcelPreview fileBuffer="{fileBuffer}" fileName="{fileName}" isShowDownload="{true}"/>
    </div>
  );
};

export default ExcelViewer;
```

## File: src/features/creation/trains/AddTrain.tsx

```typescript
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance, useAxiosInterceptor } from "../../../api/axios";
import axios from "axios";
import TrainForm from "./TrainForm";
import MassCreationManager from "./MassCreationManager";
import { useTrainFormState } from "../../../hooks/useTrainFormState";
import { prepareFinalData, validateRequiredFields } from "../../../utils/prepareTrainData";
import { RequestCustom } from "../../../types/domain";

const DRAFTS_STORAGE_KEY = "objectPS_drafts_list";

const AddTrain = ({ endPoint }: RequestCustom) => {
  const navigate = useNavigate();
  useAxiosInterceptor();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMassCreationMode, setIsMassCreationMode] = useState(false);
  const [massCreationKey, setMassCreationKey] = useState(0);
  const [regularCreationKey, setRegularCreationKey] = useState(0);

  const {
    formData,
    setFormData,
    selectedDetectors,
    setSelectedDetectors,
    resetForm,
  } = useTrainFormState("trainFormData");

  const [isCreateModalOpenTeam, setIsCreateModalOpenTeam] = useState(false);
  const [isCreateModalOpenOrg, setIsCreateModalOpenOrg] = useState(false);
  const [isCreateModalOpenExecDoc, setIsCreateModalOpenExecDoc] = useState(false);
  const [isCreateModalOpenProjectDoc, setIsCreateModalOpenProjectDoc] = useState(false);
  const [isCreateModalOpenComissionDoc, setIsCreateModalOpenComissionDoc] = useState(false);

  const handleBack = () => {
    navigate(endPoint, { replace: true });
  };

  const handleSaveAsDraft = () => {
    const currentDrafts = JSON.parse(localStorage.getItem(DRAFTS_STORAGE_KEY) || "[]");
    const newDraft = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      formData: formData,
      selectedDetectors: selectedDetectors,
    };
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify([...currentDrafts, newDraft]));
    alert("Данные сохранены в черновики");
  };

  const handleSubmitRegular = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const missingFields = validateRequiredFields(formData);
    if (missingFields.length > 0) {
      setError(`Пожалуйста, заполните обязательные поля: ${missingFields.join(", ")}`);
      setLoading(false);
      return;
    }

    try {
      const finalData = prepareFinalData(formData, selectedDetectors);
      await axiosInstance.post(endPoint, finalData);

      const currentDraftId = window.sessionStorage.getItem("current_draft_id");
      if (currentDraftId) {
        const drafts = JSON.parse(localStorage.getItem(DRAFTS_STORAGE_KEY) || "[]");
        const filtered = drafts.filter((d: any) => d.id !== Number(currentDraftId));
        localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(filtered));
        window.sessionStorage.removeItem("current_draft_id");
      }

      window.localStorage.removeItem("trainFormData");
      navigate("/trains");
    } catch (err) {
      console.error("Ошибка при отправке: ", err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Произошла ошибка при сохранении данных");
      } else {
        setError("Произошла неизвестная ошибка");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMass = async (
    updateForm: (id: number, updates: any) => void,
    forms: any[]
  ) => {
    setLoading(true);
    setError(null);

    const pendingForms = forms.filter((f) => f.status !== "success");

    for (const form of pendingForms) {
      updateForm(form.id, { status: "submitting", errorMessage: undefined });
      try {
        const finalData = prepareFinalData(form.formData, form.selectedDetectors);
        await axiosInstance.post(endPoint, finalData);
        updateForm(form.id, { status: "success" });
      } catch (err: any) {
        const errorMessage = err?.message || "Ошибка при сохранении";
        updateForm(form.id, { status: "error", errorMessage });
        setError(`Ошибка при создании объекта #${form.id}: ${errorMessage}`);
      }
    }

    setLoading(false);
    if (forms.every((f) => f.status === "success")) {
      window.localStorage.removeItem("trainFormData");
      navigate("/trains");
    }
  };

  const handleResetRegular = () => resetForm();

  const handleToggleMassCreation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked;
    resetForm();
    if (enabled) setMassCreationKey((p) => p + 1);
    else setRegularCreationKey((p) => p + 1);
    setIsMassCreationMode(enabled);
  };

  return (
    <div className="container-fluid py-3">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/" className="text-decoration-none">Главная</a></li>
          <li className="breadcrumb-item"><a href="/trains" className="text-decoration-none">Учет шлейфов</a></li>
          <li className="breadcrumb-item active" aria-current="page">Форма добавления шлейфа</li>
        </ol>
      </nav>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 mb-0 fw-bold">Добавить новый шлейф</h2>
        <div className="d-flex align-items-center gap-3">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id="switchCheckDefault"
              checked={isMassCreationMode}
              onChange={handleToggleMassCreation}
            />
            <label className="form-check-label ms-2" htmlFor="switchCheckDefault">
              Массовое создание
            </label>
          </div>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => {
              navigate("/trains/add/drafts");
              window.localStorage.removeItem("trainFormData");
            }}
          >
            📋 Черновики
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger mb-3">{error}</div>}

      {isMassCreationMode ? (
        <MassCreationManager initialDetectors="{selectedDetectors}" initialFormData="{formData}" key="{massCreationKey}" loading="{loading}" onReset="{handleResetRegular}" onSubmit="{handleSubmitMass}"/>
      ) : (
        <TrainForm error="{error}" formData="{formData}" isCreateModalOpenComissionDoc="{isCreateModalOpenComissionDoc}" isCreateModalOpenExecDoc="{isCreateModalOpenExecDoc}" isCreateModalOpenOrg="{isCreateModalOpenOrg}" isCreateModalOpenProjectDoc="{isCreateModalOpenProjectDoc}" isCreateModalOpenTeam="{isCreateModalOpenTeam}" key="{regularCreationKey}" loading="{loading}" onBack="{handleBack}" onReset="{handleResetRegular}" onSaveAsDraft="{handleSaveAsDraft}" onSubmit="{handleSubmitRegular}" selectedDetectors="{selectedDetectors}" setFormData="{setFormData}" setIsCreateModalOpenComissionDoc="{setIsCreateModalOpenComissionDoc}" setIsCreateModalOpenExecDoc="{setIsCreateModalOpenExecDoc}" setIsCreateModalOpenOrg="{setIsCreateModalOpenOrg}" setIsCreateModalOpenProjectDoc="{setIsCreateModalOpenProjectDoc}" setIsCreateModalOpenTeam="{setIsCreateModalOpenTeam}" setSelectedDetectors="{setSelectedDetectors}"/>
      )}
    </div>
  );
};

export default AddTrain;
```

## File: src/features/creation/trains/TrainForm.tsx

```typescript
import React, { useState } from "react";
import SearchableInput from "../../../components/ui/SearchableInput";
import { CreateItemModal } from "../../../components/modal/CreateItemModal";
import { CreateDocumentModal } from "../../../components/modal/CreateDocumentModal";
import {
  Organization,
  MaintenanceTeam,
  Document,
  DetectorItem,
  FormDataStation,
  SelectedDetector,
} from "../../../types/domain";

interface TrainFormProps {
  formData: any;
  setFormData: (updater: any) => void;
  selectedDetectors: SelectedDetector[];
  setSelectedDetectors: React.Dispatch<React.SetStateAction<SelectedDetector[]>>;
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

const TrainForm: React.FC<TrainFormProps> = ({
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

  const handleStationChange = (item: FormDataStation) => {
    setFormData((prev: any) => ({
      ...prev,
      stationNumberValue: item?.number?.toString() ?? "",
      stationNameValue: item?.name?.title ?? "",
      stationId: item?.id ?? null,
    }));
  };

  const addDetectorRow = () => {
    setSelectedDetectors((prev) => [...prev, { rowId: localIdCounter, detector: null, quantity: 1 }]);
    setLocalIdCounter((prev) => prev + 1);
  };

  const removeDetectorRow = (rowId: number) => {
    setSelectedDetectors((prev) => prev.filter((item) => item.rowId !== rowId));
  };

  return (
    <form onSubmit={onSubmit} onReset={onReset} className="card p-4 shadow-sm border-0 bg-white">
      {error && <div className="alert alert-danger mb-3">{error}</div>}

      <div className="mb-3">
        <label htmlFor="stationNumber" className="form-label fw-medium">
          Номер станции <span className="text-danger">*</span>
        </label>
        <SearchableInput<FormDataStation>
          endpoint="/stations/all"
          onItemSelected={handleStationChange}
          inputId="stationNumber"
          searchAndShowParam="number"
          commentParam={(item) => item?.name?.title ?? ""}
          isRequired={true}
          showAfterReload={formData.stationNumberValue ?? ""}
        />
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label htmlFor="orgTrain" className="form-label fw-medium">
            Организация <span className="text-danger">*</span>
          </label>
          <div className="input-group">
            <SearchableInput<Organization>
              endpoint="/orgs/all"
              commentParam="shortTitle"
              onItemSelected={(item) => setFormData((p: any) => ({ ...p, org: item }))}
              inputId="orgTrain"
              isRequired={true}
              showAfterReload={formData.org?.title ?? ""}
            />
            <button type="button" className="btn btn-outline-success" onClick={() => setIsCreateModalOpenOrg(true)}>
              <i className="bi bi-plus-lg"></i>
            </button>
          </div>
        </div>

        <div className="col-md-6">
          <label htmlFor="mteamTrain" className="form-label fw-medium">
            Обслуживающая бригада <span className="text-danger">*</span>
          </label>
          <div className="input-group">
            <SearchableInput<MaintenanceTeam>
              endpoint="/maintenance_teams/all"
              commentParam="orgShortTitle"
              onItemSelected={(item) => setFormData((p: any) => ({ ...p, mteam: item }))}
              inputId="mteamTrain"
              isRequired={true}
              showAfterReload={formData.mteam?.title ?? ""}
            />
            <button type="button" className="btn btn-outline-success" onClick={() => setIsCreateModalOpenTeam(true)}>
              <i className="bi bi-plus-lg"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <label htmlFor="trainNumber" className="form-label fw-medium">
            Номер шлейфа <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            id="trainNumber"
            className="form-control"
            required
            value={formData.number ?? ""}
            onChange={(e) => setFormData((p: any) => ({ ...p, number: e.target.value }))}
            placeholder="0"
          />
        </div>
        <div className="col-md-4">
          <label htmlFor="length" className="form-label fw-medium">Длина шлейфа</label>
          <input
            type="number"
            min="0"
            id="length"
            className="form-control"
            value={formData.length ?? ""}
            onChange={(e) => setFormData((p: any) => ({ ...p, length: e.target.value === "" ? null : parseInt(e.target.value, 10) }))}
            placeholder="0"
          />
        </div>
        <div className="col-md-4">
          <label htmlFor="hidden" className="form-label fw-medium">Под потолком</label>
          <select
            id="hidden"
            className="form-select"
            value={String(formData.hidden)}
            onChange={(e) => setFormData((p: any) => ({ ...p, hidden: e.target.value === "true" }))}
          >
            <option value="false">Нет</option>
            <option value="true">Да</option>
          </select>
        </div>
      </div>

      <div className="border rounded p-3 mb-3 bg-light">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="mb-0 fw-bold">Датчики</h6>
          <button type="button" className="btn btn-sm btn-outline-success" onClick={addDetectorRow}>
            + Добавить
          </button>
        </div>
        {selectedDetectors.map((item, index) => (
          <div key={item.rowId} className="row g-2 align-items-end mb-2">
            <div className="col-md-8">
              <SearchableInput<DetectorItem>
                endpoint="/detectors/all"
                onItemSelected={(data) =>
                  setSelectedDetectors((prev) =>
                    prev.map((d) => (d.rowId === item.rowId ? { ...d, detector: data } : d))
                  )
                }
                inputId={`det-${item.rowId}`}
                showAfterReload={item.detector?.title ?? ""}
              />
            </div>
            <div className="col-md-3">
              <input
                type="number"
                min="1"
                className="form-control"
                value={item.quantity || ""}
                onChange={(e) =>
                  setSelectedDetectors((prev) =>
                    prev.map((d) =>
                      d.rowId === item.rowId ? { ...d, quantity: parseInt(e.target.value) || 0 } : d
                    )
                  )
                }
                placeholder="Кол-во"
              />
            </div>
            <div className="col-md-1">
              <button type="button" className="btn btn-outline-danger w-100" onClick={() => removeDetectorRow(item.rowId)}>
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-3">
        <label htmlFor="commentTrain" className="form-label fw-medium">Комментарий</label>
        <textarea
          id="commentTrain"
          className="form-control"
          rows={3}
          value={formData.comment ?? ""}
          onChange={(e) => setFormData((p: any) => ({ ...p, comment: e.target.value }))}
        />
      </div>

      <div className="d-flex align-items-center gap-2">
        <button type="submit" className="btn btn-success" disabled={loading}>
          {loading ? "Сохранение..." : "Сохранить"}
        </button>
        <button type="button" className="btn btn-outline-secondary" onClick={onSaveAsDraft}>
          В черновик
        </button>
        <button type="reset" className="btn btn-outline-warning">
          Сбросить
        </button>
        <button type="button" className="btn btn-secondary ms-auto" onClick={onBack}>
          Назад
        </button>
      </div>

      <CreateItemModal<Organization>
        isOpen={isCreateModalOpenOrg}
        onClose={() => setIsCreateModalOpenOrg(false)}
        endPoint="/orgs"
        onSuccess={() => {}}
        headers={[{ key: "title", label: "Полное наименование" }]}
        initialData={{ title: "", shortTitle: "", responsible: "", jobTitle: "", comment: "", deleted: false }}
        onCreated={(org) => setFormData((p: any) => ({ ...p, org }))}
      />
      <CreateItemModal<MaintenanceTeam>
        isOpen={isCreateModalOpenTeam}
        onClose={() => setIsCreateModalOpenTeam(false)}
        endPoint="/maintenance_teams"
        onSuccess={() => {}}
        headers={[{ key: "title", label: "Название бригады" }]}
        initialData={{ title: "", comment: "", deleted: false }}
        onCreated={(mteam) => setFormData((p: any) => ({ ...p, mteam }))}
      />
    </form>
  );
};

export default TrainForm;
```

## File: src/features/creation/AddStations.tsx

```typescript
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance, useAxiosInterceptor } from "../../api/axios";
import SearchableInput from "../../components/ui/SearchableInput";
import WorkTypesForm from "../../modules/WorkTypesForm";
import { CreateItemModal } from "../../components/modal/CreateItemModal";
import { CreateDocumentModal } from "../../components/modal/CreateDocumentModal";
import { RequestCustom, MaintenanceTeam as Station, WorkTypes } from "../../types/domain";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import GetInitialValue from "../../utils/GetInitialValue";
import { searchableConfigs } from "../../utils/searchableConfig";
import axios from "axios";

const AddStations = ({ endPoint }: RequestCustom) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpenTeam, setisCreateModalOpenTeam] = useState(false);
  const [isCreateModalOpenName, setisCreateModalOpenName] = useState(false);
  const [isCreateModalOpenExecDoc, setisCreateModalOpenExecDoc] = useState(false);
  const [isCreateModalOpenProjectDoc, setisCreateModalOpenProjectDoc] = useState(false);
  const [isCreateModalOpenComissionDoc, setisCreateModalOpenComissionDoc] = useState(false);

  const [station, setStation] = useState<Station>({ id: 0, title: "", comment: "", deleted: false });
  const [projectDoc, setProjectDoc] = useState<any | null>(null);
  const [commissioningAct, setCommissioningAct] = useState<any | null>(null);
  const [executiveDoc, setExecutiveDoc] = useState<any | null>(null);

  const [formData, setFormData] = useLocalStorage<any>(
    "addStation",
    GetInitialValue("addStation", {
      name: null,
      type: "",
      number: null,
      capacity: null,
      objectsNumberFrom: null,
      objectsNumberTo: null,
      inventoryNumber: "",
      installationLocation: "",
      comment: "",
      sound: null,
      light: null,
      voice: null,
      lightSound: null,
      mteam: null,
    })
  );
  const [resultData, setResultData] = useState<WorkTypes[] null |>(null);

  const navigate = useNavigate();
  useAxiosInterceptor();
  const DRAFTS_STORAGE_KEY = "objectPsOsOps_drafts_list";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.number || !formData.type) {
      setError("Номер и тип станции обязательны");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const finalData = {
        stationNameId: formData.name?.id,
        stationType: formData.type,
        maintenanceTeamId: formData.mteam,
        number: formData.number,
        capacity: formData.capacity,
        objectsNumberFrom: formData.objectsNumberFrom,
        objectsNumberTo: formData.objectsNumberTo,
        inventoryNumber: formData.inventoryNumber,
        installationLocation: formData.installationLocation,
        comment: formData.comment,
        sound: formData.sound,
        light: formData.light,
        voice: formData.voice,
        lightSound: formData.lightSound,
        commissionDocId: formData.commissionDoc,
        projectDocId: formData.projectDoc,
        adminDocId: formData.adminDoc,
        workTypePeriodicity: resultData
          ? resultData.flatMap((wt) =>
              wt.typeMonth?.map((tm) => ({
                workTypeId: wt.workType?.id || null,
                codeId: tm.code?.codeId || null,
                startMonth: tm.startMonth || null,
              })) || []
            )
          : [],
      };

      await axiosInstance.post(endPoint, finalData);
      window.localStorage.removeItem("addStation");
      navigate("/stations");
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Ошибка при сохранении станции");
      } else {
        setError("Неизвестная ошибка");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-3">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/" className="text-decoration-none">Главная</a></li>
          <li className="breadcrumb-item"><a href="/stations" className="text-decoration-none">Учет станций</a></li>
          <li className="breadcrumb-item active" aria-current="page">Форма добавления</li>
        </ol>
      </nav>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 mb-0 fw-bold">Добавить новую станцию учета</h2>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => navigate("/stations/add/drafts")}
        >
          📋 Черновики
        </button>
      </div>

      {error && <div className="alert alert-danger mb-3">{error}</div>}

      <form onSubmit={handleSubmit} className="card p-4 shadow-sm border-0 bg-white">
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label fw-medium">Тип станции <span className="text-danger">*</span></label>
            <select
              className="form-select"
              value={formData.type || ""}
              onChange={(e) => setFormData((p: any) => ({ ...p, type: e.target.value }))}
              required
            >
              <option value="" disabled>Выберите тип...</option>
              <option value="FIRE">ПС</option>
              <option value="SECURITY">ОС</option>
              <option value="FIRE_SECURITY">ОПС</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-medium">Номер станции <span className="text-danger">*</span></label>
            <input
              type="number"
              className="form-control"
              value={formData.number ?? ""}
              onChange={(e) => setFormData((p: any) => ({ ...p, number: e.target.value ? Number(e.target.value) : null }))}
              required
            />
          </div>
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label fw-medium">Обслуживающая бригада</label>
            <div className="input-group">
              <SearchableInput endpoint="{searchableConfigs.maintenanceTeam.endpoint}" onItemSelected="{(item:"> setFormData((p: any) => ({ ...p, mteam: item.id }))}
                commentParam={searchableConfigs.maintenanceTeam.commentParam}
                inputId="maintenanceTeams"
              />
              <button type="button" className="btn btn-outline-success" onClick={() => setisCreateModalOpenTeam(true)}>
                +
              </button>
            </div>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-medium">Наименование станции</label>
            <div className="input-group">
              <SearchableInput endpoint="{searchableConfigs.stationName.endpoint}" onItemSelected="{(item:"> setFormData((p: any) => ({ ...p, name: item }))}
                commentParam={searchableConfigs.stationName.commentParam}
                inputId="name"
              />
              <button type="button" className="btn btn-outline-success" onClick={() => setisCreateModalOpenName(true)}>
                +
              </button>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label fw-medium">Комментарий</label>
          <textarea
            className="form-control"
            rows={3}
            value={formData.comment ?? ""}
            onChange={(e) => setFormData((p: any) => ({ ...p, comment: e.target.value }))}
          />
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-success" disabled={loading}>
            {loading ? "Сохранение..." : "Сохранить"}
          </button>
          <button type="button" className="btn btn-secondary ms-auto" onClick={() => navigate(-1)}>
            Назад
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStations;
```

## File: src/features/creation/AddDetectors.tsx

```typescript
import { useState } from "react";
import { axiosInstance, useAxiosInterceptor } from "../../api/axios";
import { useNavigate } from "react-router-dom";
import SearchableInput from "../../components/ui/SearchableInput";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import axios from "axios";

interface AddDetectorsProps {
  endPoint: string;
}

const AddDetectors = ({ endPoint }: AddDetectorsProps) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useAxiosInterceptor();

  const [formData, setFormData] = useLocalStorage<any>("addDetector", {
    title: "",
    laboriousness: null,
    purpose: "",
    type: null,
    comment: null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await axiosInstance.post(endPoint, {
        title: formData.title,
        laboriousness: formData.laboriousness,
        purpose: formData.purpose,
        type: formData.type?.id ?? null,
        comment: formData.comment,
        deleted: false,
      });
      window.localStorage.removeItem("addDetector");
      navigate("/detectors");
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Ошибка при сохранении датчика");
      } else {
        setError("Неизвестная ошибка");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-3">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/" className="text-decoration-none">Главная</a></li>
          <li className="breadcrumb-item"><a href={endPoint} className="text-decoration-none">Датчики</a></li>
          <li className="breadcrumb-item active" aria-current="page">Создать извещатель</li>
        </ol>
      </nav>
      <h2 className="h4 mb-4 fw-bold">Форма создания извещателя или датчика</h2>

      {error && <div className="alert alert-danger mb-3">{error}</div>}

      <form onSubmit={handleSubmit} className="card p-4 shadow-sm border-0 bg-white">
        <div className="mb-3">
          <label className="form-label fw-medium">Наименование датчика <span className="text-danger">*</span></label>
          <input
            type="text"
            className="form-control"
            value={formData.title}
            onChange={(e) => setFormData((p: any) => ({ ...p, title: e.target.value }))}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-medium">Трудоемкость <span className="text-danger">*</span></label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="form-control"
            value={formData.laboriousness ?? ""}
            onChange={(e) => setFormData((p: any) => ({ ...p, laboriousness: e.target.value ? parseFloat(e.target.value) : null }))}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-medium">Назначение датчика <span className="text-danger">*</span></label>
          <input
            type="text"
            className="form-control"
            value={formData.purpose}
            onChange={(e) => setFormData((p: any) => ({ ...p, purpose: e.target.value }))}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-medium">Тип датчика <span className="text-danger">*</span></label>
          <SearchableInput endpoint="/detector_types/all" onItemSelected="{(item)"> setFormData((p: any) => ({ ...p, type: item }))}
            inputId="detectorType"
            isRequired={true}
            showAfterReload={formData.type?.title ?? ""}
          />
        </div>

        <div className="mb-4">
          <label className="form-label fw-medium">Комментарий</label>
          <textarea
            className="form-control"
            rows={3}
            value={formData.comment ?? ""}
            onChange={(e) => setFormData((p: any) => ({ ...p, comment: e.target.value }))}
          />
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-success" disabled={loading}>
            {loading ? "Сохранение..." : "Сохранить"}
          </button>
          <button type="button" className="btn btn-secondary ms-auto" onClick={() => navigate(-1)}>
            Назад
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDetectors;
```

## File: src/features/creation/AddDocument.tsx

```typescript
import { useState } from "react";
import { axiosInstance, useAxiosInterceptor } from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../../hooks/useLocalStorage";

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
export const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx", "xls", "xlsx"];

const AddDocument = ({ endPoint }: { endPoint: string }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File null |>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  useAxiosInterceptor();

  const [formData, setFormData] = useLocalStorage<any>("add" + endPoint.replace("/", ""), {
    title: "",
    comment: "",
    documentType: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!ALLOWED_FILE_TYPES.includes(file.type) || !ALLOWED_EXTENSIONS.includes(ext || "")) {
        setFileError("Недопустимый формат файла");
        setSelectedFile(null);
        setFileName("");
        return;
      }
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !formData.title || !formData.documentType) {
      setError("Заполните обязательные поля и выберите файл");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = new FormData();
      data.append("file", selectedFile);
      data.append("title", formData.title);
      data.append("comment", formData.comment || "");
      data.append("documentType", formData.documentType);

      await axiosInstance.post(endPoint, data, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (p) => {
          if (p.total) setUploadProgress(Math.round((p.loaded * 100) / p.total));
        },
      });

      window.localStorage.removeItem("add" + endPoint.replace("/", ""));
      navigate("/documents");
    } catch (err: any) {
      setError("Ошибка при отправке: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="container-fluid py-3">
      <h2 className="h4 mb-4 fw-bold">Создать документ</h2>
      {error && <div className="alert alert-danger mb-3">{error}</div>}

      <form onSubmit={handleSubmit} className="card p-4 shadow-sm border-0 bg-white">
        <div className="mb-3">
          <label className="form-label fw-medium">Название документа <span className="text-danger">*</span></label>
          <input
            type="text"
            className="form-control"
            value={formData.title}
            onChange={(e) => setFormData((p: any) => ({ ...p, title: e.target.value }))}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-medium">Файл (PDF, Word, Excel) <span className="text-danger">*</span></label>
          <input type="file" className="form-control" onChange={handleFileChange} required accept=".pdf,.doc,.docx,.xls,.xlsx" />
          {fileName && <div className="small text-muted mt-1">Выбран: {fileName}</div>}
          {fileError && <div className="text-danger small mt-1">{fileError}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label fw-medium">Тип документа <span className="text-danger">*</span></label>
          <select
            className="form-select"
            value={formData.documentType}
            onChange={(e) => setFormData((p: any) => ({ ...p, documentType: e.target.value }))}
            required
          >
            <option value="" disabled>Выберите тип...</option>
            <option value="ADMIN">Исполнительная документация</option>
            <option value="COMMISSION">Акт ввода в эксплуатацию</option>
            <option value="PROJECT">Проектная документация</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="form-label fw-medium">Комментарий</label>
          <textarea
            className="form-control"
            rows={3}
            value={formData.comment}
            onChange={(e) => setFormData((p: any) => ({ ...p, comment: e.target.value }))}
          />
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-success" disabled={loading}>
            {loading ? `Загрузка ${uploadProgress}%` : "Сохранить"}
          </button>
          <button type="button" className="btn btn-secondary ms-auto" onClick={() => navigate(-1)}>
            Назад
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDocument;
```

## File: src/features/creation/AddMaintenanceType.tsx

```typescript
import { useState, useEffect } from "react";
import { axiosInstance, useAxiosInterceptor } from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../../hooks/useLocalStorage";

const AddMaintenanceType = ({ endPoint }: { endPoint: string }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [allCodes, setAllCodes] = useState<any[]>([]);
  const navigate = useNavigate();
  useAxiosInterceptor();

  const [formData, setFormData] = useLocalStorage<any>("addMaintenanceType", {
    title: "",
    codes: [],
    workTypeFor: "",
    comment: null,
  });

  useEffect(() => {
    axiosInstance.get("/work_type_codes/all").then((res) => setAllCodes(res.data || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || formData.codes.length === 0 || !formData.workTypeFor) {
      setError("Заполните все обязательные поля и выберите виды работ");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await axiosInstance.post(endPoint, formData);
      window.localStorage.removeItem("addMaintenanceType");
      navigate("/work_types");
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка при сохранении");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-3">
      <h2 className="h4 mb-4 fw-bold">Форма добавления регламентной работы</h2>
      {error && <div className="alert alert-danger mb-3">{error}</div>}

      <form onSubmit={handleSubmit} className="card p-4 shadow-sm border-0 bg-white">
        <div className="mb-3">
          <label className="form-label fw-medium">Наименование вида работ <span className="text-danger">*</span></label>
          <input
            type="text"
            className="form-control"
            value={formData.title || ""}
            onChange={(e) => setFormData((p: any) => ({ ...p, title: e.target.value }))}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-medium">Тип субъекта <span className="text-danger">*</span></label>
          <select
            className="form-select"
            value={formData.workTypeFor || ""}
            onChange={(e) => setFormData((p: any) => ({ ...p, workTypeFor: e.target.value }))}
            required
          >
            <option value="" disabled>Выберите тип...</option>
            <option value="TRAIN">Шлейф</option>
            <option value="STATION">Станция</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="form-label fw-medium">Комментарий</label>
          <textarea
            className="form-control"
            rows={3}
            value={formData.comment || ""}
            onChange={(e) => setFormData((p: any) => ({ ...p, comment: e.target.value }))}
          />
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-success" disabled={loading}>
            {loading ? "Сохранение..." : "Сохранить"}
          </button>
          <button type="button" className="btn btn-secondary ms-auto" onClick={() => navigate(-1)}>
            Назад
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMaintenanceType;
```

## File: src/features/creation/AddMTeam.tsx

```typescript
import { useState } from "react";
import { axiosInstance, useAxiosInterceptor } from "../../api/axios";
import { useNavigate } from "react-router-dom";
import SearchableInput from "../../components/ui/SearchableInput";
import { Organization } from "../../types/domain";

interface AddMTeamProps {
  endPoint: string;
  prevPage: string;
  title: string;
  titleLabel: string;
  placeHolder: string;
}

const AddMTeam = ({ endPoint, title, titleLabel, placeHolder }: AddMTeamProps) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useAxiosInterceptor();

  const [formData, setFormData] = useState({
    title: "",
    comment: null as string | null,
    org: null as Organization | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.org?.id) {
      setError("Заполните название бригады и выберите организацию");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await axiosInstance.post(endPoint, {
        title: formData.title,
        orgId: formData.org.id,
        comment: formData.comment,
      });
      navigate("/maintenance_teams");
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка сохранения");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-3">
      <h2 className="h4 mb-4 fw-bold">{title}</h2>
      {error && <div className="alert alert-danger mb-3">{error}</div>}

      <form onSubmit={handleSubmit} className="card p-4 shadow-sm border-0 bg-white">
        <div className="mb-3">
          <label className="form-label fw-medium">{titleLabel} <span className="text-danger">*</span></label>
          <input
            type="text"
            className="form-control"
            value={formData.title}
            onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
            placeholder={placeHolder}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-medium">Организация <span className="text-danger">*</span></label>
          <SearchableInput<Organization>
            endpoint="/orgs/all"
            onItemSelected={(org) => setFormData((p) => ({ ...p, org }))}
            commentParam="shortTitle"
            inputId="orgTeam"
            isRequired={true}
          />
        </div>

        <div className="mb-4">
          <label className="form-label fw-medium">Комментарий</label>
          <textarea
            className="form-control"
            rows={3}
            value={formData.comment || ""}
            onChange={(e) => setFormData((p) => ({ ...p, comment: e.target.value }))}
          />
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-success" disabled={loading}>
            {loading ? "Сохранение..." : "Сохранить"}
          </button>
          <button type="button" className="btn btn-secondary ms-auto" onClick={() => navigate(-1)}>
            Назад
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMTeam;
```

## File: src/features/creation/AddOneField.tsx

```typescript
import { useState } from "react";
import { axiosInstance, useAxiosInterceptor } from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../../hooks/useLocalStorage";

interface AddOneFieldProps {
  endPoint: string;
  prevPage: string;
  title: string;
  titleLabel: string;
  placeHolder: string;
}

const AddOneField = ({ endPoint, title, titleLabel, placeHolder }: AddOneFieldProps) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useAxiosInterceptor();

  const [formData, setFormData] = useLocalStorage<any>("add" + endPoint.replace("/", ""), {
    title: "",
    comment: null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Поле наименования обязательно");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await axiosInstance.post(endPoint, formData);
      window.localStorage.removeItem("add" + endPoint.replace("/", ""));
      navigate(-1);
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка сохранения");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-3">
      <h2 className="h4 mb-4 fw-bold">{title}</h2>
      {error && <div className="alert alert-danger mb-3">{error}</div>}

      <form onSubmit={handleSubmit} className="card p-4 shadow-sm border-0 bg-white">
        <div className="mb-3">
          <label className="form-label fw-medium">{titleLabel} <span className="text-danger">*</span></label>
          <input
            type="text"
            className="form-control"
            value={formData.title}
            onChange={(e) => setFormData((p: any) => ({ ...p, title: e.target.value }))}
            placeholder={placeHolder}
            required
          />
        </div>

        <div className="mb-4">
          <label className="form-label fw-medium">Комментарий</label>
          <textarea
            className="form-control"
            rows={3}
            value={formData.comment || ""}
            onChange={(e) => setFormData((p: any) => ({ ...p, comment: e.target.value }))}
          />
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-success" disabled={loading}>
            {loading ? "Сохранение..." : "Сохранить"}
          </button>
          <button type="button" className="btn btn-secondary ms-auto" onClick={() => navigate(-1)}>
            Назад
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddOneField;
```

## File: src/features/creation/AddOrg.tsx

```typescript
import { useState } from "react";
import { axiosInstance, useAxiosInterceptor } from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { Organization } from "../../types/domain";

const AddOrg = ({ endPoint }: { endPoint: string }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useAxiosInterceptor();

  const [formData, setFormData] = useLocalStorage<Organization>("addOrg", {
    title: "",
    shortTitle: "",
    responsible: "",
    jobTitle: "",
    comment: "",
    deleted: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Полное наименование организации обязательно");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await axiosInstance.post(endPoint, formData);
      window.localStorage.removeItem("addOrg");
      navigate("/orgs");
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка сохранения");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-3">
      <h2 className="h4 mb-4 fw-bold">Форма добавления организации / подразделения</h2>
      {error && <div className="alert alert-danger mb-3">{error}</div>}

      <form onSubmit={handleSubmit} className="card p-4 shadow-sm border-0 bg-white">
        <div className="mb-3">
          <label className="form-label fw-medium">Полное наименование <span className="text-danger">*</span></label>
          <input
            type="text"
            className="form-control"
            value={formData.title}
            onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-medium">Сокращенное наименование</label>
          <input
            type="text"
            className="form-control"
            value={formData.shortTitle}
            onChange={(e) => setFormData((p) => ({ ...p, shortTitle: e.target.value }))}
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-medium">Ф.И.О. ответственного лица</label>
          <input
            type="text"
            className="form-control"
            value={formData.responsible}
            onChange={(e) => setFormData((p) => ({ ...p, responsible: e.target.value }))}
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-medium">Должность</label>
          <input
            type="text"
            className="form-control"
            value={formData.jobTitle}
            onChange={(e) => setFormData((p) => ({ ...p, jobTitle: e.target.value }))}
          />
        </div>

        <div className="mb-4">
          <label className="form-label fw-medium">Комментарий</label>
          <textarea
            className="form-control"
            rows={3}
            value={formData.comment}
            onChange={(e) => setFormData((p) => ({ ...p, comment: e.target.value }))}
          />
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-success" disabled={loading}>
            {loading ? "Сохранение..." : "Сохранить"}
          </button>
          <button type="button" className="btn btn-secondary ms-auto" onClick={() => navigate(-1)}>
            Назад
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddOrg;
```

## File: src/features/reports/ExcelPreview.tsx

```typescript
import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

interface ExcelPreviewProps {
  fileBuffer: ArrayBuffer | null;
  fileName?: string;
  isShowDownload?: boolean;
}

const ExcelPreview: React.FC<ExcelPreviewProps> = ({
  fileBuffer,
  fileName = "document.xlsx",
  isShowDownload = true,
}) => {
  const [sheets, setSheets] = useState<{ name: string; html: string }[]>([]);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);

  useEffect(() => {
    if (!fileBuffer) {
      setSheets([]);
      return;
    }

    try {
      const workbook = XLSX.read(fileBuffer, { type: "array" });
      const parsedSheets = workbook.SheetNames.map((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const html = XLSX.utils.sheet_to_html(worksheet, { header: "" });
        return { name: sheetName, html };
      });

      setSheets(parsedSheets);
      setActiveSheetIndex(0);
    } catch (e) {
      console.error("Ошибка при парсинге XLSX файла:", e);
      setSheets([]);
    }
  }, [fileBuffer]);

  const handleDownload = () => {
    if (!fileBuffer) return;
    const blob = new Blob([fileBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (!fileBuffer) {
    return (
      <div className="text-center p-5 text-muted bg-white rounded border">
        <i className="bi bi-file-earmark-excel fs-1 text-success d-block mb-2"></i>
        Данные табличного документа не загружены
      </div>
    );
  }

  return (
    <div className="card shadow-sm border-0 bg-white mt-3">
      {isShowDownload && (
        <div className="card-header bg-light d-flex justify-content-between align-items-center py-2 px-3">
          <span className="fw-medium text-truncate" style={{ maxWidth: "70%" }}>
            <i className="bi bi-file-earmark-excel text-success me-2"></i>
            {fileName}
          </span>
          <button type="button" className="btn btn-sm btn-success d-flex align-items-center gap-1" onClick={handleDownload}>
            <i className="bi bi-download"></i> Скачать файл
          </button>
        </div>
      )}

      {sheets.length > 1 && (
        <div className="card-header bg-white border-bottom py-2">
          <ul className="nav nav-pills nav-sm">
            {sheets.map((sheet, idx) => (
              <li key={sheet.name} className="nav-item me-1">
                <button
                  type="button"
                  className={`nav-link py-1 px-3 small ${idx === activeSheetIndex ? "active" : "bg-light text-dark"}`}
                  onClick={() => setActiveSheetIndex(idx)}
                >
                  {sheet.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card-body p-0">
        {sheets.length > 0 ? (
          <div
            className="table-responsive p-3"
            style={{ maxHeight: "60vh", overflow: "auto" }}
            dangerouslySetInnerHTML={{ __html: sheets[activeSheetIndex]?.html || "" }}
          />
        ) : (
          <div className="text-center p-4 text-muted">Не удалось отобразить листы документа</div>
        )}
      </div>
    </div>
  );
};

export default ExcelPreview;
```

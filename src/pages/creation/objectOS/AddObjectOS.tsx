import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance, useAxiosInterceptor } from "../../../api/client";
import { useFormState } from "../../../hooks/useFormState";
import {
  FormDataObjectOS,
  SelectedDetector,
  MassCreationForm,
} from "../../../types/creation";
import ObjectOSForm from "./ObjectOSForm";
import MassCreationManagerObjectOS from "./MassCreationManagerObjectOS";
import {
  prepareObjectOSData,
  validateObjectOS,
} from "../../../utils/prepareObjectOSData";

const DRAFTS_STORAGE_KEY = "objectOS_drafts_list";

const initialFormData: FormDataObjectOS = {
  org: {
    title: "",
    shortTitle: "",
    responsible: "",
    jobTitle: "",
    comment: "",
    deleted: false,
  },
  number: null,
  name: "",
  coordinates: "",
  phone: "",
  dateEntered: "",
  dateAdjusted: "",
  comment: "",
  adminDoc: null,
  commissionDoc: null,
  projectDoc: null,
  station: null,
  adminStation: null,
  deleted: false,
  mteam: { title: "", comment: "", deleted: false },
};

export const AddObjectOS: React.FC<{ endPoint: string }> = ({ endPoint }) => {
  const navigate = useNavigate();
  useAxiosInterceptor();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMassCreationMode, setIsMassCreationMode] = useState(false);
  const [massCreationKey, setMassCreationKey] = useState(0);
  const [regularCreationKey, setRegularCreationKey] = useState(0);

  const {
    data: formData,
    setData: setFormData,
    reset: resetForm,
  } = useFormState<FormDataObjectOS>("objectOSFormData", initialFormData);

  const [selectedDetectors, setSelectedDetectors] = useState<
    SelectedDetector[]
  >([]);

  // Модальные окна
  const [isCreateModalOpenTeam, setIsCreateModalOpenTeam] = useState(false);
  const [isCreateModalOpenOrg, setIsCreateModalOpenOrg] = useState(false);
  const [isCreateModalOpenExecDoc, setIsCreateModalOpenExecDoc] =
    useState(false);
  const [isCreateModalOpenProjectDoc, setIsCreateModalOpenProjectDoc] =
    useState(false);
  const [isCreateModalOpenComissionDoc, setIsCreateModalOpenComissionDoc] =
    useState(false);

  useEffect(() => {
    const draftRaw = localStorage.getItem("temp_load_draft");
    if (draftRaw) {
      try {
        const parsed = JSON.parse(draftRaw);
        setFormData(parsed.formData);
        if (parsed.selectedDetectors) {
          setSelectedDetectors(parsed.selectedDetectors);
        }
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
      selectedDetectors,
    };
    localStorage.setItem(
      DRAFTS_STORAGE_KEY,
      JSON.stringify([...currentDrafts, newDraft]),
    );
    alert("Объект ОС сохранен в черновики");
  };

  const handleSubmitRegular = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const missing = validateObjectOS(formData);
    if (missing.length > 0) {
      setError(`Заполните обязательные поля: ${missing.join(", ")}`);
      setLoading(false);
      return;
    }

    try {
      const finalData = prepareObjectOSData(formData, selectedDetectors);
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

      window.localStorage.removeItem("objectOSFormData");
      navigate("/subjects");
    } catch (err: any) {
      console.error("Ошибка создания объекта ОС:", err);
      setError(err.response?.data?.message || "Ошибка сохранения объекта");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMass = async (
    updateForm: (
      id: number,
      updates: Partial<MassCreationForm<FormDataObjectOS>>,
    ) => void,
    forms: MassCreationForm<FormDataObjectOS>[],
  ) => {
    setLoading(true);
    setError(null);

    const pendingForms = forms.filter((f) => f.status !== "success");

    for (const form of pendingForms) {
      updateForm(form.id, { status: "submitting", errorMessage: undefined });
      try {
        const finalData = prepareObjectOSData(
          form.formData,
          form.selectedDetectors,
        );
        await axiosInstance.post(endPoint, finalData);
        updateForm(form.id, { status: "success" });
      } catch (err: any) {
        const msg =
          err.response?.data?.message || err.message || "Ошибка сохранения";
        updateForm(form.id, { status: "error", errorMessage: msg });
        setError(`Ошибка при создании объекта #${form.id}: ${msg}`);
      }
    }

    setLoading(false);
    const allSuccess = forms.every((f) => f.status === "success");
    if (allSuccess) {
      window.localStorage.removeItem("objectOSFormData");
      navigate("/subjects");
    }
  };

  const handleToggleMassCreation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked;
    resetForm();
    setSelectedDetectors([]);
    if (enabled) {
      setMassCreationKey((p) => p + 1);
    } else {
      setRegularCreationKey((p) => p + 1);
    }
    setIsMassCreationMode(enabled);
  };

  return (
    <div className="container mt-2">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="/">Главная</a>
          </li>
          <li className="breadcrumb-item">
            <a href="/subjects">Учет объектов ОС</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Форма добавления объекта ОС
          </li>
        </ol>
      </nav>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Добавить новый объект ОС</h3>
        <div className="d-flex align-items-center gap-3">
          <div className="form-check form-switch mb-0">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id="switchObjMass"
              checked={isMassCreationMode}
              onChange={handleToggleMassCreation}
            />
            <label
              className="form-check-label user-select-none"
              htmlFor="switchObjMass"
            >
              Массовое создание
            </label>
          </div>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => {
              navigate("/subjects/add/drafts");
              window.localStorage.removeItem("objectOSFormData");
            }}
          >
            <i className="bi bi-archive me-1"></i> Черновики
          </button>
        </div>
      </div>

      {isMassCreationMode ? (
        <MassCreationManagerObjectOS
          key={massCreationKey}
          initialFormData={formData}
          initialDetectors={selectedDetectors}
          onSubmit={handleSubmitMass}
          onReset={() => {
            resetForm();
            setSelectedDetectors([]);
          }}
          loading={loading}
        />
      ) : (
        <ObjectOSForm
          key={regularCreationKey}
          formData={formData}
          setFormData={setFormData}
          selectedDetectors={selectedDetectors}
          setSelectedDetectors={setSelectedDetectors}
          onSubmit={handleSubmitRegular}
          onReset={() => {
            resetForm();
            setSelectedDetectors([]);
          }}
          onSaveAsDraft={handleSaveAsDraft}
          onBack={() => navigate("/subjects")}
          loading={loading}
          error={error}
          isCreateModalOpenTeam={isCreateModalOpenTeam}
          setIsCreateModalOpenTeam={setIsCreateModalOpenTeam}
          isCreateModalOpenOrg={isCreateModalOpenOrg}
          setIsCreateModalOpenOrg={setIsCreateModalOpenOrg}
          isCreateModalOpenExecDoc={isCreateModalOpenExecDoc}
          setIsCreateModalOpenExecDoc={setIsCreateModalOpenExecDoc}
          isCreateModalOpenProjectDoc={isCreateModalOpenProjectDoc}
          setIsCreateModalOpenProjectDoc={setIsCreateModalOpenProjectDoc}
          isCreateModalOpenComissionDoc={isCreateModalOpenComissionDoc}
          setIsCreateModalOpenComissionDoc={setIsCreateModalOpenComissionDoc}
        />
      )}
    </div>
  );
};

export default AddObjectOS;

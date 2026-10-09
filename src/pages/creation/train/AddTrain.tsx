import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance, useAxiosInterceptor } from "../../../api/client";
import TrainForm from "./TrainForm";
import MassCreationManager from "./MassCreationManager";
import { useTrainFormState } from "../../../hooks/useTrainFormState";
import {
  prepareFinalData,
  validateRequiredFields,
} from "../../../utils/prepareTrainData";
import {
  RequestCustom,
  MassCreationForm,
  FormDataTrain,
} from "../../../types/creation";

const DRAFTS_STORAGE_KEY = "objectPS_drafts_list";

export const AddTrain: React.FC<RequestCustom> = ({ endPoint }) => {
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

  // Модальные окна
  const [isCreateModalOpenTeam, setIsCreateModalOpenTeam] = useState(false);
  const [isCreateModalOpenOrg, setIsCreateModalOpenOrg] = useState(false);
  const [isCreateModalOpenExecDoc, setIsCreateModalOpenExecDoc] =
    useState(false);
  const [isCreateModalOpenProjectDoc, setIsCreateModalOpenProjectDoc] =
    useState(false);
  const [isCreateModalOpenComissionDoc, setIsCreateModalOpenComissionDoc] =
    useState(false);

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
    alert("Шлейф сохранен в черновики");
  };

  const handleSubmitRegular = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const missingFields = validateRequiredFields(formData);
    if (missingFields.length > 0) {
      setError(`Заполните обязательные поля: ${missingFields.join(", ")}`);
      setLoading(false);
      return;
    }

    try {
      const finalData = prepareFinalData(formData, selectedDetectors);
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

      window.localStorage.removeItem("trainFormData");
      navigate("/trains");
    } catch (err: any) {
      console.error("Ошибка сохранения шлейфа:", err);
      setError(err.response?.data?.message || "Ошибка сохранения шлейфа");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMass = async (
    updateForm: (
      id: number,
      updates: Partial<MassCreationForm<FormDataTrain>>,
    ) => void,
    forms: MassCreationForm<FormDataTrain>[],
  ) => {
    setLoading(true);
    setError(null);

    const pendingForms = forms.filter((f) => f.status !== "success");

    for (const form of pendingForms) {
      updateForm(form.id, { status: "submitting", errorMessage: undefined });
      try {
        const finalData = prepareFinalData(
          form.formData,
          form.selectedDetectors,
        );
        await axiosInstance.post(endPoint, finalData);
        updateForm(form.id, { status: "success" });
      } catch (err: any) {
        const msg =
          err.response?.data?.message || err.message || "Ошибка сохранения";
        updateForm(form.id, { status: "error", errorMessage: msg });
        setError(`Ошибка при сохранении шлейфа #${form.id}: ${msg}`);
      }
    }

    setLoading(false);
    const allSuccess = forms.every((f) => f.status === "success");
    if (allSuccess) {
      window.localStorage.removeItem("trainFormData");
      navigate("/trains");
    }
  };

  const handleToggleMassCreation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked;
    resetForm();
    if (enabled) {
      setMassCreationKey((prev) => prev + 1);
    } else {
      setRegularCreationKey((prev) => prev + 1);
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
            <a href="/trains">Учет шлейфов</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Форма добавления шлейфа
          </li>
        </ol>
      </nav>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Добавить новый шлейф</h3>
        <div className="d-flex align-items-center gap-3">
          <div className="form-check form-switch mb-0">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id="switchTrainMass"
              checked={isMassCreationMode}
              onChange={handleToggleMassCreation}
            />
            <label
              className="form-check-label user-select-none"
              htmlFor="switchTrainMass"
            >
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
            <i className="bi bi-archive me-1"></i> Черновики
          </button>
        </div>
      </div>

      {isMassCreationMode ? (
        <MassCreationManager
          key={massCreationKey}
          initialFormData={formData}
          initialDetectors={selectedDetectors}
          onSubmit={handleSubmitMass}
          onReset={resetForm}
          loading={loading}
        />
      ) : (
        <TrainForm
          key={regularCreationKey}
          formData={formData}
          setFormData={setFormData as any}
          selectedDetectors={selectedDetectors}
          setSelectedDetectors={setSelectedDetectors}
          onSubmit={handleSubmitRegular}
          onReset={resetForm}
          onSaveAsDraft={handleSaveAsDraft}
          onBack={() => navigate("/trains")}
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

export default AddTrain;

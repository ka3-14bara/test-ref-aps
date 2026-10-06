// AddTrain.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance, useAxiosInterceptor } from "../../../api/axios";
import axios from "axios";
import TrainForm from "./TrainForm";
import MassCreationManager from "./MassCreationManager";
import { useTrainFormState } from "../../../hooks/useTrainFormState";
import { prepareFinalData, validateRequiredFields } from "../../../utils/prepareTrainData";
import { RequestCustom } from "../AddTypes"; // предполагаемый импорт

const DRAFTS_STORAGE_KEY = "objectPS_drafts_list";

const AddTrain = ({ endPoint }: RequestCustom) => {
  const navigate = useNavigate();
  useAxiosInterceptor();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMassCreationMode, setIsMassCreationMode] = useState(false);
  const [massCreationKey, setMassCreationKey] = useState(0);
  const [regularCreationKey, setRegularCreationKey] = useState(0);

  // Состояние обычной формы (с сохранением в localStorage)
  const {
    formData,
    setFormData,
    selectedDetectors,
    setSelectedDetectors,
    //resultData,
    //setResultData,
    resetForm,
  } = useTrainFormState("trainFormData");

  // Состояния модальных окон
  const [isCreateModalOpenTeam, setIsCreateModalOpenTeam] = useState(false);
  const [isCreateModalOpenOrg, setIsCreateModalOpenOrg] = useState(false);
  const [isCreateModalOpenExecDoc, setIsCreateModalOpenExecDoc] =
    useState(false);
  const [isCreateModalOpenProjectDoc, setIsCreateModalOpenProjectDoc] =
    useState(false);
  const [isCreateModalOpenComissionDoc, setIsCreateModalOpenComissionDoc] =
    useState(false);

  const handleBack = () => {
    navigate(endPoint, { replace: true });
  };

  const handleSaveAsDraft = () => {
    const currentDrafts = JSON.parse(
      localStorage.getItem(DRAFTS_STORAGE_KEY) || "[]",
    );
    const newDraft = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      formData: formData,
      selectedDetectors: selectedDetectors,
    };
    localStorage.setItem(
      DRAFTS_STORAGE_KEY,
      JSON.stringify([...currentDrafts, newDraft]),
    );
    alert("Данные сохранены в черновики");
  };

  // Отправка обычной формы
  const handleSubmitRegular = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const missingFields = validateRequiredFields(formData);
    if (missingFields.length > 0) {
      setError(
        `Пожалуйста, заполните следующие обязательные поля: ${missingFields.join(", ")}`,
      );
      setLoading(false);
      return;
    }

    try {
      const finalData = prepareFinalData(
        formData,
        selectedDetectors,
        //formData.workTypes,
      );
      await axiosInstance.post(endPoint, finalData);

      // Удаляем черновик, если он был
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
    } catch (err) {
      console.error("Ошибка при отправке: ", err);
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Произошла ошибка при сохранении данных",
        );
      } else {
        setError("Произошла неизвестная ошибка");
      }
    } finally {
      setLoading(false);
    }
  };

  // Отправка массовых форм
  const handleSubmitMass = async (
    updateForm: (id: number, updates: any) => void,
    forms: any[],
  ) => {
    setLoading(true);
    setError(null);

    const pendingForms = forms.filter((f) => f.status !== "success");

    for (const form of pendingForms) {
      // 1. Используем переданную функцию updateForm вместо form.onUpdate
      updateForm(form.id, { status: "submitting", errorMessage: undefined });

      try {
        const finalData = prepareFinalData(
          form.formData,
          form.selectedDetectors,
          //form.resultData,
        );
        await axiosInstance.post(endPoint, finalData);

        // 2. Снова используем updateForm для успеха
        updateForm(form.id, { status: "success" });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Ошибка при сохранении";

        // 3. И для ошибки
        updateForm(form.id, { status: "error", errorMessage });
        setError(`Ошибка при создании объекта #${form.id}: ${errorMessage}`);
      }
    }

    setLoading(false);

    const allSuccess = forms.every((f) => f.status === "success");
    if (allSuccess) {
      window.localStorage.removeItem("trainFormData");
      navigate("/trains");
    }
  };

  const handleResetRegular = () => {
    resetForm();
  };

  const handleToggleMassCreation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked;
    if (enabled) {
      resetForm();
      setMassCreationKey((prev) => prev + 1);
    } else {
      resetForm();
      setRegularCreationKey((prev) => prev + 1);
    }
    setIsMassCreationMode(enabled);
  };

  return (
    <div className="container mt-2">
      {/* Хлебные крошки */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="/" className="text-decoration-none">
              Главная
            </a>
          </li>
          <li className="breadcrumb-item">
            <a href="/trains" className="text-decoration-none">
              Учет шлейфов
            </a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Журнал - Форма добавления шлейфа
          </li>
        </ol>
      </nav>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Добавить новый шлейф</h2>
        <div className="d-flex align-items-center gap-3">
          <div className="form-check form-switch" style={{ maxHeight: "38px" }}>
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id="switchCheckDefault"
              checked={isMassCreationMode}
              onChange={handleToggleMassCreation}
            />
            <label
              className="form-check-label ms-2"
              htmlFor="switchCheckDefault"
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
            📋 Черновики
          </button>
        </div>
      </div>

      {loading && (
        <div className="position-fixed top-50 start-50 translate-middle">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      )}

      {error && <div className="alert alert-danger mt-3">{error}</div>}

      {isMassCreationMode ? (
        <MassCreationManager
          key={massCreationKey}
          initialFormData={formData}
          initialDetectors={selectedDetectors}
          //initialWorkTypes={resultData}
          onSubmit={handleSubmitMass}
          onReset={handleResetRegular}
          loading={loading}
        />
      ) : (
        <TrainForm
          key={regularCreationKey}
          formData={formData}
          setFormData={setFormData}
          //setResultData={setResultData}
          selectedDetectors={selectedDetectors}
          setSelectedDetectors={setSelectedDetectors}
          onSubmit={handleSubmitRegular}
          onReset={handleResetRegular}
          onSaveAsDraft={handleSaveAsDraft}
          onBack={handleBack}
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

// src/components/createPages/addObjectOS/AddObjectOS.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance, useAxiosInterceptor } from '../../../api/axios';
import axios from 'axios';
import { useFormState } from '../../../hooks/useFormState';
import { FormDataObjectOS, SelectedDetector, MassCreationForm } from '../AddTypes';
import ObjectOSForm from './ObjectOSForm';
import MassCreationManagerObjectOS from './MassCreationManagerObjectOS';
import { prepareObjectOSData, validateObjectOS } from '../../../utils/prepareObjectOSData'; 

const DRAFTS_STORAGE_KEY = 'objectOS_drafts_list';

const AddObjectOS = ({ endPoint }: { endPoint: string }) => {
  const navigate = useNavigate();
  useAxiosInterceptor();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMassCreationMode, setIsMassCreationMode] = useState(false);
  const [massCreationKey, setMassCreationKey] = useState(0);
  const [regularCreationKey, setRegularCreationKey] = useState(0);

  // Состояние обычной формы (через универсальный хук)
  const initialFormData: FormDataObjectOS = {
    org: { title: '', shortTitle: '', responsible: '', jobTitle: '', comment: '', deleted: false },
    number: null,
    name: '',
    coordinates: '',
    phone: '',
    dateEntered: '',
    dateAdjusted: '',
    comment: '',
    adminDoc: null,
    commissionDoc: null,
    projectDoc: null,
    station: null,
    adminStation: null,
    deleted: false,
    mteam: { title: '', comment: '', deleted: false },
  };
  const { data: formData, setData: setFormData, reset: resetForm } = useFormState<FormDataObjectOS>(
    'objectOSFormData',
    initialFormData
  );

  const [selectedDetectors, setSelectedDetectors] = useState<SelectedDetector[]>([]);

  // Модалки
  const [isCreateModalOpenTeam, setIsCreateModalOpenTeam] = useState(false);
  const [isCreateModalOpenOrg, setIsCreateModalOpenOrg] = useState(false);
  const [isCreateModalOpenExecDoc, setIsCreateModalOpenExecDoc] = useState(false);
  const [isCreateModalOpenProjectDoc, setIsCreateModalOpenProjectDoc] = useState(false);
  const [isCreateModalOpenComissionDoc, setIsCreateModalOpenComissionDoc] = useState(false);

  const handleBack = () => {
    navigate(endPoint, { replace: true });
  };

  const handleSaveAsDraft = () => {
    const currentDrafts = JSON.parse(localStorage.getItem(DRAFTS_STORAGE_KEY) || '[]');
    const newDraft = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      formData,
      selectedDetectors,
    };
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify([...currentDrafts, newDraft]));
    alert('Данные сохранены в черновики');
  };

  // Отправка обычной формы
  const handleSubmitRegular = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const missing = validateObjectOS(formData);
    if (missing.length > 0) {
      setError(`Пожалуйста, заполните обязательные поля: ${missing.join(', ')}`);
      setLoading(false);
      return;
    }

    try {
      const finalData = prepareObjectOSData(formData, selectedDetectors);
      await axiosInstance.post(endPoint, finalData);

      // Удаляем черновик
      const currentDraftId = window.sessionStorage.getItem('current_draft_id');
      if (currentDraftId) {
        const drafts = JSON.parse(localStorage.getItem(DRAFTS_STORAGE_KEY) || '[]');
        const filtered = drafts.filter((d: any) => d.id !== Number(currentDraftId));
        localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(filtered));
        window.sessionStorage.removeItem('current_draft_id');
      }

      window.localStorage.removeItem('objectOSFormData');
      navigate('/subjects');
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Ошибка при сохранении');
      } else {
        setError('Неизвестная ошибка');
      }
    } finally {
      setLoading(false);
    }
  };

  // Отправка массовых форм
  const handleSubmitMass = async (
    updateForm: (id: number, updates: Partial<MassCreationForm<FormDataObjectOS>>) => void,
    forms: MassCreationForm<FormDataObjectOS>[]
  ) => {
    setLoading(true);
    setError(null);

    const pendingForms = forms.filter((f) => f.status !== 'success');

    for (const form of pendingForms) {
      updateForm(form.id, { status: 'submitting', errorMessage: undefined });

      try {
        const finalData = prepareObjectOSData(form.formData, form.selectedDetectors);
        await axiosInstance.post(endPoint, finalData);
        updateForm(form.id, { status: 'success' });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Ошибка при сохранении';
        updateForm(form.id, { status: 'error', errorMessage });
        setError(`Ошибка при создании объекта #${form.id}: ${errorMessage}`);
      }
    }

    setLoading(false);

    const allSuccess = forms.every((f) => f.status === 'success');
    if (allSuccess) {
      window.localStorage.removeItem('objectOSFormData');
      navigate('/subjects');
    }
  };

  const handleResetRegular = () => {
    resetForm();
    setSelectedDetectors([]);
  };

  const handleToggleMassCreation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked;
    if (enabled) {
      resetForm();
      setSelectedDetectors([]);
      setMassCreationKey((prev) => prev + 1);
    } else {
      resetForm();
      setSelectedDetectors([]);
      setRegularCreationKey((prev) => prev + 1);
    }
    setIsMassCreationMode(enabled);
  };

  // Загрузка черновика при монтировании (если есть)
  useEffect(() => {
    const draftRaw = localStorage.getItem('temp_load_draft');
    if (draftRaw) {
      const parsed = JSON.parse(draftRaw);
      setFormData(parsed.formData);
      if (parsed.selectedDetectors) {
        setSelectedDetectors(parsed.selectedDetectors);
      }
      window.sessionStorage.setItem('current_draft_id', parsed.id.toString());
      localStorage.removeItem('temp_load_draft');
    }
  }, [setFormData]);

  return (
    <div className="container mt-2">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/">Главная</a></li>
          <li className="breadcrumb-item"><a href="/subjects">Учет объектов ОС</a></li>
          <li className="breadcrumb-item active" aria-current="page">Журнал - Форма добавления объекта ОС</li>
        </ol>
      </nav>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Добавить новый объект ОС</h2>
        <div className="d-flex align-items-center gap-3">
          <div className="form-check form-switch" style={{ maxHeight: '38px' }}>
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id="switchMassCreation"
              checked={isMassCreationMode}
              onChange={handleToggleMassCreation}
            />
            <label className="form-check-label ms-2" htmlFor="switchMassCreation">
              Массовое создание
            </label>
          </div>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => {
              navigate('/subjects/add/drafts');
              window.localStorage.removeItem('objectOSFormData');
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
        <MassCreationManagerObjectOS
          key={massCreationKey}
          initialFormData={formData}
          initialDetectors={selectedDetectors}
          onSubmit={handleSubmitMass}
          onReset={handleResetRegular}
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

export default AddObjectOS;
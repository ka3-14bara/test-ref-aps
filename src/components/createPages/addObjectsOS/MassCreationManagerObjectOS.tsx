// src/components/createPages/addObjectOS/MassCreationManagerObjectOS.tsx
import React, { useEffect } from 'react';
import CommonFieldsSelectorObjectOS from './CommonFieldsSelectorObjectOS';
import MassCreationFormItemObjectOS from './MassCreationFormItemObjectOS';
import { useMassCreationState } from '../../../hooks/useMassCreationState';
import { FormDataObjectOS, SelectedDetector, MassCreationForm } from '../AddTypes';

interface MassCreationManagerObjectOSProps {
  initialFormData: FormDataObjectOS;
  initialDetectors: SelectedDetector[];
  onSubmit: (updateForm: (id: number, updates: Partial<MassCreationForm<FormDataObjectOS>>) => void, forms: MassCreationForm<FormDataObjectOS>[]) => Promise<void>;
  onReset: () => void;
  loading: boolean;
}

const MassCreationManagerObjectOS: React.FC<MassCreationManagerObjectOSProps> = ({
  initialFormData,
  initialDetectors,
  onSubmit,
  onReset,
  loading,
}) => {
  const {
    forms,
    addForm,
    removeForm,
    updateForm,
    resetAll,
    commonFields,
    commonFieldValues,
    setCommonField,
    removeCommonField,
    updateCommonFieldValue,
  } = useMassCreationState<FormDataObjectOS>(initialFormData);

  useEffect(() => {
    if (forms.length === 0) {
      addForm();
      if (initialDetectors.length > 0 && forms[0]) {
        updateForm(forms[0].id, { selectedDetectors: initialDetectors });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    await onSubmit(updateForm, forms);
  };

  const handleReset = () => {
    resetAll();
    onReset();
  };

  const handleAddForm = () => {
    addForm();
  };

  const handleCommonFieldToggle = (field: keyof FormDataObjectOS) => {
    if (commonFields.includes(field)) {
      removeCommonField(field);
    } else {
      setCommonField(field, initialFormData[field]);
    }
  };

  return (
    <>
      <CommonFieldsSelectorObjectOS
        commonFields={commonFields}
        commonFieldValues={commonFieldValues}
        onToggleField={handleCommonFieldToggle}
        onValueChange={updateCommonFieldValue}
      />

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>📝 Формы объектов ОС ({forms.length})</h5>
        <button
          type="button"
          className="btn btn-outline-success"
          onClick={handleAddForm}
          disabled={loading}
        >
          + Добавить форму
        </button>
      </div>

      {forms.map((form, index) => (
        <MassCreationFormItemObjectOS
          key={form.id}
          form={form}
          index={index}
          commonFields={commonFields}
          onUpdate={(updates) => updateForm(form.id, updates)}
          onRemove={() => removeForm(form.id)}
          isRemovable={forms.length > 1}
        />
      ))}

      <div className="d-flex justify-content-start align-items-center gap-2 mt-4">
        <button
          type="button"
          className={`btn ${loading ? 'btn-secondary' : 'btn-success'}`}
          onClick={handleSubmit}
          disabled={loading || forms.length === 0}
        >
          {loading ? 'Сохранение...' : `Сохранить все (${forms.length})`}
        </button>
        <button type="button" className="btn btn-outline-warning" onClick={handleReset}>
          Сбросить
        </button>
      </div>
    </>
  );
};

export default MassCreationManagerObjectOS;
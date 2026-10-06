// MassCreationManager.tsx
import React, { useEffect } from "react";
import CommonFieldsSelector from "./CommonFieldsSelector";
import MassCreationFormItem from "./MassCreationFormItem";
import { useMassCreationState } from "../../../hooks/useMassCreationState";
import { FormDataTrain, SelectedDetector } from "../AddTypes";

interface MassCreationManagerProps {
  initialFormData: FormDataTrain;
  initialDetectors: SelectedDetector[];
  //initialWorkTypes: WorkTypes[] | null;
  onSubmit: (updateForm: (id: number, updates: any) => void, forms: any[]) => Promise<void>;
  onReset: () => void;
  loading: boolean;
}

const MassCreationManager: React.FC<MassCreationManagerProps> = ({
  initialFormData,
  initialDetectors,
  //initialWorkTypes,
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
  } = useMassCreationState<FormDataTrain>(initialFormData);

  // Инициализация первой формы при монтировании, если нет форм
  useEffect(() => {
    if (forms.length === 0) {
      // Копируем начальные датчики и работы в первую форму
      addForm({
        ...initialFormData,
        detectorsValue: {}, // будет заполнено из selectedDetectors
        //workTypes: initialWorkTypes,
      });
      // Если нужно скопировать датчики, то надо обновить selectedDetectors у формы
      if (initialDetectors.length > 0) {
        updateForm(forms[0]?.id, { selectedDetectors: initialDetectors });
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async () => {
    await onSubmit(updateForm, forms);
  };

  const handleReset = () => {
    resetAll();
    onReset();
  };

  const handleAddForm = () => {
    // Добавляем форму с пустыми датчиками и работами, но с общими полями
    addForm({
      ...initialFormData,
      detectorsValue: {},
      //workTypes: null,
    });
  };

  const handleCommonFieldToggle = (field: keyof FormDataTrain) => {
    if (commonFields.includes(field)) {
      removeCommonField(field);
    } else {
      setCommonField(field, initialFormData[field]);
    }
  };

  return (
    <>
      <CommonFieldsSelector
        commonFields={commonFields}
        commonFieldValues={commonFieldValues}
        onToggleField={handleCommonFieldToggle as (field: string) => void}
        onValueChange={updateCommonFieldValue as (field: string, value: any) => void}
      />

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>📝 Формы шлейфов ({forms.length})</h5>
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
        <MassCreationFormItem
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

export default MassCreationManager;
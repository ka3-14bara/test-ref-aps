import React, { useEffect } from "react";
import CommonFieldsSelector from "./CommonFieldsSelector";
import MassCreationFormItem from "./MassCreationFormItem";
import { useMassCreationState } from "../../../hooks/useMassCreationState";
import {
  FormDataTrain,
  SelectedDetector,
  MassCreationForm,
} from "../../../types/creation";

interface MassCreationManagerProps {
  initialFormData: FormDataTrain;
  initialDetectors: SelectedDetector[];
  onSubmit: (
    updateForm: (
      id: number,
      updates: Partial<MassCreationForm<FormDataTrain>>,
    ) => void,
    forms: MassCreationForm<FormDataTrain>[],
  ) => Promise<void>;
  onReset: () => void;
  loading: boolean;
}

export const MassCreationManager: React.FC<MassCreationManagerProps> = ({
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
  } = useMassCreationState<FormDataTrain>(initialFormData);

  useEffect(() => {
    if (forms.length === 0) {
      addForm();
      if (initialDetectors.length > 0 && forms[0]) {
        updateForm(forms[0].id, { selectedDetectors: initialDetectors });
      }
    }
  }, []);

  const handleCommonFieldToggle = (field: string) => {
    const key = field as keyof FormDataTrain;
    if (commonFields.includes(key)) {
      removeCommonField(key);
    } else {
      setCommonField(key, initialFormData[key]);
    }
  };

  return (
    <>
      <CommonFieldsSelector
        commonFields={commonFields}
        commonFieldValues={commonFieldValues}
        onToggleField={handleCommonFieldToggle}
        onValueChange={updateCommonFieldValue}
      />

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0 fw-semibold">
          <i className="bi bi-list-task me-2"></i> Карточки шлейфов (
          {forms.length})
        </h5>
        <button
          type="button"
          className="btn btn-outline-success btn-sm"
          onClick={() => addForm()}
          disabled={loading}
        >
          <i className="bi bi-plus-lg me-1"></i> Добавить еще шлейф
        </button>
      </div>

      {forms.map((form, index) => (
        <MassCreationFormItem
          key={form.id}
          form={form}
          index={index}
          commonFields={commonFields as string[]}
          onUpdate={(updates) => updateForm(form.id, updates)}
          onRemove={() => removeForm(form.id)}
          isRemovable={forms.length > 1}
        />
      ))}

      <div className="d-flex align-items-center gap-2 mt-4">
        <button
          type="button"
          className="btn btn-success px-4"
          onClick={() => onSubmit(updateForm, forms)}
          disabled={loading || forms.length === 0}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>{" "}
              Сохранение...
            </>
          ) : (
            `Сохранить все (${forms.length})`
          )}
        </button>
        <button
          type="button"
          className="btn btn-outline-warning"
          onClick={() => {
            resetAll();
            onReset();
          }}
          disabled={loading}
        >
          Сбросить все
        </button>
      </div>
    </>
  );
};

export default MassCreationManager;

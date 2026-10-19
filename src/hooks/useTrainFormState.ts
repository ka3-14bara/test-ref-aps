import { useState, useCallback } from "react";
import { FormDataTrain, SelectedDetector } from "../types/creation";
import GetInitialValue from "../utils/GetInitialValue";

const getEmptyFormData = (): FormDataTrain => ({
  org: {
    id: null,
    title: "",
    shortTitle: "",
    responsible: "",
    jobTitle: "",
    comment: "",
    deleted: false,
  },
  number: null,
  sectionNumber: null,
  location: "",
  coordinates: "",
  length: null,
  trainLaboriousness: null,
  dateEntered: "",
  dateAdjusted: "",
  comment: "",
  adminDoc: null,
  commissionDoc: null,
  projectDoc: null,
  deleted: false,
  trainTypesValue: {},
  detectorsValue: {},
  stationNumberValue: "",
  mteam: { id: null, title: "", comment: "", deleted: false },
  stationNameValue: "",
  stationId: null,
  hidden: false,
});

export const useTrainFormState = (storageKey?: string) => {
  const [formData, setFormDataInternal] = useState<FormDataTrain>(() => {
    // 1. Приоритет: временный загруженный черновик
    const tempDraftRaw = localStorage.getItem("temp_load_draft");
    if (tempDraftRaw) {
      try {
        const parsed = JSON.parse(tempDraftRaw);
        if (parsed.formData) {
          return { ...getEmptyFormData(), ...parsed.formData };
        }
      } catch (e) {
        console.error("Ошибка парсинга temp_load_draft в хуке:", e);
      }
    }
    // 2. Иначе автосохраненный стейт формы
    if (storageKey) {
      return GetInitialValue(storageKey, getEmptyFormData());
    }
    return getEmptyFormData();
  });

  const [selectedDetectors, setSelectedDetectors] = useState<
    SelectedDetector[]
  >(() => {
    const tempDraftRaw = localStorage.getItem("temp_load_draft");
    if (tempDraftRaw) {
      try {
        const parsed = JSON.parse(tempDraftRaw);
        if (Array.isArray(parsed.selectedDetectors)) {
          return parsed.selectedDetectors;
        }
      } catch (e) {
        console.error("Ошибка парсинга датчиков temp_load_draft:", e);
      }
    }
    return [];
  });

  const updateFormData = useCallback(
    (
      updater:
        | Partial<FormDataTrain>
        | ((prev: FormDataTrain) => FormDataTrain),
    ) => {
      setFormDataInternal((prev) => {
        const newData =
          typeof updater === "function"
            ? updater(prev)
            : { ...prev, ...updater };
        if (storageKey) {
          localStorage.setItem(storageKey, JSON.stringify(newData));
        }
        return newData;
      });
    },
    [storageKey],
  );

  const resetForm = useCallback(() => {
    const empty = getEmptyFormData();
    setFormDataInternal(empty);
    setSelectedDetectors([]);
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  return {
    formData,
    setFormData: updateFormData,
    selectedDetectors,
    setSelectedDetectors,
    resetForm,
  };
};

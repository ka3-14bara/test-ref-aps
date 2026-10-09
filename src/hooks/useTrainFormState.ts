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
  const [formData, setFormData] = useState<FormDataTrain>(() => {
    if (storageKey) {
      return GetInitialValue(storageKey, getEmptyFormData());
    }
    return getEmptyFormData();
  });

  const [selectedDetectors, setSelectedDetectors] = useState<
    SelectedDetector[]
  >([]);

  const updateFormData = useCallback(
    (
      updater:
        | Partial<FormDataTrain>
        | ((prev: FormDataTrain) => FormDataTrain),
    ) => {
      setFormData((prev) => {
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
    setFormData(empty);
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

// src/hooks/useMassCreationState.ts
import { useState, useCallback } from 'react';
import { MassCreationForm} from '../components/createPages/AddTypes';

export function useMassCreationState<T extends Record<string, any>>(
  baseFormData: T,
  initialCommonFields: (keyof T)[] = []
) {
  const [forms, setForms] = useState<MassCreationForm<T>[]>([]);
  const [nextId, setNextId] = useState(1);
  const [commonFields, setCommonFields] = useState<(keyof T)[]>(initialCommonFields);
  const [commonFieldValues, setCommonFieldValues] = useState<Partial<T>>({});

  const addForm = useCallback((customData?: Partial<T>) => {
    const newForm: MassCreationForm<T> = {
      id: nextId,
      formData: {
        ...baseFormData,
        ...commonFieldValues,
        ...(customData || {}),
      },
      selectedDetectors: [],
      status: 'pending',
    };
    setForms(prev => [...prev, newForm]);
    setNextId(prev => prev + 1);
  }, [nextId, baseFormData, commonFieldValues]);

  const removeForm = useCallback((id: number) => {
    setForms(prev => prev.filter(f => f.id !== id));
  }, []);

  const updateForm = useCallback((id: number, updates: Partial<MassCreationForm<T>>) => {
    setForms(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  }, []);

  const resetAll = useCallback(() => {
    setForms([]);
    setCommonFields([]);
    setCommonFieldValues({});
    setNextId(1);
  }, []);

  const setCommonField = useCallback((field: keyof T, value: any) => {
    setCommonFields(prev => prev.includes(field) ? prev : [...prev, field]);
    setCommonFieldValues(prev => ({ ...prev, [field]: value }));
    setForms(prev => prev.map(f => ({
      ...f,
      formData: { ...f.formData, [field]: value },
    })));
  }, []);

  const removeCommonField = useCallback((field: keyof T) => {
    setCommonFields(prev => prev.filter(f => f !== field));
    setCommonFieldValues(prev => {
      const newVals = { ...prev };
      delete newVals[field];
      return newVals;
    });
  }, []);

  const updateCommonFieldValue = useCallback((field: keyof T, value: any) => {
    setCommonFieldValues(prev => ({ ...prev, [field]: value }));
    setForms(prev => prev.map(f => ({
      ...f,
      formData: { ...f.formData, [field]: value },
    })));
  }, []);

  return {
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
  };
}
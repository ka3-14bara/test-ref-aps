// src/hooks/useFormState.ts
import { useState, useEffect, useCallback } from 'react';

export function useFormState<T>(storageKey: string, initialValue: T) {
  const [data, setData] = useState<T>(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        return JSON.parse(stored) as T;
      } catch {
        return initialValue;
      }
    }
    return initialValue;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [data, storageKey]);

  const reset = useCallback(() => {
    setData(initialValue);
    localStorage.removeItem(storageKey);
  }, [initialValue, storageKey]);

  return { data, setData, reset };
}
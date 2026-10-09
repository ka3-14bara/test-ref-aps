import { useState, useEffect, useCallback } from "react";

export function useFormState<T>(storageKey: string, initialValue: T) {
  const [data, setData] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.error(
        `Ошибка синхронизации useFormState по ключу "${storageKey}":`,
        error,
      );
    }
  }, [data, storageKey]);

  const reset = useCallback(() => {
    setData(initialValue);
    localStorage.removeItem(storageKey);
  }, [initialValue, storageKey]);

  return { data, setData, reset };
}

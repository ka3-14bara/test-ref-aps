export function GetInitialValue<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored) as T;
    }
  } catch (error) {
    console.error(`Ошибка десериализации значения для ключа "${key}":`, error);
  }
  return defaultValue;
}

export default GetInitialValue;

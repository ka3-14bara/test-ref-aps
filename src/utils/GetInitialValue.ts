const GetInitialValue = <T>(storageKey: string, defaultValue: T): T => {
  // 1. Приоритет №1: Проверяем, не перешли ли мы только что по кнопке "Выбрать" из таблицы черновиков
  const draftItem = localStorage.getItem("temp_load_draft");
  if (draftItem) {
    try {
      const parsed = JSON.parse(draftItem);
      // Возвращаем formData из черновика
      return parsed.formData;
    } catch (e) {
      console.error("Ошибка парсинга черновика", e);
    }
  } else {
    // 2. Приоритет №2: Если черновика нет, проверяем обычный LocalStorage формы (после F5)
    const savedValue = localStorage.getItem(storageKey);
    if (savedValue) {
      try {
        return JSON.parse(savedValue);
      } catch (e) {
        console.error("Ошибка парсинга сохраненных данных", e);
      }
    }
  }

  // 3. Если всё пусто — возвращаем дефолт
  return defaultValue;
};

export default GetInitialValue;

import React, {
  useState,
  FormEvent,
  useRef,
  useEffect,
  useCallback,
} from "react";
import Modal from "react-modal";
// Предполагаем, что эти импорты доступны в вашем проекте
import { axiosInstance } from "../../api/axios";
// import '../styles/ActionModal.css'; // Если хотите использовать те же стили
import { Header } from "../Types";
import FormField from "./FormField";
import {
  searchableConfigs,
  SearchableType,
} from "../../utils/searchableConfig";

// Установим корневой элемент приложения для accessibility в react-modal
// Это должно быть вызвано один раз в вашем главном файле (например, index.tsx)
// Modal.setAppElement('#root');

interface CreateModalProps<T extends Record<string, any>> {
  isOpen: boolean;
  onClose: () => void;
  headers: Header[]; // Заголовки для отображения полей формы
  endPoint: string; // URL для POST запроса, например, '/api/sensors'
  onSuccess: () => void; // Колбэк после успешного создания
  // dataInterface: T; // Интерфейс данных (убрано, используем headers и нач. состояние)
  onCreated?: (createdItem: T) => void;
  initialData: Omit<T, "id">; // Начальные данные без поля 'id'
}

export function CreateItemModal<T extends Record<string, any>>({
  isOpen,
  onClose,
  headers,
  endPoint,
  onSuccess,
  onCreated,
  initialData,
}: CreateModalProps<T>) {
  // Используем Omit<T, 'id'> для состояния формы
  const [formData, setFormData] = useState<Omit<T, "id">>(initialData);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Сбрасываем форму при каждом открытии
  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
    }
  }, [isOpen, initialData]);

  // Функция для установки фокуса после открытия (для доступности)
  const handleAfterOpen = () => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  };

  const handleCloseModal = () => {
    // В случае создания нового элемента, обычно не спрашивают подтверждение
    // Но если нужно, логика как в вашем ActionModal:
    // if (!window.confirm('Уверены, что хотите отменить создание?')) return;
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev!,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleIntChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, checked } = e.target;
      const parsedValue = value === "" ? null : parseInt(value, 10);
      setFormData(
        (prev) =>
          ({
            ...(prev || {}),
            [name]: type === "checkbox" ? checked : parsedValue,
          }) as T,
      );
    },
    [],
  );

  const handleFloatChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, checked } = e.target;
      const parsedValue = value === "" ? null : parseFloat(value);
      setFormData(
        (prev) =>
          ({
            ...(prev || {}),
            [name]: type === "checkbox" ? checked : parsedValue,
          }) as T,
      );
    },
    [],
  );

  const handleSearchableChange = useCallback(
    <K extends keyof typeof searchableConfigs>(
      key: K,
      item: SearchableType<K>,
    ) => {
      setFormData((prev) => {
        const newState = {
          ...(prev || {}),
          [key]: item,
        };
        return newState as T;
      });
    },
    [],
  );

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    try {
      var dataToSend;
      if (endPoint == "/maintenance_teams") {
        dataToSend = {
          title: formData.title,
          orgId: formData.orgShortTitle.id,
          comment: formData.comment,
        };
      } else {
        dataToSend = formData as any;
      }
      const response = await axiosInstance.post(endPoint, dataToSend); // сохраняем ответ

      const createdItem = response.data; // получаем созданный объект

      // Вызываем колбэки
      if (onCreated) {
        onCreated(createdItem); // передаём созданный объект в родитель
      }
      alert("Элемент успешно создан!");
      onSuccess(); // обновление списка
      onClose(); // закрытие модалки
    } catch (error) {
      console.error("Ошибка при создании элемента:", error);
      alert("Произошла ошибка при создании: " + error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleCloseModal}
      onAfterOpen={handleAfterOpen} // Добавляем обработчик фокуса
      contentLabel="Создать элемент"
      className="modal-content" // Используем ваши CSS классы
      overlayClassName="modal-overlay"
    >
      <div className="modal-header">
        <h2>Создать элемент</h2>
        <button onClick={handleCloseModal} className="close-button">
          &times;
        </button>
      </div>

      <div className="modal-body">
        {/* Форма для создания элемента */}
        <form onSubmit={handleSave}>
          <div>
            {headers.map((header) => {
              // Можно оставить фильтрацию, если нужно
              if (header.key === "id" || header.key.startsWith("none"))
                return null;

              const value = formData?.[header.key] ?? "";
              const itemValue = null;

              return (
                <FormField
                  key={header.key}
                  header={header}
                  value={value}
                  itemValue={itemValue}
                  onChange={handleChange}
                  onIntChange={handleIntChange}
                  onFloatChange={handleFloatChange}
                  onSearchableChange={handleSearchableChange}
                />
              );
            })}
          </div>
          <div className="modal-footer" style={{ marginTop: "20px" }}>
            <button
              type="submit"
              className="btn btn-primary"
              onClick={handleSave}
            >
              Сохранить
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCloseModal}
            >
              Отменить
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

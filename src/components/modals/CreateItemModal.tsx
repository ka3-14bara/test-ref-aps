import React, {
  useState,
  FormEvent,
  useRef,
  useEffect,
  useCallback,
} from "react";
import Modal from "react-modal";
import { axiosInstance } from "../../api/client";
import { Header } from "../../types/table";
import FormField from "./FormField";
import {
  searchableConfigs,
  SearchableType,
} from "../../utils/searchableConfig";

Modal.setAppElement("#root");

interface CreateItemModalProps<T extends Record<string, any>> {
  isOpen: boolean;
  onClose: () => void;
  headers: Header[];
  endPoint: string;
  onSuccess: () => void;
  onCreated?: (createdItem: T) => void;
  initialData: Omit<T, "id">;
}

export function CreateItemModal<T extends Record<string, any>>({
  isOpen,
  onClose,
  headers,
  endPoint,
  onSuccess,
  onCreated,
  initialData,
}: CreateItemModalProps<T>) {
  const [formData, setFormData] = useState<Omit<T, "id">>(initialData);
  const [loading, setLoading] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
    }
  }, [isOpen, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleIntChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const parsed = value === "" ? null : parseInt(value, 10);
      setFormData((prev) => ({
        ...prev,
        [name]: parsed,
      }));
    },
    [],
  );

  const handleFloatChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const parsed = value === "" ? null : parseFloat(value);
      setFormData((prev) => ({
        ...prev,
        [name]: parsed,
      }));
    },
    [],
  );

  const handleSearchableChange = useCallback(
    <K extends keyof typeof searchableConfigs>(
      key: K,
      item: SearchableType<K>,
    ) => {
      setFormData((prev) => ({
        ...prev,
        [key]: item,
      }));
    },
    [],
  );

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let dataToSend: any = formData;
      if (endPoint === "/maintenance_teams") {
        dataToSend = {
          title: (formData as any).title,
          orgId: (formData as any).orgShortTitle?.id || null,
          comment: (formData as any).comment || "",
        };
      }

      const response = await axiosInstance.post(endPoint, dataToSend);
      if (onCreated) {
        onCreated(response.data);
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Ошибка при создании сущности:", error);
      alert(
        "Ошибка при создании: " +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="app-modal"
      overlayClassName="app-modal-overlay"
      onAfterOpen={() => firstInputRef.current?.focus()}
    >
      <div className="app-modal__header">
        <h5 className="app-modal__title">Создать элемент</h5>
        <button
          type="button"
          className="btn-close"
          onClick={onClose}
          aria-label="Закрыть"
        ></button>
      </div>

      <form
        onSubmit={handleSave}
        className="d-flex flex-column flex-grow-1 overflow-hidden"
      >
        <div className="app-modal__body">
          {headers.map((header) => {
            if (header.key === "id" || header.key.startsWith("none"))
              return null;
            return (
              <FormField
                key={header.key}
                header={header}
                value={formData[header.key] ?? ""}
                onChange={handleChange}
                onIntChange={handleIntChange}
                onFloatChange={handleFloatChange}
                onSearchableChange={handleSearchableChange}
              />
            );
          })}
        </div>

        <div className="app-modal__footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Отмена
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2"></span>
            ) : null}
            Сохранить
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default CreateItemModal;

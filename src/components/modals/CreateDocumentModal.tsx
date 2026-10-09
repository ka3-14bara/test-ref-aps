import React, { useState, FormEvent, useEffect } from "react";
import Modal from "react-modal";
import { axiosInstance } from "../../api/client";
import { Document } from "../../types/creation";
import {
  ALLOWED_EXTENSIONS,
  ALLOWED_FILE_TYPES,
} from "../../pages/creation/documents/AddDocument";

Modal.setAppElement("#root");

interface CreateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  endPoint: string;
  onSuccess: () => void;
  onCreated?: (createdDoc: Document) => void;
  docType: "ADMIN" | "COMMISSION" | "PROJECT";
}

export const CreateDocumentModal: React.FC<CreateDocumentModalProps> = ({
  isOpen,
  onClose,
  endPoint,
  onSuccess,
  onCreated,
  docType,
}) => {
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [selectedDocType, setSelectedDocType] = useState<string>(docType);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setComment("");
      setSelectedDocType(docType);
      setFile(null);
      setFileError(null);
    }
  }, [isOpen, docType]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const selected = e.target.files?.[0];
    if (!selected) return;

    const extension = selected.name.split(".").pop()?.toLowerCase() || "";
    if (
      !ALLOWED_FILE_TYPES.includes(selected.type) ||
      !ALLOWED_EXTENSIONS.includes(extension)
    ) {
      setFileError("Допустимые форматы: PDF, DOC, DOCX, XLS, XLSX");
      setFile(null);
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setFileError("Пожалуйста, выберите файл");
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("file", file);
      formDataToSend.append("title", title);
      formDataToSend.append("comment", comment);
      formDataToSend.append("documentType", selectedDocType);

      const response = await axiosInstance.post<Document>(
        endPoint,
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (onCreated) {
        onCreated(response.data);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Ошибка создания документа:", err);
      alert(
        "Ошибка при сохранении документа: " +
          (err.response?.data?.message || err.message),
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
    >
      <div className="app-modal__header">
        <h5 className="app-modal__title">Создать документ</h5>
        <button
          type="button"
          className="btn-close"
          onClick={onClose}
          aria-label="Закрыть"
        ></button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="d-flex flex-column flex-grow-1 overflow-hidden"
      >
        <div className="app-modal__body">
          <div className="mb-3">
            <label htmlFor="createDocTitle" className="form-label">
              Наименование документа <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="createDocTitle"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите наименование"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="createDocFile" className="form-label">
              Файл документа <span className="text-danger">*</span>
            </label>
            <input
              type="file"
              id="createDocFile"
              className={`form-control ${fileError ? "is-invalid" : ""}`}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              required
            />
            {fileError && <div className="invalid-feedback">{fileError}</div>}
            {file && (
              <div className="form-text text-success">
                Выбран файл: {file.name}
              </div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="createDocType" className="form-label">
              Тип документа
            </label>
            <select
              id="createDocType"
              className="form-select"
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value)}
              required
            >
              <option value="ADMIN">Исполнительная документация</option>
              <option value="COMMISSION">Акт ввода в эксплуатацию</option>
              <option value="PROJECT">Проектная документация</option>
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="createDocComment" className="form-label">
              Комментарий
            </label>
            <textarea
              id="createDocComment"
              className="form-control"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Дополнительная информация"
            />
          </div>
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
            Загрузить документ
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateDocumentModal;

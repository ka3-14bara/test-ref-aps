import React, { useState, FormEvent, useRef, useEffect } from "react";
import Modal from "react-modal";
import { axiosInstance } from "../../api/axios";

export interface DocumentFormData {
  title: string;
  comment: string;
  documentType: string;
  deleted?: boolean;
}

export type Document = {
  id?: number | null;
  title: string;
  filePath: string;
  documentType: string;
  documentTypeDisplayValue: string;
  comment: string;
  deleted: boolean;
};

interface CreateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  endPoint: string;
  onSuccess: () => void;
  onCreated?: (createdDoc: Document) => void;
  docType: "ADMIN" | "COMMISSION" | "PROJECT";
}

export function CreateDocumentModal({
  isOpen,
  onClose,
  endPoint,
  onSuccess,
  onCreated,
  docType,
}: CreateDocumentModalProps) {
  const [formData, setFormData] = useState<DocumentFormData>({
    title: "",
    comment: "",
    documentType: "",
    deleted: false,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_FILE_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];
  const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx", "xls", "xlsx"];

  useEffect(() => {
    if (isOpen) {
      setFormData({ title: "", comment: "", documentType: "", deleted: false });
      setSelectedFile(null);
      setFileName("");
      setFileError(null);
    }
  }, [isOpen]);

  const handleAfterOpen = () => {
    if (firstInputRef.current) firstInputRef.current.focus();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, title: value }));
    if (value !== "" || !e.target.required) {
      e.target.className = "form-control mb-3";
    } else {
      e.target.className = "form-control mb-3 is-invalid";
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, comment: e.target.value }));
  };

  const handleDocTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, documentType: e.target.value }));
    e.target.className = "form-select";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (
        !ALLOWED_FILE_TYPES.includes(file.type) ||
        !ALLOWED_EXTENSIONS.includes(fileExtension || "")
      ) {
        setFileError(
          "Пожалуйста, выберите файл в формате PDF, DOC, DOCX, XLS или XLSX",
        );
        setSelectedFile(null);
        setFileName("");
        return;
      }
      setSelectedFile(file);
      setFileName(file.name);
    }
    if (e.target.files && e.target.files.length > 0) {
      e.target.className = "form-control";
    } else {
      e.target.className = "form-control is-invalid";
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!selectedFile) {
      setFileError("Пожалуйста, выберите файл");
      setLoading(false);
      return;
    }
    if (!formData.title) {
      alert("Пожалуйста, введите название документа");
      setLoading(false);
      return;
    }
    if (!formData.documentType) {
      alert("Пожалуйста, выберите тип документа");
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("file", selectedFile);
      formDataToSend.append("title", formData.title);
      formDataToSend.append("comment", formData.comment);
      formDataToSend.append("documentType", formData.documentType);

      const response = await axiosInstance.post(endPoint, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const createdDoc = response.data;

      if (onCreated) {
        onCreated(createdDoc);
      }

      alert("Документ успешно создан!");
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Ошибка при создании документа:", err);
      alert("Ошибка при создании документа: " + err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleCloseModal}
      onAfterOpen={handleAfterOpen}
      contentLabel="Создать документ"
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <div className="modal-header">
        <h2>Создать документ</h2>
        <button onClick={handleCloseModal} className="close-button">
          &times;
        </button>
      </div>

      <div className="modal-body">
        <form>
          <div className="mb-3">
            <label htmlFor="docName" className="form-label">
              Название документа
            </label>
            <input
              ref={firstInputRef}
              type="text"
              id="docName"
              className="form-control mb-3"
              value={formData.title}
              onChange={handleNameChange}
              autoComplete="off"
              placeholder="Название документа"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="formFile" className="form-label">
              Выберите документ (PDF, Word, Excel)
            </label>
            <input
              className="form-control"
              type="file"
              id="formFile"
              onChange={handleFileChange}
              required
              accept=".pdf,.doc,.docx,.xls,.xlsx"
            />
            {fileName && (
              <small className="text-muted">Выбран файл: {fileName}</small>
            )}
            {fileError && <div className="text-danger mt-1">{fileError}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="docType" className="form-label">
              Тип документа:
            </label>
            <select
              id="docType"
              className="form-select"
              value={formData.documentType}
              onChange={handleDocTypeChange}
              required
            >
              <option disabled value="">
                Выберите тип...
              </option>
              {docType === "ADMIN" && (
                <option value="ADMIN">Исполнительная документация</option>
              )}
              {docType === "COMMISSION" && (
                <option value="COMMISSION">Акт ввода в эксплуатацию</option>
              )}
              {docType === "PROJECT" && (
                <option value="PROJECT">Проектная документация</option>
              )}
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="comment" className="form-label">
              Комментарий:
            </label>
            <textarea
              id="comment"
              className="form-control"
              rows={4}
              value={formData.comment}
              onChange={handleCommentChange}
              autoComplete="off"
              placeholder="Комментарий"
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className={`btn ${loading ? "btn-secondary" : "btn-success"}`}
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? "Сохранение..." : "Сохранить"}
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

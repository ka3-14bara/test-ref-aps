import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance, useAxiosInterceptor } from "../../../api/client";
import { useLocalStorage } from "../../../hooks/useLocalStorage";

export interface FormDataDocument {
  title: string;
  comment: string;
  documentType: string;
  deleted?: boolean;
}

interface AddDocumentProps {
  endPoint: string;
}

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx", "xls", "xlsx"];

export const AddDocument: React.FC<AddDocumentProps> = ({ endPoint }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const navigate = useNavigate();
  useAxiosInterceptor();

  const storageKey = "add" + endPoint.replace(/\//g, "");
  const [formData, setFormData] = useLocalStorage<FormDataDocument>(
    storageKey,
    {
      title: "",
      comment: "",
      documentType: "",
      deleted: false,
    },
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (
      !ALLOWED_FILE_TYPES.includes(file.type) ||
      !ALLOWED_EXTENSIONS.includes(extension || "")
    ) {
      setFileError("Допустимые форматы: PDF, DOC, DOCX, XLS, XLSX");
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Выберите файл документа");
      return;
    }
    if (!formData.title.trim()) {
      setError("Введите название документа");
      return;
    }
    if (!formData.documentType) {
      setError("Выберите тип документа");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = new FormData();
      data.append("file", selectedFile);
      data.append("title", formData.title);
      data.append("comment", formData.comment);
      data.append("documentType", formData.documentType);

      await axiosInstance.post(endPoint, data, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            setUploadProgress(
              Math.round((progressEvent.loaded * 100) / progressEvent.total),
            );
          }
        },
      });

      window.localStorage.removeItem(storageKey);
      navigate("/documents");
    } catch (err: any) {
      console.error("Ошибка загрузки документа:", err);
      setError(
        err.response?.data?.message ||
          "Ошибка при отправке документа на сервер",
      );
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleReset = () => {
    window.localStorage.removeItem(storageKey);
    setFormData({
      title: "",
      comment: "",
      documentType: "",
      deleted: false,
    });
    setSelectedFile(null);
    setError(null);
  };

  return (
    <div className="container mt-2">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="/">Главная</a>
          </li>
          <li className="breadcrumb-item">
            <a href={endPoint}>Документы</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Создать документ
          </li>
        </ol>
      </nav>

      <h3 className="mb-4">Добавить документ</h3>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card shadow-sm border-0 p-4 position-relative">
        {loading && (
          <div
            className="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex flex-column justify-content-center align-items-center"
            style={{ zIndex: 10 }}
          >
            <div
              className="spinner-border text-primary mb-3"
              role="status"
            ></div>
            <h6>Загрузка на сервер: {uploadProgress}%</h6>
            <div className="progress w-50" style={{ height: "8px" }}>
              <div
                className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="docTitleInput" className="form-label fw-semibold">
                Название документа <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="docTitleInput"
                className={`form-control ${!formData.title ? "is-invalid" : ""}`}
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Например: Акт скрытых работ"
                required
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="docTypeSelect" className="form-label fw-semibold">
                Тип документа <span className="text-danger">*</span>
              </label>
              <select
                id="docTypeSelect"
                className={`form-select ${!formData.documentType ? "is-invalid" : ""}`}
                value={formData.documentType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    documentType: e.target.value,
                  }))
                }
                required
              >
                <option value="" disabled>
                  -- Выберите тип документа --
                </option>
                <option value="ADMIN">Исполнительная документация</option>
                <option value="COMMISSION">Акт ввода в эксплуатацию</option>
                <option value="PROJECT">Проектная документация</option>
              </select>
            </div>

            <div className="col-12">
              <label htmlFor="docFileInput" className="form-label fw-semibold">
                Файл документа <span className="text-danger">*</span>
              </label>
              <input
                type="file"
                id="docFileInput"
                className={`form-control ${fileError ? "is-invalid" : ""}`}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                required
              />
              {fileError && <div className="invalid-feedback">{fileError}</div>}
              {selectedFile && (
                <div className="form-text text-success">
                  Выбран файл: {selectedFile.name}
                </div>
              )}
            </div>

            <div className="col-12">
              <label
                htmlFor="docCommentArea"
                className="form-label fw-semibold"
              >
                Комментарий
              </label>
              <textarea
                id="docCommentArea"
                className="form-control"
                rows={3}
                value={formData.comment}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, comment: e.target.value }))
                }
                placeholder="Примечания..."
              />
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-4">
            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-success px-4"
                disabled={loading}
              >
                Сохранить
              </button>
              <button
                type="button"
                className="btn btn-outline-warning"
                onClick={handleReset}
              >
                Сбросить
              </button>
            </div>
            <button
              type="button"
              className="btn btn-secondary px-4"
              onClick={() => navigate("/documents")}
            >
              Назад
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDocument;

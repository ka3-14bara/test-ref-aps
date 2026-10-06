import { useEffect, useState } from "react";
import { axiosInstance, useAxiosInterceptor } from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../../hooks/useLocalStorage";

export interface FormData {
  title: string;
  comment: string;
  documentType: string;
  deleted?: boolean;
}

interface RequestCustom {
  endPoint: string;
}

// Допустимые типы файлов
export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx", "xls", "xlsx"];

const AddDocument = ({ endPoint }: RequestCustom) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  useAxiosInterceptor();

  const [formData, setFormData] = useLocalStorage<FormData>(
    "add" + endPoint.replace("/", ""),
    {
      title: "",
      comment: "",
      documentType: "",
      deleted: false,
    },
  );

  useEffect(() => {
    const title = document.getElementById("docName") as HTMLInputElement | null;
    const type = document.getElementById("docType") as HTMLSelectElement | null;
    const values = ["admin", "comission", "project"];

    if (title && (title.value === "" || title.value == null))
      title.className = "form-control mb-3 is-invalid";
    else if (title) title.className = "form-control mb-3";

    if (type && !values.includes(formData.documentType ?? ""))
      type.className = "form-select is-invalid";
    else if (type) type.className = "form-select";
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      title: value,
    });
    if (value !== "" || !e.target.required) e.target.className = "form-control";
    else e.target.className = "form-control is-invalid";
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      comment: e.target.value,
    });
  };

  const handleDocTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      documentType: e.target.value,
    });
    e.target.className = "form-select";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      // Проверяем тип MIME и расширение файла
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
    if (e.target.files && e.target.files.length > 0)
      e.target.className = "form-control";
    else e.target.className = "form-control is-invalid";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!selectedFile) {
      setError("Пожалуйста, выберите файл");
      setLoading(false);
      return;
    } else if (formData.title === "") {
      setError("Пожалуйста, введите название документа");
      setLoading(false);
      return;
    } else if (formData.documentType === "") {
      setError("Пожалуйста, выберите тип документа");
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
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            // Вычисляем процент загрузки
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setUploadProgress(percentCompleted); // Записываем в стейт
          }
        },
      });

      if (response.status === 200 || response.status === 201) {
        (e.target as HTMLFormElement).reset();
      } else {
        throw new Error("Ошибка отправки данных. " + response.statusText);
      }
    } catch (err) {
      setError("Ошибка при отправке данных: " + err);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    window.localStorage.removeItem("add" + endPoint.replace("/", ""));
    setFormData({
      title: "",
      comment: "",
      documentType: "",
      deleted: false,
    });
    location.reload();
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
            Справочник - Создать документ
          </li>
        </ol>
      </nav>
      <h2 className="mb-4">Создать документ</h2>

      {loading && (
        <div
          className="card p-4 shadow position-fixed top-50 start-50 translate-middle bg-white"
          style={{ zIndex: 1050, width: "350px" }}
        >
          <div className="d-flex align-items-center mb-3">
            <div className="spinner-border text-primary me-3" role="status">
              <span className="visually-hidden">Загрузка...</span>
            </div>
            <h6 className="mb-0 fw-bold">Отправка файла на сервер...</h6>
          </div>

          {/* Прогресс-бар Bootstrap */}
          <div className="progress" style={{ height: "20px" }}>
            <div
              className="progress-bar progress-bar-striped progress-bar-animated bg-success"
              role="progressbar"
              style={{ width: `${uploadProgress}%` }}
              aria-valuenow={uploadProgress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              {uploadProgress}%
            </div>
          </div>
        </div>
      )}

      {error && <div className="alert alert-danger mt-3">{error}</div>}

      <form onSubmit={handleSubmit} onReset={handleReset}>
        <div className="mb-3">
          <label htmlFor="docName" className="form-label">
            Название документа
          </label>
          <input
            type="text"
            id="docName"
            className="form-control is-invalid"
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
            className="form-control is-invalid"
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
            Выберите тип документа:
          </label>
          <select
            id="docType"
            name="docType"
            className="form-select is-invalid"
            onChange={handleDocTypeChange}
            value={formData.documentType || ""}
            required
          >
            <option disabled value="">
              Выберите тип...
            </option>
            <option value="ADMIN">Исполнительная документация</option>
            <option value="COMMISSION">Акт ввода в эксплуатацию</option>
            <option value="PROJECT">Проектная документация</option>
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

        <div className="d-flex justify-content-between align-items-center">
          <button
            type="submit"
            className={`btn ${loading ? "btn-secondary" : "btn-success"}`}
            disabled={loading || !selectedFile || !formData.documentType}
          >
            {loading ? "Сохранение..." : "Сохранить"}
          </button>
          <button type="reset" className="btn btn btn-outline-warning">
            Сбросить
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleBack}
          >
            Назад
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDocument;

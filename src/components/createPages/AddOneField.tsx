import { useState, useEffect } from "react";
import { axiosInstance, useAxiosInterceptor } from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../../hooks/useLocalStorage";

export interface FormData {
  id?: number | null;
  title: string;
  comment: string | null;
  deleted?: boolean;
}

interface RequestCustom {
  endPoint: string;
  prevPage: string;
  title: string;
  titleLabel: string;
  placeHolder: string;
}

const AddStationsNames = ({
  endPoint,
  title,
  titleLabel,
  placeHolder,
  prevPage,
}: RequestCustom) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useAxiosInterceptor();

  const [formData, setFormData] = useLocalStorage<FormData>(
    "add" + endPoint.replace("/", ""),
    {
      title: "",
      comment: null,
      deleted: false,
    },
  );

  useEffect(() => {
    const title = document.getElementById("stationName");

    if (formData.title === "" && title)
      title.className = "form-control is-invalid";
    else if (title) title.className = "form-control";
  }, []);

  // Обработчик изменения поля "title"
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value ?? "";
    setFormData({
      ...formData,
      title: title,
    });
    if (title === "") e.target.className = "form-control is-invalid";
    else e.target.className = "form-control";
  };

  // Обработчик изменения поля "Комментарий"
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      comment: e.target.value,
    });
  };

  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Валидация
    if (!formData.title.trim()) {
      setError("Пожалуйста, введите название станции.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post(endPoint, formData);

      if (response.status === 200 || response.status === 201) {
        setFormData({
          title: "",
          comment: null,
        });
      } else {
        setError("Ошибка отправки данных");
      }
    } catch (err: any) {
      console.error("Ошибка загрузки:", err);
      if (err.response) {
        setError(err.response.data.message || "Ошибка");
      } else {
        setError("Сетевая ошибка или другая ошибка");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`${endPoint}`, { replace: true });
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    window.localStorage.removeItem("add" + endPoint.replace("/", ""));
    setFormData({
      title: "",
      comment: null,
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
            <a href={endPoint}>{prevPage}</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Справочник - {title}
          </li>
        </ol>
      </nav>
      <h2 className="mb-4">{title}</h2>

      {loading && (
        <div className="position-fixed top-50 start-50 translate-middle">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      )}

      {error && <div className="alert alert-danger mt-3">{error}</div>}

      <form onSubmit={handleSubmit} onReset={handleReset}>
        <div className="mb-3">
          <label htmlFor="stationName" className="form-label">
            {titleLabel}
          </label>
          <input
            type="text"
            id="stationName"
            className="form-control"
            value={formData.title}
            onChange={handleNameChange}
            autoComplete="off"
            placeholder={placeHolder}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="comment" className="form-label">
            Комментарий:
          </label>
          <textarea
            id="comment"
            className="form-control"
            rows={4}
            value={formData.comment ?? ""}
            onChange={handleCommentChange}
            autoComplete="off"
            placeholder="Комментарий"
          />
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <button
            type="submit"
            className={`btn ${loading ? "btn-secondary" : "btn-success"}`}
            disabled={loading}
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

export default AddStationsNames;

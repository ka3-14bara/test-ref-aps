import { useEffect, useState } from "react";
import { axiosInstance, useAxiosInterceptor } from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { Organization as FormData } from "./AddTypes";

interface RequestCustom {
  endPoint: string;
}
const AddOrgs = ({ endPoint }: RequestCustom) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useAxiosInterceptor();

  const [formData, setFormData] = useLocalStorage<FormData>(
    "addOrg" + endPoint.replace("/", ""),
    {
      title: "",
      shortTitle: "",
      responsible: "",
      jobTitle: "",
      comment: "",
      deleted: false,
    },
  );

  useEffect(() => {
    const title = document.getElementById(
      "fullOrgName",
    ) as HTMLInputElement | null;

    if (title && (title.value === "" || title.value == null))
      title.className = "form-control mb-3 is-invalid";
    else if (title) title.className = "form-control mb-3";
  }, []);

  // Обработчик изменения поля "Название станции"
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value !== "" ? e.target.value : undefined;

    setFormData({
      ...formData,
      title: e.target.value,
    });

    if (value != undefined) e.target.className = "form-control mb-3";
    else e.target.className = "form-control mb-3 is-invalid";
  };

  // Обработчик изменения поля "Название станции"
  const handleShortTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      shortTitle: e.target.value,
    });
  };

  // Обработчик изменения поля "Название станции"
  const handleResponsibleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      responsible: e.target.value,
    });
  };

  // Обработчик изменения поля "Название станции"
  const handleJobTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      jobTitle: e.target.value,
    });
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
      setError("Пожалуйста, введите название организации.");
      setLoading(false);
      return;
    }

    if (formData.shortTitle && !formData.shortTitle.trim()) {
      setError("Пожалуйста, введите сокращенное название организации.");
      setLoading(false);
      return;
    }

    if (formData.shortTitle && !formData.shortTitle.trim()) {
      setError("Пожалуйста, введите ФИО ответственного.");
      setLoading(false);
      return;
    }

    if (formData.shortTitle && !formData.shortTitle.trim()) {
      setError("Пожалуйста, введите должность ответственного");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post(endPoint, formData);

      if (response.status === 200 || response.status === 201) {
        setFormData({
          title: "",
          shortTitle: "",
          responsible: "",
          jobTitle: "",
          comment: "",
          deleted: false,
        });
        window.localStorage.removeItem("addOrg");
      } else {
        throw new Error("Ошибка отправки данных");
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
    window.localStorage.removeItem("addOrg");
    setFormData({
      title: "",
      shortTitle: "",
      responsible: "",
      jobTitle: "",
      comment: "",
      deleted: false,
    });
    location.reload();
  };

  return (
    <div className="container mt-4">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="/">Главная</a>
          </li>
          <li className="breadcrumb-item">
            <a href={endPoint}>Подразделения и организации</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Справочник - Форма добавления организаций/подразделений
          </li>
        </ol>
      </nav>
      <h2 className="mb-4">Форма добавления организаций/подразделений</h2>

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
          <label htmlFor="fullOrgName" className="form-label">
            Полное наименование
          </label>
          <input
            type="text"
            id="fullOrgName"
            className="form-control mb-3 is-invalid"
            value={formData.title ?? ""}
            onChange={handleTitleChange}
            autoComplete="off"
            placeholder="Полное наименование организации"
            style={{ height: "90px" }}
            required
          />

          <label htmlFor="shortOrgName" className="form-label">
            Сокращенное наименование
          </label>
          <input
            type="text"
            id="shortOrgName"
            className="form-control mb-3"
            value={formData.shortTitle ?? ""}
            onChange={handleShortTitleChange}
            autoComplete="off"
            placeholder="Сокращенное наименование организации"
            style={{ height: "50px" }}
          />

          <label htmlFor="person" className="form-label">
            Ф.И.О. лица для утверждения перечня оборудования со стороны
            подразделений ПАО «КАМАЗ»
          </label>
          <input
            type="text"
            id="person"
            className="form-control mb-3"
            value={formData.responsible ?? ""}
            onChange={handleResponsibleChange}
            autoComplete="off"
            placeholder="ФИО ответственного"
            style={{ height: "50px" }}
          />

          <label htmlFor="grade" className="form-label">
            Должность ответсвенного лица
          </label>
          <input
            type="text"
            id="grade"
            className="form-control mb-5"
            value={formData.jobTitle ?? ""}
            onChange={handleJobTitleChange}
            autoComplete="off"
            placeholder="Должность"
            style={{ height: "50px" }}
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

export default AddOrgs;

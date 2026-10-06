import { useEffect, useState } from "react";
import { axiosInstance, useAxiosInterceptor } from "../../api/axios";
import { useNavigate } from "react-router-dom";
import SearchableInput from "../../modules/SearchableInput";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import axios from "axios";
interface RequestCustom {
  endPoint: string;
}
type DetectorData = {
  id?: number | null;
  title: string;
  comment: string | null;
  deleted?: boolean;
};

interface FormData {
  title: string;
  laboriousness: number | null;
  purpose: string;
  type: DetectorData | null;
  comment: string | null;
  deleted?: boolean;
}

const AddDetectors = ({ endPoint }: RequestCustom) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useLocalStorage<FormData>("addDetector", {
    title: "",
    laboriousness: null,
    purpose: "",
    type: { id: null, title: "", comment: "", deleted: false },
    comment: null,
    deleted: false,
  });

  useAxiosInterceptor();

  useEffect(() => {
    const name = document.getElementById(
      "detectorName",
    ) as HTMLInputElement | null;
    const laboriousness = document.getElementById(
      "laboriousness",
    ) as HTMLSelectElement | null;
    const purpose = document.getElementById(
      "purpose",
    ) as HTMLSelectElement | null;

    if (name && (name.value === "" || name.value == null))
      name.className = "form-control mb-3 is-invalid";
    else if (name) name.className = "form-control mb-3";

    if (
      laboriousness &&
      (laboriousness.value === "" || laboriousness.value == null)
    )
      laboriousness.className = "form-control mb-3 is-invalid";
    else if (laboriousness) laboriousness.className = "form-control mb-3";

    if (purpose && (purpose.value === "" || purpose.value == null))
      purpose.className = "form-control mb-3 is-invalid";
    else if (purpose) purpose.className = "form-control mb-3";
  }, []);

  // Обработчик изменения поля "Название станции"
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;

    setFormData({
      ...formData,
      title: title,
    });

    if (title === "") e.target.className = "form-control mb-3 is-invalid";
    else e.target.className = "form-control mb-3";
  };

  // Обработчик изменения поля "Название станции"
  const handleLaboriousnessChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value === "" ? null : parseFloat(e.target.value);
    setFormData({
      ...formData,
      laboriousness: value,
    });

    if (value == null) e.target.className = "form-control mb-3 is-invalid";
    else e.target.className = "form-control mb-3";
  };

  // Обработчик изменения поля "Название станции"
  const handlePurposeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setFormData({
      ...formData,
      purpose: e.target.value,
    });

    if (value === "") e.target.className = "form-control mb-3 is-invalid";
    else e.target.className = "form-control mb-3";
  };

  // Обработчик изменения поля "Тип датчика"
  const handleTypeTitleChange = (item: DetectorData) => {
    setFormData((prev) => ({ ...prev, type: item }));
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
    setLoading(true);
    setError(null);

    const finalData: any = {
      title: formData.title,
      laboriousness: formData.laboriousness,
      purpose: formData.purpose,
      type: formData.type?.id ?? null,
      comment: formData.comment,
      deleted: false,
    };
    try {
      // Отправка запроса
      const response = await axiosInstance.post(endPoint, finalData);

      // Обработка успешного ответа
      console.log("Успешный ответ:", response.data);
      window.localStorage.removeItem("addDetector");
      navigate("/detectors");
    } catch (err) {
      console.error("Ошибка при отправке:", err);
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Произошла ошибка при сохранении данных",
        );
      } else {
        setError("Произошла неизвестная ошибка");
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
    window.localStorage.removeItem("addDetector");
    setFormData({
      title: "",
      laboriousness: null,
      purpose: "",
      type: { id: null, title: "", comment: "", deleted: false },
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
            <a href={endPoint}>Извещатели и датчики</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Справочник - Создать извещатель, датчик
          </li>
        </ol>
      </nav>
      <h2 className="mb-4">Форма создания извещателя или датчика</h2>

      {loading && (
        <div className="position-fixed top-50 start-50 translate-middle">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      )}

      {error && <div className="alert alert-danger mt-3">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="detectorName" className="form-label">
            Наименование датчика
          </label>
          <input
            type="text"
            id="detectorName"
            className="form-control mb-3 is-invalid"
            value={formData.title}
            onChange={handleTitleChange}
            autoComplete="off"
            placeholder="Наименование датчика"
            style={{ height: "90px" }}
            required
          />

          <label htmlFor="laboriousness" className="form-label">
            Трудоемкость
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            id="laboriousness"
            className="form-control mb-3 is-invalid"
            value={formData.laboriousness ?? ""}
            onChange={handleLaboriousnessChange}
            autoComplete="off"
            placeholder="Трудоемкость 0.00"
            style={{ height: "50px" }}
            required
          />

          <label htmlFor="purpose" className="form-label">
            Назначение датчика
          </label>
          <input
            type="text"
            id="purpose"
            className="form-control mb-3 is-invalid"
            value={formData.purpose}
            onChange={handlePurposeChange}
            autoComplete="off"
            placeholder="Назначение датчика"
            style={{ height: "50px" }}
            required
          />

          <label htmlFor="detectorType" className="form-label">
            Тип датчика
          </label>
          <SearchableInput<DetectorData> // <-- Указываем тип здесь
            endpoint="/detector_types/all"
            onItemSelected={handleTypeTitleChange}
            inputId="detectorType"
            style={{ height: "50px" }}
            isRequired={true}
            showAfterReload={formData.type?.title ?? ""}
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
          <button
            type="button"
            className="btn btn btn btn btn-outline-warning"
            onClick={handleReset}
          >
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

export default AddDetectors;

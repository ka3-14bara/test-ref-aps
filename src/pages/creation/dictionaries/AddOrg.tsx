import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance, useAxiosInterceptor } from "../../../api/client";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { Organization } from "../../../types/creation";

interface AddOrgProps {
  endPoint: string;
}

export const AddOrg: React.FC<AddOrgProps> = ({ endPoint }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useAxiosInterceptor();

  const storageKey = "addOrg" + endPoint.replace(/\//g, "");
  const [formData, setFormData] = useLocalStorage<Organization>(storageKey, {
    title: "",
    shortTitle: "",
    responsible: "",
    jobTitle: "",
    comment: "",
    deleted: false,
  });

  const handleFieldChange = (field: keyof Organization, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Пожалуйста, введите полное наименование организации.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post(endPoint, formData);
      if (response.status === 200 || response.status === 201) {
        window.localStorage.removeItem(storageKey);
        navigate(endPoint);
      }
    } catch (err: any) {
      console.error("Ошибка добавления организации:", err);
      setError(
        err.response?.data?.message ||
          "Ошибка при сохранении данных организации",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    window.localStorage.removeItem(storageKey);
    setFormData({
      title: "",
      shortTitle: "",
      responsible: "",
      jobTitle: "",
      comment: "",
      deleted: false,
    });
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
            <a href={endPoint}>Подразделения и организации</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Форма добавления
          </li>
        </ol>
      </nav>

      <h3 className="mb-4">Добавить подразделение / организацию</h3>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card shadow-sm border-0 p-4">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-12">
              <label htmlFor="fullOrgName" className="form-label fw-semibold">
                Полное наименование <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="fullOrgName"
                className={`form-control ${!formData.title ? "is-invalid" : ""}`}
                value={formData.title}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                placeholder="Полное официальное наименование"
                required
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="shortOrgName" className="form-label fw-semibold">
                Сокращенное наименование
              </label>
              <input
                type="text"
                id="shortOrgName"
                className="form-control"
                value={formData.shortTitle}
                onChange={(e) =>
                  handleFieldChange("shortTitle", e.target.value)
                }
                placeholder="Например: ПАО «КАМАЗ»"
              />
            </div>

            <div className="col-md-6">
              <label
                htmlFor="responsiblePerson"
                className="form-label fw-semibold"
              >
                Ответственное лицо (ФИО)
              </label>
              <input
                type="text"
                id="responsiblePerson"
                className="form-control"
                value={formData.responsible}
                onChange={(e) =>
                  handleFieldChange("responsible", e.target.value)
                }
                placeholder="Фамилия Имя Отчество"
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="jobTitle" className="form-label fw-semibold">
                Должность ответственного
              </label>
              <input
                type="text"
                id="jobTitle"
                className="form-control"
                value={formData.jobTitle}
                onChange={(e) => handleFieldChange("jobTitle", e.target.value)}
                placeholder="Должность"
              />
            </div>

            <div className="col-12">
              <label htmlFor="orgComment" className="form-label fw-semibold">
                Комментарий
              </label>
              <textarea
                id="orgComment"
                className="form-control"
                rows={3}
                value={formData.comment}
                onChange={(e) => handleFieldChange("comment", e.target.value)}
                placeholder="Дополнительные сведения..."
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
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                ) : null}
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
              onClick={() => navigate(endPoint)}
            >
              Назад
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOrg;

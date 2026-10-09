import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance, useAxiosInterceptor } from "../../../api/client";
import { useLocalStorage } from "../../../hooks/useLocalStorage";

export interface FormDataOneField {
  id?: number | null;
  title: string;
  comment: string | null;
  deleted?: boolean;
}

interface AddOneFieldProps {
  endPoint: string;
  prevPage: string;
  title: string;
  titleLabel: string;
  placeHolder: string;
}

export const AddOneField: React.FC<AddOneFieldProps> = ({
  endPoint,
  title,
  titleLabel,
  placeHolder,
  prevPage,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useAxiosInterceptor();

  const storageKey = "add" + endPoint.replace(/\//g, "");
  const [formData, setFormData] = useLocalStorage<FormDataOneField>(
    storageKey,
    {
      title: "",
      comment: null,
      deleted: false,
    },
  );

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, title: e.target.value }));
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, comment: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError(`Пожалуйста, заполните: ${titleLabel}`);
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
      console.error("Ошибка сохранения:", err);
      setError(
        err.response?.data?.message || "Сетевая ошибка сохранения данных",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    window.localStorage.removeItem(storageKey);
    setFormData({
      title: "",
      comment: null,
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
            <a href={endPoint}>{prevPage}</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {title}
          </li>
        </ol>
      </nav>

      <h3 className="mb-4">{title}</h3>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card shadow-sm border-0 p-4">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="stationName" className="form-label fw-semibold">
              {titleLabel} <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="stationName"
              className={`form-control ${!formData.title ? "is-invalid" : ""}`}
              value={formData.title}
              onChange={handleNameChange}
              placeholder={placeHolder}
              autoComplete="off"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="commentField" className="form-label fw-semibold">
              Комментарий
            </label>
            <textarea
              id="commentField"
              className="form-control"
              rows={3}
              value={formData.comment ?? ""}
              onChange={handleCommentChange}
              placeholder="Дополнительные примечания..."
            />
          </div>

          <div className="d-flex justify-content-between align-items-center">
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

export default AddOneField;

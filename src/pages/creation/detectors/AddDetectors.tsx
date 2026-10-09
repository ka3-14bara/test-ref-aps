import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance, useAxiosInterceptor } from "../../../api/client";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import SearchableInput from "../../../components/common/SearchableInput";
import { DetectorItem } from "../../../types/creation";

interface AddDetectorsProps {
  endPoint: string;
}

export const AddDetectors: React.FC<AddDetectorsProps> = ({ endPoint }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useAxiosInterceptor();

  const [formData, setFormData] = useLocalStorage<DetectorItem>("addDetector", {
    title: "",
    laboriousness: 0,
    purpose: "",
    type: { id: null, title: "", comment: "", deleted: false },
    comment: "",
    deleted: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Введите наименование датчика");
      return;
    }
    if (!formData.type?.id) {
      setError("Выберите тип датчика");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        title: formData.title,
        laboriousness: formData.laboriousness,
        purpose: formData.purpose,
        type: formData.type.id,
        comment: formData.comment || null,
        deleted: false,
      };
      await axiosInstance.post(endPoint, payload);
      window.localStorage.removeItem("addDetector");
      navigate("/detectors");
    } catch (err: any) {
      console.error("Ошибка сохранения датчика:", err);
      setError(err.response?.data?.message || "Ошибка при сохранении датчика");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    window.localStorage.removeItem("addDetector");
    setFormData({
      title: "",
      laboriousness: 0,
      purpose: "",
      type: { id: null, title: "", comment: "", deleted: false },
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
            <a href={endPoint}>Извещатели и датчики</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Форма добавления
          </li>
        </ol>
      </nav>

      <h3 className="mb-4">Создать извещатель или датчик</h3>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card shadow-sm border-0 p-4">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="detectorName" className="form-label fw-semibold">
                Наименование датчика <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="detectorName"
                className={`form-control ${!formData.title ? "is-invalid" : ""}`}
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Наименование"
                required
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="detectorLabor" className="form-label fw-semibold">
                Трудоемкость (нормо-часы)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                id="detectorLabor"
                className="form-control"
                value={formData.laboriousness ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    laboriousness: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="0.00"
              />
            </div>

            <div className="col-md-6">
              <label
                htmlFor="detectorPurpose"
                className="form-label fw-semibold"
              >
                Назначение датчика
              </label>
              <input
                type="text"
                id="detectorPurpose"
                className="form-control"
                value={formData.purpose}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, purpose: e.target.value }))
                }
                placeholder="Например: обнаружение дыма"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Тип датчика <span className="text-danger">*</span>
              </label>
              <SearchableInput<any>
                endpoint="/detector_types/all"
                onItemSelected={(selected) =>
                  setFormData((prev) => ({ ...prev, type: selected }))
                }
                inputId="detectorTypeInput"
                showAfterReload={formData.type?.title || ""}
                isRequired={true}
              />
            </div>

            <div className="col-12">
              <label
                htmlFor="detectorComment"
                className="form-label fw-semibold"
              >
                Комментарий
              </label>
              <textarea
                id="detectorComment"
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
              onClick={() => navigate("/detectors")}
            >
              Назад
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDetectors;

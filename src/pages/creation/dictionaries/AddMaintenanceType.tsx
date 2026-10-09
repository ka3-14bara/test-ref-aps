import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance, useAxiosInterceptor } from "../../../api/client";
import { useLocalStorage } from "../../../hooks/useLocalStorage";

interface FormDataMaintenanceType {
  title: string;
  codes: Array<{ codeId: number; periodicity: number }>;
  workTypeFor: string;
  comment?: string | null;
  deleted?: boolean;
}

interface CodeData {
  id: number;
  title: string;
  comment: string;
  deleted: boolean;
}

interface AddMaintenanceTypeProps {
  endPoint: string;
}

export const AddMaintenanceType: React.FC<AddMaintenanceTypeProps> = ({
  endPoint,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [allCodes, setAllCodes] = useState<CodeData[]>([]);
  const navigate = useNavigate();
  useAxiosInterceptor();

  const [formData, setFormData] = useLocalStorage<FormDataMaintenanceType>(
    "addMaintenanceType",
    {
      title: "",
      codes: [],
      workTypeFor: "",
      comment: null,
      deleted: false,
    },
  );

  const [checkboxes, setCheckboxes] = useLocalStorage<Record<string, boolean>>(
    "maintenanceCheckboxes",
    {},
  );

  useEffect(() => {
    const fetchCodes = async () => {
      try {
        const response = await axiosInstance.get<CodeData[]>(
          "/work_type_codes/all",
        );
        setAllCodes(response.data || []);
      } catch (err) {
        console.error("Ошибка загрузки кодов работ:", err);
      }
    };
    fetchCodes();
  }, []);

  const handleCheckboxChange = (
    codeId: number,
    titleKey: string,
    checked: boolean,
  ) => {
    setCheckboxes((prev) => ({ ...prev, [titleKey]: checked }));
    setFormData((prev) => {
      if (checked) {
        return {
          ...prev,
          codes: [...prev.codes, { codeId, periodicity: 1 }],
        };
      }
      return {
        ...prev,
        codes: prev.codes.filter((c) => c.codeId !== codeId),
      };
    });
  };

  const handlePeriodicityChange = (codeId: number, periodicity: number) => {
    setFormData((prev) => ({
      ...prev,
      codes: prev.codes.map((c) =>
        c.codeId === codeId ? { ...c, periodicity } : c,
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Введите наименование вида работ");
      return;
    }
    if (formData.codes.length === 0) {
      setError("Выберите хотя бы один код регламентной работы");
      return;
    }
    if (!formData.workTypeFor) {
      setError("Выберите тип субъекта");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await axiosInstance.post(endPoint, formData);
      window.localStorage.removeItem("addMaintenanceType");
      window.localStorage.removeItem("maintenanceCheckboxes");
      navigate(endPoint);
    } catch (err: any) {
      console.error("Ошибка сохранения:", err);
      setError(
        err.response?.data?.message ||
          "Ошибка при сохранении вида регламентной работы",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    window.localStorage.removeItem("addMaintenanceType");
    window.localStorage.removeItem("maintenanceCheckboxes");
    setFormData({
      title: "",
      codes: [],
      workTypeFor: "",
      comment: null,
      deleted: false,
    });
    setCheckboxes({});
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
            <a href={endPoint}>Виды регламентных работ</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Форма добавления
          </li>
        </ol>
      </nav>

      <h3 className="mb-4">Добавить вид регламентной работы</h3>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card shadow-sm border-0 p-4">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label
              htmlFor="mainWorkTypeTitle"
              className="form-label fw-semibold"
            >
              Наименование вида работ <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="mainWorkTypeTitle"
              className={`form-control ${!formData.title ? "is-invalid" : ""}`}
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Введите наименование..."
              required
            />
          </div>

          <div className="mb-3">
            <label
              htmlFor="workTypeForSelect"
              className="form-label fw-semibold"
            >
              Тип субъекта <span className="text-danger">*</span>
            </label>
            <select
              id="workTypeForSelect"
              className={`form-select ${!formData.workTypeFor ? "is-invalid" : ""}`}
              value={formData.workTypeFor}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  workTypeFor: e.target.value,
                }))
              }
              required
            >
              <option value="" disabled>
                -- Выберите тип субъекта --
              </option>
              <option value="TRAIN">Шлейф</option>
              <option value="STATION">Станция</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Коды регламентных работ и периодичность{" "}
              <span className="text-danger">*</span>
            </label>
            <div
              className="border rounded p-3 bg-light overflow-auto"
              style={{ maxHeight: "300px" }}
            >
              {allCodes.map((codeItem) => {
                const isChecked = Boolean(checkboxes[codeItem.title]);
                const codeObj = formData.codes.find(
                  (c) => c.codeId === codeItem.id,
                );
                return (
                  <div
                    key={codeItem.id}
                    className="row g-2 align-items-center mb-2"
                  >
                    <div className="col-md-8">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`code-check-${codeItem.id}`}
                          checked={isChecked}
                          onChange={(e) =>
                            handleCheckboxChange(
                              codeItem.id,
                              codeItem.title,
                              e.target.checked,
                            )
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`code-check-${codeItem.id}`}
                        >
                          <strong>{codeItem.title}</strong> — {codeItem.comment}
                        </label>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="input-group input-group-sm">
                        <span className="input-group-text">Периодичность:</span>
                        <input
                          type="number"
                          min="1"
                          className="form-control"
                          disabled={!isChecked}
                          value={codeObj?.periodicity ?? ""}
                          onChange={(e) =>
                            handlePeriodicityChange(
                              codeItem.id,
                              parseInt(e.target.value, 10) || 1,
                            )
                          }
                          placeholder="в мес."
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="maintComment" className="form-label fw-semibold">
              Комментарий
            </label>
            <textarea
              id="maintComment"
              className="form-control"
              rows={3}
              value={formData.comment ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, comment: e.target.value }))
              }
              placeholder="Примечания..."
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

export default AddMaintenanceType;

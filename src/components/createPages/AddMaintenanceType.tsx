import { useState, useEffect } from "react";
import { axiosInstance, useAxiosInterceptor } from "../../api/axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { useLocalStorage } from "../../hooks/useLocalStorage";

interface FormData {
  title: string | undefined;
  codes: {
    codeId: number;
    periodicity: number;
  }[];
  workTypeFor: string;
  workTypeForValue: string;
  comment?: string | null;
  deleted?: boolean;
}

interface CodeData {
  id: number;
  title: string;
  comment: string;
  deleted: boolean;
}

interface RequestCustom {
  endPoint: string;
}

/*
  Модуль страницы формы добавления вида регламентной работы
*/
const AddMaintenanceType = ({ endPoint }: RequestCustom) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [update, setUpdate] = useState(false);
  const navigate = useNavigate();
  const [allCodes, setAllCodes] = useState<CodeData[]>([]);
  useAxiosInterceptor();

  const [formData, setFormData] = useLocalStorage<FormData>(
    "addMaintenanceType",
    {
      title: "",
      codes: [],
      workTypeFor: "",
      workTypeForValue: "",
      comment: null,
      deleted: false,
    },
  );

  // Состояние для чекбоксов с сохранением в localStorage
  const [checkboxes, setCheckboxes] = useLocalStorage<Record<string, boolean>>(
    "maintenanceCheckboxes",
    {},
  );

  useEffect(() => {
    const title = document.getElementById(
      "fullOrgName",
    ) as HTMLInputElement | null;
    const type = document.getElementById("subType") as HTMLSelectElement | null;
    const values = ["train", "station"];

    if (title && (title.value === "" || title.value == null))
      title.className = "form-control mb-3 is-invalid";
    else if (title) title.className = "form-control mb-3";

    if (type && !values.includes(formData.workTypeFor ?? ""))
      type.className = "form-select is-invalid";
    else if (type) type.className = "form-select";
  }, []);

  useEffect(() => {
    allCodes.map((item) => {
      const code = document.getElementById(
        item.title + item.id + "Period",
      ) as HTMLInputElement | null;
      const titleKey = item.title;
      const isChecked = checkboxes[titleKey] || false;

      if (code && code.value == null && isChecked)
        code.className = "form-control mb-2 is-invalid";
      else if (code) code.className = "form-control mb-2";
    });
  }, [allCodes]);

  const fetchWorkCodes = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get<CodeData[]>(
        "/work_type_codes/all",
      );
      const codes = response.data || [];
      setAllCodes(codes);

      // Инициализируем чекбоксы на основе загруженных кодов
      const initialCheckboxes: Record<string, boolean> = {};
      codes.forEach((element) => {
        initialCheckboxes[element.title] = checkboxes[element.title] || false;
      });
      setCheckboxes(initialCheckboxes);
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
      setAllCodes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkCodes();
    setUpdate(false);
  }, [endPoint, update]);

  // Обработчик изменения поля "Название станции"
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value !== "" ? e.target.value : undefined;
    setFormData({
      ...formData,
      title: value,
    });
    if (value != undefined) e.target.className = "form-control mb-3";
    else e.target.className = "form-control mb-3 is-invalid";
  };

  // Обработчик изменения поля "Комментарий"
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      comment: e.target.value,
    });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === "train" ? "Шлейф" : "Станция";
    setFormData({
      ...formData,
      workTypeFor: e.target.value,
      workTypeForValue: value,
    });
    e.target.className = "form-select";
  };

  const handlePeriodChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    codeId: number,
  ) => {
    const { value } = e.target;
    const periodicityValue = value ? parseInt(value, 10) : 0;
    // Обновляем периодичность для конкретного кода
    setFormData((prev) => ({
      ...prev,
      codes: prev.codes.map((code) =>
        code.codeId === codeId
          ? { ...code, periodicity: periodicityValue }
          : code,
      ),
    }));
    if (periodicityValue != 0) e.target.className = "form-control";
    else e.target.className = "form-control is-invalid";
  };

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    titleKey: string,
    codeId: number,
  ) => {
    const { checked } = e.target;
    setCheckboxes((prevCheckboxes) => ({
      ...prevCheckboxes,
      [titleKey]: checked,
    }));

    // Если чекбокс был отмечен, добавляем его в массив codes
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        codes: [
          ...prev.codes,
          {
            codeId: codeId,
            periodicity: 0, // начальное значение периодичности
          },
        ],
      }));
    } else {
      // Если чекбокс снят, удаляем его из массива codes
      setFormData((prev) => ({
        ...prev,
        codes: prev.codes.filter((code) => code.codeId !== codeId),
      }));
    }
  };

  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selVals = ["TRAIN", "STATION"];
    // Здесь добавь логику отправки на сервер
    if (formData.title === undefined || !formData.title.trim()) {
      setError("Пожалуйста, введите наименование вида работ.");
      setLoading(false);
      return;
    } else if (formData.codes.length == 0) {
      setError("Выберите хотя бы один вид регламентной работы");
      setLoading(false);
      return;
    } else if (!selVals.includes(formData.workTypeFor ?? "")) {
      setError("Выберите тип субъекта");
      setLoading(false);
      return;
    }
    const finalData = {
      title: formData.title,
      workTypeFor: formData.workTypeFor,
      codes: formData.codes,
      comment: formData.comment,
    };
    setLoading(true);
    setError(null);
    setUpdate(true);

    try {
      const response = await axiosInstance.post(endPoint, finalData);

      if (response.status === 200 || response.status === 201) {
        setFormData({
          title: "",
          codes: [],
          workTypeFor: "",
          workTypeForValue: "",
          comment: undefined,
          deleted: false,
        });
        (e.target as HTMLFormElement).reset();
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
    window.localStorage.removeItem("addMaintenanceType");
    window.localStorage.removeItem("maintenanceCheckboxes"); // Очищаем чекбоксы
    setFormData({
      title: "",
      codes: [],
      workTypeFor: "",
      workTypeForValue: "",
      comment: undefined,
      deleted: false,
    });
    setCheckboxes({}); // Сбрасываем состояние чекбоксов
    location.reload();
  };

  return (
    <div className="container items-center mb-0 mt-2">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="/">Главная</a>
          </li>
          <li className="breadcrumb-item">
            <a href={endPoint}>Виды регламентных работ</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Справочник - Форма добавления вида регламентной работы
          </li>
        </ol>
      </nav>
      <h2 className="mb-4">Форма добавления вида регламентной работы</h2>
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
            Наименование вида работ
          </label>
          <input
            type="text"
            id="fullOrgName"
            className="form-control mb-3 is-invalid"
            value={formData.title ?? ""}
            onChange={handleTitleChange}
            placeholder="Наименование вида работ"
            autoComplete="off"
            style={{ height: "90px" }}
            required
          />
          <div className="border rounded ps-3 pe-3">
            <h5 className="mb-3 mt-1">
              Выберите вид регламентной работы и введите периодичность:
            </h5>
            {allCodes.length > 0 &&
              allCodes.map((item) => {
                const titleKey = item.title;
                const isChecked = checkboxes[titleKey] || false;
                return (
                  <div className="form-check mb-3" key={item.id || item.title}>
                    {/* Чекбокс */}
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={item.title + item.id}
                      checked={isChecked}
                      onChange={(e) =>
                        handleCheckboxChange(e, titleKey, item.id)
                      }
                    />
                    <label
                      className="form-check-label"
                      htmlFor={item.title + item.id}
                    >
                      {item.title} - {item.comment}
                    </label>
                    {/* Поле ввода (активируется/деактивируется) */}
                    <input
                      type="number"
                      min="1"
                      step="1"
                      id={item.title + item.id + "Period"}
                      className={`form-control mb-2 ${isChecked ? "is-invalid" : ""}`}
                      placeholder="Периодичность в месяцах"
                      disabled={!isChecked}
                      value={
                        formData.codes.find((code) => code.codeId === item.id)
                          ?.periodicity || ""
                      }
                      onChange={(e) => handlePeriodChange(e, item.id)}
                      autoComplete="off"
                      required={isChecked}
                    />
                  </div>
                );
              })}
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="subType" className="form-label">
            Выберите тип субъекта:
          </label>
          <select
            id="subType"
            name="subType"
            className="form-select is-invalid"
            onChange={handleSelectChange}
            required
            value={formData.workTypeFor || ""}
          >
            <option value="" disabled>
              ...
            </option>
            <option value="TRAIN">Шлейф</option>
            <option value="STATION">Станция</option>
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

export default AddMaintenanceType;

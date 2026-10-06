import { useCallback, useEffect, useState } from "react";
import { axiosInstance, useAxiosInterceptor } from "../../api/axios";
import { useNavigate } from "react-router-dom";
import SearchableInput from "../../modules/SearchableInput";
import WorkTypesForm from "../../modules/WorkTypesForm";
import { CreateItemModal } from "../../modules/modal/CreateItemModal";
import { CreateDocumentModal } from "../../modules/modal/CreateDocumentModal";
import {
  RequestCustom,
  FormDataStation as FormData,
  MaintenanceTeam,
  Document,
  MaintenanceTeam as Station,
  WorkTypes,
} from "./AddTypes";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import axios from "axios";
import GetInitialValue from "../../utils/GetInitialValue";
import { searchableConfigs } from "../../utils/searchableConfig";

const AddStations = ({ endPoint }: RequestCustom) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpenTeam, setisCreateModalOpenTeam] = useState(false);
  const [isCreateModalOpenName, setisCreateModalOpenName] = useState(false);
  const [isCreateModalOpenExecDoc, setisCreateModalOpenExecDoc] =
    useState(false);
  const [isCreateModalOpenProjectDoc, setisCreateModalOpenProjectDoc] =
    useState(false);
  const [isCreateModalOpenComissionDoc, setisCreateModalOpenComissionDoc] =
    useState(false);
  const [mteam, setMteam] = useState<MaintenanceTeam>({
    id: 0,
    title: "",
    comment: "",
    deleted: false,
  });
  const [station, setStation] = useState<Station>({
    id: 0,
    title: "",
    comment: "",
    deleted: false,
  });
  const [projectDoc, setProjectDoc] = useState<Document | null>(null);
  const [commissioningAct, setCommissioningAct] = useState<Document | null>(
    null,
  );
  const [executiveDoc, setExecutiveDoc] = useState<Document | null>(null);
  const [formData, setFormData] = useLocalStorage<FormData>(
    "addStation",
    GetInitialValue("addStation", {
      name: station,
      type: "",
      typeDisplayValue: "",
      number: null,
      capacity: null,
      objectsNumberFrom: null,
      objectsNumberTo: null,
      objectsNumbers: null,
      inventoryNumber: "",
      installationLocation: "",
      dateEntered: null,
      dateAdjusted: null,
      normative: null,
      comment: "",
      sound: null,
      light: null,
      voice: null,
      lightSound: null,
      commissionDoc: null,
      projectDoc: null,
      adminDoc: null,
      supplyFireAlarmQuantity: null,
      supplyWarningEvacuationControlQuantity: null,
      workTypes: null,
      deleted: false,
      objectsNumbersValue: "",
      stationTypesValue: {},
      mteam: null,
    }),
  );
  const [resultData, setResultData] = useState<WorkTypes[] | null>(null);

  const handleWorkTypesChange = useCallback((data: WorkTypes[]) => {
    setResultData(data);
  }, []);
  const maintenancaTeam = [
    { key: "title", label: "Обслуживающая бригада" },
    { key: "orgShortTitle", label: "Обслуживаемая организация" },
    { key: "comment", label: "Комментарий" },
  ];
  const name = [
    { key: "title", label: "Название станции" },
    { key: "comment", label: "Комментарий" },
  ];

  // Ключ для хранения массива черновиков
  const DRAFTS_STORAGE_KEY = "objectPsOsOps_drafts_list";

  const navigate = useNavigate();

  useAxiosInterceptor();

  const handleOpenCreateModalTeam = () => setisCreateModalOpenTeam(true);
  const handleCloseCreateModalTeam = () => setisCreateModalOpenTeam(false);
  const handleOpenCreateModalName = () => setisCreateModalOpenName(true);
  const handleCloseCreateModalName = () => setisCreateModalOpenName(false);

  const handleOpenCreateModalExecDoc = () => setisCreateModalOpenExecDoc(true);
  const handleCloseCreateModalExecDoc = () =>
    setisCreateModalOpenExecDoc(false);
  const handleOpenCreateModalProjectDoc = () =>
    setisCreateModalOpenProjectDoc(true);
  const handleCloseCreateModalProjectDoc = () =>
    setisCreateModalOpenProjectDoc(false);
  const handleOpenCreateModalComissionDoc = () =>
    setisCreateModalOpenComissionDoc(true);
  const handleCloseCreateModalComissionDoc = () =>
    setisCreateModalOpenComissionDoc(false);

  // Побочные действия при выборе черновика (ЧТЕНИЕ остального и УДАЛЕНИЕ)
  useEffect(() => {
    const draftRaw = localStorage.getItem("temp_load_draft");
    if (draftRaw) {
      const parsed = JSON.parse(draftRaw);

      // Принудительно вызываем сеттер хука, чтобы он записал данные
      setFormData(parsed.formData);

      // Сохраняем ID черновика для удаления после успешного POST на сервер
      window.sessionStorage.setItem("current_draft_id", parsed.id.toString());

      // ТЕПЕРЬ ОЧИЩАЕМ, когда все стейты (formData и selectedDetectors) получили данные
      localStorage.removeItem("temp_load_draft");
    }
  }, []); // Сработает один раз при монтировании

  const handleSaveAsDraft = () => {
    const currentDrafts = JSON.parse(
      localStorage.getItem(DRAFTS_STORAGE_KEY) || "[]",
    );

    const newDraft = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      formData: formData,
    };

    localStorage.setItem(
      DRAFTS_STORAGE_KEY,
      JSON.stringify([...currentDrafts, newDraft]),
    );
    alert("Данные сохранены в черновики");
  };

  const validateForm = (): boolean => {
    if (!formData.number) {
      setError("Номер станции обязателен");
      return false;
    }
    if (!formData.type) {
      setError("Тип станции обязателен");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Формируем finalData в требуемом формате
      const finalData = {
        stationNameId: formData.name?.id,
        stationType: formData.type || "",
        maintenanceTeamId: formData.mteam || null,
        number: formData.number || null,
        capacity: formData.capacity || null,
        objectsNumberFrom: formData.objectsNumberFrom || null,
        objectsNumberTo: formData.objectsNumberTo || null,
        inventoryNumber: formData.inventoryNumber || "",
        installationLocation: formData.installationLocation || "",
        normative: formData.normative || null,
        comment: formData.comment || "",

        sound: formData.sound || null,
        light: formData.light || null,
        voice: formData.voice || null,
        lightSound: formData.lightSound || null,

        commissionDocId: formData.commissionDoc || null,
        projectDocId: formData.projectDoc || null,
        adminDocId: formData.adminDoc || null,

        supplyFireAlarmQuantity: formData.supplyFireAlarmQuantity || null,
        supplyWarningEvacuationControlQuantity:
          formData.supplyWarningEvacuationControlQuantity || null,

        workTypePeriodicity: resultData
          ? resultData.flatMap((workType) => {
              // Если у каждого workType может быть несколько месяцев (typeMonth),
              // разворачиваем их в плоский список согласно схеме
              return (
                workType.typeMonth?.map((tm) => ({
                  workTypeId: workType.workType?.id || null,
                  codeId: tm.code?.codeId || null,
                  startMonth: tm.startMonth || null,
                })) || []
              );
            })
          : [],
      };

      // 1. Отправка на сервер
      const response = await axiosInstance.post(endPoint, finalData);
      // Обработка успешного ответа
      console.log("Успешный ответ:", response.data);

      // 2. Очищаем черновик, если мы работали с ним
      const currentDraftId = window.sessionStorage.getItem("current_draft_id");
      if (currentDraftId) {
        const drafts = JSON.parse(
          localStorage.getItem(DRAFTS_STORAGE_KEY) || "[]",
        );
        const filtered = drafts.filter(
          (d: any) => d.id !== Number(currentDraftId),
        );
        localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(filtered));
        window.sessionStorage.removeItem("current_draft_id");
      }

      // 3. Очищаем временные данные формы (из useLocalStorage)
      window.localStorage.removeItem("addStation");

      // 4. Уходим на страницу списка
      navigate("/stations");
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

  const handleSuccess = () => {
    console.log("Элемент успешно создан, обновляем таблицу данных...");
  };

  const handleBack = () => {
    navigate(`${endPoint}`, { replace: true });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const values = { FIRE: "ПС", SECURITY: "ОС", FIRE_SECURITY: "ОПС" };
    const stationType = e.target.value as keyof typeof values;
    if (stationType in values) {
      setFormData({
        ...formData,
        type: stationType,
        typeDisplayValue: values[stationType],
      });
    }
    e.target.className = "form-select";
  };

  const handleTeamChange = (item: MaintenanceTeam) => {
    setMteam(item);
    setFormData({
      ...formData,
      mteam: item.id,
    });
  };

  const handleNameChange = (item: Station) => {
    setStation(item);
    setFormData({
      ...formData,
      name: item,
    });
  };

  const handleProjectDocChange = (item: Document) => {
    setProjectDoc(item);
    setFormData({
      ...formData,
      projectDoc: item.id || null,
    });
  };

  const handleComssionActChange = (item: Document) => {
    setCommissioningAct(item);
    setFormData({
      ...formData,
      commissionDoc: item.id || null,
    });
  };

  const handleExecDocChange = (item: Document) => {
    setExecutiveDoc(item);
    setFormData({
      ...formData,
      adminDoc: item.id || null,
    });
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      comment: e.target.value,
    });
  };

  const handleIntInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    name: keyof FormData,
  ) => {
    const value = e.target.value === "" ? null : parseInt(e.target.value, 10);
    setFormData({
      ...formData,
      [name]: value,
    });
    if (value != null || !e.target.required)
      e.target.className = "form-control";
    else e.target.className = "form-control is-invalid";
  };

  const handleStrInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    name: keyof FormData,
  ) => {
    setFormData({
      ...formData,
      [name]: e.target.value,
    });
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    window.localStorage.removeItem("addStation");
    setStation({
      id: 0,
      title: "",
      comment: "",
      deleted: false,
    });
    setMteam({
      id: 0,
      title: "",
      comment: "",
      deleted: false,
    });

    setFormData({
      name: station,
      type: "",
      typeDisplayValue: "",
      number: null,
      capacity: null,
      objectsNumberFrom: null,
      objectsNumberTo: null,
      objectsNumbers: null,
      inventoryNumber: "",
      installationLocation: "",
      dateEntered: null,
      dateAdjusted: null,
      normative: null,
      comment: "",
      sound: null,
      light: null,
      voice: null,
      lightSound: null,
      commissionDoc: null,
      projectDoc: null,
      adminDoc: null,
      supplyFireAlarmQuantity: null,
      supplyWarningEvacuationControlQuantity: null,
      workTypes: null,
      deleted: false,
      objectsNumbersValue: "",
      stationTypesValue: {},
      mteam: null,
    });

    setProjectDoc(null);
    setCommissioningAct(null);
    setExecutiveDoc(null);
    setResultData(null);
    window.localStorage.removeItem("addStation");
    location.reload();
  };

  const handleNormativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? null : parseFloat(e.target.value);
    setFormData({
      ...formData,
      normative: value,
    });
  };
  return (
    <div className="container mt-2">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="/">Главная</a>
          </li>
          <li className="breadcrumb-item">
            <a href="/stations">Учет станций ПС, ОС, ОПС</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Журнал - Форма добавления учета станции
          </li>
        </ol>
      </nav>
      <div className="d-flex justify-content-start">
        <h2 className="mb-4">Добавить новую станцию учета</h2>
        <button
          type="button"
          className="btn btn-outline-secondary ms-auto"
          style={{ maxHeight: "38px" }}
          onClick={() => {
            navigate("/stations/add/drafts");
            window.localStorage.removeItem("addStation");
          }}
        >
          📋 Черновики
        </button>
      </div>

      {loading && (
        <div className="position-fixed top-50 start-50 translate-middle">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      )}

      {error && <div className="alert alert-danger mt-3">{error}</div>}

      <form
        onSubmit={handleSubmit}
        onReset={handleReset}
        className="needs-validation"
        noValidate
      >
        <div className="d-flex gap-4 mb-4">
          <div
            className="d-flex flex-column flex-grow-1"
            style={{ width: "50%" }}
          >
            <label htmlFor="stationType" className="form-label">
              Тип станции
            </label>
            <select
              className={`form-select ${formData.type ? "" : "is-invalid"}`}
              onChange={handleSelectChange}
              style={{ height: "50px" }}
              id="stationType"
              value={formData.type || "default"}
              required
            >
              <option value="default" disabled>
                Тип станции
              </option>
              <option value="FIRE">ПС</option>
              <option value="SECURITY">ОС</option>
              <option value="FIRE_SECURITY">ОПС</option>
            </select>
          </div>

          <div
            className="d-flex flex-column flex-grow-1"
            style={{ width: "50%" }}
          >
            <label htmlFor="stationNum" className="form-label">
              Номер станции
            </label>
            <input
              type="number"
              min="1"
              max="99999"
              step="1"
              id="stationNum"
              className={`form-control ${formData.number ? "" : "is-invalid"}`}
              value={formData.number ?? ""}
              onChange={(e) => handleIntInputChange(e, "number")}
              autoComplete="off"
              placeholder="Номер станции (1-99999)"
              style={{ height: "50px" }}
              required
            />
          </div>
        </div>

        <div className="d-flex gap-4 mb-4">
          <div className="d-flex flex-column flex-grow-1">
            <label htmlFor="maintenanceTeams" className="form-label">
              Обслуживающая бригада
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "0px" }}>
              <SearchableInput
                endpoint={searchableConfigs.maintenanceTeam.endpoint}
                onItemSelected={handleTeamChange}
                commentParam={searchableConfigs.maintenanceTeam.commentParam}
                inputId="maintenanceTeams"
                style={{ height: "50px" }}
              />
              <button
                type="button"
                className="btn btn-outline-success h-100"
                onClick={handleOpenCreateModalTeam}
              >
                +
              </button>
              <CreateItemModal<MaintenanceTeam>
                isOpen={isCreateModalOpenTeam}
                onClose={handleCloseCreateModalTeam}
                endPoint="/maintenance_teams"
                onSuccess={handleSuccess}
                headers={maintenancaTeam}
                initialData={mteam}
                onCreated={(createdTeam) => {
                  setMteam(createdTeam);
                  setFormData((prev) => ({ ...prev, mteam: createdTeam.id }));
                }}
              />
            </div>
          </div>

          <div className="d-flex flex-column flex-grow-1">
            <label htmlFor="name" className="form-label">
              Наименование станции
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "0px" }}>
              <SearchableInput
                endpoint={searchableConfigs.stationName.endpoint}
                onItemSelected={handleNameChange}
                commentParam={searchableConfigs.stationName.commentParam}
                inputId="name"
                style={{ height: "50px" }}
                isRequired={true}
                showAfterReload={formData.name?.title ?? ""}
              />
              <button
                type="button"
                className="btn btn-outline-success h-100"
                onClick={handleOpenCreateModalName}
              >
                +
              </button>
              <CreateItemModal<MaintenanceTeam>
                isOpen={isCreateModalOpenName}
                onClose={handleCloseCreateModalName}
                endPoint="/station_names"
                onSuccess={handleSuccess}
                headers={name}
                initialData={station}
                onCreated={(createdStationName) => {
                  setStation(createdStationName);
                  setFormData((prev) => ({
                    ...prev,
                    name: createdStationName,
                  }));
                }}
              />
            </div>
          </div>
        </div>

        <div className="d-flex gap-4 mb-4">
          <div
            className="d-flex flex-column flex-grow-1"
            style={{ width: "50%" }}
          >
            <label htmlFor="capacity" className="form-label">
              Ёмкость
            </label>
            <input
              type="number"
              min="0"
              step="1"
              id="capacity"
              className="form-control"
              value={formData.capacity ?? ""}
              onChange={(e) => handleIntInputChange(e, "capacity")}
              autoComplete="off"
              placeholder="Емкость (0)"
              style={{ height: "50px" }}
            />
          </div>

          <div
            className="d-flex flex-column flex-grow-1"
            style={{ width: "50%" }}
          >
            <label htmlFor="normative" className="form-label">
              Норматив
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              pattern="[0-9]*[.,]?[0-9]*"
              id="normative"
              className="form-control"
              value={formData.normative ?? ""}
              onChange={handleNormativeChange}
              autoComplete="off"
              placeholder="Норматив (0.00)"
              style={{ height: "50px" }}
            />
          </div>
        </div>

        <div className="d-flex gap-4 mb-4">
          <div
            className="d-flex flex-column flex-grow-1"
            style={{ width: "50%" }}
          >
            <label htmlFor="trainFrom" className="form-label">
              Нумерация шлейфов
            </label>
            <div
              className="gap-4"
              style={{ display: "flex", alignItems: "center" }}
            >
              <div
                className="d-flex flex-column flex-grow-1"
                style={{ width: "25%" }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "0px" }}
                >
                  <input
                    className="form-control"
                    id="trainFrom"
                    style={{
                      height: "50px",
                      width: "50px",
                      fontSize: "0.875rem",
                    }}
                    disabled
                    value={"От:"}
                  />
                  <input
                    type="number"
                    min="0"
                    step="1"
                    id="objectsNumberFrom"
                    className="form-control"
                    value={formData.objectsNumberFrom ?? ""}
                    onChange={(e) =>
                      handleIntInputChange(e, "objectsNumberFrom")
                    }
                    autoComplete="off"
                    placeholder="От"
                    style={{ height: "50px" }}
                  />
                </div>
              </div>
              <div
                className="d-flex flex-column flex-grow-1"
                style={{ width: "25%" }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "0px" }}
                >
                  <input
                    className="form-control"
                    id="trainTo"
                    style={{
                      height: "50px",
                      width: "50px",
                      fontSize: "0.875rem",
                    }}
                    disabled
                    value={"До:"}
                  />
                  <input
                    type="number"
                    min="0"
                    step="1"
                    id="objectsNumberTo"
                    className="form-control"
                    value={formData.objectsNumberTo ?? ""}
                    onChange={(e) => handleIntInputChange(e, "objectsNumberTo")}
                    autoComplete="off"
                    placeholder="До "
                    style={{ height: "50px" }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            className="d-flex flex-column flex-grow-1"
            style={{ width: "50%" }}
          >
            <label htmlFor="inventoryNum" className="form-label">
              Инвентарный номер
            </label>
            <input
              type="number"
              min="0"
              step="1"
              id="inventoryNum"
              className="form-control"
              value={formData.inventoryNumber ?? ""}
              onChange={(e) => handleIntInputChange(e, "inventoryNumber")}
              autoComplete="off"
              placeholder="Инвентарный номер"
              style={{ height: "50px" }}
            />
          </div>
        </div>

        <div className="d-flex gap-4 mb-4">
          <div
            className="d-flex flex-column flex-grow-1"
            style={{ width: "50%" }}
          >
            <label htmlFor="trainFrom" className="form-label">
              Место установки
            </label>
            <input
              type="text"
              id="location"
              className="form-control"
              value={formData.installationLocation ?? ""}
              onChange={(e) => handleStrInputChange(e, "installationLocation")}
              autoComplete="off"
              placeholder="Место установки"
              style={{ height: "50px" }}
            />
          </div>

          <div className="d-flex gap-4" style={{ width: "50%" }}>
            <div
              className="d-flex flex-column flex-grow-1"
              style={{ width: "33%" }}
            >
              <label htmlFor="dateEntered" className="form-label">
                Дата ввода в эксплуатацию
              </label>
              <input
                type="date"
                id="dateEntered"
                className="form-control"
                value={formData.dateEntered ?? ""}
                onChange={(e) => handleStrInputChange(e, "dateEntered")}
                placeholder=""
                style={{ height: "50px" }}
              />
            </div>

            <div
              className="d-flex flex-column flex-grow-1"
              style={{ width: "33%" }}
            >
              <label htmlFor="dateAdjusted" className="form-label">
                Дата корректировки
              </label>
              <input
                type="date"
                id="dateAdjusted"
                className="form-control"
                value={formData.dateAdjusted ?? ""}
                onChange={(e) => handleStrInputChange(e, "dateAdjusted")}
                placeholder=""
                style={{ height: "50px" }}
              />
            </div>
          </div>
        </div>

        <div className="d-flex gap-4 mb-4">
          <div
            className="d-flex flex-column flex-grow-1"
            style={{ width: "100%" }}
          >
            <label htmlFor="sound" className="form-label">
              Оповещатели
            </label>
            <div
              className="gap-4"
              style={{ display: "flex", alignItems: "center" }}
            >
              <div
                className="d-flex flex-column flex-grow-1"
                style={{ width: "25%" }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "0px" }}
                >
                  <input
                    className="form-control"
                    id="sound"
                    style={{
                      height: "50px",
                      width: "65px",
                      fontSize: "0.875rem",
                    }}
                    disabled
                    value={"Звук:"}
                  />
                  <input
                    type="number"
                    min="0"
                    step="1"
                    id="sound-ins"
                    className="form-control"
                    value={formData.sound ?? ""}
                    onChange={(e) => handleIntInputChange(e, "sound")}
                    autoComplete="off"
                    placeholder="Кол-во"
                    style={{ height: "50px", minWidth: "65px" }}
                  />
                </div>
              </div>
              <div
                className="d-flex flex-column flex-grow-1"
                style={{ width: "25%" }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "0px" }}
                >
                  <input
                    className="form-control"
                    id="lightSound"
                    style={{
                      height: "50px",
                      width: "100px",
                      fontSize: "0.875rem",
                    }}
                    disabled
                    value={"Свет-звук:"}
                  />
                  <input
                    type="number"
                    min="0"
                    step="1"
                    id="lightSound-in"
                    className="form-control"
                    value={formData.lightSound ?? ""}
                    onChange={(e) => handleIntInputChange(e, "lightSound")}
                    autoComplete="off"
                    placeholder="Кол-во"
                    style={{ height: "50px", minWidth: "65px" }}
                  />
                </div>
              </div>
              <div
                className="d-flex flex-column flex-grow-1"
                style={{ width: "25%" }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "0px" }}
                >
                  <input
                    className="form-control"
                    id="voice"
                    style={{
                      height: "50px",
                      width: "65px",
                      fontSize: "0.875rem",
                    }}
                    disabled
                    value={"Речь:"}
                  />
                  <input
                    type="number"
                    min="0"
                    step="1"
                    id="voice-in"
                    className="form-control"
                    value={formData.voice ?? ""}
                    onChange={(e) => handleIntInputChange(e, "voice")}
                    autoComplete="off"
                    placeholder="Кол-во"
                    style={{ height: "50px" }}
                  />
                </div>
              </div>
              <div
                className="d-flex flex-column flex-grow-1"
                style={{ width: "25%" }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "0px" }}
                >
                  <input
                    className="form-control"
                    id="light"
                    style={{
                      height: "50px",
                      width: "65px",
                      fontSize: "0.875rem",
                    }}
                    disabled
                    value={"Свет:"}
                  />
                  <input
                    type="number"
                    min="0"
                    step="1"
                    id="light-id"
                    className="form-control"
                    value={formData.light ?? ""}
                    onChange={(e) => handleIntInputChange(e, "light")}
                    autoComplete="off"
                    placeholder="Кол-во"
                    style={{ height: "50px" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex gap-4 mb-4">
          <div
            className="d-flex flex-column flex-grow-1"
            style={{ width: "100%" }}
          >
            <label htmlFor="trainFrom" className="form-label">
              Источники беспербойного электропитания
            </label>
            <div
              className="gap-4"
              style={{ display: "flex", alignItems: "center" }}
            >
              <div
                className="d-flex flex-column flex-grow-1"
                style={{ width: "50%" }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "0px" }}
                >
                  <input
                    className="form-control"
                    id="supplyFireAlarmQuantity"
                    style={{
                      height: "50px",
                      width: "60px",
                      fontSize: "0.875rem",
                    }}
                    disabled
                    value={"АПС:"}
                  />
                  <input
                    type="number"
                    min="0"
                    step="1"
                    id="supplyFireAlarmQuantity-id"
                    className="form-control"
                    value={formData.supplyFireAlarmQuantity ?? ""}
                    onChange={(e) =>
                      handleIntInputChange(e, "supplyFireAlarmQuantity")
                    }
                    autoComplete="off"
                    placeholder="Кол-во"
                    style={{ height: "50px" }}
                  />
                </div>
              </div>

              <div
                className="d-flex flex-column flex-grow-1"
                style={{ width: "50%" }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "0px" }}
                >
                  <input
                    className="form-control"
                    id="supplyWarningEvacuationControlQuantity"
                    style={{
                      height: "50px",
                      width: "70px",
                      fontSize: "0.875rem",
                    }}
                    disabled
                    value={"СОУЭ:"}
                  />
                  <input
                    type="number"
                    min="0"
                    step="1"
                    id="supplyWarningEvacuationControlQuantity-in"
                    className="form-control"
                    value={
                      formData.supplyWarningEvacuationControlQuantity ?? ""
                    }
                    onChange={(e) =>
                      handleIntInputChange(
                        e,
                        "supplyWarningEvacuationControlQuantity",
                      )
                    }
                    autoComplete="off"
                    placeholder="Кол-во"
                    style={{ height: "50px" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex gap-4 mb-4" style={{ overflow: "auto" }}>
          <WorkTypesForm onChange={handleWorkTypesChange} required={true} />
        </div>

        <div className="d-flex gap-4 mb-4">
          <div
            className="d-flex flex-column flex-grow-1"
            style={{ width: "33%" }}
          >
            <label htmlFor="projectDoc" className="form-label">
              Проектная документация
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "0px" }}>
              <SearchableInput
                endpoint="/documents/project"
                onItemSelected={handleProjectDocChange}
                inputId="projectDoc"
                style={{ height: "50px" }}
                showAfterReload={projectDoc?.title}
              />
              <button
                type="button"
                className="btn btn-outline-success h-100"
                onClick={handleOpenCreateModalProjectDoc}
              >
                +
              </button>
              <CreateDocumentModal
                isOpen={isCreateModalOpenProjectDoc}
                onClose={handleCloseCreateModalProjectDoc}
                endPoint="/documents"
                onSuccess={handleSuccess}
                onCreated={(createdDoc) => {
                  setProjectDoc(createdDoc);
                  setFormData((prev) => ({
                    ...prev,
                    projectDoc: createdDoc.id,
                  }));
                }}
                docType="PROJECT"
              />
            </div>
          </div>

          <div
            className="d-flex flex-column flex-grow-1"
            style={{ width: "33%" }}
          >
            <label htmlFor="comissionAct" className="form-label">
              Акт ввода в эксплуатацию
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "0px" }}>
              <SearchableInput
                endpoint="/documents/comission"
                onItemSelected={handleComssionActChange}
                inputId="comissionAct"
                style={{ height: "50px" }}
                showAfterReload={commissioningAct?.title}
              />
              <button
                type="button"
                className="btn btn-outline-success h-100"
                onClick={handleOpenCreateModalComissionDoc}
              >
                +
              </button>
              <CreateDocumentModal
                isOpen={isCreateModalOpenComissionDoc}
                onClose={handleCloseCreateModalComissionDoc}
                endPoint="/documents"
                onSuccess={handleSuccess}
                onCreated={(createdDoc) => {
                  setCommissioningAct(createdDoc);
                  setFormData((prev) => ({
                    ...prev,
                    commissionDoc: createdDoc.id,
                  }));
                }}
                docType="COMMISSION"
              />
            </div>
          </div>

          <div
            className="d-flex flex-column flex-grow-1"
            style={{ width: "33%" }}
          >
            <label htmlFor="executiveDoc" className="form-label">
              Исполнительная документация
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "0px" }}>
              <SearchableInput
                endpoint="/documents/admin"
                onItemSelected={handleExecDocChange}
                inputId="executiveDoc"
                style={{ height: "50px" }}
                showAfterReload={executiveDoc?.title}
              />
              <button
                type="button"
                className="btn btn-outline-success h-100"
                onClick={handleOpenCreateModalExecDoc}
              >
                +
              </button>
              <CreateDocumentModal
                isOpen={isCreateModalOpenExecDoc}
                onClose={handleCloseCreateModalExecDoc}
                endPoint="/documents"
                onSuccess={handleSuccess}
                onCreated={(createdDoc) => {
                  setExecutiveDoc(createdDoc);
                  setFormData((prev) => ({ ...prev, adminDoc: createdDoc.id }));
                }}
                docType="ADMIN"
              />
            </div>
          </div>
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

        <div className="d-flex justify-content-start align-items-center gap-2">
          <button
            type="submit"
            className={`btn ${loading ? "btn-secondary" : "btn-success"}`}
            disabled={loading}
          >
            {loading ? "Сохранение..." : "Сохранить"}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleSaveAsDraft}
          >
            В черновик
          </button>
          <button type="reset" className="btn btn btn-outline-warning">
            Сбросить
          </button>
          <button
            type="button"
            className="btn btn-secondary ms-auto"
            onClick={handleBack}
          >
            Назад
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStations;

import React, { useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { axiosInstance, useAxiosInterceptor } from "../../api/client";
import { MaintenanceTeam } from "../../types/creation";
import SearchableInput from "../common/SearchableInput";
import ExcelPreview from "./ExcelPreview";

interface ExcelViewerProps {
  req: string;
  header: string;
}

type SelectedTeams = {
  rowId: number;
  mteam: MaintenanceTeam | null;
};

export const ExcelViewer: React.FC<ExcelViewerProps> = ({ req, header }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState("schedule.xlsx");
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [selectedTeams, setSelectedTeams] = useState<SelectedTeams[]>([]);
  const [quarter, setQuarter] = useState<number>(1);
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [localIdCounter, setLocalIdCounter] = useState(1);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  useAxiosInterceptor();

  const loadExcelFromServer = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updatedMteams = selectedTeams
      .filter((item) => item.mteam)
      .map((item) => item.mteam?.id);

    const isTrainSchedule = location.pathname === "/schedules/train";
    const params = isTrainSchedule
      ? { maintenanceTeamId: updatedMteams, year }
      : { maintenanceTeamIds: updatedMteams, year, quarter };

    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(req, {
        params,
        paramsSerializer: { indexes: null },
        responseType: "arraybuffer",
      });

      const contentDisposition = response.headers["content-disposition"];
      if (contentDisposition) {
        const parts = contentDisposition.split("filename=");
        let rawName = parts[1] ? parts[1].trim() : "schedule.xlsx";
        rawName = rawName.replace(/['"]/g, "").split(";")[0].trim();
        setFileName(decodeURIComponent(rawName));
      }

      setFileBuffer(response.data);
    } catch (err: any) {
      setError(
        "Ошибка загрузки графика: " +
          (err.response?.data?.message || err.message),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLocalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      setFileBuffer(event.target?.result as ArrayBuffer);
    };
    reader.readAsArrayBuffer(file);
  };

  const addTeamRow = () => {
    setSelectedTeams((prev) => [
      ...prev,
      { rowId: localIdCounter, mteam: null },
    ]);
    setLocalIdCounter((c) => c + 1);
  };

  const handleTeamSelect = (rowId: number, teamData: MaintenanceTeam) => {
    setSelectedTeams((prev) =>
      prev.map((item) =>
        item.rowId === rowId ? { ...item, mteam: teamData } : item,
      ),
    );
  };

  const removeTeamRow = (rowId: number) => {
    setSelectedTeams((prev) => prev.filter((item) => item.rowId !== rowId));
  };

  return (
    <div className="container-fluid px-4 py-2">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="/">Главная</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            График - {header}
          </li>
        </ol>
      </nav>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">График {header}</h3>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#collapseFilterForm"
            aria-expanded="false"
          >
            <i className="bi bi-funnel me-1"></i> Параметры выгрузки
          </button>
          <button
            onClick={() => loadExcelFromServer()}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2"></span>
            ) : (
              <i className="bi bi-cloud-arrow-down me-1"></i>
            )}
            Загрузить с сервера
          </button>
          <button
            className="btn btn-outline-secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            <i className="bi bi-folder2-open me-1"></i> Открыть локально
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            onChange={handleLocalFileUpload}
            className="d-none"
          />
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="collapse mb-3" id="collapseFilterForm">
        <div className="card card-body shadow-sm border-0">
          <form onSubmit={loadExcelFromServer}>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label fw-semibold mb-0">
                    Бригады для фильтрации
                  </label>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-success"
                    onClick={addTeamRow}
                    disabled={
                      selectedTeams.length > 0 &&
                      location.pathname === "/schedules/train"
                    }
                  >
                    + Добавить бригаду
                  </button>
                </div>

                {selectedTeams.map((item, idx) => (
                  <div
                    key={item.rowId}
                    className="row g-2 align-items-end mb-2"
                  >
                    <div className="col">
                      <SearchableInput<MaintenanceTeam>
                        endpoint="/maintenance_teams/all"
                        commentParam="orgShortTitle"
                        onItemSelected={(data) =>
                          handleTeamSelect(item.rowId, data)
                        }
                        inputId={`viewer-team-${item.rowId}`}
                        placeholder={`Выберите бригаду #${idx + 1}`}
                      />
                    </div>
                    <div className="col-auto">
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => removeTeamRow(item.rowId)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="col-md-6">
                <div className="row g-2">
                  {location.pathname === "/schedules/subject" && (
                    <div className="col-md-6">
                      <label
                        htmlFor="selectQuarter"
                        className="form-label fw-semibold"
                      >
                        Квартал
                      </label>
                      <select
                        id="selectQuarter"
                        className="form-select"
                        value={quarter}
                        onChange={(e) =>
                          setQuarter(parseInt(e.target.value, 10))
                        }
                      >
                        <option value={1}>I квартал</option>
                        <option value={2}>II квартал</option>
                        <option value={3}>III квартал</option>
                        <option value={4}>IV квартал</option>
                      </select>
                    </div>
                  )}
                  <div
                    className={
                      location.pathname === "/schedules/subject"
                        ? "col-md-6"
                        : "col-12"
                    }
                  >
                    <label
                      htmlFor="inputYear"
                      className="form-label fw-semibold"
                    >
                      Год
                    </label>
                    <input
                      id="inputYear"
                      type="text"
                      className="form-control"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="ГГГГ"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div style={{ height: "72vh" }}>
        <ExcelPreview fileBuffer={fileBuffer} fileName={fileName} />
      </div>
    </div>
  );
};

export default ExcelViewer;

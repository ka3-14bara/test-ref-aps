import React, { useState, useRef } from "react";
import { axiosInstance, useAxiosInterceptor } from "../../api/axios";
import "../../styles/ExcelViewer.css";
import { Organization, MaintenanceTeam } from "./AddTypes";
import SearchableInput from "../../modules/SearchableInput";
import { useLocation } from "react-router-dom";
import ExcelPreview from "../../modules/ExcelPreview";

interface ExcelViewerProps {
  req: string;
  header: string;
}

type FormData = {
  quarter: number;
  year: string;
  org: Organization | null;
  mteams: { teamID: any }[];
};

type SelectedTeams = {
  rowId: number;
  mteam: MaintenanceTeam | null;
};

const ExcelViewer: React.FC<ExcelViewerProps> = ({ req, header }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState("file.xlsx");
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localIdCounter, setLocalIdCounter] = useState(1);

  const [selectedTeams, setSelectedTeams] = useState<SelectedTeams[]>([]);
  const [formData, setFormData] = useState<FormData>({
    quarter: 0,
    year: "",
    org: null,
    mteams: [],
  });

  const location = useLocation();
  useAxiosInterceptor();

  const loadExcelFromServer = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updatedMteams = selectedTeams
      .filter((item) => item.mteam)
      .map((item) => item.mteam?.id);

    let finalData;
    if (location.pathname === "/schedules/train") {
      finalData = { maintenanceTeamId: updatedMteams, year: formData.year };
    } else {
      finalData = {
        maintenanceTeamIds: updatedMteams,
        year: formData.year,
        quarter: formData.quarter,
      };
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(req, {
        params: finalData,
        paramsSerializer: { indexes: null },
        responseType: "arraybuffer",
      });

      const contentDisposition = response.headers["content-disposition"];
      if (contentDisposition) {
        const parts = contentDisposition.split("filename=");
        let nameFileResponse = parts[1] ? parts[1].trim() : "file.xlsx";
        nameFileResponse = nameFileResponse
          .replace(/['"]/g, "")
          .split(";")[0]
          .trim();
        setFileName(decodeURIComponent(nameFileResponse));
      }

      setFileBuffer(response.data);
    } catch (err) {
      setError("Ошибка загрузки файла: " + (err as any).message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      setFileBuffer(e.target?.result as ArrayBuffer);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleQuarter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, quarter: parseInt(e.target.value, 10) || 0 });
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, year: e.target.value });
  };

  const addTeamRow = () => {
    setSelectedTeams([
      ...selectedTeams,
      { rowId: localIdCounter, mteam: null },
    ]);
    setLocalIdCounter((prev) => prev + 1);
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
    <div className="excel-container px-5">
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

      <h2 className="title">Загрузка и просмотр Графика {header}</h2>

      <div>
        <div className="controls-container mt-3 mb-3">
          <button
            className="btn btn-outline-secondary"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#collapseForm"
            aria-expanded="false"
            aria-controls="collapseForm"
          >
            Открыть форму ⇓
          </button>
          <button
            onClick={() => loadExcelFromServer()}
            disabled={loading}
            className="btn btn-primary mx-2"
          >
            {loading ? "Загрузка..." : "Загрузить с сервера"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            onChange={handleFileUpload}
            className="file-input"
          />
          {error && <div className="text-danger mt-2">{error}</div>}
        </div>

        <div className="collapse" id="collapseForm">
          <div className="card card-body mt-3">
            <form onSubmit={loadExcelFromServer}>
              <div className="row">
                <div className="col-md-6 mb-4">
                  <label htmlFor="add-team" className="form-label">
                    Бригады:
                  </label>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-success form-control mb-2"
                    id="add-team"
                    onClick={addTeamRow}
                    style={{ height: "40px" }}
                    disabled={
                      selectedTeams.length > 0 &&
                      location.pathname === "/schedules/train"
                    }
                  >
                    + Добавить бригаду
                  </button>
                  {selectedTeams.map((item, idx) => (
                    <div
                      key={item.rowId}
                      className="row mb-2 gx-2 align-items-end"
                    >
                      <div className="col">
                        <label
                          className="form-label small"
                          htmlFor={`team-input-${item.rowId}`}
                        >
                          Бригада №{idx + 1}
                        </label>
                        <SearchableInput<MaintenanceTeam>
                          endpoint="/maintenance_teams/all"
                          commentParam="orgShortTitle"
                          onItemSelected={(data) =>
                            handleTeamSelect(
                              item.rowId,
                              data as MaintenanceTeam,
                            )
                          }
                          inputId={`team-input-${item.rowId}`}
                          style={{ height: "40px" }}
                        />
                      </div>
                      <div className="col-auto">
                        <button
                          type="button"
                          className="btn btn-danger"
                          style={{ height: "40px" }}
                          onClick={() => removeTeamRow(item.rowId)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="col-md-6 mb-4">
                  <div className="d-flex gap-4">
                    {location.pathname === "/schedules/subject" && (
                      <div className="flex-grow-1">
                        <label htmlFor="quarter" className="form-label">
                          Квартал:
                        </label>
                        <select
                          id="quarter"
                          className="form-select"
                          style={{ height: "40px" }}
                          onChange={handleQuarter}
                          value={formData.quarter}
                          required
                        >
                          <option disabled value={0}>
                            Выберите квартал
                          </option>
                          <option value="1">I квартал</option>
                          <option value="2">II квартал</option>
                          <option value="3">III квартал</option>
                          <option value="4">IV квартал</option>
                        </select>
                      </div>
                    )}
                    <div className="flex-grow-1">
                      <label htmlFor="year-of-period" className="form-label">
                        Год:
                      </label>
                      <input
                        id="year-of-period"
                        type="text"
                        className="form-control"
                        style={{ height: "40px" }}
                        onChange={handleYearChange}
                        autoComplete="off"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Вызов вынесенного компонента */}
      <ExcelPreview fileBuffer={fileBuffer} fileName={fileName} />
    </div>
  );
};

export default ExcelViewer;

import React, { useState } from "react";
import { REPORT_SETTINGS, ReportEndpoint } from "../../types/reports";
import ReportFilters from "./ReportFilters";
import { axiosInstance, useAxiosInterceptor } from "../../api/client";

export const ReportsPage: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ReportEndpoint | "">(
    "",
  );
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  useAxiosInterceptor();

  const handleDownload = async () => {
    if (!selectedEndpoint) return;
    setLoading(true);

    try {
      const response = await axiosInstance.get(selectedEndpoint, {
        params: {
          ...filters,
          includeDeleted: filters.includeDeleted || false,
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${REPORT_SETTINGS[selectedEndpoint].label}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Ошибка выгрузки отчета:", error);
      alert(
        "Не удалось скачать отчет: " +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-2">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="/">Главная</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Отчеты
          </li>
        </ol>
      </nav>

      <div className="card shadow-sm border-0">
        <div className="card-header bg-secondary text-white py-3">
          <h5 className="mb-0">
            <i className="bi bi-file-earmark-spreadsheet me-2"></i> Выгрузка
            отчетов (Excel)
          </h5>
        </div>
        <div className="card-body p-4">
          <div className="mb-4">
            <label className="form-label fw-bold">Выберите форму отчета:</label>
            <select
              className="form-select form-select-lg"
              value={selectedEndpoint}
              onChange={(e) => {
                setSelectedEndpoint(e.target.value as ReportEndpoint);
                setFilters({});
              }}
            >
              <option value="">-- Выберите отчет из списка --</option>
              {(Object.keys(REPORT_SETTINGS) as ReportEndpoint[]).map((key) => (
                <option key={key} value={key}>
                  {REPORT_SETTINGS[key].label}
                </option>
              ))}
            </select>
          </div>

          {selectedEndpoint && (
            <>
              <div className="mb-4 p-3 border rounded bg-light">
                <h6 className="fw-semibold mb-3 border-bottom pb-2">
                  <i className="bi bi-sliders me-2"></i> Параметры и фильтрация
                  данных
                </h6>
                <ReportFilters
                  fields={REPORT_SETTINGS[selectedEndpoint].fields}
                  placeHolder={REPORT_SETTINGS[selectedEndpoint].fieldsRu}
                  values={filters}
                  onChange={(field, val) =>
                    setFilters((prev) => ({ ...prev, [field]: val }))
                  }
                />
              </div>

              <div className="d-flex justify-content-end">
                <button
                  className="btn btn-success btn-lg d-flex align-items-center gap-2"
                  onClick={handleDownload}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm"></span>
                  ) : (
                    <i className="bi bi-download"></i>
                  )}
                  Сформировать и скачать .xlsx
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

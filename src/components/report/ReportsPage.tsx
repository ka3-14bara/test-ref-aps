import React, { useState } from 'react';
import { Download } from 'react-bootstrap-icons';
import { REPORT_SETTINGS, ReportEndpoint } from './reportTypes';
import ReportFilters from './ReportFilters';
import { axiosInstance, useAxiosInterceptor } from '../../api/axios';

const ReportsPage: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ReportEndpoint | ''>('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  useAxiosInterceptor()

  const handleDownload = async () => {
    if (!selectedEndpoint) return;
    setLoading(true);

    try {
      const response = await axiosInstance.get(selectedEndpoint, {
        params: {
          ...filters,
          includeDeleted: filters.includeDeleted || false,
        },
        responseType: 'blob', 
      });

      // Создаем ссылку для скачивания
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${REPORT_SETTINGS[selectedEndpoint].label}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Ошибка при выгрузке:", error);
      alert("Не удалось скачать файл: " + error);
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
          <li className="breadcrumb-item">
            <a href="/report">Отчеты</a>
          </li>
        </ol>
      </nav>
      <div className="card shadow-sm">
        <div className="card-header bg-secondary text-white">
          <h4 className="mb-0">Выгрузка отчетов (Excel)</h4>
        </div>
        <div className="card-body">
          <div className="mb-4">
            <label className="form-label fw-bold">Выберите тип отчета:</label>
            <select 
              className="form-select" 
              value={selectedEndpoint}
              onChange={(e) => {
                setSelectedEndpoint(e.target.value as ReportEndpoint);
                setFilters({}); // Сброс фильтров при смене отчета
              }}
            >
              <option value="">-- Не выбрано --</option>
              {(Object.keys(REPORT_SETTINGS) as ReportEndpoint[]).map(key => (
                <option key={key} value={key}>{REPORT_SETTINGS[key].label}</option>
              ))}
            </select>
          </div>

          {selectedEndpoint && (
            <>
              <div className="mb-4">
                <h5 className="border-bottom pb-2">Фильтры поиска</h5>
                <ReportFilters 
                  fields={REPORT_SETTINGS[selectedEndpoint].fields}
                  placeHolder={REPORT_SETTINGS[selectedEndpoint].fieldsRu}
                  values={filters}
                  onChange={(field, val) => setFilters(prev => ({ ...prev, [field]: val }))}
                />
              </div>
              
              <div className="d-flex justify-content-end">
                <button 
                  className="btn btn-success btn-lg d-flex align-items-center"
                  onClick={handleDownload}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm me-2"></span>
                  ) : (
                    <Download className="me-2" />
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

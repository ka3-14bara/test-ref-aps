import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

interface ExcelPreviewProps {
  fileBuffer: ArrayBuffer | null;
  fileName: string;
  isShowDownload?: boolean;
}

export const ExcelPreview: React.FC<ExcelPreviewProps> = ({
  fileBuffer,
  fileName,
  isShowDownload = true,
}) => {
  const [sheets, setSheets] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>("");
  const [htmlData, setHtmlData] = useState<string>("");
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);

  useEffect(() => {
    if (!fileBuffer) {
      setSheets([]);
      setActiveSheet("");
      setHtmlData("");
      setWorkbook(null);
      return;
    }

    try {
      const wb = XLSX.read(fileBuffer, { type: "array" });
      setWorkbook(wb);
      setSheets(wb.SheetNames);

      if (wb.SheetNames.length > 0) {
        const firstSheet = wb.SheetNames[0];
        setActiveSheet(firstSheet);
        renderSheet(wb, firstSheet);
      }
    } catch (err) {
      console.error("Ошибка парсинга Excel файла:", err);
    }
  }, [fileBuffer]);

  const renderSheet = (wb: XLSX.WorkBook, sheetName: string) => {
    const ws = wb.Sheets[sheetName];
    if (ws) {
      const html = XLSX.utils.sheet_to_html(ws, { id: "excel-table" });
      setHtmlData(html);
    }
  };

  const handleSheetChange = (sheetName: string) => {
    setActiveSheet(sheetName);
    if (workbook) {
      renderSheet(workbook, sheetName);
    }
  };

  const handleDownload = () => {
    if (!fileBuffer) return;
    const blob = new Blob([fileBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || "document.xlsx";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!fileBuffer) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="bi bi-file-earmark-excel fs-1 d-block mb-2 text-secondary"></i>
        Файл не выбран или не загружен
      </div>
    );
  }

  return (
    <div className="d-flex flex-column h-100 bg-white rounded shadow-sm border">
      <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-light">
        <ul className="nav nav-pills card-header-pills">
          {sheets.map((sheet) => (
            <li className="nav-item me-1" key={sheet}>
              <button
                type="button"
                className={`nav-link btn-sm ${activeSheet === sheet ? "active fw-semibold" : ""}`}
                onClick={() => handleSheetChange(sheet)}
              >
                {sheet}
              </button>
            </li>
          ))}
        </ul>

        {isShowDownload && (
          <button
            className="btn btn-outline-success btn-sm d-flex align-items-center gap-1"
            onClick={handleDownload}
          >
            <i className="bi bi-download"></i> Скачать .xlsx
          </button>
        )}
      </div>

      <div
        className="flex-grow-1 p-3 overflow-auto"
        dangerouslySetInnerHTML={{ __html: htmlData }}
      />
    </div>
  );
};

export default ExcelPreview;

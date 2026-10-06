import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

interface ExcelPreviewProps {
  fileBuffer: ArrayBuffer | null;
  fileName: string;
  isShowDownload?: boolean;
}

const ExcelPreview: React.FC<ExcelPreviewProps> = ({
  fileBuffer,
  fileName,
  isShowDownload = true,
}) => {
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [currentSheetName, setCurrentSheetName] = useState<string>("");
  const [tableHtml, setTableHtml] = useState<string>("");

  // Функция рендеринга конкретного листа
  const renderSheet = (wb: XLSX.WorkBook, sheetName: string) => {
    const worksheet = wb.Sheets[sheetName];
    const html = XLSX.utils.sheet_to_html(worksheet, { editable: false });
    setTableHtml(html);
    setCurrentSheetName(sheetName);
  };

  // Эффект следит за изменением буфера файла (при загрузке нового)
  useEffect(() => {
    if (!fileBuffer) {
      setWorkbook(null);
      setSheetNames([]);
      setCurrentSheetName("");
      setTableHtml("");
      return;
    }

    const data = new Uint8Array(fileBuffer);
    const wb = XLSX.read(data, {
      type: "array",
      cellStyles: true,
      // cellDates убираем! Даты остаются стабильными числами Excel
    });

    // Проходим по всем листам книги
    wb.SheetNames.forEach((sheetName) => {
      const worksheet = wb.Sheets[sheetName];
      if (!worksheet) return;

      for (const cellAddress in worksheet) {
        if (cellAddress === "!") continue;

        const cell = worksheet[cellAddress];

        // В Excel формат кода 14 — это стандартная дата.
        // Также проверяем текстовое представление формата z, если оно содержит буквы m/d/y
        if (
          cell &&
          cell.t === "n" &&
          (cell.z === 14 ||
            (typeof cell.z === "string" && /[mdy]/i.test(cell.z)))
        ) {
          // Парсим числовой код даты Excel напрямую в объект {d, m, y} без участия часовых поясов JS
          const dateObj = XLSX.SSF.parse_date_code(cell.v);

          if (dateObj) {
            const day = String(dateObj.d).padStart(2, "0");
            const month = String(dateObj.m).padStart(2, "0");
            const year = dateObj.y;

            // Записываем правильную строку в кэш отображения ячейки
            cell.w = `${day}.${month}.${year}`;
          }
        }
      }
    });

    setWorkbook(wb);
    setSheetNames(wb.SheetNames);
    if (wb.SheetNames.length > 0) {
      renderSheet(wb, wb.SheetNames[0]);
    }
  }, [fileBuffer]);

  const switchSheet = (sheetName: string) => {
    if (workbook) renderSheet(workbook, sheetName);
  };

  const downloadExcelFile = () => {
    if (!fileBuffer) return;
    const blob = new Blob([fileBuffer]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (!tableHtml) return null;

  return (
    <div className="content-section card mt-3 p-3 shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0">Лист: {currentSheetName}</h5>
        {isShowDownload && (
          <button
            onClick={downloadExcelFile}
            className="btn btn-sm btn-outline-success"
          >
            Скачать файл ({fileName})
          </button>
        )}
      </div>

      <div
        className="table-container border rounded overflow-auto bg-white mb-3"
        style={{ maxHeight: "595px" }}
      >
        <div
          className="excel-render-area"
          dangerouslySetInnerHTML={{ __html: tableHtml }}
        />
      </div>

      <div className="sheets-container d-flex gap-2 flex-wrap mb-0">
        {sheetNames.map((name) => (
          <button
            key={name}
            onClick={() => switchSheet(name)}
            className={`btn btn-sm ${
              currentSheetName === name
                ? "btn-primary"
                : "btn-outline-secondary"
            }`}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExcelPreview;

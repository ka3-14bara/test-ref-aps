import React from "react";
import DocViewer from "@iamjariwala/react-doc-viewer";
import ExcelPreview from "../ExcelPreview"; // твой вынесенный компонент
import { FileType } from "../../hooks/useDocumentViewer";
import "react-pdf/dist/Page/AnnotationLayer.css"; // Стили для слоев аннотаций
import "react-pdf/dist/Page/TextLayer.css";       // Стили для текстового слоя (выделение текста)
import "@iamjariwala/react-doc-viewer/dist/index.css"; // Основные стили тулбара и темы вьюера



interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string | null;
  fileBuffer: ArrayBuffer | null;
  fileType: FileType;
  fileName: string;
  isLoading: boolean;
  error: string | null;
}

const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  fileUrl,
  fileBuffer,
  fileType,
  fileName,
  isLoading,
  error,
}) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    if (!fileUrl) return;
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  };

  return (
  <div 
    style={{ 
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0,0,0,0.5)", 
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}
  >
    <div 
      className="card shadow-lg" 
      style={{ 
        width: "90vw", 
        height: "85vh", 
        maxWidth: "1400px",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
        borderRadius: "8px",
        overflow: "hidden"
      }}
    >
      
      {/* Хедер модалки */}
      <div className="card-header bg-light d-flex justify-content-between align-items-center py-2 px-3" style={{ borderBottom: "1px solid #dee2e6" }}>
        <h5 className="mb-0 text-truncate" style={{ maxWidth: "70%", color: "#333", fontWeight: 500 }}>
          Просмотр: {fileName}
        </h5>
        <div className="d-flex gap-2">
          {fileUrl && (
            <button className="btn btn-sm btn-success" onClick={handleDownload}>
              🖨 Скачать на ПК
            </button>
          )}
          <button 
            type="button" 
            className="btn-close" 
            onClick={onClose} 
            style={{ cursor: "pointer" }}
          />
        </div>
      </div>

      {/* Тело модалки */}
      <div className="card-body p-0 bg-secondary bg-opacity-10 position-relative" style={{ flex: 1, height: "calc(100% - 50px)", overflow: "hidden" }}>
        {isLoading && (
          <div className="position-absolute top-50 start-50 translate-middle text-center">
            <div className="spinner-border text-primary mb-2" />
            <div>Загрузка и кэширование файла...</div>
          </div>
        )}

        {error && (
          <div className="alert alert-danger m-3 text-center">{error}</div>
        )}

        {!isLoading && !error && (
          <div className="w-100 h-100" style={{ overflow: "auto" }}>
            {fileType === "excel" && fileBuffer && (
              <div className="p-3 h-100">
                <ExcelPreview fileBuffer={fileBuffer} fileName={fileName} isShowDownload={false}/>
              </div>
            )}

            {fileType === "docViewer" && fileUrl && (
              <DocViewer
                documents={[{ uri: fileUrl, fileName: fileName }]}
                config={{
                  header: { disableHeader: true, disableFileName: true }
                }}
                style={{ height: "100%" }}
              />
            )}

            {fileType === "unsupported" && (
              <div className="text-center p-5 position-absolute top-50 start-50 translate-middle w-100">
                <h5 className="mb-2">Предварительный просмотр недоступен для этого формата</h5>
                <p className="text-muted small mb-3">Вы можете скачать файл для просмотра на компьютере</p>
                <button className="btn btn-primary" onClick={handleDownload}>
                  Скачать файл
                </button>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  </div>
);


};

export default DocumentViewerModal;

import React from "react";
import DocViewer, { DocViewerRenderers } from "@iamjariwala/react-doc-viewer";
import ExcelPreview from "../excel/ExcelPreview";
import { FileType } from "../../hooks/useDocumentViewer";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "@iamjariwala/react-doc-viewer/dist/index.css";

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

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
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
    <div className="app-modal-overlay">
      <div
        className="card shadow-lg w-100"
        style={{ maxWidth: "1400px", height: "88vh" }}
      >
        <div className="card-header bg-light d-flex justify-content-between align-items-center py-2 px-3 border-bottom">
          <h6
            className="mb-0 text-truncate fw-semibold"
            style={{ maxWidth: "75%" }}
          >
            <i className="bi bi-file-earmark-text me-2"></i>
            {fileName}
          </h6>
          <div className="d-flex align-items-center gap-2">
            {fileUrl && (
              <button
                className="btn btn-sm btn-outline-success"
                onClick={handleDownload}
              >
                <i className="bi bi-download me-1"></i> Скачать
              </button>
            )}
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Закрыть"
            />
          </div>
        </div>

        <div
          className="card-body p-0 position-relative bg-light overflow-hidden"
          style={{ flex: 1 }}
        >
          {isLoading && (
            <div className="position-absolute top-50 start-50 translate-middle text-center">
              <div className="spinner-border text-primary mb-2" role="status" />
              <div className="text-muted small">
                Загрузка и обработка документа...
              </div>
            </div>
          )}

          {error && (
            <div className="alert alert-danger m-3 text-center" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i> {error}
            </div>
          )}

          {!isLoading && !error && (
            <div className="w-100 h-100 overflow-auto">
              {fileType === "excel" && fileBuffer && (
                <div className="p-3 h-100">
                  <ExcelPreview
                    fileBuffer={fileBuffer}
                    fileName={fileName}
                    isShowDownload={false}
                  />
                </div>
              )}

              {fileType === "docViewer" && fileUrl && (
                <DocViewer
                  documents={[{ uri: fileUrl, fileName }]}
                  pluginRenderers={DocViewerRenderers}
                  config={{
                    header: { disableHeader: true, disableFileName: true },
                  }}
                  style={{ height: "100%" }}
                />
              )}

              {fileType === "unsupported" && (
                <div className="text-center p-5 position-absolute top-50 start-50 translate-middle w-100">
                  <i className="bi bi-file-earmark-x fs-1 text-secondary mb-2 d-block"></i>
                  <h5>Предварительный просмотр недоступен</h5>
                  <p className="text-muted small mb-3">
                    Данный формат файла не поддерживается онлайн-просмотрщиком.
                  </p>
                  <button className="btn btn-primary" onClick={handleDownload}>
                    <i className="bi bi-download me-1"></i> Скачать файл для
                    просмотра
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

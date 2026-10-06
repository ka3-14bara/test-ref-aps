import { useState, useCallback } from "react";
import { axiosInstance } from "../api/axios";

export type FileType = "excel" | "docViewer" | "unsupported";

interface UseDocumentViewerReturn {
  fileUrl: string | null;
  fileBuffer: ArrayBuffer | null;
  fileType: FileType;
  fileName: string;
  isLoading: boolean;
  error: string | null;
  openViewer: (selectedRow: any) => Promise<void>;
  closeViewer: () => void;
}

export const useDocumentViewer = (): UseDocumentViewerReturn => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [fileType, setFileType] = useState<FileType>("unsupported");
  const [fileName, setFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getFileType = (path: string): FileType => {
    if (!path) return "unsupported";
    const extension = path.split(".").pop()?.toLowerCase();

    if (extension === "xlsx" || extension === "xls") {
      return "excel";
    }

    // Форматы, которые нативно и без облака хорошо переварит @iamjariwala/react-doc-viewer
    const supportedExtensions = ["pdf", "docx", "png", "jpg", "jpeg", "txt"];
    if (extension && supportedExtensions.includes(extension)) {
      return "docViewer";
    }

    return "unsupported";
  };

  const openViewer = useCallback(async (selectedRow: any) => {
    if (!selectedRow || !selectedRow.id || !selectedRow.filePath) return;

    const detectedType = getFileType(selectedRow.filePath);
    setFileType(detectedType);
    setFileName(selectedRow.title || "document");
    setError(null);
    setIsLoading(true);

    try {
      // Запрашиваем файл как arraybuffer, чтобы удовлетворить оба вьюера
      const response = await axiosInstance.get(
        `/documents/${selectedRow.id}/download`,
        {
          responseType: "arraybuffer",
        },
      );

      const buffer = response.data;
      setFileBuffer(buffer);

      // Создаем Blob URL для react-doc-viewer или системного скачивания
      const contentType = response.headers["content-type"];

      const blob = new Blob([buffer], {
        type: contentType ? String(contentType) : undefined,
      });

      const url = window.URL.createObjectURL(blob);
      setFileUrl(url);
    } catch (err: any) {
      console.error("Ошибка при кэшировании документа:", err);
      setError("Не удалось загрузить документ для просмотра");
      alert("Не удалось загрузить документ для просмотра" + err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const closeViewer = useCallback(() => {
    // освобождаем оперативную память браузера от Blob-кэша
    if (fileUrl) {
      window.URL.revokeObjectURL(fileUrl);
    }
    setFileUrl(null);
    setFileBuffer(null);
    setFileType("unsupported");
    setFileName("");
    setError(null);
  }, [fileUrl]);

  return {
    fileUrl,
    fileBuffer,
    fileType,
    fileName,
    isLoading,
    error,
    openViewer,
    closeViewer,
  };
};

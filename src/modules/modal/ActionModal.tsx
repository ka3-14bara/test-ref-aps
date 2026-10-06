import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  ChangeEvent,
} from "react";
import "../../styles/ActionModal.css";
import { axiosInstance, useAxiosInterceptor } from "../../api/axios";
import { Header } from "../Types";
import Modal from "react-modal";
import FormField from "./FormField";
import DetectorsSection from "./DetectorsSection";
import WorkTypesSection from "./WorkTypesSection";
import { prepareDetectorsPayload } from "../../utils/prepareDetectors";
import Draggable from "react-draggable";

import {
  SelectedDetector,
  DetectorItem,
  WorkTypes,
} from "../../components/createPages/AddTypes";

import {
  searchableConfigs,
  SearchableType,
  DETECTORS,
} from "../../utils/searchableConfig";
import { useLocation } from "react-router-dom";
import {
  ALLOWED_EXTENSIONS,
  ALLOWED_FILE_TYPES,
} from "../../components/createPages/AddDocument";

type StationType = "FIRE" | "SECURITY" | "FIRE_SECURITY" | "default";
type DocType = "COMMISSION" | "ADMIN" | "PROJECT" | "";

Modal.setAppElement("#root");

interface ActionModalProps<T extends Record<string, any>> {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: T[];
  headers: Header[];
  reqUrl: string;
  onSuccess: () => void;
  notShow: string[];
}

export function ActionModal<T extends Record<string, any>>({
  isOpen,
  onClose,
  selectedItems,
  headers,
  reqUrl,
  onSuccess,
  notShow,
}: ActionModalProps<T>) {
  const isBulkAction = selectedItems.length > 1;
  const [formData, setFormData] = useState<T | null>(null);
  const [initialDataString, setInitialDataString] = useState<string>("");
  const [selectedDetectors, setSelectedDetectors] = useState<
    SelectedDetector[]
  >([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<string>("");

  const isInitialized = useRef(false);
  const [isCommentMode, setIsCommentMode] = useState<boolean>(false);

  const location = useLocation();

  const hasDetectors = headers.some((header) =>
    DETECTORS.includes(header.key.split(".")[0] as any),
  );

  const hasWorkTypes = headers.some((header) =>
    ["stationTypesValue", "workTypesValue"].includes(header.key.split(".")[0]),
  );

  const hasDropDownStations = headers.some((header) =>
    ["typeDisplayValue"].includes(header.key.split(".")[0]),
  );
  const hasDropDownDocuments = location.pathname === "/documents";

  const DOCUMENT_TYPE_MAP: Record<string, string> = {
    "Исполнительная документация": "ADMIN",
    "Акт ввода в эксплуатацию": "COMMISSION",
    "Проектная документация": "PROJECT",
    ADMIN: "ADMIN",
    COMMISSION: "COMMISSION",
    PROJECT: "PROJECT",
  };

  useAxiosInterceptor();

  // Инициализация данных при открытии (только для одиночного элемента)
  useEffect(() => {
    setSelectedFile(null);
    setFileName("");
    
    if (isOpen && selectedItems.length === 1) {
      // Сброс при каждом открытии
      isInitialized.current = false;
      setFormData(null);
      setSelectedDetectors([]);

      const item = selectedItems[0];

      const correctCode = DOCUMENT_TYPE_MAP[item.documentType] || item.documentType;
      
      const preparedItem = {
        ...item,
        documentType: correctCode, // Здесь уже точно будет "ADMIN", "COMMISSION" или "PROJECT"
        documentTypeDisplayValue: item.documentTypeDisplayValue || item.documentType
      };

      // Записываем в стейт уже исправленный объект
      setFormData(preparedItem as T);
      // Для отслеживания изменений тоже сохраняем исправленную строку
      setInitialDataString(JSON.stringify(preparedItem));
      // =====================================================================

      const initDetectors = async () => {
        try {
          const response = await axiosInstance.get<DetectorItem[]>("/detectors/all");
          const allDetectors = response.data;

          if (item.detectors && Array.isArray(item.detectors)) {
            const baseTimestamp = Date.now();
            const enrichedDetectors: SelectedDetector[] = item.detectors.map(
              (d: any, idx: number) => {
                const rowId = baseTimestamp + idx + Math.random();
                const fullDetectorData = allDetectors.find(
                  (detector) => detector.id === d.detectorId,
                );

                return {
                  rowId,
                  detector: fullDetectorData || ({
                      id: d.detectorId,
                      title: d.detectorId ? `ID ${d.detectorId}` : "Неизвестный датчик",
                    } as DetectorItem),
                  quantity: d.quantity,
                };
              },
            );
            setSelectedDetectors(enrichedDetectors);
          }
          isInitialized.current = true;
        } catch (error) {
          console.error("Ошибка при загрузке датчиков:", error);
        }
      };

      initDetectors();
      
    } else if (!isOpen) {
      setFormData(null);
      setSelectedDetectors([]);
      isInitialized.current = false;
    }
  }, [isOpen, selectedItems]);


  //  обработчики изменений (без изменений)
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(
      (prev) =>
        ({
          ...(prev || {}),
          [name]: type === "checkbox" ? checked : value,
        }) as T,
    );
  }, []);

  const handleIntChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, checked } = e.target;
      const parsedValue = value === "" ? null : parseInt(value, 10);
      setFormData(
        (prev) =>
          ({
            ...(prev || {}),
            [name]: type === "checkbox" ? checked : parsedValue,
          }) as T,
      );
    },
    [],
  );

  const handleFloatChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, checked } = e.target;
      const parsedValue = value === "" ? null : parseFloat(value);
      setFormData(
        (prev) =>
          ({
            ...(prev || {}),
            [name]: type === "checkbox" ? checked : parsedValue,
          }) as T,
      );
    },
    [],
  );

  const handleWorkTypesChange = useCallback((data: WorkTypes[]) => {
    setFormData((prev) => {
      return {
        ...(prev || {}),
        workTypes: data,
      } as unknown as T;
    });
  }, []);

  const handleSearchableChange = useCallback(
    <K extends keyof typeof searchableConfigs>(
      key: K,
      item: SearchableType<K>,
    ) => {
      setFormData((prev) => {
        const newState = {
          ...(prev || {}),
          [key]: item,
        };
        return newState as T;
      });
    },
    [],
  );

  // Обработчики для датчиков
  const addDetectorRow = useCallback(() => {
    setSelectedDetectors((prev) => [
      ...prev,
      {
        rowId: Date.now() + Math.random(),
        detector: null,
        quantity: 1,
      },
    ]);
  }, []);

  const removeDetectorRow = useCallback((rowId: number) => {
    setSelectedDetectors((prev) => prev.filter((item) => item.rowId !== rowId));
  }, []);

  const handleQuantityChange = useCallback((rowId: number, value: string) => {
    const qty = parseInt(value) || 0;
    setSelectedDetectors((prev) =>
      prev.map((item) =>
        item.rowId === rowId ? { ...item, quantity: qty } : item,
      ),
    );
  }, []);

  const handleDetectorSelect = useCallback(
    (rowId: number, detectorData: DetectorItem) => {
      setSelectedDetectors((prev) =>
        prev.map((item) =>
          item.rowId === rowId ? { ...item, detector: detectorData } : item,
        ),
      );
    },
    [],
  );

  // Подготовка данных для сохранения (использует утилиту prepareDetectorsPayload)
  const prepareStationData = useCallback(() => {
    if (!formData) return formData;
    const resultData: WorkTypes[] = formData.workTypes;
    return {
      stationNameId: formData.name?.id || null,
      stationType: formData.type || "",
      maintenanceTeamId: formData.mTeam?.id || null,
      number: formData.number || null,
      capacity: formData.capacity || 0,
      objectsNumberFrom: formData.objectsNumberFrom || null,
      objectsNumberTo: formData.objectsNumberTo || null,
      inventoryNumber: formData.inventoryNumber || "",
      installationLocation: formData.installationLocation || "",
      normative: formData.normative || null,
      comment: formData.comment || "",
      sound: formData.sound || 0,
      light: formData.light || 0,
      voice: formData.voice || 0,
      lightSound: formData.lightSound || 0,
      commissionDocId: formData.commissionDoc?.id || null,
      projectDocId: formData.projectDoc?.id || null,
      adminDocId: formData.adminDoc?.id || null,
      dateEntered: formData.dateEntered || null,
      dateAdjusted: formData.dateAdjusted || null,
      supplyFireAlarmQuantity: formData.supplyFireAlarmQuantity || null,
      supplyWarningEvacuationControlQuantity:
        formData.supplyWarningEvacuationControlQuantity || null,
      workTypePeriodicity: resultData
        ? resultData.flatMap((workType) => {
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
  }, [formData]);

  const prepareTrainData = useCallback(() => {
    if (!formData) return formData;
    return {
      number: formData.numberHidden
        ? formData.numberHidden.replace(/\*+$/, "")
        : formData.number.replace(/\*+$/, ""),
      sectionNumber: formData.sectionNumber || null,
      location: formData.location || "",
      coordinates: formData.coordinates || "",
      length: formData.length || 0,
      //trainLaboriousness: formData.trainLaboriousness || null,
      dateEntered: formData.dateEntered || null,
      dateAdjusted: formData.dateAdjusted || null,
      comment: formData.comment || "",
      deleted: false,
      orgId: formData.org?.id || null,
      stationId: formData.station?.id || null,
      maintenanceTeamId: formData.maintenanceTeam?.id || null,
      commissionDocId: formData.commissionDoc?.id
        ? formData.commissionDoc.id
        : null,
      projectDocId: formData.projectDoc?.id ? formData.projectDoc.id : null,
      adminDocId: formData.adminDoc?.id ? formData.adminDoc.id : null,
      detectors: prepareDetectorsPayload(selectedDetectors),
    };
  }, [formData, selectedDetectors]);

  const prepareDocument = useCallback(() => {
    if (!formData) return formData;
    return {
      title: formData.title,
      comment: formData.comment || "",
      documentType: formData.documentType,
      file: selectedFile,
    };
  }, [formData]);

  const prepareMTeam = useCallback(() => {
    if (!formData) return formData;
    return {
      title: formData.title,
      comment: formData.comment || "",
      orgId: formData.orgShortTitle?.id || null,
    };
  }, [formData]);

  const prepareObjectData = useCallback(() => {
    if (!formData) return formData;
    return {
      number: formData.number,
      name: formData.name || "",
      coordinates: formData.coordinates || "",
      phone: formData.phone || "",
      dateEntered: formData.dateEntered || null,
      //trainLaboriousness: formData.trainLaboriousness || null,
      comment: formData.comment || "",
      dateAdjusted: formData.dateAdjusted || null,
      deleted: false,
      stationNumberValue: formData.stationNumberValue || null,
      orgId: formData.org?.id || null,
      maintenanceTeamId: formData.maintenanceTeam?.id || null,
      adminStationId: formData.adminStation?.id || null,
      stationId: formData.station?.id || null,
      adminDocId: formData.adminDoc?.id || null,
      commissionDocId: formData.commissionDoc?.id || null,
      projectDocId: formData.projectDoc?.id || null,
      detectors: prepareDetectorsPayload(selectedDetectors),
    };
  }, [formData, selectedDetectors]);

  const prepareDetectors = useCallback(() => {
    if (!formData) return formData;

    return {
      title: formData.title,
      laboriousness: formData.laboriousness,
      purpose: formData.purpose,
      type: formData.type.id,
      comment: formData.comment,
      deleted: formData.deleted,
    };
  }, [formData]);

  const handleSave = async () => {
    let finalData: any = {};

    if (reqUrl === "/trains") finalData = prepareTrainData();
    else if (reqUrl === "/stations") finalData = prepareStationData();
    else if (reqUrl === "/subjects") finalData = prepareObjectData();
    else if (reqUrl === "/detectors") finalData = prepareDetectors();
    else if (reqUrl === "/documents") finalData = prepareDocument();
    else if (reqUrl === "/maintenance_teams") finalData = prepareMTeam();
    else finalData = formData;

    if (!formData || isBulkAction) return;

    const urlWithParams = `${reqUrl}/${formData.id}`;
    try {
      const headers = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
      await axiosInstance.put(
        urlWithParams,
        finalData,
        reqUrl === "/documents" ? headers : {},
      );
      alert("Данные успешно обновлены!");
      setFileName("");
      setSelectedFile(null);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Ошибка при сохранении данных:", error);

      // Извлекаем сообщение из ответа сервера
      const serverMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Произошла неизвестная ошибка";

      alert(`Ошибка: ${serverMessage}`);
    }
  };

  const handleStatusChange = async (deletedStatus: boolean) => {
    const ids = selectedItems.map((item) => item.id);

    try {
      if (deletedStatus) {
        await axiosInstance.delete(reqUrl, { data: { ids } });
        alert("Элемент(ы) удалены.");
      } else {
        await axiosInstance.patch(reqUrl, { ids });
        alert("Элемент(ы) восстановлены.");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Ошибка при изменении статуса:", error);
      alert("Произошла ошибка при выполнении операции: " + error);
    }
  };

  const handleCloseModal = () => {
    const currentDataString = JSON.stringify(formData || {});
    if (
      initialDataString &&
      currentDataString !== initialDataString &&
      !window.confirm(
        "У вас есть несохраненные изменения. Вы уверены, что хотите закрыть?",
      )
    ) {
      return;
    }
    onClose();
  };

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as StationType;

    setFormData((prev: any) => ({
      ...prev,
      type: value,
      typeDisplayValue: e.target.options[e.target.selectedIndex].text,
    }));
  };

  const handleDocSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as DocType;

    setFormData((prev: any) => ({
      ...prev,
      documentType: value,
      documentTypeDisplayValue: e.target.options[e.target.selectedIndex].text,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      // Проверяем тип MIME и расширение файла
      if (
        !ALLOWED_FILE_TYPES.includes(file.type) ||
        !ALLOWED_EXTENSIONS.includes(fileExtension || "")
      ) {
        setFileError(
          "Пожалуйста, выберите файл в формате PDF, DOC, DOCX, XLS или XLSX",
        );
        setSelectedFile(null);
        setFileName("");
        return;
      }

      setSelectedFile(file);
      setFormData((prev: any) => ({
        ...prev,
        file: file,
      }));
      setFileName(file.name);
    }
  };

  const handleCommentChange = async () => {
    const ids = selectedItems.map((item) => item.id);

    try {
      await axiosInstance.put(reqUrl + "/bulk-edit", {
        ids,
        comment: newComment,
      });
      alert("Комментарии изменены");
      setNewComment("");
      setIsCommentMode(false);
    } catch (error) {
      console.error("Ошибка при изменении комментария:", error);
      alert("Ошибка при изменении комментария: " + error);
    }
  };

  //const searchType = location.pathname === "/trains" ? "Шлейф" : "Станция";
  const serverWorkTypePeriodicity = formData?.workTypePeriodicity;

  const renderStationSelect = () => {
    if (formData) {
      return (
        <div className="form-group mb-3">
          <label htmlFor="stationType">"Тип станции (ПС, ОС, ОПС)"</label>
          <select
            className={`form-select ${formData.type !== "default" ? "" : "is-invalid"}`}
            onChange={handleSelectChange}
            style={{ height: "38px" }}
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
      );
    }
  };

  const renderDocumentSelect = () => {
    if (!formData) return null;

    const currentType = DOCUMENT_TYPE_MAP[formData.documentType] || "";
    console.log(currentType);
    const isValid = ["ADMIN", "COMMISSION", "PROJECT"].includes(currentType);

    return (
      <div className="form-group mb-3">
        <label htmlFor="documentType">Тип документа</label>
        <select
          className={`form-select ${isValid ? "" : "is-invalid"}`}
          onChange={handleDocSelectChange}
          style={{ height: "38px" }}
          id="documentType"
          value={isValid ? currentType : "default"}
          required
        >
          <option value="default" disabled>
            Тип документа
          </option>
          <option value="ADMIN">Исполнительная документация</option>
          <option value="COMMISSION">Акт ввода в эксплуатацию</option>
          <option value="PROJECT">Проектная документация</option>
        </select>
      </div>
    );
  };

  const renderDocumentFile = () => {
    if (formData) {
      return (
        <div className="mb-3">
          <label htmlFor="formFile" className="form-label">
            Выберите новый документ (PDF, Word, Excel)
          </label>
          <input
            className="form-control"
            type="file"
            id="formFile"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.xls,.xlsx"
          />
          {fileName && (
            <small className="text-muted">Выбран файл: {fileName}</small>
          )}
          {fileError && <div className="text-danger mt-1">{fileError}</div>}
          <br />
          {formData.filePath.split("_").length > 1 && (
            <small className="text-muted">
              Загруженный файл на сервер: '
              {formData.filePath.slice(formData.filePath.indexOf("_") + 1)}'
            </small>
          )}
        </div>
      );
    }
  };

  // Мемоизированный список полей
  const fieldsToRender = useMemo(() => {
    if (!formData) return [];
    return headers
      .filter(
        (header) =>
          !notShow.includes(header.label) && !header.key.startsWith("none"),
      )
      .map((header) => {
        const rootKey = header.key.split(".")[0];

        // Явно приводим результат reduce к типу unknown, а затем проверяем его
        const value = header.key
          .split(".")
          .reduce(
            (obj, key) => obj?.[key],
            formData as Record<string, any>,
          ) as unknown;

        let valueFrom = "";
        let valueTo = "";

        if (header.key === "objectsNumbers") {
          // Приводим formData к Record, чтобы TS не ругался на произвольные ключи
          const currentFormData = formData as Record<string, any>;
          const currentFrom = currentFormData["objectsNumberFrom"];
          const currentTo = currentFormData["objectsNumberTo"];

          if (currentFrom !== undefined || currentTo !== undefined) {
            valueFrom = currentFrom !== null ? String(currentFrom) : "";
            valueTo = currentTo !== null ? String(currentTo) : "";
          }
          // Проверяем тип value перед вызовом string-методов (убирает ошибку "never")
          else if (typeof value === "string" && value.includes("-")) {
            const [from, to] = value.split("-");
            valueFrom = from || "";
            valueTo = to || "";
          } else if (value !== undefined && value !== null) {
            valueFrom = String(value);
          }
        }

        const cleanKey = rootKey as keyof typeof searchableConfigs;
        const isSearchable = cleanKey in searchableConfigs;
        let itemValue: any = undefined;

        if (isSearchable) {
          const currentFormData = formData as Record<string, any>;
          itemValue = currentFormData[cleanKey] || currentFormData[header.key];
          if (cleanKey === "stationNumberValue")
            itemValue = currentFormData?.station;
        }

        return { header, value, itemValue, valueFrom, valueTo };
      });
  }, [formData, headers, notShow]);

  const nodeRef = useRef<HTMLDivElement>(null);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleCloseModal}
      overlayClassName="modal-overlay"
      className="modal-custom-holder" // Новый класс-заглушка
    >
      <Draggable handle=".modal-header" nodeRef={nodeRef}>
        <div className="modal-content" ref={nodeRef}>
          <div className="modal-header">
            <h2>
              {isBulkAction
                ? `Выбрано элементов: ${selectedItems.length}`
                : "Редактировать элемент"}
            </h2>
            <button onClick={handleCloseModal} className="close-button">
              &times;
            </button>
          </div>

          <div className="modal-body">
            {isBulkAction ? (
              <div>
                <p>Выберите действие для {selectedItems.length} элементов:</p>

                {/* Переключатель (чекбокс-свитч в стиле Bootstrap) */}
                <div className="form-check form-switch mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="modeSwitch"
                    checked={isCommentMode}
                    onChange={(e) => setIsCommentMode(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="modeSwitch">
                    {isCommentMode
                      ? "Режим: Изменение комментария"
                      : "Режим: Изменение статуса"}
                  </label>
                </div>

                {/* Рендеринг в зависимости от положения переключателя */}
                {!isCommentMode ? (
                  <div className="mb-3">
                    <button
                      className="btn btn-danger"
                      onClick={() => handleStatusChange(true)}
                    >
                      Удалить
                    </button>
                    <button
                      className="btn btn-success ms-2"
                      onClick={() => handleStatusChange(false)}
                    >
                      Восстановить
                    </button>
                  </div>
                ) : (
                  <div className="mb-3">
                    <label htmlFor="comment" className="form-label">
                      Новый комментарий:
                    </label>
                    <textarea
                      id="comment"
                      className="form-control mb-2"
                      rows={4}
                      value={newComment}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setNewComment(e.target.value)
                      }
                      autoComplete="off"
                      placeholder="Комментарий"
                    />
                    <button
                      className="btn btn-primary"
                      onClick={handleCommentChange}
                    >
                      Изменить
                    </button>
                  </div>
                )}
              </div>
            ) : (
              formData && (
                <form>
                  {hasDropDownStations && renderStationSelect()}
                  {hasDropDownDocuments && renderDocumentSelect()}
                  {hasDropDownDocuments && renderDocumentFile()}

                  {fieldsToRender.map(
                    ({ header, value, itemValue, valueFrom, valueTo }) => (
                      <FormField
                        key={header.key}
                        header={header}
                        value={value}
                        valueFrom={valueFrom}
                        valueTo={valueTo}
                        itemValue={itemValue}
                        onChange={handleChange}
                        onIntChange={handleIntChange}
                        onFloatChange={handleFloatChange}
                        onSearchableChange={handleSearchableChange}
                      />
                    ),
                  )}

                  {hasDetectors && (
                    <DetectorsSection
                      selectedDetectors={selectedDetectors}
                      onAdd={addDetectorRow}
                      onRemove={removeDetectorRow}
                      onQuantityChange={handleQuantityChange}
                      onDetectorSelect={handleDetectorSelect}
                    />
                  )}

                  {hasWorkTypes && (
                    <WorkTypesSection
                      onChange={handleWorkTypesChange}
                      serverWorkTypePeriodicity={serverWorkTypePeriodicity}
                      required={false}
                    />
                  )}
                </form>
              )
            )}
          </div>

          <div className="modal-footer">
            {!isBulkAction && (
              <button className="btn btn-primary" onClick={handleSave}>
                Сохранить
              </button>
            )}
            <button className="btn btn-secondary" onClick={handleCloseModal}>
              {isBulkAction ? "Закрыть" : "Отменить"}
            </button>
          </div>
        </div>
      </Draggable>
    </Modal>
  );
}

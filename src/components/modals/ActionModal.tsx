import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  ChangeEvent,
} from "react";
import Modal from "react-modal";
import Draggable from "react-draggable";
import { useLocation } from "react-router-dom";
import { axiosInstance, useAxiosInterceptor } from "../../api/client";
import { Header } from "../../types/table";
import {
  SelectedDetector,
  DetectorItem,
  WorkTypes,
} from "../../types/creation";
import {
  searchableConfigs,
  SearchableType,
  DETECTORS,
} from "../../utils/searchableConfig";
import { prepareDetectorsPayload } from "../../utils/prepareDetectors";
import {
  ALLOWED_EXTENSIONS,
  ALLOWED_FILE_TYPES,
} from "../../pages/creation/documents/AddDocument";
import FormField from "./FormField";
import DetectorsSection from "./DetectorsSection";
import WorkTypesSection from "./WorkTypesSection";

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
  const [isCommentMode, setIsCommentMode] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  const nodeRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  useAxiosInterceptor();

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

  useEffect(() => {
    setSelectedFile(null);
    setFileName("");

    if (isOpen && selectedItems.length === 1) {
      const item = selectedItems[0];
      const correctCode =
        DOCUMENT_TYPE_MAP[item.documentType] || item.documentType;

      const preparedItem = {
        ...item,
        documentType: correctCode,
        documentTypeDisplayValue:
          item.documentTypeDisplayValue || item.documentType,
      };

      setFormData(preparedItem as T);
      setInitialDataString(JSON.stringify(preparedItem));

      const initDetectors = async () => {
        try {
          const response =
            await axiosInstance.get<DetectorItem[]>("/detectors/all");
          const allDetectors = response.data || [];

          if (item.detectors && Array.isArray(item.detectors)) {
            const baseTimestamp = Date.now();
            const enriched: SelectedDetector[] = item.detectors.map(
              (d: any, idx: number) => {
                const rowId = baseTimestamp + idx + Math.random();
                const fullDetector = allDetectors.find(
                  (detector) => detector.id === d.detectorId,
                );
                return {
                  rowId,
                  detector:
                    fullDetector ||
                    ({
                      id: d.detectorId,
                      title: d.detectorId
                        ? `ID ${d.detectorId}`
                        : "Неизвестный датчик",
                    } as DetectorItem),
                  quantity: d.quantity,
                };
              },
            );
            setSelectedDetectors(enriched);
          }
        } catch (error) {
          console.error("Ошибка при загрузке датчиков:", error);
        }
      };

      initDetectors();
    } else if (!isOpen) {
      setFormData(null);
      setSelectedDetectors([]);
    }
  }, [isOpen, selectedItems]);

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
      const { name, value } = e.target;
      const parsed = value === "" ? null : parseInt(value, 10);
      setFormData(
        (prev) =>
          ({
            ...(prev || {}),
            [name]: parsed,
          }) as T,
      );
    },
    [],
  );

  const handleFloatChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const parsed = value === "" ? null : parseFloat(value);
      setFormData(
        (prev) =>
          ({
            ...(prev || {}),
            [name]: parsed,
          }) as T,
      );
    },
    [],
  );

  const handleWorkTypesChange = useCallback((data: WorkTypes[]) => {
    setFormData(
      (prev) =>
        ({
          ...(prev || {}),
          workTypes: data,
        }) as unknown as T,
    );
  }, []);

  const handleSearchableChange = useCallback(
    <K extends keyof typeof searchableConfigs>(
      key: K,
      item: SearchableType<K>,
    ) => {
      setFormData(
        (prev) =>
          ({
            ...(prev || {}),
            [key]: item,
          }) as T,
      );
    },
    [],
  );

  const addDetectorRow = useCallback(() => {
    setSelectedDetectors((prev) => [
      ...prev,
      { rowId: Date.now() + Math.random(), detector: null, quantity: 1 },
    ]);
  }, []);

  const removeDetectorRow = useCallback((rowId: number) => {
    setSelectedDetectors((prev) => prev.filter((item) => item.rowId !== rowId));
  }, []);

  const handleQuantityChange = useCallback((rowId: number, value: string) => {
    const qty = parseInt(value, 10) || 0;
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
        ? resultData.flatMap(
            (workType) =>
              workType.typeMonth?.map((tm) => ({
                workTypeId: workType.workType?.id || null,
                codeId: tm.code?.codeId || null,
                startMonth: tm.startMonth || null,
              })) || [],
          )
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
      dateEntered: formData.dateEntered || null,
      dateAdjusted: formData.dateAdjusted || null,
      comment: formData.comment || "",
      deleted: false,
      orgId: formData.org?.id || null,
      stationId: formData.station?.id || null,
      maintenanceTeamId: formData.maintenanceTeam?.id || null,
      commissionDocId: formData.commissionDoc?.id || null,
      projectDocId: formData.projectDoc?.id || null,
      adminDocId: formData.adminDoc?.id || null,
      detectors: prepareDetectorsPayload(selectedDetectors),
    };
  }, [formData, selectedDetectors]);

  const prepareObjectData = useCallback(() => {
    if (!formData) return formData;
    return {
      number: formData.number,
      name: formData.name || "",
      coordinates: formData.coordinates || "",
      phone: formData.phone || "",
      dateEntered: formData.dateEntered || null,
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

  const handleSave = async () => {
    if (!formData || isBulkAction) return;

    let finalData: any = {};
    if (reqUrl === "/trains") finalData = prepareTrainData();
    else if (reqUrl === "/stations") finalData = prepareStationData();
    else if (reqUrl === "/subjects") finalData = prepareObjectData();
    else if (reqUrl === "/detectors") {
      finalData = {
        title: formData.title,
        laboriousness: formData.laboriousness,
        purpose: formData.purpose,
        type: formData.type?.id,
        comment: formData.comment,
        deleted: formData.deleted,
      };
    } else if (reqUrl === "/documents") {
      finalData = {
        title: formData.title,
        comment: formData.comment || "",
        documentType: formData.documentType,
        file: selectedFile,
      };
    } else if (reqUrl === "/maintenance_teams") {
      finalData = {
        title: formData.title,
        comment: formData.comment || "",
        orgId: formData.orgShortTitle?.id || null,
      };
    } else {
      finalData = formData;
    }

    setLoading(true);
    try {
      const config =
        reqUrl === "/documents"
          ? { headers: { "Content-Type": "multipart/form-data" } }
          : {};
      await axiosInstance.put(`${reqUrl}/${formData.id}`, finalData, config);
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(`Ошибка: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (deletedStatus: boolean) => {
    const ids = selectedItems.map((item) => item.id);
    setLoading(true);
    try {
      if (deletedStatus) {
        await axiosInstance.delete(reqUrl, { data: { ids } });
      } else {
        await axiosInstance.patch(reqUrl, { ids });
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(`Ошибка выполнения операции: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCommentChange = async () => {
    const ids = selectedItems.map((item) => item.id);
    setLoading(true);
    try {
      await axiosInstance.put(`${reqUrl}/bulk-edit`, {
        ids,
        comment: newComment,
      });
      setNewComment("");
      setIsCommentMode(false);
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(`Ошибка изменения комментариев: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (
      initialDataString &&
      JSON.stringify(formData || {}) !== initialDataString &&
      !window.confirm("Имеются несохраненные изменения. Закрыть окно?")
    ) {
      return;
    }
    onClose();
  };

  const fieldsToRender = useMemo(() => {
    if (!formData) return [];
    return headers
      .filter((h) => !notShow.includes(h.label) && !h.key.startsWith("none"))
      .map((header) => {
        const rootKey = header.key.split(".")[0];
        const value = header.key
          .split(".")
          .reduce((obj, key) => obj?.[key], formData as Record<string, any>);

        let valueFrom = "";
        let valueTo = "";

        if (header.key === "objectsNumbers") {
          const cur = formData as Record<string, any>;
          valueFrom =
            cur.objectsNumberFrom !== null ? String(cur.objectsNumberFrom) : "";
          valueTo =
            cur.objectsNumberTo !== null ? String(cur.objectsNumberTo) : "";
        }

        const cleanKey = rootKey as keyof typeof searchableConfigs;
        const isSearchable = cleanKey in searchableConfigs;
        let itemValue: any = undefined;

        if (isSearchable) {
          const cur = formData as Record<string, any>;
          itemValue = cur[cleanKey] || cur[header.key];
          if (cleanKey === "stationNumberValue") itemValue = cur.station;
        }

        return { header, value, itemValue, valueFrom, valueTo };
      });
  }, [formData, headers, notShow]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleCloseModal}
      overlayClassName="app-modal-overlay"
      className="border-0 p-0 bg-transparent"
    >
      <Draggable handle=".app-modal__header" nodeRef={nodeRef}>
        <div className="app-modal" ref={nodeRef}>
          <div className="app-modal__header">
            <h5 className="app-modal__title">
              {isBulkAction
                ? `Массовые действия (${selectedItems.length})`
                : "Редактировать запись"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleCloseModal}
              aria-label="Закрыть"
            />
          </div>

          <div className="app-modal__body">
            {isBulkAction ? (
              <div>
                <div className="form-check form-switch mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="bulkModeSwitch"
                    checked={isCommentMode}
                    onChange={(e) => setIsCommentMode(e.target.checked)}
                  />
                  <label
                    className="form-check-label user-select-none"
                    htmlFor="bulkModeSwitch"
                  >
                    {isCommentMode
                      ? "Режим: Изменение комментария"
                      : "Режим: Изменение статуса записи"}
                  </label>
                </div>

                {!isCommentMode ? (
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => handleStatusChange(true)}
                      disabled={loading}
                    >
                      <i className="bi bi-trash me-1"></i> Пометить как
                      удаленные
                    </button>
                    <button
                      className="btn btn-outline-success"
                      onClick={() => handleStatusChange(false)}
                      disabled={loading}
                    >
                      <i className="bi bi-arrow-counterclockwise me-1"></i>{" "}
                      Восстановить
                    </button>
                  </div>
                ) : (
                  <div>
                    <label htmlFor="bulkCommentInput" className="form-label">
                      Новый комментарий для выбранных строк:
                    </label>
                    <textarea
                      id="bulkCommentInput"
                      className="form-control mb-3"
                      rows={4}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Введите общий комментарий..."
                    />
                    <button
                      className="btn btn-primary"
                      onClick={handleBulkCommentChange}
                      disabled={loading || !newComment.trim()}
                    >
                      Применить комментарий
                    </button>
                  </div>
                )}
              </div>
            ) : (
              formData && (
                <form>
                  {hasDropDownStations && (
                    <div className="mb-3">
                      <label htmlFor="stationTypeSelect" className="form-label">
                        Тип станции (ПС, ОС, ОПС)
                      </label>
                      <select
                        id="stationTypeSelect"
                        className="form-select"
                        value={formData.type || "default"}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev: any) => ({
                            ...prev,
                            type: val,
                            typeDisplayValue:
                              e.target.options[e.target.selectedIndex].text,
                          }));
                        }}
                      >
                        <option value="default" disabled>
                          Выберите тип...
                        </option>
                        <option value="FIRE">ПС</option>
                        <option value="SECURITY">ОС</option>
                        <option value="FIRE_SECURITY">ОПС</option>
                      </select>
                    </div>
                  )}

                  {hasDropDownDocuments && (
                    <div className="mb-3">
                      <label htmlFor="docTypeSelect" className="form-label">
                        Тип документа
                      </label>
                      <select
                        id="docTypeSelect"
                        className="form-select"
                        value={
                          DOCUMENT_TYPE_MAP[formData.documentType] || "ADMIN"
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev: any) => ({
                            ...prev,
                            documentType: val,
                            documentTypeDisplayValue:
                              e.target.options[e.target.selectedIndex].text,
                          }));
                        }}
                      >
                        <option value="ADMIN">
                          Исполнительная документация
                        </option>
                        <option value="COMMISSION">
                          Акт ввода в эксплуатацию
                        </option>
                        <option value="PROJECT">Проектная документация</option>
                      </select>
                    </div>
                  )}

                  {hasDropDownDocuments && (
                    <div className="mb-3">
                      <label htmlFor="updateDocFile" className="form-label">
                        Заменить файл (необязательно)
                      </label>
                      <input
                        id="updateDocFile"
                        className={`form-control ${fileError ? "is-invalid" : ""}`}
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        onChange={(e) => {
                          setFileError(null);
                          const sel = e.target.files?.[0];
                          if (!sel) return;
                          const ext =
                            sel.name.split(".").pop()?.toLowerCase() || "";
                          if (
                            !ALLOWED_FILE_TYPES.includes(sel.type) ||
                            !ALLOWED_EXTENSIONS.includes(ext)
                          ) {
                            setFileError("Формат не поддерживается");
                            return;
                          }
                          setSelectedFile(sel);
                          setFileName(sel.name);
                        }}
                      />
                      {fileError && (
                        <div className="invalid-feedback">{fileError}</div>
                      )}
                      {fileName && (
                        <div className="form-text text-success">
                          Новый файл: {fileName}
                        </div>
                      )}
                    </div>
                  )}

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
                      serverWorkTypePeriodicity={formData.workTypePeriodicity}
                    />
                  )}
                </form>
              )
            )}
          </div>

          <div className="app-modal__footer">
            {!isBulkAction && (
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                ) : null}
                Сохранить
              </button>
            )}
            <button
              className="btn btn-secondary"
              onClick={handleCloseModal}
              disabled={loading}
            >
              {isBulkAction ? "Закрыть" : "Отмена"}
            </button>
          </div>
        </div>
      </Draggable>
    </Modal>
  );
}

export default ActionModal;

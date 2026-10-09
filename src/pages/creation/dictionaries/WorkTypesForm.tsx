import React, { useState, useEffect, useCallback, useMemo } from "react";
import { axiosInstance } from "../../../api/client";
import SearchableInput from "../../../components/common/SearchableInput";
import { WorkTypes, WorkType, Code } from "../../../types/creation";

interface WorkTypesFormProps {
  onChange: (data: WorkTypes[]) => void;
  required?: boolean;
  searchType?: string;
  serverWorkTypePeriodicity?: Array<{
    workTypeId: number;
    codeId: number;
    startMonth: number;
  }>;
}

const MONTH_NAMES = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

export const WorkTypesForm: React.FC<WorkTypesFormProps> = ({
  onChange,
  required = false,
  searchType = "Станция",
  serverWorkTypePeriodicity,
}) => {
  const [availableWorkTypes, setAvailableWorkTypes] = useState<WorkType[]>([]);
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<WorkTypes[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const fetchWorkTypes = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get<WorkType[]>("/work_types/all");
        if (isMounted) {
          const filtered = (response.data || []).filter(
            (wt) =>
              !wt.deleted &&
              (searchType ? wt.workTypeForValue === searchType : true),
          );
          setAvailableWorkTypes(filtered);
        }
      } catch (err) {
        console.error("Ошибка загрузки видов работ:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchWorkTypes();
    return () => {
      isMounted = false;
    };
  }, [searchType]);

  useEffect(() => {
    if (serverWorkTypePeriodicity && availableWorkTypes.length > 0) {
      const grouped = new Map<number, WorkTypes>();

      serverWorkTypePeriodicity.forEach((item) => {
        const fullWorkType = availableWorkTypes.find(
          (wt) => wt.id === item.workTypeId,
        );
        if (!fullWorkType) return;

        if (!grouped.has(item.workTypeId)) {
          grouped.set(item.workTypeId, {
            workType: fullWorkType,
            typeMonth: [],
          });
        }

        const entry = grouped.get(item.workTypeId)!;
        const matchingCode = fullWorkType.codes?.find(
          (c) => c.codeId === item.codeId,
        );

        if (matchingCode) {
          entry.typeMonth.push({
            code: matchingCode,
            startMonth: item.startMonth,
          });
        }
      });

      const initialSelected = Array.from(grouped.values());
      setSelectedWorkTypes(initialSelected);
      onChange(initialSelected);
    }
  }, [serverWorkTypePeriodicity, availableWorkTypes, onChange]);

  const handleAddWorkType = useCallback(
    (workType: WorkType) => {
      setSelectedWorkTypes((prev) => {
        if (prev.some((item) => item.workType.id === workType.id)) return prev;
        const updated = [
          ...prev,
          {
            workType,
            typeMonth: (workType.codes || []).map((code) => ({
              code,
              startMonth: 1,
            })),
          },
        ];
        onChange(updated);
        return updated;
      });
    },
    [onChange],
  );

  const handleRemoveWorkType = useCallback(
    (workTypeId: number) => {
      setSelectedWorkTypes((prev) => {
        const updated = prev.filter((item) => item.workType.id !== workTypeId);
        onChange(updated);
        return updated;
      });
    },
    [onChange],
  );

  const handleMonthChange = useCallback(
    (workTypeId: number, codeId: number, startMonth: number) => {
      setSelectedWorkTypes((prev) => {
        const updated = prev.map((item) => {
          if (item.workType.id !== workTypeId) return item;
          return {
            ...item,
            typeMonth: item.typeMonth.map((tm) =>
              tm.code.codeId === codeId ? { ...tm, startMonth } : tm,
            ),
          };
        });
        onChange(updated);
        return updated;
      });
    },
    [onChange],
  );

  return (
    <div className="card border-0 bg-transparent w-100">
      <div className="mb-3">
        <label className="form-label fw-semibold">
          Добавить вид регламентной работы{" "}
          {required && <span className="text-danger">*</span>}
        </label>
        <SearchableInput<WorkType>
          endpoint="/work_types/all"
          onItemSelected={(item) => item && handleAddWorkType(item)}
          inputId="work-type-search-input"
          placeholder="Выберите вид регламентной работы для добавления..."
        />
      </div>

      {loading && (
        <div className="text-center py-3">
          <div
            className="spinner-border spinner-border-sm text-primary me-2"
            role="status"
          ></div>
          <span className="text-muted small">Загрузка видов работ...</span>
        </div>
      )}

      {selectedWorkTypes.length > 0 && (
        <div className="table-responsive border rounded bg-white mt-2">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: "40%" }}>Вид регламентных работ</th>
                <th style={{ width: "25%" }}>Код работы</th>
                <th style={{ width: "25%" }}>Начальный месяц</th>
                <th style={{ width: "10%" }} className="text-end">
                  Действие
                </th>
              </tr>
            </thead>
            <tbody>
              {selectedWorkTypes.map((item) => (
                <React.Fragment key={item.workType.id}>
                  {item.typeMonth.map((tm, idx) => (
                    <tr key={`${item.workType.id}-${tm.code.codeId}`}>
                      {idx === 0 && (
                        <td
                          rowSpan={item.typeMonth.length}
                          className="fw-semibold align-top pt-3 border-end"
                        >
                          {item.workType.title}
                        </td>
                      )}
                      <td>
                        <span className="badge bg-secondary me-2">
                          Код {tm.code.codeId}
                        </span>
                        <span className="small text-muted">
                          (Каждые {tm.code.periodicity} мес.)
                        </span>
                      </td>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={tm.startMonth}
                          onChange={(e) =>
                            handleMonthChange(
                              item.workType.id!,
                              tm.code.codeId,
                              parseInt(e.target.value, 10),
                            )
                          }
                        >
                          {MONTH_NAMES.map((m, mIdx) => (
                            <option key={mIdx + 1} value={mIdx + 1}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </td>
                      {idx === 0 && (
                        <td
                          rowSpan={item.typeMonth.length}
                          className="text-end align-top pt-3"
                        >
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() =>
                              handleRemoveWorkType(item.workType.id!)
                            }
                            title="Удалить вид работ"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WorkTypesForm;

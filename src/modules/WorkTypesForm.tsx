import React, { useState, useEffect, useCallback, useMemo } from "react";
import { axiosInstance, useAxiosInterceptor } from "../api/axios";
import { WorkType } from "../components/createPages/AddTypes";

interface CodesNames {
  id: number;
  title: string;
  comment: string;
  deleted: boolean;
}

interface FormDataRow {
  id: number | null | undefined;
  title: string;
  codeId: string;
  periodicity: number | null;
  startMonth: string;
}

interface InitialMonth {
  codeId: number;
  workTypeId: number;
  startMonth: string;
}

interface WorkTypesFormProps {
  onChange: (data: any[]) => void; // Можно заменить на WorkTypes[] если интерфейс совпадает
  searchType?: string;
  initialMonths?: InitialMonth[];
  required?: boolean;
}

const WorkTypesForm: React.FC<WorkTypesFormProps> = ({
  onChange,
  searchType,
  initialMonths,
  required,
}) => {
  const [formData, setFormData] = useState<FormDataRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [types, setTypes] = useState<CodesNames[]>([]);
  const [error, setError] = useState<string | null>(null);
  const lastSentDataRef = React.useRef<string>("");

  useAxiosInterceptor();

  useEffect(() => {
    const getApiData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [resWorkTypes, resCodes] = await Promise.all([
          axiosInstance.get<WorkType[]>("/work_types/all"),
          axiosInstance.get<CodesNames[]>("/work_type_codes/all"),
        ]);

        const data = resWorkTypes.data;
        setWorkTypes(data);
        setTypes(resCodes.data);

        // 1. ИСПРАВЛЕННАЯ ЛОГИКА ФИЛЬТРАЦИИ:
        // Сначала фильтруем по типу, если он передан
        let filteredData = searchType
          ? data.filter((item: any) => item.workTypeForValue === searchType)
          : data;

        // Если отфильтровали в ноль (например, в модалке пришла строка "Станция", а в базе ключ "STATION"),
        // то подстраховываемся и берем весь массив данных, чтобы таблица не исчезала
        if (filteredData.length === 0) {
          filteredData = data;
        }

        const initialData: FormDataRow[] = filteredData.flatMap(
          (workType: any) =>
            (workType.codes || []).map((code: any) => {
              // Ищем совпадение СТРОГО по комбинации работы И кода
              const existingEntry = initialMonths?.find(
                (m) =>
                  String(m.codeId) === String(code.codeId) &&
                  String(m.workTypeId) === String(workType.id), // Убедись, что тут id или workTypeId
              );

              return {
                id: code.id,
                title: workType.title,
                codeId: code.codeId?.toString() ?? "",
                periodicity: code.periodicity,
                startMonth: existingEntry ? existingEntry.startMonth : "",
              };
            }),
        );

        setFormData(initialData);
      } catch (err) {
        console.error("Ошибка при получении данных API:", err);
        setError("Не удалось загрузить данные.");
      } finally {
        setIsLoading(false);
      }
    };

    getApiData();
    // Оставляем в зависимостях searchType и initialMonths, чтобы при открытии модалки
    // повторный просчет наложил прилетевшие с бэкенда месяца поверх сетки
  }, [searchType, initialMonths]);

  // Группировка данных (вынесено в useMemo для производительности)
  const groupedData = useMemo(() => {
    return formData.reduce(
      (acc, row) => {
        if (!row.title) return acc;
        if (!acc[row.title]) acc[row.title] = [];
        acc[row.title].push(row);
        return acc;
      },
      {} as Record<string, FormDataRow[]>,
    );
  }, [formData]);

  // Эффект для уведомления родителя об изменениях
  useEffect(() => {
    const finalResult = Object.entries(groupedData)
      .map(([title, rows]) => {
        const originalWorkType = workTypes.find((wt) => wt.title === title);
        if (!originalWorkType) return null;

        const months = rows
          .filter((row) => row.startMonth)
          .map((row) => ({
            code:
              originalWorkType.codes.find(
                (c) => c.codeId === parseInt(row.codeId, 10),
              ) || originalWorkType,
            startMonth: parseInt(row.startMonth.split("-")[1], 10),
          }));

        return months.length > 0
          ? { workType: originalWorkType, typeMonth: months }
          : null;
      })
      .filter(Boolean);

    const currentDataString = JSON.stringify(finalResult);
    if (lastSentDataRef.current !== currentDataString) {
      lastSentDataRef.current = currentDataString;
      onChange(finalResult);
    }
  }, [groupedData, workTypes, onChange]);

  const handleMonthChange = useCallback((id: number, month: string) => {
    setFormData((prevData) =>
      prevData.map((row) =>
        row.id === id ? { ...row, startMonth: month } : row,
      ),
    );
  }, []);

  if (isLoading)
    return (
      <div className="text-center mt-3">
        <div className="spinner-border text-primary" />
      </div>
    );
  if (error) return <div className="alert alert-danger mt-3">{error}</div>;

  return (
    <div className="container mt-4 p-0 mb-4">
      <table
        className="table table-bordered w-100"
        style={{ fontSize: "0.875rem" }}
      >
        <thead>
          <tr>
            <th>Регламентные работы</th>
            <th>Коды</th>
            <th>Периодичность</th>
            <th>Месяц начала</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedData).map(([title, rows], groupIndex) => {
            const bgColor = groupIndex % 2 === 0 ? "#ffffff" : "#f8f9fa";

            // 1. Создаем функцию для получения текстового значения ячейки
            const getRowTitle = (row: any) => {
              const foundType = types.find(
                (t) => t.id === parseInt(row.codeId, 10),
              );
              return foundType?.title || String(row.codeId);
            };

            // 2. Сортируем копию массива rows по алфавиту
            const sortedRows = [...rows].sort((a, b) =>
              getRowTitle(a).localeCompare(getRowTitle(b), undefined, {
                numeric: true,
                sensitivity: "base",
              }),
            );

            return (
              <React.Fragment key={title}>
                {/* 3. Рендерим уже отсортированный массив */}
                {sortedRows.map((row, rowIndex) => (
                  <tr
                    key={row.id || `${title}-${rowIndex}`}
                    style={{ backgroundColor: bgColor }}
                  >
                    {rowIndex === 0 && (
                      <td
                        rowSpan={sortedRows.length} // Используем длину отсортированного массива
                        style={{
                          verticalAlign: "middle",
                          backgroundColor: bgColor,
                          fontWeight: "500",
                        }}
                      >
                        {title}
                      </td>
                    )}
                    <td style={{ backgroundColor: bgColor }}>
                      {getRowTitle(row)}
                    </td>
                    <td style={{ backgroundColor: bgColor }}>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={row.periodicity ?? ""}
                        disabled
                      />
                    </td>
                    <td style={{ backgroundColor: bgColor }}>
                      <input
                        type="month"
                        className={`form-control form-control-sm ${required && !row.startMonth ? "is-invalid" : ""}`}
                        value={row.startMonth}
                        required={required}
                        onChange={(e) =>
                          handleMonthChange(row.id || 0, e.target.value)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default WorkTypesForm;

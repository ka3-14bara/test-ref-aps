import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Описываем структуру колонки
interface ColumnConfig<T> {
  header: string;
  // Функция, которая говорит, как достать значение из formData черновика
  render: (data: T) => React.ReactNode;
}

interface DraftsTableProps<T> {
  storageKey: string; // Ключ в localStorage (напр. 'objectOS_drafts_list')
  createPath: string; // Путь для возврата к форме (напр. '/subjects/add')
  title: string; // Заголовок страницы
  columns: ColumnConfig<T>[]; // Конфигурация колонок
  prevPageText: string;
  parrentPageUrl: string;
  parrentPageText:string;
}

const DraftsTable = <T,>({
  storageKey,
  createPath,
  title,
  columns,
  prevPageText,
  parrentPageUrl,
  parrentPageText
}: DraftsTableProps<T>) => {
  const navigate = useNavigate();

  // Загружаем черновики
  const [drafts, setDrafts] = useState<any[]>(() =>
    JSON.parse(localStorage.getItem(storageKey) || "[]"),
  );

  const handleSelectDraft = (draft: any) => {
    // Сохраняем во временный буфер, который подхватит форма создания
    localStorage.setItem("temp_load_draft", JSON.stringify(draft));
    navigate(createPath);
  };

  const deleteDraft = (id: number) => {
    const updated = drafts.filter((d: any) => d.id !== id);
    setDrafts(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  return (
    <div className="container-fluid">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="/">Главная</a>
          </li>
          <li className="breadcrumb-item">
            <a href={parrentPageUrl}>{parrentPageText}</a>
          </li>
          <li className="breadcrumb-item">
            <a href={parrentPageUrl+"/add"}>{prevPageText}</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Журнал - {title}
          </li>
        </ol>
      </nav>
      <h2 className="mt-4">{title}</h2>
      <div className="table-wrapper mt-4" style={{ height: "75vh" }}>
        <div className="table-body-container mt-3">
          <table className="table-el table-hover">
            <thead className="table-light">
            <tr>
              <th style={{ width: "150px" }}>Действия</th>
              <th>Дата сохранения</th>
              {columns.map((col, index) => (
                <th key={index}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {drafts.length > 0 ? (
              drafts.map((draft) => (
                <tr key={draft.id}>
                  <td>
                    <button
                      className="btn btn-outline-success btn-sm me-2"
                      style={{ width: "75px" }}
                      onClick={() => handleSelectDraft(draft)}
                    >
                      Выбрать
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm mt-2"
                      style={{ width: "75px" }}
                      onClick={() => deleteDraft(draft.id)}
                    >
                      Удалить
                    </button>
                  </td>
                  <td className="align-middle text-center">{draft.date}</td>
                  {columns.map((col, index) => (
                    <td key={index} className="align-middle text-center">
                      {col.render(draft.formData)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 2} className="text-center py-4">
                  Черновиков не найдено
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    <button className="btn btn-secondary mt-2" onClick={() => navigate(-1)}>
        Назад
      </button>
    </div>
  );
};

export default DraftsTable;

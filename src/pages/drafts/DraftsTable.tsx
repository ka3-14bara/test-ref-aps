import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ColumnConfig } from "../../types/table";

interface DraftsTableProps<T> {
  storageKey: string;
  createPath: string;
  title: string;
  columns: ColumnConfig<T>[];
  prevPageText: string;
  parentPageUrl: string;
  parentPageText: string;
}

export const DraftsTable = <T,>({
  storageKey,
  createPath,
  title,
  columns,
  prevPageText,
  parentPageUrl,
  parentPageText,
}: DraftsTableProps<T>) => {
  const navigate = useNavigate();

  const [drafts, setDrafts] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "[]");
    } catch {
      return [];
    }
  });

  const handleSelectDraft = (draft: any) => {
    localStorage.setItem("temp_load_draft", JSON.stringify(draft));
    navigate(createPath);
  };

  const deleteDraft = (id: number) => {
    const updated = drafts.filter((d) => d.id !== id);
    setDrafts(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  return (
    <div className="container-fluid px-4 py-2">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="/">Главная</a>
          </li>
          <li className="breadcrumb-item">
            <a href={parentPageUrl}>{parentPageText}</a>
          </li>
          <li className="breadcrumb-item">
            <a href={`${parentPageUrl}/add`}>{prevPageText}</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Черновики - {title}
          </li>
        </ol>
      </nav>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">{title}</h3>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate(-1)}
        >
          <i className="bi bi-arrow-left me-1"></i> Назад
        </button>
      </div>

      <div className="card shadow-sm border-0">
        <div className="table-responsive" style={{ maxHeight: "72vh" }}>
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light sticky-top">
              <tr>
                <th style={{ width: "170px" }}>Действия</th>
                <th>Дата создания</th>
                {columns.map((col, idx) => (
                  <th key={idx}>{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {drafts.length > 0 ? (
                drafts.map((draft) => (
                  <tr key={draft.id}>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-success"
                          onClick={() => handleSelectDraft(draft)}
                        >
                          Выбрать
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => deleteDraft(draft.id)}
                        >
                          Удалить
                        </button>
                      </div>
                    </td>
                    <td className="text-muted small">{draft.date}</td>
                    {columns.map((col, idx) => (
                      <td key={idx}>{col.render(draft.formData)}</td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length + 2}
                    className="text-center py-5 text-muted"
                  >
                    <i className="bi bi-inbox fs-3 d-block mb-2"></i>
                    Черновиков не найдено
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DraftsTable;

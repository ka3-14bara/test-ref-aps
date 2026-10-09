import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance, useAxiosInterceptor } from "../../../api/client";
import { Organization } from "../../../types/creation";
import SearchableInput from "../../../components/common/SearchableInput";
import CreateItemModal from "../../../components/modals/CreateItemModal";

interface AddMTeamProps {
  endPoint: string;
  prevPage: string;
  title: string;
  titleLabel: string;
  placeHolder: string;
}

export const AddMTeam: React.FC<AddMTeamProps> = ({
  endPoint,
  title,
  titleLabel,
  placeHolder,
  prevPage,
}) => {
  const [teamTitle, setTeamTitle] = useState("");
  const [comment, setComment] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  useAxiosInterceptor();

  const orgHeaders = [
    { key: "title", label: "Полное наименование" },
    { key: "shortTitle", label: "Сокращенное наименование" },
    { key: "responsible", label: "Ответственное лицо" },
    { key: "jobTitle", label: "Должность" },
    { key: "comment", label: "Комментарий" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamTitle.trim()) {
      setError("Введите название бригады");
      return;
    }
    if (!selectedOrg?.id) {
      setError("Выберите обслуживаемую организацию");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await axiosInstance.post(endPoint, {
        title: teamTitle,
        orgId: selectedOrg.id,
        comment: comment || null,
      });
      navigate(endPoint);
    } catch (err: any) {
      console.error("Ошибка создания бригады:", err);
      setError(err.response?.data?.message || "Ошибка сохранения бригады");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTeamTitle("");
    setComment("");
    setSelectedOrg(null);
    setError(null);
  };

  return (
    <div className="container mt-2">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="/">Главная</a>
          </li>
          <li className="breadcrumb-item">
            <a href={endPoint}>{prevPage}</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {title}
          </li>
        </ol>
      </nav>

      <h3 className="mb-4">{title}</h3>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card shadow-sm border-0 p-4">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="teamName" className="form-label fw-semibold">
              {titleLabel} <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="teamName"
              className={`form-control ${!teamTitle ? "is-invalid" : ""}`}
              value={teamTitle}
              onChange={(e) => setTeamTitle(e.target.value)}
              placeholder={placeHolder}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Обслуживаемая организация <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <SearchableInput<Organization>
                endpoint="/orgs/all"
                onItemSelected={(org) => setSelectedOrg(org)}
                commentParam="shortTitle"
                inputId="mteamOrgSelect"
                showAfterReload={selectedOrg?.title || ""}
                isRequired={true}
              />
              <button
                type="button"
                className="btn btn-outline-success"
                onClick={() => setIsModalOpen(true)}
                title="Создать организацию на лету"
              >
                <i className="bi bi-plus-lg"></i>
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="mteamComment" className="form-label fw-semibold">
              Комментарий
            </label>
            <textarea
              id="mteamComment"
              className="form-control"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Примечания..."
            />
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-success px-4"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                ) : null}
                Сохранить
              </button>
              <button
                type="button"
                className="btn btn-outline-warning"
                onClick={handleReset}
              >
                Сбросить
              </button>
            </div>
            <button
              type="button"
              className="btn btn-secondary px-4"
              onClick={() => navigate(endPoint)}
            >
              Назад
            </button>
          </div>
        </form>
      </div>

      <CreateItemModal<Organization>
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        endPoint="/orgs"
        headers={orgHeaders}
        initialData={{
          title: "",
          shortTitle: "",
          responsible: "",
          jobTitle: "",
          comment: "",
          deleted: false,
        }}
        onSuccess={() => {}}
        onCreated={(created) => setSelectedOrg(created)}
      />
    </div>
  );
};

export default AddMTeam;

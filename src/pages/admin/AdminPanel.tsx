import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../api/client";
import { useAuth } from "../../hooks/useAuth";
import { User, UsersResponse, RoleMatrix } from "../../types/api";
import { PaginationInfo } from "../../types/table";
import PaginationPanel from "../../components/common/PaginationPanel";

export const AdminPanel: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<RoleMatrix[]>([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });

  const [sortField, setSortField] = useState("id");
  const [direction, setDirection] = useState<"asc" | "desc">("asc");
  const [showModal, setShowModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get<UsersResponse>(
        `/users?page=${pagination.page}&size=${pagination.size}&sort=${sortField}&direction=${direction}`,
      );
      const rolesRes =
        await axiosInstance.get<RoleMatrix[]>("/role/roles-matrix");

      setUsers(response.data.content);
      setRoles(rolesRes.data);
      setPagination((prev) => ({
        ...prev,
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
      }));
    } catch (err) {
      console.error("Ошибка загрузки пользователей:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.page, pagination.size, sortField, direction]);

  const handleSort = (field: string) => {
    const newDir = sortField === field && direction === "asc" ? "desc" : "asc";
    setSortField(field);
    setDirection(newDir);
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const handleRoleChange = async (username: string, newRole: string) => {
    try {
      await axiosInstance.patch(`/users/${username}/role`, {
        roleName: newRole,
      });
      fetchData();
    } catch (err) {
      alert("Ошибка изменения роли пользователя");
    }
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete("/users", { data: { ids: selectedIds } });
      setSelectedIds([]);
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert("Ошибка удаления пользователей");
    }
  };

  return (
    <div className="container-fluid px-4 py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">
          <i className="bi bi-shield-lock me-2"></i> Управление пользователями
        </h3>
        <button
          className="btn btn-outline-danger d-flex align-items-center gap-2"
          onClick={() => setShowModal(true)}
          disabled={selectedIds.length === 0}
        >
          <i className="bi bi-trash"></i> Удалить выбранных (
          {selectedIds.length})
        </button>
      </div>

      <div className="card shadow-sm border-0 mb-3">
        <div className="table-responsive" style={{ height: "70vh" }}>
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light sticky-top">
              <tr>
                <th style={{ width: "40px" }}>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={
                      users.length > 0 && selectedIds.length === users.length
                    }
                    onChange={(e) =>
                      setSelectedIds(
                        e.target.checked
                          ? users
                              .filter(
                                (u) => u.username !== currentUser?.username,
                              )
                              .map((u) => u.id)
                          : [],
                      )
                    }
                  />
                </th>
                <th
                  onClick={() => handleSort("id")}
                  style={{ cursor: "pointer", width: "80px" }}
                  className="user-select-none"
                >
                  ID{" "}
                  <i
                    className={`bi ms-1 ${
                      sortField === "id"
                        ? direction === "asc"
                          ? "bi-sort-numeric-down text-primary"
                          : "bi-sort-numeric-up-alt text-primary"
                        : "bi-arrow-down-up text-muted opacity-25"
                    }`}
                  ></i>
                </th>
                <th
                  onClick={() => handleSort("username")}
                  style={{ cursor: "pointer" }}
                  className="user-select-none"
                >
                  Пользователь{" "}
                  <i
                    className={`bi ms-1 ${
                      sortField === "username"
                        ? direction === "asc"
                          ? "bi-sort-alpha-down text-primary"
                          : "bi-sort-alpha-up-alt text-primary"
                        : "bi-arrow-down-up text-muted opacity-25"
                    }`}
                  ></i>
                </th>
                <th>Текущая роль</th>
                <th>Смена роли</th>
                <th>Разрешения</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selectedIds.includes(user.id)}
                      disabled={user.username === currentUser?.username}
                      onChange={() => {
                        setSelectedIds((prev) =>
                          prev.includes(user.id)
                            ? prev.filter((i) => i !== user.id)
                            : [...prev, user.id],
                        );
                      }}
                    />
                  </td>
                  <td>{user.id}</td>
                  <td>
                    <strong>{user.username}</strong>
                  </td>
                  <td>
                    <span className="badge bg-light text-primary border border-primary-subtle">
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <select
                      className="form-select form-select-sm w-auto"
                      value={user.role.replace("ROLE_", "")}
                      disabled={user.username === currentUser?.username}
                      onChange={(e) =>
                        handleRoleChange(user.username, e.target.value)
                      }
                    >
                      {roles.map((r) => (
                        <option key={r.roleName} value={r.roleName}>
                          {r.roleName.replace("ROLE_", "")}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div className="d-flex flex-wrap gap-1">
                      {(user.permissions || []).map((perm, idx) => (
                        <span
                          key={idx}
                          className="badge bg-light text-secondary border fw-normal small"
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <PaginationPanel
          pagination={pagination}
          isLoading={loading}
          onPageChange={(newPage) =>
            setPagination((prev) => ({ ...prev, page: newPage }))
          }
          onPageSizeChange={(newSize) =>
            setPagination((prev) => ({ ...prev, size: newSize, page: 0 }))
          }
        />
      </div>

      {showModal && (
        <div className="app-modal-overlay">
          <div
            className="card shadow-lg"
            style={{ maxWidth: "480px", width: "100%" }}
          >
            <div className="card-header bg-danger text-white py-3">
              <h5 className="mb-0">Подтверждение удаления</h5>
            </div>
            <div className="card-body p-4">
              <p className="mb-0">
                Вы действительно хотите безвозвратно удалить{" "}
                <strong>{selectedIds.length}</strong> пользователей?
              </p>
            </div>
            <div className="card-footer bg-light d-flex justify-content-end gap-2 py-3">
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Отмена
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Да, удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

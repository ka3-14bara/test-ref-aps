import { User } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { axiosInstance } from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import { PaginationInfo } from "../modules/Types";
import { PaginationPanel } from "../modules/PaginationPanel";

interface AdminPanel {
  req: string;
}

export interface RoleMatrix {
  roleName: string;
  permissions: string[];
}

export interface UsersResponse {
  content: User[];
  totalPages: number;
  totalElements: number;
  number: number; // текущая страница
}

const AdminPanel = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<RoleMatrix[]>([]);
  const [loading, setLoading] = useState(true);

  // Стейт пагинации согласно твоему интерфейсу PaginationInfo
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });

  const [sortField, setSortField] = useState("id");
  const [direction, setDirection] = useState("asc");
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

      // Синхронизируем данные пагинации из ответа сервера
      setPagination((prev) => ({
        ...prev,
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
      }));
    } catch (err) {
      console.error("Ошибка загрузки:", err);
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
      // Добавляем ROLE_ обратно перед отправкой на бэкенд
      const fullRoleName = `${newRole}`;
      await axiosInstance.patch(`/users/${username}/role`, {
        roleName: fullRoleName,
      });
      fetchData();
    } catch (err) {
      alert("Ошибка смены роли");
    }
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete("/users", { data: { ids: selectedIds } });
      setSelectedIds([]);
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert("Ошибка удаления");
    }
  };

  const renderSortIcon = (field: string) => {
    if (sortField !== field) {
      // Иконка для неактивного столбца
      return (
        <i
          className="bi bi-arrow-down-up text-secondary opacity-50 ms-1"
          style={{ fontSize: "0.8rem" }}
        ></i>
      );
    }
    return direction === "asc" ? (
      <i className="bi bi-sort-numeric-down text-primary ms-1"></i> // Для ID или текста (возрастание)
    ) : (
      <i className="bi bi-sort-numeric-up-alt text-primary ms-1"></i>
    );
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h3 mb-0">Система управления</h2>
        <button
          className="btn btn-outline-danger d-flex align-items-center gap-2"
          onClick={() => setShowModal(true)}
          disabled={selectedIds.length === 0}
        >
          <i className="bi bi-person-x"></i> Удалить ({selectedIds.length})
        </button>
      </div>

      <div className="card shadow-sm border-0 mb-3">
        <div className="table-responsive" style={{ height: "71vh" }}>
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: "40px" }}></th>

                <th
                  onClick={() => handleSort("id")}
                  style={{
                    cursor: "pointer",
                    userSelect: "none",
                    minWidth: "100px",
                  }}
                  className="position-relative"
                >
                  ID {renderSortIcon("id")}
                </th>

                <th
                  onClick={() => handleSort("username")}
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  Пользователь {renderSortIcon("username")}
                </th>
                <th>Роль</th>
                <th>Сменить роль</th>
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
                      className="form-select form-select-sm"
                      style={{ width: "160px" }}
                      // Убеждаемся, что значение в селекте совпадает с тем, что в <option value="...">
                      value={(user.role || "").replace("ROLE_", "")}
                      disabled={user.username === currentUser?.username}
                      onChange={(e) =>
                        handleRoleChange(user.username, e.target.value)
                      }
                    >
                      {roles.map((r) => (
                        <option key={r.roleName} value={r.roleName}>
                          {/* Отображаем красиво, убирая ROLE_ для пользователя */}
                          {r.roleName.replace("ROLE_", "")}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div className="d-flex flex-wrap gap-1">
                      {user.permissions.map((p, i) => (
                        <span
                          key={i}
                          className="badge bg-light text-secondary border fw-normal"
                          style={{ fontSize: "0.65rem" }}
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Интеграция твоего компонента */}
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

      {/* Модальное окно подтверждения */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Подтверждение удаления</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <p className="mb-0">
                  Вы собираетесь удалить <strong>{selectedIds.length}</strong>{" "}
                  пользователей. Данные будут стерты безвозвратно. Продолжить?
                </p>
              </div>
              <div className="modal-footer border-0">
                <button
                  className="btn btn-light"
                  onClick={() => setShowModal(false)}
                >
                  Отмена
                </button>
                <button className="btn btn-danger px-4" onClick={confirmDelete}>
                  Да, удалить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

import React from "react";
import { User } from "../../types/api";

interface UserAvatarProps {
  user: User | null;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ user }) => {
  const getInitials = (username: string) => {
    if (!username) return "U";
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <div className="d-inline-flex align-items-center gap-2">
      <div
        className="rounded-circle bg-dark text-warning d-flex align-items-center justify-content-center fw-bold shadow-sm"
        style={{ width: "36px", height: "36px", fontSize: "0.875rem" }}
      >
        {user ? getInitials(user.username) : <i className="bi bi-person"></i>}
      </div>
      <div className="d-flex flex-column text-start">
        <span className="fw-semibold text-dark small lh-1">
          {user?.username || "Пользователь"}
        </span>
        <span className="text-muted" style={{ fontSize: "0.75rem" }}>
          {user?.role?.replace("ROLE_", "") || "Гость"}
        </span>
      </div>
    </div>
  );
};

export default UserAvatar;

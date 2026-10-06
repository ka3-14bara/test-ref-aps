import { User } from "../components/Navigation";

interface UserAvatarProps {
  user: User | null;
}

export const UserAvatar = ({ user }: UserAvatarProps) => {
  return (
    <span className="d-inline-flex align-items-center" style={{ verticalAlign: 'middle' }}>
      <div 
        className="d-flex align-items-center justify-content-center rounded-circle bg-secondary text-white shadow-sm" 
        style={{ width: '32px', height: '32px', marginRight: '8px', fontSize: '0.9rem', fontWeight: 'bold', flexShrink: 0 }}
      >
        {user?.username ? user.username.charAt(0).toUpperCase() : '?'}
      </div>
      <span style={{ lineHeight: '1' }}>{user?.username || "Загрузка..."}</span>
    </span>
  );
};

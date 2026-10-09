export interface User {
  id: number;
  username: string;
  role: string;
  permissions: string[];
}

export interface RoleMatrix {
  roleName: string;
  permissions: string[];
}

export interface UsersResponse {
  content: User[];
  totalPages: number;
  totalElements: number;
  number: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

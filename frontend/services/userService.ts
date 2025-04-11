import api, { fetchApi, postApi, putApi, deleteApi } from '@/lib/api';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  date_joined: string;
  borrowing_count: number;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface UserUpdate {
  username?: string;
  email?: string;
  password?: string;
  role?: string;
  is_active?: boolean;
}

// Get all users (admin only)
export const getUsers = async (search?: string) => {
  const params: any = {};
  if (search) params.search = search;
  
  return fetchApi<User[]>('/users', params);
};

// Get a specific user (admin only)
export const getUser = async (id: number) => {
  return fetchApi<User>(`/users/${id}`);
};

// Create a new user (admin only)
export const createUser = async (userData: UserCreate) => {
  return postApi<User>('/users', userData);
};

// Update a user (admin only)
export const updateUser = async (id: number, userData: UserUpdate) => {
  return putApi<User>(`/users/${id}`, userData);
};

// Delete a user (admin only)
export const deleteUser = async (id: number) => {
  return deleteApi(`/users/${id}`);
};

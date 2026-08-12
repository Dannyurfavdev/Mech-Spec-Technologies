import apiClient from './client';
import { LoginResponse, User, Role } from '../types';

export const login = (username: string, password: string) =>
  apiClient.post<LoginResponse>('/auth/login/', { username, password });

export const register = (username: string, email: string, password: string, role: Role) =>
  apiClient.post('/auth/register/', { username, email, password, role });

export const logout = (refresh: string) =>
  apiClient.post('/auth/logout/', { refresh });

export const getMe = () => apiClient.get<User>('/auth/me/');
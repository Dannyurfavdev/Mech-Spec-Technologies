import apiClient from './client';
import type { User } from '../types';

export interface InstructorProfile {
  bio?: string;
  title?: string;
  picture?: string;
}

export const getMe = () => apiClient.get<User>('/auth/me/');

export const updateMe = (data: Partial<Pick<User, 'email'>>) =>
  apiClient.patch<User>('/auth/me/', data);

export const getInstructorProfile = () =>
  apiClient.get<InstructorProfile>('/auth/instructor/profile/');

export const updateInstructorProfile = (data: InstructorProfile) =>
  apiClient.put<InstructorProfile>('/auth/instructor/profile/', data);
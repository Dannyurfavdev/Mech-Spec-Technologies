import apiClient from './client';
import type { User, Role } from '../types';
import type { Course } from '../types';

export interface PlatformStats {
  users: {
    total: number;
    students: number;
    instructors: number;
    admins: number;
    suspended: number;
  };
  courses: {
    total_active: number;
    published: number;
    removed: number;
  };
  enrollments: {
    total: number;
  };
  orders: {
    total: number;
    paid: number;
    pending: number;
  };
}

export const getUsers = (role?: Role) =>
  apiClient.get<User[]>('/auth/admin/users/', {
    params: role ? { role } : {},
  });

export const suspendUser = (id: number) =>
  apiClient.post(`/auth/admin/users/${id}/suspend/`);

export const activateUser = (id: number) =>
  apiClient.post(`/auth/admin/users/${id}/activate/`);

export const getStats = () =>
  apiClient.get<PlatformStats>('/auth/admin/stats/');

export const getAdminCourses = () =>
    apiClient.get<Course[]>('/courses/admin/courses/');
  
export const removeCourse = (id: number) =>
 apiClient.post(`/courses/admin/courses/${id}/remove/`);
  
export const restoreCourse = (id: number) =>
 apiClient.post(`/courses/admin/courses/${id}/restore/`);
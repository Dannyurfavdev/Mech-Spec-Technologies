import apiClient from './client';
import type { Course, Category } from '../types';

export const getCategories = () => apiClient.get<Category[]>('/courses/categories/');

export const getCourses = (categoryId?: number) =>
  apiClient.get<Course[]>('/courses/', {
    params: categoryId ? { category: categoryId } : {},
  });

export const getCourseDetail = (id: number) =>
  apiClient.get<Course>(`/courses/${id}/`);
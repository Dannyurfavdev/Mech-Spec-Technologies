import apiClient from './client';
import type { Course } from '../types';

export interface CreateCoursePayload {
  title: string;
  description: string;
  category: number;
  price?: number;
}

export const createCourse = (payload: CreateCoursePayload) =>
  apiClient.post<Course>('/courses/instructor/courses/', payload);

export const addObjective = (courseId: number, text: string) =>
  apiClient.post(`/courses/instructor/courses/${courseId}/objectives/`, { text });

export const addModule = (courseId: number, title: string) =>
  apiClient.post(`/courses/instructor/courses/${courseId}/modules/`, { title });

export const addLesson = (courseId: number, moduleId: number, title: string, content?: string) =>
  apiClient.post(
    `/courses/instructor/courses/${courseId}/modules/${moduleId}/lessons/`,
    { title, content }
  );

export const publishCourse = (courseId: number) =>
  apiClient.patch(`/courses/instructor/courses/${courseId}/`, { is_published: true });
import apiClient from './client';

export const checkout = (courseId: number) =>
  apiClient.post('/enrollments/checkout/', { course: courseId });

export const confirmPayment = (reference: string) =>
  apiClient.post(`/enrollments/payments/${reference}/confirm/`);

export const getMyEnrollments = () =>
  apiClient.get('/enrollments/my-enrollments/');

export const completeLesson = (lessonId: number) =>
  apiClient.post(`/enrollments/lessons/${lessonId}/complete/`);

export const getCourseProgress = (courseId: number) =>
  apiClient.get(`/enrollments/courses/${courseId}/progress/`);
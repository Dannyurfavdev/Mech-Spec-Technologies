import apiClient from './client';

export const checkout = (courseId: number) =>
  apiClient.post('/enrollments/checkout/', { course: courseId });

export const confirmPayment = (reference: string) =>
  apiClient.post(`/enrollments/payments/${reference}/confirm/`);

export const getMyEnrollments = () =>
  apiClient.get('/enrollments/my-enrollments/');
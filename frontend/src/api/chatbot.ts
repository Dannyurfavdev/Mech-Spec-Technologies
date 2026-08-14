import apiClient from './client';

export interface ChatResponse {
  reply: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export const askChatbot = (message: string) =>
  apiClient.post<ChatResponse>('/chatbot/ask/', { message });

export const getFAQs = () =>
  apiClient.get<FAQ[]>('/chatbot/faqs/');
export type Role = 'student' | 'instructor' | 'admin';

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  is_active?: boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse extends AuthTokens {
  user: User;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  category: number;
  is_published: boolean;
  instructor?: number;
  price?: number;
}

export interface Category {
  id: number;
  name: string;
}
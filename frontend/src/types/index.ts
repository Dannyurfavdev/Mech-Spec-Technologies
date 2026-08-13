export type Role = 'student' | 'instructor' | 'admin';

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  is_suspended?: boolean;
  created_at?: string;
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
  is_removed?: boolean;
  instructor?: number;
  instructor_name?: string;
  price?: number;
}

export interface Category {
  id: number;
  name: string;
}

export interface Objective {
  id: number;
  text: string;
}

export interface Lesson {
  id: number;
  title: string;
  content?: string;
  order?: number;
}

export interface Module {
  id: number;
  title: string;
  lessons: Lesson[];
  order?: number;
}

export interface CourseDetail extends Course {
  objectives?: Objective[];
  modules?: Module[];
  instructor_name?: string;
}

export interface Enrollment {
  id: number;
  course: number;
}
export interface DraftModule {
  id: number;        // real backend id once saved
  title: string;
  lessons: { id: number; title: string }[];
}

export interface EnrolledCourse {
  id: number;
  course: number;
  course_detail: {
    id: number;
    title: string;
    slug: string;
    price: string;
    thumbnail: string | null;
    is_published: boolean;
    instructor: number;
    instructor_name: string;
    category: number;
    category_name: string;
    created_at: string;
  };
  enrolled_at: string;
}

export interface CourseProgress {
  course: number;
  total_lessons: number;
  completed_lesson_ids: number[];
  completed_count: number;
  percent_complete: number;
  modules?: Module[];
}

export interface EnrolledStudent {
  id: number;
  student: {
    id: number;
    username: string;
    email: string;
    role: string;
    is_suspended: boolean;
    created_at: string;
  };
  enrolled_at: string;
}
export interface CheckoutResponse {
  order: {
    id: number;
    course: number;
    course_detail: any;
    price_at_purchase: string;
    status: string;
    created_at: string;
  };
  transaction: {
    id: number;
    reference: string;
    status: string;
    order: number;
  };
}
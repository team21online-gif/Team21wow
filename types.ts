export enum UserRole {
  ADMIN = 'ADMIN',
  MENTOR = 'MENTOR',
  STUDENT = 'STUDENT',
}

export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED',
}

export interface User {
  id: string;
  username: string;
  password?: string; // In a real app, never store plain text. Mock only.
  fullName: string;
  role: UserRole;
  status: UserStatus;
  mentorId?: string; // If student, who is their mentor
}

export interface Lesson {
  id: string;
  title: string;
  content: string; // Markdown or text
}

export interface Course {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  assignedStudentIds: string[];
  assignedMentorIds: string[];
}

export interface Submission {
  id: string;
  studentId: string;
  courseId: string;
  lessonId: string;
  content: string;
  feedback?: string;
  grade?: number;
  submittedAt: string;
  gradedAt?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

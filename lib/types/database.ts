export type UserRole = 'DIRECTOR' | 'TEACHER' | 'PARENT';

export type GradeLevel = 'CP' | 'CE1' | 'CE2' | 'CM1' | 'CM2' | '6EME' | '5EME' | '4EME' | '3EME';

export interface School {
  id: string;
  name: string;
  created_at: string;
}

export interface User {
  id: string;
  role: UserRole;
  school_id: string | null;
  classroom_id: string | null;
  email: string | null;
  full_name: string | null;
  created_at: string;
  child_first_name: string | null;
  avatar_id: string | null;
}

export interface Classroom {
  id: string;
  name: string;
  grade: GradeLevel;
  school_id: string;
  created_at: string;
}

export interface SignupFormData {
  email: string;
  password: string;
  fullName: string;
  schoolName: string;
}

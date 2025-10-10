// Types de base pour l'application Futur Génie

export type UserRole = 'directeur' | 'enseignant' | 'parent' | 'eleve';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  createdAt: string;
}

export interface School {
  id: string;
  name: string;
  address?: string;
  directorId: string;
  createdAt: string;
}

export interface Class {
  id: string;
  name: string;
  schoolId: string;
  teacherId: string;
  level: string;
  createdAt: string;
}

export interface Exercise {
  id: string;
  title: string;
  subject: string;
  description?: string;
  classId: string;
  teacherId: string;
  createdAt: string;
}

export interface Student {
  id: string;
  userId: string;
  classId: string;
  parentId?: string;
  createdAt: string;
}

// Types pour les composants UI
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type CardVariant = 'glass' | 'solid' | 'outline';

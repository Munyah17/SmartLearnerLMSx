import type { UserRole } from './roles'

export interface School {
  id: string
  name: string
  slug: string
  address: string | null
  phone: string | null
  email: string | null
  logo_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  school_id: string
  first_name: string
  last_name: string
  role: UserRole
  avatar_url: string | null
  phone: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Class {
  id: string
  school_id: string
  name: string
  grade_level: string
  capacity: number | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Subject {
  id: string
  school_id: string
  name: string
  code: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface Teacher {
  id: string
  school_id: string
  profile_id: string
  employee_number: string
  department: string | null
  qualification: string | null
  join_date: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  profile?: Profile
}

export type Gender = 'male' | 'female' | 'other'

export interface Student {
  id: string
  school_id: string
  profile_id: string | null
  student_number: string
  first_name: string
  last_name: string
  date_of_birth: string | null
  gender: Gender | null
  class_id: string | null
  address: string | null
  guardian_name: string | null
  guardian_phone: string | null
  guardian_email: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  class?: Class
}

export type FeeStatus = 'unpaid' | 'partial' | 'paid'

export interface Fee {
  id: string
  school_id: string
  student_id: string
  amount: number
  description: string
  due_date: string | null
  paid_date: string | null
  status: FeeStatus
  created_by: string | null
  created_at: string
  updated_at: string
  student?: Student
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'

export interface Attendance {
  id: string
  school_id: string
  student_id: string
  class_id: string
  date: string
  status: AttendanceStatus
  notes: string | null
  recorded_by: string | null
  created_at: string
  student?: Student
}

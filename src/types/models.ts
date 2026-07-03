import type { UserRole, StaffTitle, StudentTitle } from './roles'

// ─────────────────────────────────────────────────────────────
// School (tenant)
// ─────────────────────────────────────────────────────────────
export type SchoolType = 'primary' | 'secondary' | 'high' | 'combined' | 'tertiary'
export type TermStructure = '3_terms' | '2_semesters' | '4_quarters'
export type GradeSystem =
  | 'zim_primary' | 'zim_secondary' | 'cambridge'
  | 'south_african' | 'us_k12' | 'uk_year' | 'indian' | 'other'

export interface SchoolFeatures {
  library: boolean
  health: boolean
  transport: boolean
  activities: boolean
  digital_ids: boolean
}

export interface School {
  id: string
  name: string
  slug: string
  address: string | null
  phone: string | null
  email: string | null
  logo_url: string | null
  is_active: boolean
  // Config (from migration 004)
  school_type: SchoolType | null
  school_motto: string | null
  website: string | null
  id_prefix: string | null        // e.g. "SLS" used in ID numbers
  academic_year: string | null    // e.g. "2026"
  term_structure: TermStructure | null
  currency: string | null         // "USD" | "ZWL"
  country: string | null          // "ZW"
  grade_system: GradeSystem | null
  features: SchoolFeatures | null
  role_labels: Record<string, string> | null   // custom label overrides
  primary_color: string | null
  created_at: string
  updated_at: string
}

// ─────────────────────────────────────────────────────────────
// Profile (extends auth.users — one row per Supabase user)
// ─────────────────────────────────────────────────────────────
export interface Profile {
  id: string
  school_id: string
  first_name: string
  last_name: string
  role: UserRole
  // Extended (migration 004)
  staff_title: StaffTitle | null     // for staff members
  student_title: StudentTitle | null // for student leadership
  id_number: string | null           // generated school ID (e.g. SLS-2026-STD-00001)
  gender: 'male' | 'female' | 'other' | null
  date_of_birth: string | null
  national_id: string | null
  address: string | null
  department: string | null
  id_issued_at: string | null
  // Core
  avatar_url: string | null
  phone: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// ─────────────────────────────────────────────────────────────
// Class / Stream
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// Subject
// ─────────────────────────────────────────────────────────────
export interface Subject {
  id: string
  school_id: string
  name: string
  code: string
  description: string | null
  created_at: string
  updated_at: string
}

// ─────────────────────────────────────────────────────────────
// Teacher (detail record linked to a profile)
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// Student
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// Fee
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// Attendance
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// Activity (sport, club, cultural, etc.)
// ─────────────────────────────────────────────────────────────
export type ActivityType = 'sport' | 'club' | 'cultural' | 'academic' | 'faith' | 'other'

export interface Activity {
  id: string
  school_id: string
  name: string
  type: ActivityType
  patron_id: string | null   // teacher who is the patron (always a staff member)
  coach_id: string | null    // coach (can be internal teacher or external)
  description: string | null
  meeting_schedule: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  patron?: Profile
  coach?: Profile
}

// ─────────────────────────────────────────────────────────────
// ID Sequence tracker
// ─────────────────────────────────────────────────────────────
export interface IdSequence {
  school_id: string
  role_prefix: string   // e.g. "STD", "TCH"
  last_seq: number
}

export type UserRole = 'school_admin' | 'teacher' | 'student' | 'parent'

export const ROLE_LABELS: Record<UserRole, string> = {
  school_admin: 'School Admin',
  teacher: 'Teacher',
  student: 'Student',
  parent: 'Parent',
}

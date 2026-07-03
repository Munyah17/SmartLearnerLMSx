import type { UserRole, StaffTitle } from './roles'

// ─────────────────────────────────────────────────────────────
// Permission tokens — granular feature access flags.
// ─────────────────────────────────────────────────────────────
export type Permission =
  // School settings
  | 'school.manage'           // Edit school name, config, logos
  | 'school.view_settings'    // Read-only settings access

  // People — Staff
  | 'staff.manage'            // Create / edit / deactivate staff profiles
  | 'staff.view'              // See staff directory

  // People — Students
  | 'students.manage'         // Create / edit / deactivate student records
  | 'students.view_all'       // See all students in school
  | 'students.view_own'       // See own student record
  | 'students.view_children'  // See linked children (parent)

  // Classes & Timetable
  | 'classes.manage'
  | 'classes.view'
  | 'subjects.manage'
  | 'subjects.view'
  | 'timetable.manage'
  | 'timetable.view'

  // Attendance
  | 'attendance.manage'           // Take and edit attendance
  | 'attendance.view_all'         // All students' attendance
  | 'attendance.view_class'       // Own classes only
  | 'attendance.view_own'         // Own record (student)
  | 'attendance.view_children'    // Children's records (parent)

  // Grades / Results
  | 'grades.manage'
  | 'grades.view_all'
  | 'grades.view_class'
  | 'grades.view_own'
  | 'grades.view_children'

  // Assignments
  | 'assignments.manage'      // Create / grade assignments
  | 'assignments.submit'      // Submit work (students)
  | 'assignments.view'

  // Fees / Finance
  | 'fees.manage'             // Create / edit fee records
  | 'fees.view_all'           // All students' fees
  | 'fees.view_own'           // Own fee record
  | 'fees.view_children'      // Children's fees (parent)

  // Activities — sports, clubs, cultural
  | 'activities.manage'
  | 'activities.view'

  // Library
  | 'library.manage'
  | 'library.view'

  // Health / Medical
  | 'health.manage'
  | 'health.view_all'
  | 'health.view_own'

  // Transport
  | 'transport.manage'
  | 'transport.view'

  // Reports
  | 'reports.financial'
  | 'reports.academic'
  | 'reports.attendance'

  // Announcements
  | 'announcements.manage'
  | 'announcements.view'

  // Digital IDs
  | 'ids.issue'           // Generate and assign ID numbers
  | 'ids.print'           // Print / export ID cards
  | 'ids.view_own'        // View own ID card


// ─────────────────────────────────────────────────────────────
// Full permission sets by title-group / role
// ─────────────────────────────────────────────────────────────

const EXECUTIVE_PERMS: Permission[] = [
  'school.manage', 'school.view_settings',
  'staff.manage', 'staff.view',
  'students.manage', 'students.view_all',
  'classes.manage', 'classes.view',
  'subjects.manage', 'subjects.view',
  'timetable.manage', 'timetable.view',
  'attendance.manage', 'attendance.view_all',
  'grades.manage', 'grades.view_all',
  'assignments.manage', 'assignments.view',
  'fees.manage', 'fees.view_all',
  'activities.manage', 'activities.view',
  'library.manage', 'library.view',
  'health.manage', 'health.view_all',
  'transport.manage', 'transport.view',
  'reports.financial', 'reports.academic', 'reports.attendance',
  'announcements.manage', 'announcements.view',
  'ids.issue', 'ids.print', 'ids.view_own',
]

const DEPUTY_PERMS: Permission[] = [
  'school.view_settings',                       // no school.manage
  'staff.manage', 'staff.view',
  'students.manage', 'students.view_all',
  'classes.manage', 'classes.view',
  'subjects.manage', 'subjects.view',
  'timetable.manage', 'timetable.view',
  'attendance.manage', 'attendance.view_all',
  'grades.manage', 'grades.view_all',
  'assignments.manage', 'assignments.view',
  'fees.view_all',                              // no fees.manage
  'activities.manage', 'activities.view',
  'library.view',
  'health.view_all',
  'transport.view',
  'reports.academic', 'reports.attendance',     // no financial reports
  'announcements.manage', 'announcements.view',
  'ids.issue', 'ids.print', 'ids.view_own',
]

const HOD_PERMS: Permission[] = [
  'staff.view',
  'students.view_all',
  'classes.manage', 'classes.view',
  'subjects.manage', 'subjects.view',
  'timetable.view',
  'attendance.manage', 'attendance.view_all',
  'grades.manage', 'grades.view_all',
  'assignments.manage', 'assignments.view',
  'activities.view',
  'library.view',
  'reports.academic', 'reports.attendance',
  'announcements.view',
  'ids.view_own',
]

const SENIOR_TEACHER_PERMS: Permission[] = [
  'staff.view',
  'students.view_all',
  'classes.view',
  'subjects.view',
  'timetable.view',
  'attendance.manage', 'attendance.view_all',
  'grades.manage', 'grades.view_all',
  'assignments.manage', 'assignments.view',
  'activities.view',
  'library.view',
  'reports.academic', 'reports.attendance',
  'announcements.manage', 'announcements.view',
  'ids.view_own',
]

const BURSAR_PERMS: Permission[] = [
  'students.view_all',
  'classes.view',
  'fees.manage', 'fees.view_all',
  'reports.financial',
  'announcements.view',
  'ids.issue', 'ids.print', 'ids.view_own',
]

const FINANCE_READ_PERMS: Permission[] = [
  'students.view_all',
  'fees.view_all',
  'reports.financial',
  'announcements.view',
  'ids.view_own',
]

const LIBRARIAN_PERMS: Permission[] = [
  'students.view_all',
  'library.manage', 'library.view',
  'timetable.view',
  'announcements.view',
  'ids.view_own',
]

const NURSE_PERMS: Permission[] = [
  'students.view_all',
  'health.manage', 'health.view_all', 'health.view_own',
  'announcements.view',
  'ids.view_own',
]

const COUNSELOR_PERMS: Permission[] = [
  'students.view_all',
  'attendance.view_all',
  'health.view_all',
  'announcements.view',
  'ids.view_own',
]

const LAB_SCIENTIST_PERMS: Permission[] = [
  'students.view_all',
  'classes.view',
  'timetable.view',
  'library.view',
  'announcements.view',
  'ids.view_own',
]

// ─────────────────────────────────────────────────────────────
// Base permissions per system role
// (used when no title-level override exists)
// ─────────────────────────────────────────────────────────────
const ROLE_BASE_PERMISSIONS: Record<UserRole, Permission[]> = {
  school_admin: EXECUTIVE_PERMS,

  teacher: [
    'staff.view',
    'students.view_all',
    'classes.view',
    'subjects.view',
    'timetable.view',
    'attendance.manage', 'attendance.view_class',
    'grades.manage', 'grades.view_class',
    'assignments.manage', 'assignments.view',
    'activities.view',
    'library.view',
    'announcements.view',
    'ids.view_own',
  ],

  finance: BURSAR_PERMS,

  admin_staff: [
    'staff.view',
    'students.manage', 'students.view_all',
    'classes.view',
    'timetable.view',
    'attendance.view_all',
    'fees.view_all',
    'activities.view',
    'announcements.manage', 'announcements.view',
    'ids.issue', 'ids.print', 'ids.view_own',
    'transport.view',
  ],

  support_staff: [
    'students.view_all',
    'classes.view',
    'timetable.view',
    'attendance.view_class',
    'activities.view',
    'library.manage', 'library.view',
    'health.manage', 'health.view_all', 'health.view_own',
    'announcements.view',
    'ids.view_own',
  ],

  ancillary: [
    'announcements.view',
    'ids.view_own',
    'transport.view',
  ],

  student: [
    'students.view_own',
    'classes.view',
    'timetable.view',
    'attendance.view_own',
    'grades.view_own',
    'assignments.submit', 'assignments.view',
    'fees.view_own',
    'activities.view',
    'library.view',
    'health.view_own',
    'announcements.view',
    'ids.view_own',
  ],

  parent: [
    'students.view_children',
    'timetable.view',
    'attendance.view_children',
    'grades.view_children',
    'fees.view_children',
    'activities.view',
    'announcements.view',
    'ids.view_own',
  ],
}

// ─────────────────────────────────────────────────────────────
// Title-level overrides: a more specific permission set when
// the user's staff_title matches.
// ─────────────────────────────────────────────────────────────
const TITLE_OVERRIDES: Partial<Record<StaffTitle, Permission[]>> = {
  // Executive titles → full executive permissions
  headmaster: EXECUTIVE_PERMS, headmistress: EXECUTIVE_PERMS,
  principal: EXECUTIVE_PERMS, director: EXECUTIVE_PERMS,

  // Deputy titles → deputy permissions
  deputy_headmaster: DEPUTY_PERMS, deputy_headmistress: DEPUTY_PERMS,
  vice_principal: DEPUTY_PERMS, deputy_director: DEPUTY_PERMS,

  // Academic leads
  head_of_department: HOD_PERMS,
  senior_teacher: SENIOR_TEACHER_PERMS,
  teacher_in_charge: SENIOR_TEACHER_PERMS,

  // Finance roles
  bursar: BURSAR_PERMS, finance_manager: BURSAR_PERMS,
  accounts_clerk: FINANCE_READ_PERMS, finance_assistant: FINANCE_READ_PERMS,

  // Support specialists
  librarian: LIBRARIAN_PERMS, library_assistant: LIBRARIAN_PERMS,
  nurse: NURSE_PERMS, medical_officer: NURSE_PERMS,
  counselor: COUNSELOR_PERMS,
  lab_scientist: LAB_SCIENTIST_PERMS, lab_assistant: LAB_SCIENTIST_PERMS,
}

// ─────────────────────────────────────────────────────────────
// Public API: get the effective permission set for a profile
// ─────────────────────────────────────────────────────────────
export function getPermissions(
  role: UserRole,
  staffTitle?: string | null,
): Set<Permission> {
  if (staffTitle) {
    const override = TITLE_OVERRIDES[staffTitle as StaffTitle]
    if (override) return new Set(override)
  }
  return new Set(ROLE_BASE_PERMISSIONS[role] ?? [])
}

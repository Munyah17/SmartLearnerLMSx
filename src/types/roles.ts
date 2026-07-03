// ─────────────────────────────────────────────────────────────
// System roles — stored in profiles.role, drive RLS policies.
// These are the high-level permission buckets.
// ─────────────────────────────────────────────────────────────
export type UserRole =
  | 'school_admin'   // Executive: headmaster, principal, director + deputy head
  | 'teacher'        // Academic: HOD, senior teacher, form teacher, patron, coach
  | 'finance'        // Finance: bursar, accounts clerk, finance assistant
  | 'admin_staff'    // Admin: administrator, receptionist, secretary, registry
  | 'support_staff'  // Support: lab scientist, librarian, nurse, counselor, IT
  | 'ancillary'      // Ancillary: guard, driver, cleaner, cook, groundsman
  | 'student'
  | 'parent'

// ─────────────────────────────────────────────────────────────
// Staff titles — stored in profiles.staff_title.
// Granular job titles within the system role buckets above.
// Schools can override these labels via schools.role_labels.
// ─────────────────────────────────────────────────────────────
export type StaffTitle =
  // ── Executive (school_admin role) ──────────────────────────
  | 'headmaster' | 'headmistress' | 'principal' | 'director'
  | 'deputy_headmaster' | 'deputy_headmistress'
  | 'vice_principal' | 'deputy_director'

  // ── Academic (teacher role) ─────────────────────────────────
  | 'head_of_department'
  | 'senior_teacher'
  | 'teacher_in_charge'
  | 'form_teacher'
  | 'teacher'
  | 'patron'
  | 'internal_coach'
  | 'lab_teacher'

  // ── Finance (finance role) ──────────────────────────────────
  | 'bursar' | 'finance_manager'
  | 'accounts_clerk' | 'finance_assistant'

  // ── Administration (admin_staff role) ──────────────────────
  | 'administrator'
  | 'receptionist'
  | 'secretary'
  | 'registry_clerk'

  // ── Support (support_staff role) ───────────────────────────
  | 'lab_scientist' | 'lab_assistant'
  | 'librarian' | 'library_assistant'
  | 'nurse' | 'medical_officer'
  | 'counselor'
  | 'it_technician'

  // ── Ancillary (ancillary role) ──────────────────────────────
  | 'guard' | 'security_officer'
  | 'cleaner' | 'housekeeper'
  | 'groundsman'
  | 'driver'
  | 'cook' | 'caterer'
  | 'maintenance'
  | 'external_coach'
  | 'school_inspector'
  | 'volunteer'

// ─────────────────────────────────────────────────────────────
// Student leadership titles — stored in profiles.student_title.
// Students always have role = 'student'; this field tracks
// their elected or appointed leadership position.
// ─────────────────────────────────────────────────────────────
export type StudentTitle =
  | 'head_boy' | 'head_girl'
  | 'vice_head_boy' | 'vice_head_girl'
  | 'senior_prefect_boy' | 'senior_prefect_girl'
  | 'prefect_boy' | 'prefect_girl'
  | 'class_monitor'
  | 'group_leader'
  | 'student'

// ─────────────────────────────────────────────────────────────
// Human-readable labels
// ─────────────────────────────────────────────────────────────
export const ROLE_LABELS: Record<UserRole, string> = {
  school_admin: 'School Admin',
  teacher:      'Teacher',
  finance:      'Finance',
  admin_staff:  'Administration',
  support_staff:'Support Staff',
  ancillary:    'Support Staff',
  student:      'Student',
  parent:       'Parent / Guardian',
}

export const STAFF_TITLE_LABELS: Record<StaffTitle, string> = {
  // Executive
  headmaster:            'Headmaster',
  headmistress:          'Headmistress',
  principal:             'Principal',
  director:              'Director',
  deputy_headmaster:     'Deputy Headmaster',
  deputy_headmistress:   'Deputy Headmistress',
  vice_principal:        'Vice Principal',
  deputy_director:       'Deputy Director',
  // Academic
  head_of_department:    'Head of Department',
  senior_teacher:        'Senior Teacher',
  teacher_in_charge:     'Teacher in Charge',
  form_teacher:          'Form Teacher',
  teacher:               'Teacher',
  patron:                'Patron',
  internal_coach:        'Coach',
  lab_teacher:           'Lab Teacher',
  // Finance
  bursar:                'Bursar',
  finance_manager:       'Finance Manager',
  accounts_clerk:        'Accounts Clerk',
  finance_assistant:     'Finance Assistant',
  // Admin
  administrator:         'Administrator',
  receptionist:          'Receptionist',
  secretary:             'Secretary',
  registry_clerk:        'Registry Clerk',
  // Support
  lab_scientist:         'Laboratory Scientist',
  lab_assistant:         'Lab Assistant',
  librarian:             'Librarian',
  library_assistant:     'Library Assistant',
  nurse:                 'Nurse',
  medical_officer:       'Medical Officer',
  counselor:             'Counselor',
  it_technician:         'IT Technician',
  // Ancillary
  guard:                 'Security Guard',
  security_officer:      'Security Officer',
  cleaner:               'Cleaner',
  housekeeper:           'Housekeeper',
  groundsman:            'Groundsman',
  driver:                'Driver',
  cook:                  'Cook',
  caterer:               'Caterer',
  maintenance:           'Maintenance',
  external_coach:        'External Coach',
  school_inspector:      'School Inspector',
  volunteer:             'Volunteer',
}

export const STUDENT_TITLE_LABELS: Record<StudentTitle, string> = {
  head_boy:           'Head Boy',
  head_girl:          'Head Girl',
  vice_head_boy:      'Vice Head Boy',
  vice_head_girl:     'Vice Head Girl',
  senior_prefect_boy: 'Senior Prefect',
  senior_prefect_girl:'Senior Prefect',
  prefect_boy:        'Prefect',
  prefect_girl:       'Prefect',
  class_monitor:      'Class Monitor',
  group_leader:       'Group Leader',
  student:            'Student',
}

// ─────────────────────────────────────────────────────────────
// Title → role mapping (which system role a title belongs to)
// ─────────────────────────────────────────────────────────────
export const TITLE_ROLE_MAP: Record<StaffTitle, UserRole> = {
  headmaster: 'school_admin', headmistress: 'school_admin',
  principal: 'school_admin', director: 'school_admin',
  deputy_headmaster: 'school_admin', deputy_headmistress: 'school_admin',
  vice_principal: 'school_admin', deputy_director: 'school_admin',

  head_of_department: 'teacher', senior_teacher: 'teacher',
  teacher_in_charge: 'teacher', form_teacher: 'teacher',
  teacher: 'teacher', patron: 'teacher',
  internal_coach: 'teacher', lab_teacher: 'teacher',

  bursar: 'finance', finance_manager: 'finance',
  accounts_clerk: 'finance', finance_assistant: 'finance',

  administrator: 'admin_staff', receptionist: 'admin_staff',
  secretary: 'admin_staff', registry_clerk: 'admin_staff',

  lab_scientist: 'support_staff', lab_assistant: 'support_staff',
  librarian: 'support_staff', library_assistant: 'support_staff',
  nurse: 'support_staff', medical_officer: 'support_staff',
  counselor: 'support_staff', it_technician: 'support_staff',

  guard: 'ancillary', security_officer: 'ancillary',
  cleaner: 'ancillary', housekeeper: 'ancillary',
  groundsman: 'ancillary', driver: 'ancillary',
  cook: 'ancillary', caterer: 'ancillary',
  maintenance: 'ancillary', external_coach: 'ancillary',
  school_inspector: 'ancillary', volunteer: 'ancillary',
}

// ─────────────────────────────────────────────────────────────
// Title groups (for permission lookups)
// ─────────────────────────────────────────────────────────────
export const EXECUTIVE_TITLES: StaffTitle[] = [
  'headmaster','headmistress','principal','director',
]
export const DEPUTY_TITLES: StaffTitle[] = [
  'deputy_headmaster','deputy_headmistress','vice_principal','deputy_director',
]
export const ACADEMIC_LEAD_TITLES: StaffTitle[] = [
  'head_of_department','senior_teacher','teacher_in_charge',
]
export const FINANCE_READ_ONLY_TITLES: StaffTitle[] = [
  'accounts_clerk','finance_assistant',
]

// ─────────────────────────────────────────────────────────────
// Role prefix codes used when generating ID numbers
// e.g. "SLS-2026-STD-00001"
// ─────────────────────────────────────────────────────────────
export const ROLE_ID_PREFIX: Record<UserRole, string> = {
  school_admin: 'EXE',
  teacher:      'TCH',
  finance:      'FIN',
  admin_staff:  'ADM',
  support_staff:'SUP',
  ancillary:    'ANC',
  student:      'STD',
  parent:       'PAR',
}

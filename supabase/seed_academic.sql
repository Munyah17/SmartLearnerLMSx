-- ============================================================
-- SmartLearnerLMS — Academic Seed Addendum
-- Run AFTER seed.sql and migration 005.
-- Adds classes/subjects/teachers/students so the new academic
-- modules (Timetable, Attendance, Grades, Assignments) have real
-- data to operate on. Safe to re-run.
-- ============================================================

-- ── Classes ─────────────────────────────────────────────────
INSERT INTO public.classes (id, school_id, name, grade_level, capacity, created_by)
VALUES
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'Form 1A', 'Form 1', 40, '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'Form 2B', 'Form 2', 40, '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001', 'Form 3C', 'Form 3', 35, '00000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;

-- ── Subjects ────────────────────────────────────────────────
INSERT INTO public.subjects (id, school_id, name, code, description)
VALUES
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000001', 'Mathematics', 'MATH', 'Core mathematics curriculum'),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000001', 'English',     'ENG',  'Language and literature'),
  ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000001', 'Science',     'SCI',  'Combined science'),
  ('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000001', 'History',     'HIST', 'Zimbabwean and world history'),
  ('00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000001', 'ICT',         'ICT',  'Information and communication technology')
ON CONFLICT (id) DO NOTHING;

-- ── Teachers (link existing HOD / Form Teacher profiles) ─────
INSERT INTO public.teachers (school_id, profile_id, employee_number, department, qualification, join_date, is_active, created_by)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'TCH-001', 'Science',   'BSc Mathematics & Science Ed.', '2020-01-15', true, '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 'TCH-002', 'Languages', 'BA English Literature',         '2021-08-01', true, '00000000-0000-0000-0000-000000000002')
ON CONFLICT (school_id, employee_number) DO NOTHING;

-- ── Students (10, spread across the 3 classes; no login) ─────
INSERT INTO public.students (
  id, school_id, student_number, first_name, last_name, date_of_birth, gender,
  class_id, guardian_name, guardian_phone, is_active, created_by
) VALUES
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000001', 'SLS-STU-001', 'Tafadzwa', 'Chirwa',   '2011-03-12', 'male',   '00000000-0000-0000-0000-000000000101', 'Blessing Chirwa',  '+263771000001', true, '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000001', 'SLS-STU-002', 'Rutendo',  'Marufu',   '2011-06-04', 'female', '00000000-0000-0000-0000-000000000101', 'Simba Marufu',     '+263771000002', true, '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000001', 'SLS-STU-003', 'Kudakwashe','Sibanda', '2011-11-20', 'male',   '00000000-0000-0000-0000-000000000101', 'Nomsa Sibanda',    '+263771000003', true, '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000001', 'SLS-STU-004', 'Chiedza',  'Mutasa',   '2010-02-17', 'female', '00000000-0000-0000-0000-000000000102', 'Farai Mutasa',     '+263771000004', true, '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000305', '00000000-0000-0000-0000-000000000001', 'SLS-STU-005', 'Tapiwa',   'Ncube',    '2010-09-09', 'male',   '00000000-0000-0000-0000-000000000102', 'Lindiwe Ncube',    '+263771000005', true, '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000306', '00000000-0000-0000-0000-000000000001', 'SLS-STU-006', 'Rumbidzai','Dube',     '2010-12-01', 'female', '00000000-0000-0000-0000-000000000102', 'Tonderai Dube',    '+263771000006', true, '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000307', '00000000-0000-0000-0000-000000000001', 'SLS-STU-007', 'Tinotenda','Moyo',     '2009-04-23', 'male',   '00000000-0000-0000-0000-000000000103', 'Grace Moyo',       '+263771000007', true, '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000308', '00000000-0000-0000-0000-000000000001', 'SLS-STU-008', 'Nyasha',   'Chikafu',  '2009-07-30', 'female', '00000000-0000-0000-0000-000000000103', 'Prosper Chikafu',  '+263771000008', true, '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000309', '00000000-0000-0000-0000-000000000001', 'SLS-STU-009', 'Panashe',  'Gumbo',    '2009-01-14', 'male',   '00000000-0000-0000-0000-000000000103', 'Memory Gumbo',     '+263771000009', true, '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000310', '00000000-0000-0000-0000-000000000001', 'SLS-STU-010', 'Vimbainashe','Zisengwe','2010-05-27', 'female', '00000000-0000-0000-0000-000000000101', 'Charles Zisengwe', '+263771000010', true, '00000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;

-- ── Link the demo student login (Tinashe Zvobgo) to a real student
-- record so the "Student" demo account has class access like any
-- other student, not just a bare login profile.
INSERT INTO public.students (
  id, school_id, profile_id, student_number, first_name, last_name, date_of_birth, gender,
  class_id, guardian_name, guardian_phone, is_active, created_by
) VALUES (
  '00000000-0000-0000-0000-000000000311', '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000008', 'SLS-STU-011', 'Tinashe', 'Zvobgo',
  '2009-08-05', 'male', '00000000-0000-0000-0000-000000000101',
  'Margaret Zvobgo', '+263771000011', true, '00000000-0000-0000-0000-000000000002'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SmartLearnerLMS — Demo Seed v2
-- Run AFTER all migrations (001–004) in the Supabase SQL Editor.
-- Safe to re-run — uses ON CONFLICT DO NOTHING / DO UPDATE.
-- Password for all demo accounts: demo1234
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── Demo school ─────────────────────────────────────────────
INSERT INTO public.schools (
  id, name, slug, address, email, is_active,
  school_type, id_prefix, academic_year, grade_system,
  school_motto, currency, country, term_structure,
  features
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'SmartLearner Demo School',
  'demo',
  '123 Enterprise Road, Harare, Zimbabwe',
  'demo@smartlearnlms.co.zw',
  true,
  'secondary',
  'SLS',
  '2026',
  'zim_secondary',
  'Excellence Through Knowledge',
  'USD',
  'ZW',
  '3_terms',
  '{"library":true,"health":true,"transport":true,"activities":true,"digital_ids":true}'
)
ON CONFLICT (id) DO UPDATE SET
  school_type   = EXCLUDED.school_type,
  id_prefix     = EXCLUDED.id_prefix,
  academic_year = EXCLUDED.academic_year,
  grade_system  = EXCLUDED.grade_system,
  school_motto  = EXCLUDED.school_motto,
  features      = EXCLUDED.features;

-- ── Auth users (8 demo accounts) ────────────────────────────
INSERT INTO auth.users (
  id, instance_id, aud, role,
  email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, recovery_token,
  email_change_token_new, email_change
) VALUES
  -- 1. Headmaster (school_admin + headmaster title)
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'headmaster@demo.smartlearnlms.co.zw',
    crypt('demo1234', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    now(), now(), '', '', '', ''
  ),
  -- 2. Deputy Headmaster (school_admin + deputy_headmaster title)
  (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'deputy@demo.smartlearnlms.co.zw',
    crypt('demo1234', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    now(), now(), '', '', '', ''
  ),
  -- 3. Head of Department — Sciences (teacher + head_of_department)
  (
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'hod@demo.smartlearnlms.co.zw',
    crypt('demo1234', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    now(), now(), '', '', '', ''
  ),
  -- 4. Form Teacher (teacher + form_teacher)
  (
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'teacher@demo.smartlearnlms.co.zw',
    crypt('demo1234', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    now(), now(), '', '', '', ''
  ),
  -- 5. Bursar (finance + bursar)
  (
    '00000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'bursar@demo.smartlearnlms.co.zw',
    crypt('demo1234', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    now(), now(), '', '', '', ''
  ),
  -- 6. Receptionist (admin_staff + receptionist)
  (
    '00000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'receptionist@demo.smartlearnlms.co.zw',
    crypt('demo1234', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    now(), now(), '', '', '', ''
  ),
  -- 7. Student — Head Boy (student + head_boy)
  (
    '00000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'student@demo.smartlearnlms.co.zw',
    crypt('demo1234', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    now(), now(), '', '', '', ''
  ),
  -- 8. Parent (parent)
  (
    '00000000-0000-0000-0000-000000000009',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'parent@demo.smartlearnlms.co.zw',
    crypt('demo1234', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    now(), now(), '', '', '', ''
  )
ON CONFLICT (id) DO NOTHING;

-- ── Auth identities ──────────────────────────────────────────
INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000002', 'headmaster@demo.smartlearnlms.co.zw',  '00000000-0000-0000-0000-000000000002',
   '{"sub":"00000000-0000-0000-0000-000000000002","email":"headmaster@demo.smartlearnlms.co.zw","email_verified":true}'::jsonb, 'email', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000003', 'deputy@demo.smartlearnlms.co.zw',      '00000000-0000-0000-0000-000000000003',
   '{"sub":"00000000-0000-0000-0000-000000000003","email":"deputy@demo.smartlearnlms.co.zw","email_verified":true}'::jsonb,      'email', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000004', 'hod@demo.smartlearnlms.co.zw',         '00000000-0000-0000-0000-000000000004',
   '{"sub":"00000000-0000-0000-0000-000000000004","email":"hod@demo.smartlearnlms.co.zw","email_verified":true}'::jsonb,         'email', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000005', 'teacher@demo.smartlearnlms.co.zw',     '00000000-0000-0000-0000-000000000005',
   '{"sub":"00000000-0000-0000-0000-000000000005","email":"teacher@demo.smartlearnlms.co.zw","email_verified":true}'::jsonb,     'email', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000006', 'bursar@demo.smartlearnlms.co.zw',      '00000000-0000-0000-0000-000000000006',
   '{"sub":"00000000-0000-0000-0000-000000000006","email":"bursar@demo.smartlearnlms.co.zw","email_verified":true}'::jsonb,      'email', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000007', 'receptionist@demo.smartlearnlms.co.zw','00000000-0000-0000-0000-000000000007',
   '{"sub":"00000000-0000-0000-0000-000000000007","email":"receptionist@demo.smartlearnlms.co.zw","email_verified":true}'::jsonb,'email', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000008', 'student@demo.smartlearnlms.co.zw',     '00000000-0000-0000-0000-000000000008',
   '{"sub":"00000000-0000-0000-0000-000000000008","email":"student@demo.smartlearnlms.co.zw","email_verified":true}'::jsonb,     'email', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000009', 'parent@demo.smartlearnlms.co.zw',      '00000000-0000-0000-0000-000000000009',
   '{"sub":"00000000-0000-0000-0000-000000000009","email":"parent@demo.smartlearnlms.co.zw","email_verified":true}'::jsonb,      'email', now(), now(), now())
ON CONFLICT DO NOTHING;

-- ── Profiles ─────────────────────────────────────────────────
INSERT INTO public.profiles (
  id, school_id, first_name, last_name, role,
  staff_title, student_title, gender,
  department, id_number, id_issued_at,
  is_active
) VALUES
  -- 1. Headmaster
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
   'Thomas', 'Ndlovu', 'school_admin',
   'headmaster', null, 'male',
   null, 'SLS-2026-EXE-00001', now(), true),

  -- 2. Deputy Headmaster
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
   'Grace', 'Moyo', 'school_admin',
   'deputy_headmistress', null, 'female',
   null, 'SLS-2026-EXE-00002', now(), true),

  -- 3. HOD — Sciences
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001',
   'Farai', 'Chikwanda', 'teacher',
   'head_of_department', null, 'male',
   'Science', 'SLS-2026-TCH-00001', now(), true),

  -- 4. Form Teacher — 3A
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001',
   'Rudo', 'Murisa', 'teacher',
   'form_teacher', null, 'female',
   'Languages', 'SLS-2026-TCH-00002', now(), true),

  -- 5. Bursar
  ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001',
   'Solomon', 'Banda', 'finance',
   'bursar', null, 'male',
   'Finance', 'SLS-2026-FIN-00001', now(), true),

  -- 6. Receptionist
  ('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001',
   'Tendai', 'Mhike', 'admin_staff',
   'receptionist', null, 'female',
   'Administration', 'SLS-2026-ADM-00001', now(), true),

  -- 7. Student — Head Boy
  ('00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001',
   'Tinashe', 'Zvobgo', 'student',
   null, 'head_boy', 'male',
   null, 'SLS-2026-STD-00001', now(), true),

  -- 8. Parent
  ('00000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001',
   'Margaret', 'Zvobgo', 'parent',
   null, null, 'female',
   null, 'SLS-2026-PAR-00001', now(), true)
ON CONFLICT (id) DO UPDATE SET
  staff_title   = EXCLUDED.staff_title,
  student_title = EXCLUDED.student_title,
  gender        = EXCLUDED.gender,
  department    = EXCLUDED.department,
  id_number     = EXCLUDED.id_number,
  id_issued_at  = EXCLUDED.id_issued_at;

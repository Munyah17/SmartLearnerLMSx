-- ============================================================
-- SmartLearnerLMS — Migration 004: Expanded Role System
-- Run in Supabase SQL Editor after migration 003.
-- ============================================================

-- ── 1. Expand profiles.role constraint ──────────────────────
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN (
  'school_admin',   -- Executive: headmaster, principal, director, deputy head
  'teacher',        -- Academic: HOD, senior teacher, form teacher, patron, coach
  'finance',        -- Finance: bursar, accounts clerk, finance assistant
  'admin_staff',    -- Administration: administrator, receptionist, secretary, registry
  'support_staff',  -- Support: lab scientist, librarian, nurse, counselor, IT
  'ancillary',      -- Ancillary: guard, driver, cleaner, cook, groundsman
  'student',
  'parent'
));

-- ── 2. New columns on profiles ───────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS staff_title    text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS student_title  text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS id_number      text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender         text CHECK (gender IN ('male','female','other'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth  date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS national_id    text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address        text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS id_issued_at   timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS department     text;

-- Unique ID numbers per school (enforce via app-level unique index)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_id_number
  ON profiles(id_number) WHERE id_number IS NOT NULL;

-- ── 3. Extend schools table for multi-tenant config ──────────
ALTER TABLE schools ADD COLUMN IF NOT EXISTS school_type    text DEFAULT 'secondary'
  CHECK (school_type IN ('primary','secondary','high','combined','tertiary'));
ALTER TABLE schools ADD COLUMN IF NOT EXISTS school_motto   text;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS website        text;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS id_prefix      text DEFAULT 'SCH';
ALTER TABLE schools ADD COLUMN IF NOT EXISTS academic_year  text DEFAULT '2026';
ALTER TABLE schools ADD COLUMN IF NOT EXISTS term_structure text DEFAULT '3_terms'
  CHECK (term_structure IN ('3_terms','2_semesters','4_quarters'));
ALTER TABLE schools ADD COLUMN IF NOT EXISTS currency       text DEFAULT 'USD';
ALTER TABLE schools ADD COLUMN IF NOT EXISTS country        text DEFAULT 'ZW';
ALTER TABLE schools ADD COLUMN IF NOT EXISTS grade_system   text DEFAULT 'zim_secondary'
  CHECK (grade_system IN ('zim_primary','zim_secondary','cambridge','south_african','us_k12','uk_year','indian','other'));
ALTER TABLE schools ADD COLUMN IF NOT EXISTS features       jsonb
  DEFAULT '{"library":true,"health":true,"transport":false,"activities":true,"digital_ids":true}';
ALTER TABLE schools ADD COLUMN IF NOT EXISTS role_labels    jsonb DEFAULT '{}';
ALTER TABLE schools ADD COLUMN IF NOT EXISTS primary_color  text DEFAULT '#6366f1';

-- ── 4. ID sequences table ─────────────────────────────────────
-- Tracks next sequence number per school per role prefix for ID generation.
CREATE TABLE IF NOT EXISTS id_sequences (
  school_id    uuid    NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  role_prefix  text    NOT NULL,   -- e.g. STD, TCH, ADM, FIN, ANC
  last_seq     integer NOT NULL DEFAULT 0,
  PRIMARY KEY (school_id, role_prefix)
);

-- ── 5. Activities / clubs / sports table ─────────────────────
CREATE TABLE IF NOT EXISTS activities (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id        uuid        NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name             text        NOT NULL,
  type             text        NOT NULL
    CHECK (type IN ('sport','club','cultural','academic','faith','other')),
  patron_id        uuid        REFERENCES profiles(id),
  coach_id         uuid        REFERENCES profiles(id),
  description      text,
  meeting_schedule text,
  is_active        boolean     NOT NULL DEFAULT true,
  created_by       uuid        REFERENCES profiles(id),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activities_school_id ON activities(school_id);
CREATE TRIGGER activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ── 6. RLS on new tables ──────────────────────────────────────
ALTER TABLE id_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities   ENABLE ROW LEVEL SECURITY;

-- id_sequences: readable by school members, writable by admin/admin_staff
CREATE POLICY "id_sequences_select" ON id_sequences FOR SELECT
  USING (school_id = get_my_school_id());

CREATE POLICY "id_sequences_insert" ON id_sequences FOR INSERT
  WITH CHECK (
    school_id = get_my_school_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('school_admin','admin_staff')
  );

CREATE POLICY "id_sequences_update" ON id_sequences FOR UPDATE
  USING (
    school_id = get_my_school_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('school_admin','admin_staff','finance')
  );

-- activities: all school members read; admin + teacher write
CREATE POLICY "activities_select" ON activities FOR SELECT
  USING (school_id = get_my_school_id());

CREATE POLICY "activities_insert" ON activities FOR INSERT
  WITH CHECK (
    school_id = get_my_school_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('school_admin','teacher')
  );

CREATE POLICY "activities_update" ON activities FOR UPDATE
  USING (
    school_id = get_my_school_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('school_admin','teacher')
  );

CREATE POLICY "activities_delete" ON activities FOR DELETE
  USING (
    school_id = get_my_school_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'school_admin'
  );

-- ── 7. Update existing RLS to cover new roles ─────────────────

-- Students: finance + admin_staff can also read; admin_staff can write
DROP POLICY IF EXISTS "students_insert" ON students;
CREATE POLICY "students_insert" ON students FOR INSERT
  WITH CHECK (
    school_id = get_my_school_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid())
        IN ('school_admin','teacher','admin_staff')
  );

DROP POLICY IF EXISTS "students_update" ON students;
CREATE POLICY "students_update" ON students FOR UPDATE
  USING (
    school_id = get_my_school_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid())
        IN ('school_admin','teacher','admin_staff')
  );

-- Attendance: finance/admin_staff can view but not write
DROP POLICY IF EXISTS "attendance_select" ON attendance;
CREATE POLICY "attendance_select" ON attendance FOR SELECT
  USING (
    school_id = get_my_school_id()
    AND (
      (SELECT role FROM profiles WHERE id = auth.uid())
          IN ('school_admin','teacher','admin_staff','finance','support_staff')
      OR EXISTS (
        SELECT 1 FROM students
        WHERE students.id = attendance.student_id
          AND students.profile_id = auth.uid()
      )
    )
  );

-- Fees: finance can manage; admin_staff + students can read their own
DROP POLICY IF EXISTS "fees_select" ON fees;
CREATE POLICY "fees_select" ON fees FOR SELECT
  USING (
    school_id = get_my_school_id()
    AND (
      (SELECT role FROM profiles WHERE id = auth.uid())
          IN ('school_admin','finance','admin_staff')
      OR EXISTS (
        SELECT 1 FROM students
        WHERE students.id = fees.student_id
          AND students.profile_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "fees_insert" ON fees;
CREATE POLICY "fees_insert" ON fees FOR INSERT
  WITH CHECK (
    school_id = get_my_school_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('school_admin','finance')
  );

DROP POLICY IF EXISTS "fees_update" ON fees;
CREATE POLICY "fees_update" ON fees FOR UPDATE
  USING (
    school_id = get_my_school_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('school_admin','finance')
  );

-- Schools: school_admin can update their own school settings
DROP POLICY IF EXISTS "schools_update_own" ON schools;
CREATE POLICY "schools_update_own" ON schools FOR UPDATE
  USING (
    id = get_my_school_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'school_admin'
  );

-- Classes: admin_staff can also view
DROP POLICY IF EXISTS "classes_select" ON classes;
CREATE POLICY "classes_select" ON classes FOR SELECT
  USING (school_id = get_my_school_id());

-- ── 8. Update seed demo school with new config fields ─────────
UPDATE public.schools
SET
  school_type   = 'secondary',
  id_prefix     = 'SLS',
  academic_year = '2026',
  grade_system  = 'zim_secondary',
  school_motto  = 'Excellence Through Knowledge',
  features      = '{"library":true,"health":true,"transport":true,"activities":true,"digital_ids":true}'
WHERE id = '00000000-0000-0000-0000-000000000001';

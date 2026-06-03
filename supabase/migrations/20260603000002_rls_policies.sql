-- ============================================================
-- SmartLearnerLMS — Migration 002: RLS Policies
-- ============================================================

-- ============================================================
-- Helper: resolve current user's school_id in one query
-- SECURITY DEFINER so it runs with elevated privilege and
-- can read profiles even before the caller's own RLS is checked.
-- ============================================================
CREATE OR REPLACE FUNCTION get_my_school_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT school_id FROM profiles WHERE id = auth.uid()
$$;

-- Grant to authenticated users
GRANT EXECUTE ON FUNCTION get_my_school_id TO authenticated;

-- ============================================================
-- Enable RLS on every table
-- ============================================================
ALTER TABLE schools    ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects   ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE students   ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees       ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- SCHOOLS
-- ============================================================
CREATE POLICY "schools_select_own"
  ON schools FOR SELECT
  USING (id = get_my_school_id());

-- Only platform (service_role) can insert/update/delete schools
-- No INSERT/UPDATE/DELETE policy for authenticated → blocked by default

-- ============================================================
-- PROFILES
-- ============================================================
CREATE POLICY "profiles_select_same_school"
  ON profiles FOR SELECT
  USING (school_id = get_my_school_id());

CREATE POLICY "profiles_insert_admin"
  ON profiles FOR INSERT
  WITH CHECK (
    school_id = get_my_school_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'school_admin'
  );

CREATE POLICY "profiles_update_self_or_admin"
  ON profiles FOR UPDATE
  USING (
    id = auth.uid()
    OR (
      school_id = get_my_school_id()
      AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'school_admin'
    )
  );

-- ============================================================
-- CLASSES
-- ============================================================
CREATE POLICY "classes_select"
  ON classes FOR SELECT
  USING (school_id = get_my_school_id());

CREATE POLICY "classes_insert"
  ON classes FOR INSERT
  WITH CHECK (
    school_id = get_my_school_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('school_admin','teacher')
  );

CREATE POLICY "classes_update"
  ON classes FOR UPDATE
  USING (
    school_id = get_my_school_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('school_admin','teacher')
  );

CREATE POLICY "classes_delete"
  ON classes FOR DELETE
  USING (
    school_id = get_my_school_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'school_admin'
  );

-- ============================================================
-- SUBJECTS
-- ============================================================
CREATE POLICY "subjects_select"
  ON subjects FOR SELECT
  USING (school_id = get_my_school_id());

CREATE POLICY "subjects_insert"
  ON subjects FOR INSERT
  WITH CHECK (
    school_id = get_my_school_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'school_admin'
  );

CREATE POLICY "subjects_update"
  ON subjects FOR UPDATE
  USING (
    school_id = get_my_school_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'school_admin'
  );

CREATE POLICY "subjects_delete"
  ON subjects FOR DELETE
  USING (
    school_id = get_my_school_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'school_admin'
  );

-- ============================================================
-- TEACHERS
-- ============================================================
CREATE POLICY "teachers_select"
  ON teachers FOR SELECT
  USING (school_id = get_my_school_id());

CREATE POLICY "teachers_insert"
  ON teachers FOR INSERT
  WITH CHECK (
    school_id = get_my_school_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'school_admin'
  );

CREATE POLICY "teachers_update"
  ON teachers FOR UPDATE
  USING (
    school_id = get_my_school_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'school_admin'
  );

CREATE POLICY "teachers_delete"
  ON teachers FOR DELETE
  USING (
    school_id = get_my_school_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'school_admin'
  );

-- ============================================================
-- STUDENTS
-- ============================================================
CREATE POLICY "students_select"
  ON students FOR SELECT
  USING (school_id = get_my_school_id());

CREATE POLICY "students_insert"
  ON students FOR INSERT
  WITH CHECK (
    school_id = get_my_school_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('school_admin','teacher')
  );

CREATE POLICY "students_update"
  ON students FOR UPDATE
  USING (
    school_id = get_my_school_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('school_admin','teacher')
  );

CREATE POLICY "students_delete"
  ON students FOR DELETE
  USING (
    school_id = get_my_school_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'school_admin'
  );

-- ============================================================
-- ATTENDANCE
-- ============================================================
CREATE POLICY "attendance_select"
  ON attendance FOR SELECT
  USING (school_id = get_my_school_id());

CREATE POLICY "attendance_insert"
  ON attendance FOR INSERT
  WITH CHECK (
    school_id = get_my_school_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('school_admin','teacher')
  );

CREATE POLICY "attendance_update"
  ON attendance FOR UPDATE
  USING (
    school_id = get_my_school_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('school_admin','teacher')
  );

CREATE POLICY "attendance_delete"
  ON attendance FOR DELETE
  USING (
    school_id = get_my_school_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'school_admin'
  );

-- ============================================================
-- FEES
-- ============================================================
CREATE POLICY "fees_select"
  ON fees FOR SELECT
  USING (school_id = get_my_school_id());

CREATE POLICY "fees_insert"
  ON fees FOR INSERT
  WITH CHECK (
    school_id = get_my_school_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'school_admin'
  );

CREATE POLICY "fees_update"
  ON fees FOR UPDATE
  USING (
    school_id = get_my_school_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'school_admin'
  );

CREATE POLICY "fees_delete"
  ON fees FOR DELETE
  USING (
    school_id = get_my_school_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'school_admin'
  );

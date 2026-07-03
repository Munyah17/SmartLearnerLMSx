-- ============================================================
-- SmartLearnerLMS — Migration 005: Core Academic Modules
-- Timetable, Grades & Results, Assignments + staff account creation
-- ============================================================

-- ============================================================
-- TIMETABLE SLOTS
-- ============================================================
CREATE TABLE IF NOT EXISTS timetable_slots (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id     uuid        NOT NULL REFERENCES schools(id)  ON DELETE CASCADE,
  class_id      uuid        NOT NULL REFERENCES classes(id)  ON DELETE CASCADE,
  subject_id    uuid        NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id    uuid        REFERENCES profiles(id),
  day_of_week   smallint    NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  period_number smallint    NOT NULL CHECK (period_number > 0),
  start_time    time,
  end_time      time,
  room          text,
  created_by    uuid        REFERENCES profiles(id),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (school_id, class_id, day_of_week, period_number),
  UNIQUE (school_id, teacher_id, day_of_week, period_number)
);

CREATE INDEX IF NOT EXISTS idx_timetable_slots_school_id ON timetable_slots(school_id);
CREATE INDEX IF NOT EXISTS idx_timetable_slots_class_id  ON timetable_slots(class_id);

DROP TRIGGER IF EXISTS timetable_slots_updated_at ON timetable_slots;
CREATE TRIGGER timetable_slots_updated_at
  BEFORE UPDATE ON timetable_slots
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================
-- GRADES & RESULTS
-- ============================================================
CREATE TABLE IF NOT EXISTS grades (
  id              uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id       uuid           NOT NULL REFERENCES schools(id)   ON DELETE CASCADE,
  student_id      uuid           NOT NULL REFERENCES students(id)  ON DELETE CASCADE,
  class_id        uuid           NOT NULL REFERENCES classes(id),
  subject_id      uuid           NOT NULL REFERENCES subjects(id),
  term            text           NOT NULL,
  academic_year   text           NOT NULL,
  assessment_type text           NOT NULL CHECK (assessment_type IN
                     ('classwork','test','exam','coursework','project','assignment')),
  assessment_name text           NOT NULL,
  score           numeric(6,2)   NOT NULL CHECK (score >= 0),
  max_score       numeric(6,2)   NOT NULL DEFAULT 100 CHECK (max_score > 0),
  grade_letter    text,
  comment         text,
  recorded_by     uuid           REFERENCES profiles(id),
  created_at      timestamptz    NOT NULL DEFAULT now(),
  updated_at      timestamptz    NOT NULL DEFAULT now(),
  UNIQUE (student_id, subject_id, term, academic_year, assessment_name)
);

CREATE INDEX IF NOT EXISTS idx_grades_school_id  ON grades(school_id);
CREATE INDEX IF NOT EXISTS idx_grades_student_id ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_class_id   ON grades(class_id);

DROP TRIGGER IF EXISTS grades_updated_at ON grades;
CREATE TRIGGER grades_updated_at
  BEFORE UPDATE ON grades
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================
-- ASSIGNMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS assignments (
  id          uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   uuid           NOT NULL REFERENCES schools(id)   ON DELETE CASCADE,
  class_id    uuid           NOT NULL REFERENCES classes(id)   ON DELETE CASCADE,
  subject_id  uuid           NOT NULL REFERENCES subjects(id),
  title       text           NOT NULL,
  description text,
  due_date    date,
  max_score   numeric(6,2)   NOT NULL DEFAULT 100 CHECK (max_score > 0),
  created_by  uuid           REFERENCES profiles(id),
  created_at  timestamptz    NOT NULL DEFAULT now(),
  updated_at  timestamptz    NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assignments_school_id ON assignments(school_id);
CREATE INDEX IF NOT EXISTS idx_assignments_class_id  ON assignments(class_id);

DROP TRIGGER IF EXISTS assignments_updated_at ON assignments;
CREATE TRIGGER assignments_updated_at
  BEFORE UPDATE ON assignments
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================
-- ASSIGNMENT SUBMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id            uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid           NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id    uuid           NOT NULL REFERENCES students(id)    ON DELETE CASCADE,
  submitted_at  timestamptz,
  content       text,
  score         numeric(6,2),
  feedback      text,
  graded_by     uuid           REFERENCES profiles(id),
  created_at    timestamptz    NOT NULL DEFAULT now(),
  updated_at    timestamptz    NOT NULL DEFAULT now(),
  UNIQUE (assignment_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_id ON assignment_submissions(assignment_id);

DROP TRIGGER IF EXISTS assignment_submissions_updated_at ON assignment_submissions;
CREATE TRIGGER assignment_submissions_updated_at
  BEFORE UPDATE ON assignment_submissions
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE timetable_slots       ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades                ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;

-- TIMETABLE_SLOTS
DROP POLICY IF EXISTS "timetable_slots_select" ON timetable_slots;
CREATE POLICY "timetable_slots_select" ON timetable_slots FOR SELECT
  USING (school_id = get_my_school_id());

DROP POLICY IF EXISTS "timetable_slots_insert" ON timetable_slots;
CREATE POLICY "timetable_slots_insert" ON timetable_slots FOR INSERT
  WITH CHECK (
    school_id = get_my_school_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('school_admin','teacher')
  );

DROP POLICY IF EXISTS "timetable_slots_update" ON timetable_slots;
CREATE POLICY "timetable_slots_update" ON timetable_slots FOR UPDATE
  USING (
    school_id = get_my_school_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('school_admin','teacher')
  );

DROP POLICY IF EXISTS "timetable_slots_delete" ON timetable_slots;
CREATE POLICY "timetable_slots_delete" ON timetable_slots FOR DELETE
  USING (
    school_id = get_my_school_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('school_admin','teacher')
  );

-- GRADES
DROP POLICY IF EXISTS "grades_select" ON grades;
CREATE POLICY "grades_select" ON grades FOR SELECT
  USING (school_id = get_my_school_id());

DROP POLICY IF EXISTS "grades_insert" ON grades;
CREATE POLICY "grades_insert" ON grades FOR INSERT
  WITH CHECK (
    school_id = get_my_school_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('school_admin','teacher')
  );

DROP POLICY IF EXISTS "grades_update" ON grades;
CREATE POLICY "grades_update" ON grades FOR UPDATE
  USING (
    school_id = get_my_school_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('school_admin','teacher')
  );

DROP POLICY IF EXISTS "grades_delete" ON grades;
CREATE POLICY "grades_delete" ON grades FOR DELETE
  USING (
    school_id = get_my_school_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('school_admin','teacher')
  );

-- ASSIGNMENTS
DROP POLICY IF EXISTS "assignments_select" ON assignments;
CREATE POLICY "assignments_select" ON assignments FOR SELECT
  USING (school_id = get_my_school_id());

DROP POLICY IF EXISTS "assignments_insert" ON assignments;
CREATE POLICY "assignments_insert" ON assignments FOR INSERT
  WITH CHECK (
    school_id = get_my_school_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('school_admin','teacher')
  );

DROP POLICY IF EXISTS "assignments_update" ON assignments;
CREATE POLICY "assignments_update" ON assignments FOR UPDATE
  USING (
    school_id = get_my_school_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('school_admin','teacher')
  );

DROP POLICY IF EXISTS "assignments_delete" ON assignments;
CREATE POLICY "assignments_delete" ON assignments FOR DELETE
  USING (
    school_id = get_my_school_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('school_admin','teacher')
  );

-- ASSIGNMENT_SUBMISSIONS (scoped via parent assignment's school)
DROP POLICY IF EXISTS "assignment_submissions_select" ON assignment_submissions;
CREATE POLICY "assignment_submissions_select" ON assignment_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assignments
      WHERE assignments.id = assignment_submissions.assignment_id
        AND assignments.school_id = get_my_school_id()
    )
  );

DROP POLICY IF EXISTS "assignment_submissions_insert" ON assignment_submissions;
CREATE POLICY "assignment_submissions_insert" ON assignment_submissions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assignments
      WHERE assignments.id = assignment_submissions.assignment_id
        AND assignments.school_id = get_my_school_id()
    )
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('school_admin','teacher')
  );

DROP POLICY IF EXISTS "assignment_submissions_update" ON assignment_submissions;
CREATE POLICY "assignment_submissions_update" ON assignment_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM assignments
      WHERE assignments.id = assignment_submissions.assignment_id
        AND assignments.school_id = get_my_school_id()
    )
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('school_admin','teacher')
  );

DROP POLICY IF EXISTS "assignment_submissions_delete" ON assignment_submissions;
CREATE POLICY "assignment_submissions_delete" ON assignment_submissions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM assignments
      WHERE assignments.id = assignment_submissions.assignment_id
        AND assignments.school_id = get_my_school_id()
    )
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('school_admin','teacher')
  );

-- ============================================================
-- STAFF ACCOUNT CREATION
-- Creates an auth.users + auth.identities + profiles row in one
-- call, since the client only holds the anon key and cannot call
-- the Auth Admin API directly. Mirrors the manual inserts used in
-- seed.sql. Restricted to callers whose own profile role is
-- 'school_admin'.
-- ============================================================
CREATE OR REPLACE FUNCTION create_staff_member(
  p_email       text,
  p_password    text,
  p_first_name  text,
  p_last_name   text,
  p_role        text,
  p_staff_title text DEFAULT NULL,
  p_department  text DEFAULT NULL,
  p_gender      text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  caller_role   text;
  caller_school uuid;
  new_user_id   uuid := gen_random_uuid();
BEGIN
  SELECT role, school_id INTO caller_role, caller_school
  FROM profiles WHERE id = auth.uid();

  IF caller_role IS DISTINCT FROM 'school_admin' THEN
    RAISE EXCEPTION 'Only school admins can create staff accounts';
  END IF;

  IF p_role NOT IN ('school_admin','teacher','finance','admin_staff','support_staff','ancillary') THEN
    RAISE EXCEPTION 'Invalid staff role: %', p_role;
  END IF;

  INSERT INTO auth.users (
    id, instance_id, aud, role,
    email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token,
    email_change_token_new, email_change
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    p_email, crypt(p_password, gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    now(), now(), '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) VALUES (
    new_user_id, p_email, new_user_id,
    jsonb_build_object('sub', new_user_id::text, 'email', p_email, 'email_verified', true),
    'email', now(), now(), now()
  );

  INSERT INTO profiles (
    id, school_id, first_name, last_name, role, staff_title, department, gender, is_active
  ) VALUES (
    new_user_id, caller_school, p_first_name, p_last_name, p_role, p_staff_title, p_department, p_gender, true
  );

  RETURN new_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION create_staff_member TO authenticated;
REVOKE EXECUTE ON FUNCTION create_staff_member FROM anon, public;

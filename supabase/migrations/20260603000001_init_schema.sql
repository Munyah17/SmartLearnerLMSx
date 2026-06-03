-- ============================================================
-- SmartLearnerLMS — Migration 001: Core Schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- SCHOOLS (Tenants)
-- ============================================================
CREATE TABLE schools (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL,
  slug       text        UNIQUE NOT NULL,
  address    text,
  phone      text,
  email      text,
  logo_url   text,
  is_active  boolean     NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- PROFILES (Extends auth.users — one row per Supabase user)
-- ============================================================
CREATE TABLE profiles (
  id         uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id  uuid        NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  first_name text        NOT NULL,
  last_name  text        NOT NULL,
  role       text        NOT NULL CHECK (role IN ('school_admin','teacher','student','parent')),
  avatar_url text,
  phone      text,
  is_active  boolean     NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_school_id ON profiles(school_id);
CREATE INDEX idx_profiles_role      ON profiles(role);

-- ============================================================
-- CLASSES
-- ============================================================
CREATE TABLE classes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   uuid        NOT NULL REFERENCES schools(id)   ON DELETE CASCADE,
  name        text        NOT NULL,
  grade_level text        NOT NULL,
  capacity    integer,
  created_by  uuid        REFERENCES profiles(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(school_id, name)
);

CREATE INDEX idx_classes_school_id ON classes(school_id);

-- ============================================================
-- SUBJECTS
-- ============================================================
CREATE TABLE subjects (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   uuid        NOT NULL REFERENCES schools(id)   ON DELETE CASCADE,
  name        text        NOT NULL,
  code        text        NOT NULL,
  description text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(school_id, code)
);

CREATE INDEX idx_subjects_school_id ON subjects(school_id);

-- ============================================================
-- TEACHERS
-- ============================================================
CREATE TABLE teachers (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id       uuid        NOT NULL REFERENCES schools(id)   ON DELETE CASCADE,
  profile_id      uuid        NOT NULL REFERENCES profiles(id)  ON DELETE CASCADE,
  employee_number text        NOT NULL,
  department      text,
  qualification   text,
  join_date       date,
  is_active       boolean     NOT NULL DEFAULT true,
  created_by      uuid        REFERENCES profiles(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(school_id, employee_number)
);

CREATE INDEX idx_teachers_school_id  ON teachers(school_id);
CREATE INDEX idx_teachers_profile_id ON teachers(profile_id);

-- ============================================================
-- STUDENTS
-- ============================================================
CREATE TABLE students (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id      uuid        NOT NULL REFERENCES schools(id)   ON DELETE CASCADE,
  profile_id     uuid        REFERENCES profiles(id),
  student_number text        NOT NULL,
  first_name     text        NOT NULL,
  last_name      text        NOT NULL,
  date_of_birth  date,
  gender         text        CHECK (gender IN ('male','female','other')),
  class_id       uuid        REFERENCES classes(id),
  address        text,
  guardian_name  text,
  guardian_phone text,
  guardian_email text,
  is_active      boolean     NOT NULL DEFAULT true,
  created_by     uuid        REFERENCES profiles(id),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE(school_id, student_number)
);

CREATE INDEX idx_students_school_id ON students(school_id);
CREATE INDEX idx_students_class_id  ON students(class_id);

-- ============================================================
-- ATTENDANCE
-- ============================================================
CREATE TABLE attendance (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   uuid        NOT NULL REFERENCES schools(id)   ON DELETE CASCADE,
  student_id  uuid        NOT NULL REFERENCES students(id)  ON DELETE CASCADE,
  class_id    uuid        NOT NULL REFERENCES classes(id),
  date        date        NOT NULL,
  status      text        NOT NULL CHECK (status IN ('present','absent','late','excused')),
  notes       text,
  recorded_by uuid        REFERENCES profiles(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(school_id, student_id, date)
);

CREATE INDEX idx_attendance_school_date ON attendance(school_id, date);
CREATE INDEX idx_attendance_student_id  ON attendance(student_id);

-- ============================================================
-- FEES
-- ============================================================
CREATE TABLE fees (
  id          uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   uuid           NOT NULL REFERENCES schools(id)   ON DELETE CASCADE,
  student_id  uuid           NOT NULL REFERENCES students(id)  ON DELETE CASCADE,
  amount      numeric(12,2)  NOT NULL CHECK (amount > 0),
  description text           NOT NULL,
  due_date    date,
  paid_date   date,
  status      text           NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid','partial','paid')),
  created_by  uuid           REFERENCES profiles(id),
  created_at  timestamptz    NOT NULL DEFAULT now(),
  updated_at  timestamptz    NOT NULL DEFAULT now()
);

CREATE INDEX idx_fees_school_student ON fees(school_id, student_id);
CREATE INDEX idx_fees_school_status  ON fees(school_id, status);

-- ============================================================
-- updated_at trigger (shared)
-- ============================================================
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER schools_updated_at  BEFORE UPDATE ON schools  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER classes_updated_at  BEFORE UPDATE ON classes  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER teachers_updated_at BEFORE UPDATE ON teachers FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER fees_updated_at     BEFORE UPDATE ON fees     FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

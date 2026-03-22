-- ============================================================
-- Student Registration App — Database Schema
-- PostgreSQL (Supabase)
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('admin', 'parent');
CREATE TYPE program_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE program_status AS ENUM ('active', 'inactive');
CREATE TYPE slot_mode AS ENUM ('online', 'in-person');
CREATE TYPE day_of_week AS ENUM ('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');
CREATE TYPE registration_status AS ENUM ('pending', 'approved', 'rejected');

-- ============================================================
-- TABLES
-- ============================================================

-- users (parents + admins)
CREATE TABLE users (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  role          user_role     NOT NULL,
  name          VARCHAR(255)  NOT NULL,
  phone_number  VARCHAR(20)   NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- students (children registered by parents)
CREATE TABLE students (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id     UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_name  VARCHAR(255)  NOT NULL,
  student_email VARCHAR(255)  NULL,
  student_phone VARCHAR(20)   NULL,
  age           INT           NOT NULL,
  description   TEXT          NULL,
  parent_name   VARCHAR(255)  NOT NULL,
  parent_email  VARCHAR(255)  NOT NULL,
  parent_phone  VARCHAR(20)   NOT NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- programs (tutoring courses)
CREATE TABLE programs (
  id            UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255)    NOT NULL,
  level         program_level   NOT NULL,
  target_age    VARCHAR(50)     NOT NULL,
  description   TEXT            NULL,
  prerequisites TEXT            NULL,
  status        program_status  NOT NULL DEFAULT 'active',
  created_at    TIMESTAMP       NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- locations (physical campuses / classrooms)
CREATE TABLE locations (
  id         UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(255)  NOT NULL,
  address    VARCHAR(500)  NULL,
  created_at TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- teachers
CREATE TABLE teachers (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(255)  NOT NULL,
  email        VARCHAR(255)  NULL UNIQUE,
  phone_number VARCHAR(20)   NULL,
  created_at   TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- time_slots (fixed schedule slots per program)
CREATE TABLE time_slots (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id      UUID         NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  teacher_id      UUID         NULL     REFERENCES teachers(id) ON DELETE SET NULL,
  location_id     UUID         NULL     REFERENCES locations(id) ON DELETE SET NULL,
  mode            slot_mode    NOT NULL,
  day_of_week     day_of_week  NOT NULL,
  start_time      TIME         NOT NULL,
  end_time        TIME         NOT NULL,
  max_capacity    INT          NOT NULL DEFAULT 5,
  current_count   INT          NOT NULL DEFAULT 0,
  created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_capacity CHECK (current_count >= 0 AND current_count <= max_capacity),
  CONSTRAINT chk_time     CHECK (end_time > start_time),
  -- online slots must not have a location; in-person slots must have one
  CONSTRAINT chk_mode_location CHECK (
    (mode = 'online'    AND location_id IS NULL) OR
    (mode = 'in-person' AND location_id IS NOT NULL)
  )
);

-- registrations
CREATE TABLE registrations (
  id            UUID                 PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID                 NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  program_id    UUID                 NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  time_slot_id  UUID                 NOT NULL REFERENCES time_slots(id) ON DELETE CASCADE,
  status        registration_status  NOT NULL DEFAULT 'pending',
  submitted_at  TIMESTAMP            NOT NULL DEFAULT NOW(),
  reviewed_at   TIMESTAMP            NULL,
  reviewed_by   UUID                 NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMP            NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP            NOT NULL DEFAULT NOW(),

  -- prevent duplicate registration to the same slot
  CONSTRAINT uq_student_slot UNIQUE (student_id, time_slot_id)
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_students_parent_id       ON students(parent_id);
CREATE INDEX idx_time_slots_program_id    ON time_slots(program_id);
CREATE INDEX idx_time_slots_teacher_id    ON time_slots(teacher_id);
CREATE INDEX idx_registrations_student_id ON registrations(student_id);
CREATE INDEX idx_registrations_slot_id    ON registrations(time_slot_id);
CREATE INDEX idx_registrations_status     ON registrations(status);

-- ============================================================
-- TRIGGERS — keep updated_at current
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_programs_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_teachers_updated_at
  BEFORE UPDATE ON teachers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_time_slots_updated_at
  BEFORE UPDATE ON time_slots
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_registrations_updated_at
  BEFORE UPDATE ON registrations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- TRIGGERS — capacity management on registrations
-- ============================================================

-- Increment current_count when a new registration is inserted
CREATE OR REPLACE FUNCTION increment_slot_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE time_slots
  SET current_count = current_count + 1
  WHERE id = NEW.time_slot_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_registration_insert
  AFTER INSERT ON registrations
  FOR EACH ROW EXECUTE FUNCTION increment_slot_count();

-- Decrement current_count when a registration is rejected or deleted
CREATE OR REPLACE FUNCTION decrement_slot_count()
RETURNS TRIGGER AS $$
BEGIN
  -- On status change to 'rejected'
  IF TG_OP = 'UPDATE' AND OLD.status != 'rejected' AND NEW.status = 'rejected' THEN
    UPDATE time_slots
    SET current_count = current_count - 1
    WHERE id = NEW.time_slot_id;
  END IF;

  -- On hard delete
  IF TG_OP = 'DELETE' AND OLD.status != 'rejected' THEN
    UPDATE time_slots
    SET current_count = current_count - 1
    WHERE id = OLD.time_slot_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_registration_update_or_delete
  AFTER UPDATE OR DELETE ON registrations
  FOR EACH ROW EXECUTE FUNCTION decrement_slot_count();

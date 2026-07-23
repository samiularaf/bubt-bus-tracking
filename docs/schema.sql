-- ============================================================================
-- BUBT Bus Tracking System — PostgreSQL Schema
-- Phase 3 output. Target: PostgreSQL 15+ (Supabase-compatible).
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- for gen_random_uuid()

-- ============================================================================
-- ENUM TYPES
-- ============================================================================
CREATE TYPE user_role AS ENUM ('user', 'driver', 'admin');
CREATE TYPE user_designation AS ENUM ('student', 'teacher', 'staff');
CREATE TYPE account_status AS ENUM ('active', 'inactive');
CREATE TYPE schedule_type AS ENUM ('regular', 'ramadan', 'exam', 'holiday', 'special');
CREATE TYPE day_group AS ENUM ('sun_thu', 'friday');
-- Note: Saturday has no bus service at all (per official BUBT notice) — simply no
-- templates are created for Saturday, and the trip-generation job skips it entirely.
CREATE TYPE trip_status AS ENUM ('upcoming', 'running', 'completed');
CREATE TYPE notice_category AS ENUM ('general', 'holiday', 'ramadan', 'exam', 'delay', 'cancellation', 'emergency', 'maintenance');
CREATE TYPE notification_type AS ENUM ('reminder_15min', 'trip_started', 'notice', 'emergency', 'delay', 'cancellation', 'schedule_change');

-- ============================================================================
-- ROUTES & STOPS
-- ============================================================================
CREATE TABLE routes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(120) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE stops (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id    UUID NOT NULL REFERENCES routes(id) ON DELETE RESTRICT,
    name        VARCHAR(120) NOT NULL,
    latitude    DOUBLE PRECISION NOT NULL,
    longitude   DOUBLE PRECISION NOT NULL,
    stop_order  INT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (route_id, stop_order)
);
CREATE INDEX idx_stops_route_order ON stops (route_id, stop_order);

-- ============================================================================
-- BUSES
-- ============================================================================
CREATE TABLE buses (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bus_number  VARCHAR(20) NOT NULL UNIQUE,
    route_id    UUID NOT NULL REFERENCES routes(id) ON DELETE RESTRICT,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- USERS (single table for User / Driver / Admin — role-based)
-- ============================================================================
CREATE TABLE users (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role                    user_role NOT NULL,
    name                    VARCHAR(120) NOT NULL,

    -- User (role=user) fields
    email                   VARCHAR(255),
    email_verified          BOOLEAN NOT NULL DEFAULT false,
    designation             user_designation,
    id_number               VARCHAR(50),

    -- Shared
    password_hash           VARCHAR(255) NOT NULL,

    -- Driver (role=driver) fields
    driver_id               VARCHAR(20),
    phone                   VARCHAR(20),
    blood_group             VARCHAR(5),
    nid_or_license          VARCHAR(50),
    address                 TEXT,
    emergency_contact       VARCHAR(20),
    photo_url               TEXT,
    assigned_bus_id         UUID REFERENCES buses(id) ON DELETE RESTRICT,
    joining_date            DATE,
    must_change_password    BOOLEAN NOT NULL DEFAULT false,

    -- Admin (role=admin) fields
    admin_id                VARCHAR(50),

    status                  account_status NOT NULL DEFAULT 'active',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_role_required_fields CHECK (
        (role = 'user'   AND email IS NOT NULL) OR
        (role = 'driver' AND driver_id IS NOT NULL AND phone IS NOT NULL AND blood_group IS NOT NULL
                          AND nid_or_license IS NOT NULL AND address IS NOT NULL
                          AND emergency_contact IS NOT NULL AND assigned_bus_id IS NOT NULL) OR
        (role = 'admin'  AND admin_id IS NOT NULL)
    )
);

CREATE UNIQUE INDEX users_email_unique     ON users(email)     WHERE email IS NOT NULL;
CREATE UNIQUE INDEX users_driver_id_unique ON users(driver_id) WHERE driver_id IS NOT NULL;
CREATE UNIQUE INDEX users_admin_id_unique  ON users(admin_id)  WHERE admin_id IS NOT NULL;
-- One driver per bus, permanently:
CREATE UNIQUE INDEX users_one_driver_per_bus ON users(assigned_bus_id) WHERE role = 'driver' AND assigned_bus_id IS NOT NULL;

-- ============================================================================
-- SCHEDULES
-- ============================================================================
CREATE TABLE schedules (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(120) NOT NULL,
    type        schedule_type NOT NULL,
    is_active   BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Only one schedule may be active at a time
CREATE UNIQUE INDEX schedules_one_active ON schedules (is_active) WHERE is_active = true;

CREATE TABLE schedule_trip_templates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id     UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    bus_id          UUID NOT NULL REFERENCES buses(id) ON DELETE RESTRICT,
    day_group       day_group NOT NULL,
    departure_time  TIME NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (schedule_id, bus_id, day_group, departure_time)
);
CREATE INDEX idx_templates_schedule_bus_day ON schedule_trip_templates (schedule_id, bus_id, day_group);

-- ============================================================================
-- TRIPS
-- ============================================================================
CREATE TABLE trips (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bus_id                      UUID NOT NULL REFERENCES buses(id) ON DELETE RESTRICT,
    schedule_trip_template_id   UUID REFERENCES schedule_trip_templates(id) ON DELETE SET NULL,
    driver_id                   UUID REFERENCES users(id) ON DELETE SET NULL, -- snapshot at generation time
    trip_date                   DATE NOT NULL,
    scheduled_time_utc          TIMESTAMPTZ NOT NULL,
    status                      trip_status NOT NULL DEFAULT 'upcoming',
    started_at                  TIMESTAMPTZ,
    completed_at                TIMESTAMPTZ,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (bus_id, scheduled_time_utc)
);
CREATE INDEX idx_trips_bus_date ON trips (bus_id, trip_date);
CREATE INDEX idx_trips_status ON trips (status);

-- ============================================================================
-- TRIP POSITIONS (GPS history — high volume, 30-day retention)
-- ============================================================================
CREATE TABLE trip_positions (
    id           BIGSERIAL PRIMARY KEY,
    trip_id      UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    latitude     DOUBLE PRECISION NOT NULL,
    longitude    DOUBLE PRECISION NOT NULL,
    speed_kmh    DOUBLE PRECISION,
    recorded_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_positions_trip_time ON trip_positions (trip_id, recorded_at DESC);

-- ============================================================================
-- REMINDERS
-- ============================================================================
CREATE TABLE reminders (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trip_id               UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    notified_15min        BOOLEAN NOT NULL DEFAULT false,
    notified_trip_start   BOOLEAN NOT NULL DEFAULT false,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, trip_id)
);
CREATE INDEX idx_reminders_trip ON reminders (trip_id);

-- ============================================================================
-- FAVORITE BUSES (convenience pin, not an assignment)
-- ============================================================================
CREATE TABLE favorite_buses (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bus_id      UUID NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, bus_id)
);

-- ============================================================================
-- NOTICES
-- ============================================================================
CREATE TABLE notices (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(200) NOT NULL,
    body            TEXT NOT NULL,
    category        notice_category NOT NULL,
    created_by      UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    published_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notices_category_published ON notices (category, published_at DESC);

-- ============================================================================
-- COMPLAINTS
-- ============================================================================
CREATE TABLE complaints (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject     VARCHAR(200) NOT NULL,
    message     TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- AUXILIARY: OTP CODES (email verification)
-- ============================================================================
CREATE TABLE otp_codes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code_hash       VARCHAR(255) NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    consumed        BOOLEAN NOT NULL DEFAULT false,
    attempt_count   INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_otp_user_expiry ON otp_codes (user_id, expires_at);

-- ============================================================================
-- AUXILIARY: REFRESH TOKENS
-- ============================================================================
CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(255) NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked     BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens (user_id);

-- ============================================================================
-- AUXILIARY: PUSH SUBSCRIPTIONS (Web Push)
-- ============================================================================
CREATE TABLE push_subscriptions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endpoint    TEXT NOT NULL,
    p256dh      VARCHAR(255) NOT NULL,
    auth        VARCHAR(255) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, endpoint)
);

-- ============================================================================
-- AUXILIARY: IN-APP NOTIFICATIONS (iOS Web Push fallback)
-- ============================================================================
CREATE TABLE notifications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type                notification_type NOT NULL,
    title               VARCHAR(200) NOT NULL,
    body                TEXT NOT NULL,
    related_trip_id     UUID REFERENCES trips(id) ON DELETE CASCADE,
    related_notice_id   UUID REFERENCES notices(id) ON DELETE CASCADE,
    is_read             BOOLEAN NOT NULL DEFAULT false,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user_unread ON notifications (user_id, is_read);

-- ============================================================================
-- AUXILIARY: EMERGENCY ALERTS (admin dashboard history log)
-- ============================================================================
CREATE TABLE emergency_alerts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id     UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    driver_id   UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    message     TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_emergency_alerts_trip ON emergency_alerts (trip_id);

-- ============================================================================
-- updated_at auto-touch trigger (applied to tables with updated_at)
-- ============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_buses_updated_at BEFORE UPDATE ON buses FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_routes_updated_at BEFORE UPDATE ON routes FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_stops_updated_at BEFORE UPDATE ON stops FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_schedules_updated_at BEFORE UPDATE ON schedules FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_trips_updated_at BEFORE UPDATE ON trips FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_notices_updated_at BEFORE UPDATE ON notices FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- Performance Index Migration
-- Run once against the Azure SQL database.
-- All indexes use IF NOT EXISTS equivalent (CREATE INDEX with
-- an existence check) — safe to re-run.
-- ============================================================

-- ── connections ──────────────────────────────────────────────
-- Most queried table: requester_id lookup, expert_id lookup,
-- status filter, and the combined (requester + status) used by
-- getUserConnections() and getConnectionsWithDetails().

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_connections_requester' AND object_id=OBJECT_ID('connections'))
    CREATE INDEX idx_connections_requester ON connections(requester_id);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_connections_expert' AND object_id=OBJECT_ID('connections'))
    CREATE INDEX idx_connections_expert ON connections(expert_id);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_connections_status' AND object_id=OBJECT_ID('connections'))
    CREATE INDEX idx_connections_status ON connections(status);

-- Composite — covers the common WHERE requester_id=? AND status=?
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_connections_requester_status' AND object_id=OBJECT_ID('connections'))
    CREATE INDEX idx_connections_requester_status ON connections(requester_id, status);

-- ── resources ────────────────────────────────────────────────
-- Every resource list query filters WHERE is_active = 1

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_resources_active' AND object_id=OBJECT_ID('resources'))
    CREATE INDEX idx_resources_active ON resources(is_active);

-- Composite — covers type + is_active filter combo
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_resources_type_active' AND object_id=OBJECT_ID('resources'))
    CREATE INDEX idx_resources_type_active ON resources(type, is_active);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_resources_category_active' AND object_id=OBJECT_ID('resources'))
    CREATE INDEX idx_resources_category_active ON resources(category, is_active);

-- ── sessions ─────────────────────────────────────────────────

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_sessions_connection' AND object_id=OBJECT_ID('sessions'))
    CREATE INDEX idx_sessions_connection ON sessions(connection_id);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_sessions_status_date' AND object_id=OBJECT_ID('sessions'))
    CREATE INDEX idx_sessions_status_date ON sessions(status, scheduled_at);

-- ── expert_webinars ──────────────────────────────────────────

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_webinars_active' AND object_id=OBJECT_ID('expert_webinars'))
    CREATE INDEX idx_webinars_active ON expert_webinars(is_active);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_webinar_registrations_user' AND object_id=OBJECT_ID('webinar_registrations'))
    CREATE INDEX idx_webinar_registrations_user ON webinar_registrations(user_id);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_webinar_registrations_webinar' AND object_id=OBJECT_ID('webinar_registrations'))
    CREATE INDEX idx_webinar_registrations_webinar ON webinar_registrations(webinar_id);

-- ── messages ─────────────────────────────────────────────────
-- Chat polling queries by connection_id ORDER BY sent_at DESC

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_messages_connection_time' AND object_id=OBJECT_ID('messages'))
    CREATE INDEX idx_messages_connection_time ON messages(connection_id, sent_at DESC);

-- ── reflections ──────────────────────────────────────────────

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_reflections_user' AND object_id=OBJECT_ID('reflections'))
    CREATE INDEX idx_reflections_user ON reflections(user_id);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_reflections_category' AND object_id=OBJECT_ID('reflections'))
    CREATE INDEX idx_reflections_category ON reflections(category);

-- ── users ────────────────────────────────────────────────────
-- Login lookup and active-user filters

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_users_email' AND object_id=OBJECT_ID('users'))
    CREATE INDEX idx_users_email ON users(email);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_users_active' AND object_id=OBJECT_ID('users'))
    CREATE INDEX idx_users_active ON users(is_active);

-- ── experts ──────────────────────────────────────────────────

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_experts_user' AND object_id=OBJECT_ID('experts'))
    CREATE INDEX idx_experts_user ON experts(user_id);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='idx_experts_verified_available' AND object_id=OBJECT_ID('experts'))
    CREATE INDEX idx_experts_verified_available ON experts(is_verified, is_available);

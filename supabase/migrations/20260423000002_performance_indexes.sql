-- Performance Indexes for WeVote/DEI Cafe Platform
-- Run this after the base schema is in place

-- ── users ────────────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_users_email' AND object_id = OBJECT_ID('users'))
    CREATE UNIQUE INDEX IX_users_email ON users(email) WHERE is_active = 1;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_users_role_active' AND object_id = OBJECT_ID('users'))
    CREATE INDEX IX_users_role_active ON users(role, is_active) INCLUDE (name, location, bio, avatar_url);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_users_is_mentor' AND object_id = OBJECT_ID('users'))
    CREATE INDEX IX_users_is_mentor ON users(is_mentor, is_active) INCLUDE (id, name, location);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_users_is_mentee' AND object_id = OBJECT_ID('users'))
    CREATE INDEX IX_users_is_mentee ON users(is_mentee, is_active) INCLUDE (id, name, location);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_users_created_at' AND object_id = OBJECT_ID('users'))
    CREATE INDEX IX_users_created_at ON users(created_at DESC);

-- ── experts ──────────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_experts_user_id' AND object_id = OBJECT_ID('experts'))
    CREATE UNIQUE INDEX IX_experts_user_id ON experts(user_id);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_experts_available' AND object_id = OBJECT_ID('experts'))
    CREATE INDEX IX_experts_available ON experts(is_available) INCLUDE (id, user_id, name, location, bio);

-- ── expert_expertise ─────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_expert_expertise_expert_id' AND object_id = OBJECT_ID('expert_expertise'))
    CREATE INDEX IX_expert_expertise_expert_id ON expert_expertise(expert_id) INCLUDE (expertise);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_expert_expertise_value' AND object_id = OBJECT_ID('expert_expertise'))
    CREATE INDEX IX_expert_expertise_value ON expert_expertise(expertise) INCLUDE (expert_id);

-- ── user_desired_expertise ───────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_user_desired_expertise_user' AND object_id = OBJECT_ID('user_desired_expertise'))
    CREATE INDEX IX_user_desired_expertise_user ON user_desired_expertise(user_id) INCLUDE (expertise);

-- ── connections ──────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_connections_requester' AND object_id = OBJECT_ID('connections'))
    CREATE INDEX IX_connections_requester ON connections(requester_id, status) INCLUDE (expert_id, created_at);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_connections_expert' AND object_id = OBJECT_ID('connections'))
    CREATE INDEX IX_connections_expert ON connections(expert_id, status) INCLUDE (requester_id, created_at);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_connections_status' AND object_id = OBJECT_ID('connections'))
    CREATE INDEX IX_connections_status ON connections(status) INCLUDE (expert_id, requester_id);

-- ── sessions ─────────────────────────────────────────────────────────────────
IF OBJECT_ID('sessions') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_sessions_connection' AND object_id = OBJECT_ID('sessions'))
    CREATE INDEX IX_sessions_connection ON sessions(connection_id, status) INCLUDE (scheduled_at, duration_minutes);

IF OBJECT_ID('sessions') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_sessions_scheduled_at' AND object_id = OBJECT_ID('sessions'))
    CREATE INDEX IX_sessions_scheduled_at ON sessions(scheduled_at) WHERE status = 'scheduled';

-- ── messages ─────────────────────────────────────────────────────────────────
IF OBJECT_ID('messages') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_messages_expert_sent' AND object_id = OBJECT_ID('messages'))
    CREATE INDEX IX_messages_expert_sent ON messages(expert_id, created_at DESC) INCLUDE (sender_id, content, is_read);

IF OBJECT_ID('messages') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_messages_sender' AND object_id = OBJECT_ID('messages'))
    CREATE INDEX IX_messages_sender ON messages(sender_id, is_read) INCLUDE (expert_id, created_at);

-- ── questions ────────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_questions_created' AND object_id = OBJECT_ID('questions'))
    CREATE INDEX IX_questions_created ON questions(created_at DESC) INCLUDE (title, user_id, is_answered);

-- ── resources ────────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_resources_category_active' AND object_id = OBJECT_ID('resources'))
    CREATE INDEX IX_resources_category_active ON resources(category, is_active) INCLUDE (title, type, url, downloads);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_resources_type_active' AND object_id = OBJECT_ID('resources'))
    CREATE INDEX IX_resources_type_active ON resources(type, is_active) INCLUDE (title, category, url);

-- ── reflections ──────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_reflections_user_active' AND object_id = OBJECT_ID('reflections'))
    CREATE INDEX IX_reflections_user_active ON reflections(user_id, is_active) INCLUDE (title, category, created_at);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_reflections_category_active' AND object_id = OBJECT_ID('reflections'))
    CREATE INDEX IX_reflections_category_active ON reflections(category, is_active) INCLUDE (title, created_at);

-- ── reflection_comments ──────────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_reflection_comments_reflection' AND object_id = OBJECT_ID('reflection_comments'))
    CREATE INDEX IX_reflection_comments_reflection ON reflection_comments(reflection_id) INCLUDE (user_id, content, created_at);

-- ============================================================
-- Mentorship Activities: goals, milestones, tasks, progress
-- All scoped to connection_id so every mentor-mentee pair
-- has their own unique set of data.
-- ============================================================

-- Goals table
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'mentorship_goals')
BEGIN
  CREATE TABLE mentorship_goals (
    id            UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    connection_id UNIQUEIDENTIFIER NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
    title         NVARCHAR(200)    NOT NULL,
    description   NVARCHAR(MAX),
    specific      NVARCHAR(MAX),
    measurable    NVARCHAR(MAX),
    achievable    NVARCHAR(MAX),
    relevant      NVARCHAR(MAX),
    time_bound    NVARCHAR(MAX),
    category      NVARCHAR(50)     DEFAULT 'technical',  -- skill|career|leadership|technical|personal
    priority      NVARCHAR(20)     DEFAULT 'medium',     -- high|medium|low
    status        NVARCHAR(30)     DEFAULT 'not-started',-- not-started|in-progress|completed|blocked
    progress      INT              DEFAULT 0,
    start_date    DATE,
    target_date   DATE,
    completed_date DATE,
    created_by    UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    created_at    DATETIME         DEFAULT GETDATE(),
    updated_at    DATETIME         DEFAULT GETDATE()
  );
  PRINT 'Created mentorship_goals';
END

-- Milestones table
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'goal_milestones')
BEGIN
  CREATE TABLE goal_milestones (
    id             UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    goal_id        UNIQUEIDENTIFIER NOT NULL REFERENCES mentorship_goals(id) ON DELETE CASCADE,
    title          NVARCHAR(200)    NOT NULL,
    description    NVARCHAR(MAX),
    due_date       DATE,
    completed      BIT              DEFAULT 0,
    completed_date DATE,
    sort_order     INT              DEFAULT 0,
    created_at     DATETIME         DEFAULT GETDATE()
  );
  PRINT 'Created goal_milestones';
END

-- Tasks table
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'goal_tasks')
BEGIN
  CREATE TABLE goal_tasks (
    id             UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    milestone_id   UNIQUEIDENTIFIER NOT NULL REFERENCES goal_milestones(id) ON DELETE CASCADE,
    title          NVARCHAR(300)    NOT NULL,
    completed      BIT              DEFAULT 0,
    completed_date DATE,
    assigned_to    NVARCHAR(20)     DEFAULT 'mentee',    -- mentor|mentee
    sort_order     INT              DEFAULT 0,
    created_at     DATETIME         DEFAULT GETDATE()
  );
  PRINT 'Created goal_tasks';
END

-- Progress reports table
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'progress_reports')
BEGIN
  CREATE TABLE progress_reports (
    id               UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    connection_id    UNIQUEIDENTIFIER NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
    goal_id          UNIQUEIDENTIFIER REFERENCES mentorship_goals(id),
    period           NVARCHAR(20)     DEFAULT 'weekly',  -- weekly|monthly
    start_date       DATE             NOT NULL,
    end_date         DATE             NOT NULL,
    achievements     NVARCHAR(MAX),   -- JSON array
    challenges       NVARCHAR(MAX),   -- JSON array
    next_steps       NVARCHAR(MAX),   -- JSON array
    mentor_feedback  NVARCHAR(MAX),
    mentee_feedback  NVARCHAR(MAX),
    created_by       UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    created_at       DATETIME         DEFAULT GETDATE(),
    updated_at       DATETIME         DEFAULT GETDATE()
  );
  PRINT 'Created progress_reports';
END

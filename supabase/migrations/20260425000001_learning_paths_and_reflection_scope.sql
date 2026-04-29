-- ============================================================
-- Learning Paths: per-connection curricula + modules
-- Also adds optional connection_id to reflections for scoping
-- ============================================================

-- Add connection_id to reflections (nullable, for connection-scoped reflections)
IF NOT EXISTS (
  SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_NAME = 'reflections' AND COLUMN_NAME = 'connection_id'
)
BEGIN
  ALTER TABLE reflections ADD connection_id UNIQUEIDENTIFIER NULL
    REFERENCES connections(id) ON DELETE SET NULL;
END

-- Learning Paths
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'learning_paths')
BEGIN
  CREATE TABLE learning_paths (
    id            UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    connection_id UNIQUEIDENTIFIER NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
    title         NVARCHAR(200)    NOT NULL,
    description   NVARCHAR(MAX),
    level         NVARCHAR(30)     DEFAULT 'beginner',  -- beginner|intermediate|advanced
    duration      NVARCHAR(50),
    progress      INT              DEFAULT 0,
    enrolled      BIT              DEFAULT 0,
    created_by    UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    created_at    DATETIME         DEFAULT GETDATE(),
    updated_at    DATETIME         DEFAULT GETDATE()
  );
END

-- Learning Modules (belong to a learning path)
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'learning_modules')
BEGIN
  CREATE TABLE learning_modules (
    id              UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    path_id         UNIQUEIDENTIFIER NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    title           NVARCHAR(200)    NOT NULL,
    description     NVARCHAR(MAX),
    duration        NVARCHAR(50),
    sort_order      INT              DEFAULT 0,
    completed       BIT              DEFAULT 0,
    completed_date  DATETIME         NULL,
    -- Resource links stored as JSON array: [{title, url, type}]
    resources_json  NVARCHAR(MAX)    DEFAULT '[]',
    created_at      DATETIME         DEFAULT GETDATE(),
    updated_at      DATETIME         DEFAULT GETDATE()
  );
END

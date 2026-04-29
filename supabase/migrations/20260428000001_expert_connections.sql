-- Expert Connections table
-- Tracks connection requests from users to experts (short-term advisory connections)
-- Separate from the mentor-mentee connections table

IF NOT EXISTS (
  SELECT 1 FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_NAME = 'expert_connections'
)
BEGIN
  CREATE TABLE expert_connections (
    id             UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    requester_id   UNIQUEIDENTIFIER NOT NULL,   -- users.id (person requesting connection)
    expert_id      UNIQUEIDENTIFIER NOT NULL,   -- Experts.expert_id
    message        NVARCHAR(MAX)    NULL,
    status         NVARCHAR(20)     NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'approved', 'declined')),
    created_at     DATETIME         NOT NULL DEFAULT GETDATE(),
    updated_at     DATETIME         NOT NULL DEFAULT GETDATE()
  );
  PRINT 'Created expert_connections table';
END
ELSE
BEGIN
  PRINT 'expert_connections table already exists';
END
GO

-- Index for fast lookup by requester
IF NOT EXISTS (
  SELECT 1 FROM sys.indexes
  WHERE name = 'IX_expert_connections_requester'
    AND object_id = OBJECT_ID('expert_connections')
)
BEGIN
  CREATE INDEX IX_expert_connections_requester
    ON expert_connections (requester_id, status);
  PRINT 'Created index IX_expert_connections_requester';
END
GO

-- Index for fast lookup by expert
IF NOT EXISTS (
  SELECT 1 FROM sys.indexes
  WHERE name = 'IX_expert_connections_expert'
    AND object_id = OBJECT_ID('expert_connections')
)
BEGIN
  CREATE INDEX IX_expert_connections_expert
    ON expert_connections (expert_id, status);
  PRINT 'Created index IX_expert_connections_expert';
END
GO

-- Resources table
IF NOT EXISTS (SELECT 1 FROM sysobjects WHERE name='resources' AND xtype='U')
BEGIN
    CREATE TABLE resources (
        id            UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        title         NVARCHAR(255)  NOT NULL,
        type          NVARCHAR(50)   NOT NULL DEFAULT 'article',   -- article | video | pdf | tool
        category      NVARCHAR(100)  NOT NULL DEFAULT 'General',
        url           NVARCHAR(500)  NOT NULL,
        description   NVARCHAR(MAX),
        uploaded_by   UNIQUEIDENTIFIER REFERENCES users(id) ON DELETE SET NULL,
        uploader_name NVARCHAR(255),
        is_active     BIT            NOT NULL DEFAULT 1,
        downloads     INT            NOT NULL DEFAULT 0,
        rating        DECIMAL(3,2)   NOT NULL DEFAULT 0,
        created_at    DATETIME2      NOT NULL DEFAULT GETDATE(),
        updated_at    DATETIME2      NOT NULL DEFAULT GETDATE()
    );
    CREATE INDEX IX_resources_category    ON resources(category) WHERE is_active = 1;
    CREATE INDEX IX_resources_type        ON resources(type)     WHERE is_active = 1;
    CREATE INDEX IX_resources_created_at  ON resources(created_at DESC);
END;

-- Reflections table
IF NOT EXISTS (SELECT 1 FROM sysobjects WHERE name='reflections' AND xtype='U')
BEGIN
    CREATE TABLE reflections (
        id             UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        user_id        UNIQUEIDENTIFIER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category       NVARCHAR(100)    NOT NULL DEFAULT 'General',
        title          NVARCHAR(255)    NOT NULL,
        content        NVARCHAR(MAX)    NOT NULL,
        key_takeaways  NVARCHAR(MAX),   -- JSON array stored as string
        tags           NVARCHAR(MAX),   -- comma-sep
        rating         INT              CHECK (rating BETWEEN 1 AND 5),
        is_anonymous   BIT              NOT NULL DEFAULT 0,
        reactions      NVARCHAR(MAX)    DEFAULT '{}',  -- JSON obj
        is_active      BIT              NOT NULL DEFAULT 1,
        created_at     DATETIME2        NOT NULL DEFAULT GETDATE(),
        updated_at     DATETIME2        NOT NULL DEFAULT GETDATE()
    );
    CREATE INDEX IX_reflections_user_id    ON reflections(user_id);
    CREATE INDEX IX_reflections_category   ON reflections(category) WHERE is_active = 1;
    CREATE INDEX IX_reflections_created_at ON reflections(created_at DESC);
END;

-- Reflection comments
IF NOT EXISTS (SELECT 1 FROM sysobjects WHERE name='reflection_comments' AND xtype='U')
BEGIN
    CREATE TABLE reflection_comments (
        id             UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        reflection_id  UNIQUEIDENTIFIER NOT NULL REFERENCES reflections(id) ON DELETE CASCADE,
        user_id        UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
        content        NVARCHAR(MAX)    NOT NULL,
        is_anonymous   BIT              NOT NULL DEFAULT 0,
        created_at     DATETIME2        NOT NULL DEFAULT GETDATE()
    );
    CREATE INDEX IX_reflection_comments_reflection ON reflection_comments(reflection_id);
END;

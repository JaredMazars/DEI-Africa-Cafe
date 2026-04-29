-- Admin tables: audit_log, notifications, content_items

-- ── Admin Audit Log ────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='admin_audit_log' AND xtype='U')
BEGIN
    CREATE TABLE admin_audit_log (
        id            UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        admin_email   NVARCHAR(255)  NOT NULL,
        action        NVARCHAR(100)  NOT NULL,
        entity_type   NVARCHAR(100)  NOT NULL DEFAULT '',
        entity_name   NVARCHAR(255)  NOT NULL DEFAULT '',
        details       NVARCHAR(MAX)  NULL,
        ip_address    NVARCHAR(50)   NULL,
        created_at    DATETIME2      NOT NULL DEFAULT GETDATE()
    );
    CREATE INDEX IX_audit_admin ON admin_audit_log(admin_email);
    CREATE INDEX IX_audit_created ON admin_audit_log(created_at DESC);
END;

-- ── Admin Notifications ────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='admin_notifications' AND xtype='U')
BEGIN
    CREATE TABLE admin_notifications (
        id               UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        title            NVARCHAR(255)  NOT NULL,
        message          NVARCHAR(MAX)  NOT NULL,
        type             NVARCHAR(50)   NOT NULL DEFAULT 'info'
                         CHECK (type IN ('info','warning','success','error')),
        target_audience  NVARCHAR(50)   NOT NULL DEFAULT 'all'
                         CHECK (target_audience IN ('all','mentors','mentees','experts')),
        status           NVARCHAR(20)   NOT NULL DEFAULT 'draft'
                         CHECK (status IN ('draft','published')),
        created_by       NVARCHAR(255)  NOT NULL DEFAULT 'admin',
        created_at       DATETIME2      NOT NULL DEFAULT GETDATE(),
        updated_at       DATETIME2      NOT NULL DEFAULT GETDATE()
    );
END;

-- ── Admin Content Items ────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='admin_content' AND xtype='U')
BEGIN
    CREATE TABLE admin_content (
        id           UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        type         NVARCHAR(50)   NOT NULL DEFAULT 'article'
                     CHECK (type IN ('article','video','podcast','guide')),
        title        NVARCHAR(500)  NOT NULL,
        description  NVARCHAR(MAX)  NULL,
        url          NVARCHAR(2000) NOT NULL,
        category     NVARCHAR(100)  NOT NULL DEFAULT 'General',
        status       NVARCHAR(20)   NOT NULL DEFAULT 'published'
                     CHECK (status IN ('draft','published','archived')),
        created_by   NVARCHAR(255)  NOT NULL DEFAULT 'admin',
        created_at   DATETIME2      NOT NULL DEFAULT GETDATE(),
        updated_at   DATETIME2      NOT NULL DEFAULT GETDATE()
    );
    CREATE INDEX IX_content_type ON admin_content(type);
    CREATE INDEX IX_content_status ON admin_content(status);
END;

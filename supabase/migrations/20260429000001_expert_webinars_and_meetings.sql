-- expert_webinars: webinars/group sessions created by experts
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'expert_webinars')
BEGIN
    CREATE TABLE expert_webinars (
        id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        created_by      NVARCHAR(255) NOT NULL,   -- users.id of the expert
        expert_name     NVARCHAR(255) NOT NULL,
        title           NVARCHAR(500) NOT NULL,
        description     NVARCHAR(MAX),
        scheduled_at    DATETIME2 NOT NULL,
        duration_minutes INT DEFAULT 60,
        topic           NVARCHAR(255),
        region          NVARCHAR(255),
        max_attendees   INT DEFAULT 50,
        attendee_count  INT DEFAULT 0,
        teams_link      NVARCHAR(2000),
        invited_emails  NVARCHAR(MAX),            -- comma-separated
        is_private      BIT DEFAULT 0,
        status          NVARCHAR(50) DEFAULT 'scheduled',  -- scheduled|live|ended
        created_at      DATETIME2 DEFAULT GETDATE(),
        updated_at      DATETIME2 DEFAULT GETDATE()
    );
END
GO

-- expert_meetings: 1-on-1 meetings created by experts with individual mentees
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'expert_meetings')
BEGIN
    CREATE TABLE expert_meetings (
        id                  UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        created_by          NVARCHAR(255) NOT NULL,   -- users.id of expert
        expert_name         NVARCHAR(255) NOT NULL,
        title               NVARCHAR(500) NOT NULL,
        description         NVARCHAR(MAX),
        scheduled_at        DATETIME2 NOT NULL,
        duration_minutes    INT DEFAULT 60,
        topic               NVARCHAR(255),
        region              NVARCHAR(255),
        meeting_type        NVARCHAR(50) DEFAULT 'webinar',  -- webinar|1on1
        teams_link          NVARCHAR(2000),
        attendee_emails     NVARCHAR(MAX),            -- comma-separated
        lobby_bypass        NVARCHAR(100) DEFAULT 'organization',
        status              NVARCHAR(50) DEFAULT 'scheduled',
        created_at          DATETIME2 DEFAULT GETDATE(),
        updated_at          DATETIME2 DEFAULT GETDATE()
    );
END
GO

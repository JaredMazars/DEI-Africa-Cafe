-- Webinar Registrations: tracks which users registered to attend a webinar
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'webinar_registrations')
BEGIN
  CREATE TABLE webinar_registrations (
    id            UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    webinar_id    UNIQUEIDENTIFIER NOT NULL REFERENCES expert_webinars(id) ON DELETE CASCADE,
    user_id       UNIQUEIDENTIFIER NOT NULL REFERENCES users(id) ON DELETE NO ACTION,
    registered_at DATETIME2 DEFAULT GETUTCDATE(),
    CONSTRAINT UQ_webinar_reg UNIQUE (webinar_id, user_id)
  );
  CREATE INDEX IX_webinar_reg_user ON webinar_registrations (user_id);
  PRINT 'Created webinar_registrations table';
END
ELSE PRINT 'webinar_registrations table already exists';

-- Collaboration Groups
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'collaboration_groups')
BEGIN
  CREATE TABLE collaboration_groups (
    id             UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    name           NVARCHAR(255) NOT NULL,
    description    NVARCHAR(MAX),
    creator_id     UNIQUEIDENTIFIER NOT NULL REFERENCES users(id) ON DELETE NO ACTION,
    opportunity_id NVARCHAR(255),
    status         NVARCHAR(50) DEFAULT 'active',
    created_at     DATETIME2 DEFAULT GETUTCDATE(),
    last_activity  DATETIME2 DEFAULT GETUTCDATE()
  );
  PRINT 'Created collaboration_groups table';
END
ELSE PRINT 'collaboration_groups table already exists';

-- Collaboration Group Members
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'collaboration_group_members')
BEGIN
  CREATE TABLE collaboration_group_members (
    id         UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    group_id   UNIQUEIDENTIFIER NOT NULL REFERENCES collaboration_groups(id) ON DELETE CASCADE,
    user_id    UNIQUEIDENTIFIER NOT NULL REFERENCES users(id) ON DELETE NO ACTION,
    role       NVARCHAR(100) DEFAULT 'Member',
    joined_at  DATETIME2 DEFAULT GETUTCDATE(),
    CONSTRAINT UQ_group_member UNIQUE (group_id, user_id)
  );
  CREATE INDEX IX_group_members_group ON collaboration_group_members (group_id);
  PRINT 'Created collaboration_group_members table';
END
ELSE PRINT 'collaboration_group_members table already exists';

-- Opportunity Applications (interest requests)
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'opportunity_applications')
BEGIN
  CREATE TABLE opportunity_applications (
    id              UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    opportunity_id  NVARCHAR(255) NOT NULL,
    applicant_id    UNIQUEIDENTIFIER NOT NULL REFERENCES users(id) ON DELETE NO ACTION,
    message         NVARCHAR(MAX),
    status          NVARCHAR(50) DEFAULT 'pending',
    submitted_at    DATETIME2 DEFAULT GETUTCDATE()
  );
  CREATE INDEX IX_opp_apps_opportunity ON opportunity_applications (opportunity_id);
  CREATE INDEX IX_opp_apps_applicant ON opportunity_applications (applicant_id);
  PRINT 'Created opportunity_applications table';
END
ELSE PRINT 'opportunity_applications table already exists';

-- Case Studies
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'case_studies')
BEGIN
  CREATE TABLE case_studies (
    id             UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    title          NVARCHAR(500) NOT NULL,
    industry       NVARCHAR(255),
    region         NVARCHAR(255),
    author_id      UNIQUEIDENTIFIER REFERENCES users(id) ON DELETE SET NULL,
    summary        NVARCHAR(MAX),
    download_count INT DEFAULT 0,
    published_at   DATETIME2 DEFAULT GETUTCDATE(),
    tags           NVARCHAR(MAX)  -- comma-separated
  );
  PRINT 'Created case_studies table';
END
ELSE PRINT 'case_studies table already exists';

-- Deal Pipeline
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'deal_pipeline')
BEGIN
  CREATE TABLE deal_pipeline (
    id              UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    client_name     NVARCHAR(255) NOT NULL,
    deal_value      NVARCHAR(100),
    stage           NVARCHAR(100) DEFAULT 'prospecting',
    regions         NVARCHAR(MAX),  -- comma-separated
    probability     INT DEFAULT 50,
    expected_close  DATE,
    team_lead_id    UNIQUEIDENTIFIER REFERENCES users(id) ON DELETE SET NULL,
    team_lead_name  NVARCHAR(255),
    created_at      DATETIME2 DEFAULT GETUTCDATE()
  );
  PRINT 'Created deal_pipeline table';
END
ELSE PRINT 'deal_pipeline table already exists';

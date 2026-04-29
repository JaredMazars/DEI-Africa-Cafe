-- Add is_verified, is_rejected, rejection_note columns to experts table
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='experts' AND COLUMN_NAME='is_verified')
    ALTER TABLE experts ADD is_verified BIT NOT NULL DEFAULT 0;
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='experts' AND COLUMN_NAME='is_rejected')
    ALTER TABLE experts ADD is_rejected BIT NOT NULL DEFAULT 0;
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='experts' AND COLUMN_NAME='rejection_note')
    ALTER TABLE experts ADD rejection_note NVARCHAR(500) NULL;

-- Create Opportunities table (matches existing Opportunity model which uses opportunity_id PK)
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME='Opportunities')
CREATE TABLE Opportunities (
    opportunity_id  INT IDENTITY(1,1) PRIMARY KEY,
    title           NVARCHAR(255) NOT NULL,
    description     NVARCHAR(MAX),
    industry        NVARCHAR(100),
    client_sector   NVARCHAR(100),
    regions_needed  NVARCHAR(255),
    budget_range    NVARCHAR(100),
    deadline        DATE,
    priority        NVARCHAR(20)  DEFAULT 'medium',
    status          NVARCHAR(30)  DEFAULT 'open',
    contact_person_id NVARCHAR(100) NULL,
    created_at      DATETIME2 DEFAULT GETDATE(),
    updated_at      DATETIME2 DEFAULT GETDATE()
);

-- Create OpportunityInterests table (referenced in Opportunity.getAll subquery)
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME='OpportunityInterests')
CREATE TABLE OpportunityInterests (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    opportunity_id  INT NOT NULL,
    user_id         NVARCHAR(100) NOT NULL,
    created_at      DATETIME2 DEFAULT GETDATE()
);

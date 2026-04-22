-- ============================================================
-- Migration: Add dual-role support, desired expertise, and mentor capacity
-- Target: Azure SQL Database
-- ============================================================

-- 1. Allow 'both' as a valid role in UserProfiles
--    Azure SQL requires finding + dropping the generated constraint name first.
BEGIN TRY
    DECLARE @roleCK NVARCHAR(200);
    SELECT @roleCK = cc.name
    FROM sys.check_constraints cc
    JOIN sys.tables t ON cc.parent_object_id = t.object_id
    WHERE t.name = 'UserProfiles' AND cc.definition LIKE '%mentor%';

    IF @roleCK IS NOT NULL
        EXEC('ALTER TABLE UserProfiles DROP CONSTRAINT [' + @roleCK + ']');

    ALTER TABLE UserProfiles
        ADD CONSTRAINT CK_UserProfiles_role
        CHECK (role IN ('mentor', 'mentee', 'both'));

    PRINT 'Role constraint updated to allow mentor / mentee / both.';
END TRY
BEGIN CATCH
    PRINT 'Role constraint update skipped (may already be correct): ' + ERROR_MESSAGE();
END CATCH;

-- 2. Add helper columns to UserProfiles (idempotent)
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('UserProfiles') AND name = 'can_mentor'
)
BEGIN
    ALTER TABLE UserProfiles ADD can_mentor BIT NOT NULL DEFAULT 0;
    PRINT 'Added can_mentor column.';
END

IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('UserProfiles') AND name = 'can_be_mentored'
)
BEGIN
    ALTER TABLE UserProfiles ADD can_be_mentored BIT NOT NULL DEFAULT 1;
    PRINT 'Added can_be_mentored column.';
END

-- 3. Create UserDesiredExpertise table (what a mentee/both user wants in a mentor)
IF NOT EXISTS (SELECT 1 FROM sysobjects WHERE name = 'UserDesiredExpertise' AND xtype = 'U')
BEGIN
    CREATE TABLE UserDesiredExpertise (
        desired_id       UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        user_id          UNIQUEIDENTIFIER NOT NULL,
        expertise        NVARCHAR(100)    NOT NULL,
        created_at       DATETIME2        DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
    );
    PRINT 'Created UserDesiredExpertise table.';
END

-- 4. Back-fill can_mentor / can_be_mentored from existing role column
UPDATE UserProfiles
SET    can_mentor      = CASE WHEN role IN ('mentor', 'both') THEN 1 ELSE 0 END,
       can_be_mentored = CASE WHEN role IN ('mentee', 'both') THEN 1 ELSE 0 END
WHERE  can_mentor = 0 AND can_be_mentored = 1; -- only rows not yet set

PRINT 'Back-fill complete.';

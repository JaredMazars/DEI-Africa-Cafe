-- DEI Cafe Database Schema for Azure SQL Database
-- Run this script in your Azure SQL Database to create the required tables

-- Drop existing tables if they exist (in correct order due to foreign key constraints)
IF OBJECT_ID('QuestionAnswers', 'U') IS NOT NULL DROP TABLE QuestionAnswers;
IF OBJECT_ID('OpportunityInterests', 'U') IS NOT NULL DROP TABLE OpportunityInterests;
IF OBJECT_ID('Opportunities', 'U') IS NOT NULL DROP TABLE Opportunities;
IF OBJECT_ID('Questions', 'U') IS NOT NULL DROP TABLE Questions;
IF OBJECT_ID('Experts', 'U') IS NOT NULL DROP TABLE Experts;
IF OBJECT_ID('Reviews', 'U') IS NOT NULL DROP TABLE Reviews;
IF OBJECT_ID('Messages', 'U') IS NOT NULL DROP TABLE Messages;
IF OBJECT_ID('Sessions', 'U') IS NOT NULL DROP TABLE Sessions;
IF OBJECT_ID('Connections', 'U') IS NOT NULL DROP TABLE Connections;
IF OBJECT_ID('UserLanguages', 'U') IS NOT NULL DROP TABLE UserLanguages;
IF OBJECT_ID('UserGoals', 'U') IS NOT NULL DROP TABLE UserGoals;
IF OBJECT_ID('UserInterests', 'U') IS NOT NULL DROP TABLE UserInterests;
IF OBJECT_ID('UserExpertise', 'U') IS NOT NULL DROP TABLE UserExpertise;
IF OBJECT_ID('UserProfiles', 'U') IS NOT NULL DROP TABLE UserProfiles;
IF OBJECT_ID('Users', 'U') IS NOT NULL DROP TABLE Users;

-- Users table - stores basic authentication information
CREATE TABLE Users (
    user_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- User profiles table - stores detailed user information
CREATE TABLE UserProfiles (
    profile_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    role NVARCHAR(20) NOT NULL CHECK (role IN ('mentor', 'mentee')),
    name NVARCHAR(255) NOT NULL,
    location NVARCHAR(255) NOT NULL,
    experience NVARCHAR(100) NOT NULL,
    availability NVARCHAR(100) NOT NULL,
    bio NVARCHAR(MAX),
    profile_image_url NVARCHAR(500),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- User expertise table - stores user skills and expertise areas
CREATE TABLE UserExpertise (
    expertise_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    expertise NVARCHAR(100) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- User interests table - stores user interests
CREATE TABLE UserInterests (
    interest_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    interest NVARCHAR(100) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- User goals table - stores user goals
CREATE TABLE UserGoals (
    goal_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    goal NVARCHAR(255) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- User languages table - stores languages spoken by users
CREATE TABLE UserLanguages (
    language_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    language NVARCHAR(100) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Connections table - stores mentor-mentee relationships
CREATE TABLE Connections (
    connection_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    mentor_id UNIQUEIDENTIFIER NOT NULL,
    mentee_id UNIQUEIDENTIFIER NOT NULL,
    status NVARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'inactive')),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (mentor_id) REFERENCES Users(user_id),
    FOREIGN KEY (mentee_id) REFERENCES Users(user_id),
    UNIQUE(mentor_id, mentee_id)
);

-- Messages table - stores messages between mentors and mentees
CREATE TABLE Messages (
    message_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    connection_id UNIQUEIDENTIFIER NOT NULL,
    sender_id UNIQUEIDENTIFIER NOT NULL,
    message_text NVARCHAR(MAX) NOT NULL,
    is_read BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (connection_id) REFERENCES Connections(connection_id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES Users(user_id)
);

-- Sessions table - stores mentoring session information
CREATE TABLE Sessions (
    session_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    connection_id UNIQUEIDENTIFIER NOT NULL,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    scheduled_at DATETIME2 NOT NULL,
    duration_minutes INT DEFAULT 60,
    status NVARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
    meeting_link NVARCHAR(500),
    notes NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (connection_id) REFERENCES Connections(connection_id) ON DELETE CASCADE
);

-- Reviews table - stores feedback and ratings
CREATE TABLE Reviews (
    review_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    connection_id UNIQUEIDENTIFIER NOT NULL,
    reviewer_id UNIQUEIDENTIFIER NOT NULL,
    reviewee_id UNIQUEIDENTIFIER NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (connection_id) REFERENCES Connections(connection_id),
    FOREIGN KEY (reviewer_id) REFERENCES Users(user_id),
    FOREIGN KEY (reviewee_id) REFERENCES Users(user_id)
);

-- Experts table - stores expert directory information
CREATE TABLE Experts (
    expert_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    specializations NVARCHAR(MAX),
    industries NVARCHAR(MAX),
    past_clients NVARCHAR(MAX),
    hourly_rate DECIMAL(10,2),
    response_time NVARCHAR(50),
    is_verified BIT DEFAULT 0,
    is_available BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Questions table - stores expert forum questions
CREATE TABLE Questions (
    question_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    title NVARCHAR(500) NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    tags NVARCHAR(500),
    is_answered BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Question answers table - stores answers to questions
CREATE TABLE QuestionAnswers (
    answer_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    question_id UNIQUEIDENTIFIER NOT NULL,
    expert_id UNIQUEIDENTIFIER NOT NULL,
    answer_text NVARCHAR(MAX) NOT NULL,
    is_accepted BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (question_id) REFERENCES Questions(question_id) ON DELETE CASCADE,
    FOREIGN KEY (expert_id) REFERENCES Users(user_id)
);

-- Opportunities table - stores collaboration opportunities
CREATE TABLE Opportunities (
    opportunity_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    title NVARCHAR(500) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    industry NVARCHAR(100) NOT NULL,
    client_sector NVARCHAR(100) NOT NULL,
    regions_needed NVARCHAR(500) NOT NULL,
    budget_range NVARCHAR(100) NOT NULL,
    deadline DATETIME2 NOT NULL,
    priority NVARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    status NVARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'closed')),
    contact_person_id UNIQUEIDENTIFIER NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (contact_person_id) REFERENCES Users(user_id)
);

-- Opportunity interests table - tracks who is interested in opportunities
CREATE TABLE OpportunityInterests (
    interest_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    opportunity_id UNIQUEIDENTIFIER NOT NULL,
    user_id UNIQUEIDENTIFIER NOT NULL,
    message NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (opportunity_id) REFERENCES Opportunities(opportunity_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    UNIQUE(opportunity_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IX_Users_Email ON Users(email);
CREATE INDEX IX_Users_IsActive ON Users(is_active);
CREATE INDEX IX_Users_CreatedAt ON Users(created_at);

CREATE INDEX IX_UserProfiles_UserId ON UserProfiles(user_id);
CREATE INDEX IX_UserProfiles_Role ON UserProfiles(role);
CREATE INDEX IX_UserProfiles_Location ON UserProfiles(location);
CREATE INDEX IX_UserProfiles_CreatedAt ON UserProfiles(created_at);

CREATE INDEX IX_UserExpertise_UserId ON UserExpertise(user_id);
CREATE INDEX IX_UserExpertise_Expertise ON UserExpertise(expertise);

CREATE INDEX IX_UserInterests_UserId ON UserInterests(user_id);
CREATE INDEX IX_UserInterests_Interest ON UserInterests(interest);

CREATE INDEX IX_UserGoals_UserId ON UserGoals(user_id);
CREATE INDEX IX_UserLanguages_UserId ON UserLanguages(user_id);

CREATE INDEX IX_Connections_MentorId ON Connections(mentor_id);
CREATE INDEX IX_Connections_MenteeId ON Connections(mentee_id);
CREATE INDEX IX_Connections_Status ON Connections(status);
CREATE INDEX IX_Connections_CreatedAt ON Connections(created_at);

CREATE INDEX IX_Messages_ConnectionId ON Messages(connection_id);
CREATE INDEX IX_Messages_SenderId ON Messages(sender_id);
CREATE INDEX IX_Messages_IsRead ON Messages(is_read);
CREATE INDEX IX_Messages_CreatedAt ON Messages(created_at);

CREATE INDEX IX_Sessions_ConnectionId ON Sessions(connection_id);
CREATE INDEX IX_Sessions_ScheduledAt ON Sessions(scheduled_at);
CREATE INDEX IX_Sessions_Status ON Sessions(status);
CREATE INDEX IX_Sessions_CreatedAt ON Sessions(created_at);

CREATE INDEX IX_Reviews_ConnectionId ON Reviews(connection_id);
CREATE INDEX IX_Reviews_ReviewerId ON Reviews(reviewer_id);
CREATE INDEX IX_Reviews_RevieweeId ON Reviews(reviewee_id);
CREATE INDEX IX_Reviews_CreatedAt ON Reviews(created_at);

CREATE INDEX IX_Experts_UserId ON Experts(user_id);
CREATE INDEX IX_Experts_IsVerified ON Experts(is_verified);
CREATE INDEX IX_Experts_IsAvailable ON Experts(is_available);

CREATE INDEX IX_Questions_UserId ON Questions(user_id);
CREATE INDEX IX_Questions_IsAnswered ON Questions(is_answered);
CREATE INDEX IX_Questions_CreatedAt ON Questions(created_at);

CREATE INDEX IX_QuestionAnswers_QuestionId ON QuestionAnswers(question_id);
CREATE INDEX IX_QuestionAnswers_ExpertId ON QuestionAnswers(expert_id);

CREATE INDEX IX_Opportunities_Industry ON Opportunities(industry);
CREATE INDEX IX_Opportunities_Status ON Opportunities(status);
CREATE INDEX IX_Opportunities_Priority ON Opportunities(priority);
CREATE INDEX IX_Opportunities_Deadline ON Opportunities(deadline);
CREATE INDEX IX_Opportunities_CreatedAt ON Opportunities(created_at);

CREATE INDEX IX_OpportunityInterests_OpportunityId ON OpportunityInterests(opportunity_id);
CREATE INDEX IX_OpportunityInterests_UserId ON OpportunityInterests(user_id);

-- Insert sample data for testing (optional)
-- Uncomment and modify these inserts for testing purposes

/*
-- Sample users
INSERT INTO Users (email, password_hash) VALUES 
('mentor1@oneafricahub.com', '$2a$12$sample_hash_here'),
('mentee1@oneafricahub.com', '$2a$12$sample_hash_here'),
('expert1@oneafricahub.com', '$2a$12$sample_hash_here');

-- Get the user IDs for sample data
DECLARE @mentor_id UNIQUEIDENTIFIER = (SELECT user_id FROM Users WHERE email = 'mentor1@oneafricahub.com');
DECLARE @mentee_id UNIQUEIDENTIFIER = (SELECT user_id FROM Users WHERE email = 'mentee1@oneafricahub.com');
DECLARE @expert_id UNIQUEIDENTIFIER = (SELECT user_id FROM Users WHERE email = 'expert1@oneafricahub.com');

-- Sample profiles
INSERT INTO UserProfiles (user_id, role, name, location, experience, availability, bio) VALUES 
(@mentor_id, 'mentor', 'Thabo Mthembu', 'Johannesburg, South Africa', 'senior', '3-5 hours/week', 'Senior Audit Partner with 15+ years experience'),
(@mentee_id, 'mentee', 'Sarah Okafor', 'Lagos, Nigeria', 'junior', '1-2 hours/week', 'Junior Tax Analyst looking to grow'),
(@expert_id, 'mentor', 'Dr. Amina Hassan', 'Cairo, Egypt', 'executive', '2-3 hours/week', 'Fintech regulation expert');

-- Sample expertise and interests
INSERT INTO UserExpertise (user_id, expertise) VALUES 
(@mentor_id, 'External Audit'),
(@mentor_id, 'IFRS'),
(@expert_id, 'Fintech Regulation'),
(@expert_id, 'Digital Banking');

INSERT INTO UserInterests (user_id, interest) VALUES 
(@mentee_id, 'Tax Compliance'),
(@mentee_id, 'VAT');

-- Sample expert profile
INSERT INTO Experts (user_id, specializations, industries, past_clients, hourly_rate, response_time, is_verified, is_available) VALUES
(@expert_id, 'Fintech Regulation, Digital Banking, Compliance', 'Financial Services, Technology, Banking', 'Central Bank of Egypt, Commercial International Bank', 150.00, '< 2 hours', 1, 1);

-- Sample connection
INSERT INTO Connections (mentor_id, mentee_id, status) VALUES 
(@mentor_id, @mentee_id, 'accepted');

-- Sample opportunity
INSERT INTO Opportunities (title, description, industry, client_sector, regions_needed, budget_range, deadline, priority, contact_person_id) VALUES
('Financial Services Expansion - West Africa', 'Leading Nigerian bank seeking advisory on expansion into Ghana and Côte d''Ivoire', 'Financial Services', 'Banking', 'Ghana, Côte d''Ivoire', '$2M - $5M', '2024-03-15', 'high', @expert_id);
*/

PRINT 'DEI Cafe database schema created successfully!';
PRINT 'Tables created: Users, UserProfiles, UserExpertise, UserInterests, UserGoals, UserLanguages, Connections, Messages, Sessions, Reviews, Experts, Questions, QuestionAnswers, Opportunities, OpportunityInterests';
PRINT 'Indexes created for optimal performance';
PRINT 'Ready for application deployment!';
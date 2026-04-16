-- DEI Cafe Database Schema for Azure SQL Database
-- Run this script in your Azure SQL Database to create the required tables

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

-- Create indexes for better performance
CREATE INDEX IX_Users_Email ON Users(email);
CREATE INDEX IX_UserProfiles_UserId ON UserProfiles(user_id);
CREATE INDEX IX_UserProfiles_Role ON UserProfiles(role);
CREATE INDEX IX_UserExpertise_UserId ON UserExpertise(user_id);
CREATE INDEX IX_UserInterests_UserId ON UserInterests(user_id);
CREATE INDEX IX_UserGoals_UserId ON UserGoals(user_id);
CREATE INDEX IX_UserLanguages_UserId ON UserLanguages(user_id);
CREATE INDEX IX_Connections_MentorId ON Connections(mentor_id);
CREATE INDEX IX_Connections_MenteeId ON Connections(mentee_id);
CREATE INDEX IX_Connections_Status ON Connections(status);
CREATE INDEX IX_Messages_ConnectionId ON Messages(connection_id);
CREATE INDEX IX_Messages_SenderId ON Messages(sender_id);
CREATE INDEX IX_Sessions_ConnectionId ON Sessions(connection_id);
CREATE INDEX IX_Sessions_ScheduledAt ON Sessions(scheduled_at);
CREATE INDEX IX_Reviews_ConnectionId ON Reviews(connection_id);

-- Insert sample data for testing (optional)
-- You can uncomment and modify these inserts for testing purposes

/*
-- Sample users
INSERT INTO Users (email, password_hash) VALUES 
('mentor1@example.com', '$2a$12$sample_hash_here'),
('mentee1@example.com', '$2a$12$sample_hash_here');

-- Sample profiles
DECLARE @mentor_id UNIQUEIDENTIFIER = (SELECT user_id FROM Users WHERE email = 'mentor1@example.com');
DECLARE @mentee_id UNIQUEIDENTIFIER = (SELECT user_id FROM Users WHERE email = 'mentee1@example.com');

INSERT INTO UserProfiles (user_id, role, name, location, experience, availability) VALUES 
(@mentor_id, 'mentor', 'John Mentor', 'Lagos, Nigeria', 'senior', '3-5 hours/week'),
(@mentee_id, 'mentee', 'Jane Mentee', 'Nairobi, Kenya', 'student', '1-2 hours/week');

-- Sample expertise and interests
INSERT INTO UserExpertise (user_id, expertise) VALUES 
(@mentor_id, 'Technology'),
(@mentor_id, 'Business');

INSERT INTO UserInterests (user_id, interest) VALUES 
(@mentee_id, 'Technology'),
(@mentee_id, 'Marketing');
*/
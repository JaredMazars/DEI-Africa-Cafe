import { executeQuery, executeParameterized } from '../config/database.js';

class Session {
    constructor(data) {
        this.session_id = data.session_id;
        this.connection_id = data.connection_id;
        this.title = data.title;
        this.description = data.description;
        this.scheduled_at = data.scheduled_at;
        this.duration_minutes = data.duration_minutes;
        this.status = data.status;
        this.meeting_link = data.meeting_link;
        this.notes = data.notes;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static async create(sessionData) {
        try {
            const result = await executeParameterized(
                `INSERT INTO Sessions (connection_id, title, description, scheduled_at, duration_minutes, status, meeting_link, created_at, updated_at)
                 OUTPUT INSERTED.*
                 VALUES (@cid, @title, @desc, @scheduledAt, @duration, 'scheduled', @link, GETDATE(), GETDATE())`,
                {
                    cid:         sessionData.connection_id,
                    title:       sessionData.title,
                    desc:        sessionData.description || null,
                    scheduledAt: sessionData.scheduled_at,
                    duration:    sessionData.duration_minutes || 60,
                    link:        sessionData.meeting_link || null
                }
            );
            return new Session(result.recordset[0]);
        } catch (error) {
            console.error('Error creating session:', error);
            throw error;
        }
    }

    static async findById(sessionId) {
        try {
            const result = await executeParameterized(
                'SELECT * FROM Sessions WHERE session_id = @id',
                { id: sessionId }
            );
            return result.recordset.length > 0 ? new Session(result.recordset[0]) : null;
        } catch (error) {
            console.error('Error finding session by ID:', error);
            throw error;
        }
    }

    static async getUserSessions(userId) {
        try {
            const result = await executeParameterized(
                `SELECT s.*, c.mentor_id, c.mentee_id,
                        mentor_profile.name as mentor_name,
                        mentor_profile.profile_image_url as mentor_avatar,
                        mentee_profile.name as mentee_name,
                        mentee_profile.profile_image_url as mentee_avatar
                 FROM Sessions s
                 INNER JOIN Connections c ON s.connection_id = c.connection_id
                 LEFT JOIN users mentor_profile ON c.expert_id = mentor_profile.id
                 LEFT JOIN users mentee_profile ON c.requester_id = mentee_profile.id
                 WHERE c.mentor_id = @uid OR c.mentee_id = @uid
                 ORDER BY s.scheduled_at ASC`,
                { uid: userId }
            );
            return result.recordset.map(session => new Session(session));
        } catch (error) {
            console.error('Error getting user sessions:', error);
            throw error;
        }
    }

    static async getConnectionSessions(connectionId) {
        try {
            const query = `
                SELECT s.*, 
                       mu.name as mentor_name, mu.avatar_url as mentor_avatar,
                       eu.name as mentee_name, eu.avatar_url as mentee_avatar
                FROM Sessions s
                INNER JOIN connections c ON s.connection_id = c.id
                LEFT JOIN experts ex ON c.expert_id = ex.id
                LEFT JOIN users mu ON ex.user_id = mu.id
                LEFT JOIN users eu ON c.requester_id = eu.id
                WHERE s.connection_id = '${connectionId}'
                ORDER BY s.scheduled_at DESC
            `;
            const result = await executeQuery(query);
            return result.recordset.map(session => new Session(session));
        } catch (error) {
            console.error('Error getting connection sessions:', error);
            throw error;
        }
    }

    static async getUpcomingSessions(userId) {
        try {
            const query = `
                SELECT s.*, c.mentor_id, c.mentee_id,
                       mentor_profile.name as mentor_name, 
                       mentor_profile.profile_image_url as mentor_avatar,
                       mentee_profile.name as mentee_name, 
                       mentee_profile.profile_image_url as mentee_avatar
                FROM Sessions s
                INNER JOIN Connections c ON s.connection_id = c.connection_id
                LEFT JOIN users mentor_profile ON c.expert_id = mentor_profile.id
                LEFT JOIN users mentee_profile ON c.requester_id = mentee_profile.id
                WHERE (c.mentor_id = '${userId}' OR c.mentee_id = '${userId}')
                AND s.scheduled_at > GETDATE()
                AND s.status = 'scheduled'
                ORDER BY s.scheduled_at ASC
            `;
            
            const result = await executeQuery(query);
            return result.recordset.map(session => new Session(session));
        } catch (error) {
            console.error('Error getting upcoming sessions:', error);
            throw error;
        }
    }

    static async updateStatus(sessionId, status, notes = null) {
        try {
            const query = `
                UPDATE Sessions 
                SET status = '${status}', 
                    notes = ${notes ? `'${notes.replace(/'/g, "''")}'` : 'NULL'}, 
                    updated_at = GETDATE()
                OUTPUT INSERTED.*
                WHERE session_id = '${sessionId}'
            `;
            
            const result = await executeQuery(query);
            return result.recordset.length > 0 ? new Session(result.recordset[0]) : null;
        } catch (error) {
            console.error('Error updating session status:', error);
            throw error;
        }
    }

    static async updateMeetingLink(sessionId, meetingLink) {
        try {
            await executeParameterized(
                `UPDATE Sessions SET meeting_link = @link, updated_at = GETDATE() WHERE session_id = @id`,
                { link: meetingLink, id: sessionId }
            );
        } catch (error) {
            console.error('Error updating meeting link:', error);
            throw error;
        }
    }

    static async getSessionStats() {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_sessions,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_sessions,
                    SUM(CASE WHEN status = 'scheduled' AND scheduled_at > GETDATE() THEN 1 ELSE 0 END) as upcoming_sessions,
                    AVG(CAST(duration_minutes as FLOAT)) as avg_duration
                FROM Sessions
            `;
            
            const result = await executeQuery(query);
            return result.recordset[0];
        } catch (error) {
            console.error('Error getting session stats:', error);
            throw error;
        }
    }
}

export default Session;
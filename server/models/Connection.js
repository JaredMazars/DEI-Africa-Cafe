import { executeQuery } from '../config/database.js';

class Connection {
    constructor(data) {
        this.connection_id = data.connection_id;
        this.mentor_id = data.mentor_id;
        this.mentee_id = data.mentee_id;
        this.status = data.status;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static async create(connectionData) {
        try {
            const query = `
                INSERT INTO Connections (mentor_id, mentee_id, status, created_at, updated_at)
                OUTPUT INSERTED.*
                VALUES ('${connectionData.mentor_id}', '${connectionData.mentee_id}', 
                        '${connectionData.status || 'pending'}', GETDATE(), GETDATE())
            `;
            
            const result = await executeQuery(query);
            return new Connection(result.recordset[0]);
        } catch (error) {
            console.error('Error creating connection:', error);
            throw error;
        }
    }

    static async findById(connectionId) {
        try {
            const query = `SELECT * FROM Connections WHERE connection_id = '${connectionId}'`;
            const result = await executeQuery(query);
            
            return result.recordset.length > 0 ? new Connection(result.recordset[0]) : null;
        } catch (error) {
            console.error('Error finding connection by ID:', error);
            throw error;
        }
    }

    static async getUserConnections(userId) {
        try {
            const query = `
                SELECT c.*, 
                       mentor_profile.name as mentor_name, 
                       mentor_profile.profile_image_url as mentor_avatar,
                       mentor_profile.location as mentor_location, 
                       mentor_profile.experience as mentor_experience,
                       mentor_profile.bio as mentor_bio,
                       mentee_profile.name as mentee_name, 
                       mentee_profile.profile_image_url as mentee_avatar,
                       mentee_profile.location as mentee_location, 
                       mentee_profile.experience as mentee_experience,
                       mentee_profile.bio as mentee_bio,
                       mentor_user.email as mentor_email,
                       mentee_user.email as mentee_email
                FROM Connections c
                LEFT JOIN UserProfiles mentor_profile ON c.mentor_id = mentor_profile.user_id
                LEFT JOIN UserProfiles mentee_profile ON c.mentee_id = mentee_profile.user_id
                LEFT JOIN Users mentor_user ON c.mentor_id = mentor_user.user_id
                LEFT JOIN Users mentee_user ON c.mentee_id = mentee_user.user_id
                WHERE c.mentor_id = '${userId}' OR c.mentee_id = '${userId}'
                ORDER BY c.created_at DESC
            `;
            
            const result = await executeQuery(query);
            return result.recordset.map(conn => new Connection(conn));
        } catch (error) {
            console.error('Error getting user connections:', error);
            throw error;
        }
    }

    static async updateStatus(connectionId, status) {
        try {
            const query = `
                UPDATE Connections 
                SET status = '${status}', updated_at = GETDATE()
                OUTPUT INSERTED.*
                WHERE connection_id = '${connectionId}'
            `;
            
            const result = await executeQuery(query);
            return result.recordset.length > 0 ? new Connection(result.recordset[0]) : null;
        } catch (error) {
            console.error('Error updating connection status:', error);
            throw error;
        }
    }

    static async getConnectionStats() {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_connections,
                    SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as active_connections,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_connections,
                    COUNT(CASE WHEN created_at >= DATEADD(month, -1, GETDATE()) THEN 1 END) as new_connections_this_month
                FROM Connections
            `;
            
            const result = await executeQuery(query);
            return result.recordset[0];
        } catch (error) {
            console.error('Error getting connection stats:', error);
            throw error;
        }
    }

    static async checkExistingConnection(mentorId, menteeId) {
        try {
            const query = `
                SELECT * FROM Connections 
                WHERE mentor_id = '${mentorId}' AND mentee_id = '${menteeId}'
            `;
            
            const result = await executeQuery(query);
            return result.recordset.length > 0 ? new Connection(result.recordset[0]) : null;
        } catch (error) {
            console.error('Error checking existing connection:', error);
            throw error;
        }
    }

    static async getConnectionsWithDetails(userId) {
        try {
            const query = `
                SELECT c.*,
                       mentor_profile.name as mentor_name,
                       mentor_profile.profile_image_url as mentor_avatar,
                       mentor_profile.location as mentor_location,
                       mentor_profile.experience as mentor_experience,
                       mentor_profile.bio as mentor_bio,
                       mentee_profile.name as mentee_name,
                       mentee_profile.profile_image_url as mentee_avatar,
                       mentee_profile.location as mentee_location,
                       mentee_profile.experience as mentee_experience,
                       mentee_profile.bio as mentee_bio,
                       (SELECT COUNT(*) FROM Sessions s WHERE s.connection_id = c.connection_id AND s.status = 'completed') as total_sessions,
                       (SELECT COUNT(*) FROM Sessions s WHERE s.connection_id = c.connection_id AND s.status = 'scheduled' AND s.scheduled_at > GETDATE()) as upcoming_sessions,
                       (SELECT AVG(CAST(rating as FLOAT)) FROM Reviews r WHERE r.connection_id = c.connection_id) as average_rating
                FROM Connections c
                LEFT JOIN UserProfiles mentor_profile ON c.mentor_id = mentor_profile.user_id
                LEFT JOIN UserProfiles mentee_profile ON c.mentee_id = mentee_profile.user_id
                WHERE (c.mentor_id = '${userId}' OR c.mentee_id = '${userId}') AND c.status = 'accepted'
                ORDER BY c.updated_at DESC
            `;
            
            const result = await executeQuery(query);
            return result.recordset;
        } catch (error) {
            console.error('Error getting connections with details:', error);
            throw error;
        }
    }

    /**
     * Returns how many accepted mentees a mentor currently has.
     * Used to enforce the 3-mentee capacity rule.
     */
    static async getMenteeCount(mentorId) {
        try {
            const result = await executeQuery(`
                SELECT COUNT(*) as mentee_count
                FROM Connections
                WHERE mentor_id = '${mentorId}' AND status = 'accepted'
            `);
            return result.recordset[0]?.mentee_count ?? 0;
        } catch (error) {
            console.error('Error getting mentee count:', error);
            throw error;
        }
    }

    /**
     * Check if a mentor is at full capacity (3 accepted mentees).
     */
    static async isMentorAtCapacity(mentorId) {
        const count = await this.getMenteeCount(mentorId);
        return count >= Connection.MENTOR_CAPACITY;
    }
}

/** Maximum number of accepted mentees a mentor can have at one time */
Connection.MENTOR_CAPACITY = 3;

export default Connection;
import { executeQuery } from '../config/database.js';

/**
 * Connection model
 * Real DB schema:
 *   connections: id, requester_id (users.id), expert_id (experts.id), message, status, created_at, updated_at
 */
class Connection {
    constructor(data) {
        // Expose both naming conventions for compatibility
        this.id            = data.id || data.connection_id;
        this.connection_id = this.id;
        this.expert_id     = data.expert_id;
        this.mentor_id     = data.expert_id;   // alias
        this.requester_id  = data.requester_id;
        this.mentee_id     = data.requester_id; // alias
        this.message       = data.message;
        this.status        = data.status;
        this.created_at    = data.created_at;
        this.updated_at    = data.updated_at;
    }

    /**
     * connectionData.mentor_id = experts.id (the expert being connected to)
     * connectionData.mentee_id = users.id   (the requesting user)
     */
    static async create(connectionData) {
        try {
            const expertId    = connectionData.expert_id || connectionData.mentor_id;
            const requesterId = connectionData.requester_id || connectionData.mentee_id;
            const message     = connectionData.message || 'I would like to connect with you.';

            const query = `
                INSERT INTO connections (requester_id, expert_id, message, status, created_at, updated_at)
                OUTPUT INSERTED.*
                VALUES ('${requesterId}', '${expertId}',
                        '${message.replace(/'/g, "''")}',
                        'pending', GETDATE(), GETDATE())
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
            const query = `SELECT * FROM connections WHERE id = '${connectionId}'`;
            const result = await executeQuery(query);
            return result.recordset.length > 0 ? new Connection(result.recordset[0]) : null;
        } catch (error) {
            console.error('Error finding connection by ID:', error);
            throw error;
        }
    }

    /**
     * Get all connections for a user (as mentor via experts.user_id or as mentee via requester_id)
     */
    static async getUserConnections(userId) {
        try {
            const query = `
                SELECT c.*
                FROM connections c
                LEFT JOIN experts e ON c.expert_id = e.id
                WHERE c.requester_id = '${userId}' OR e.user_id = '${userId}'
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
                UPDATE connections
                SET status = '${status}', updated_at = GETDATE()
                OUTPUT INSERTED.*
                WHERE id = '${connectionId}'
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
                FROM connections
            `;
            const result = await executeQuery(query);
            return result.recordset[0];
        } catch (error) {
            console.error('Error getting connection stats:', error);
            throw error;
        }
    }

    /**
     * Check for an existing connection between a mentee and an expert
     * expertId = experts.id, menteeUserId = users.id
     */
    static async checkExistingConnection(expertId, menteeUserId) {
        try {
            const query = `
                SELECT * FROM connections
                WHERE expert_id = '${expertId}' AND requester_id = '${menteeUserId}'
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
                SELECT
                    c.*,
                    e.name as mentor_name,
                    e.avatar_url as mentor_avatar,
                    e.location as mentor_location,
                    e.bio as mentor_bio,
                    e.title as mentor_title,
                    u_req.name as mentee_name,
                    u_req.location as mentee_location,
                    u_req.bio as mentee_bio,
                    e.user_id as mentor_user_id
                FROM connections c
                LEFT JOIN experts e ON c.expert_id = e.id
                LEFT JOIN users u_req ON c.requester_id = u_req.id
                WHERE c.requester_id = '${userId}'
                   OR e.user_id = '${userId}'
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
     * Count accepted mentees for a given expert (experts.id)
     */
    static async getMenteeCount(expertId) {
        try {
            const result = await executeQuery(`
                SELECT COUNT(*) as mentee_count
                FROM connections
                WHERE expert_id = '${expertId}' AND status = 'accepted'
            `);
            return result.recordset[0]?.mentee_count ?? 0;
        } catch (error) {
            console.error('Error getting mentee count:', error);
            throw error;
        }
    }

    static async isMentorAtCapacity(expertId) {
        const count = await Connection.getMenteeCount(expertId);
        return count >= Connection.MENTOR_CAPACITY;
    }
}

Connection.MENTOR_CAPACITY = 3;

export default Connection;

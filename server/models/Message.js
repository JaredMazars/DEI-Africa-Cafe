import { executeQuery } from '../config/database.js';

class Message {
    constructor(data) {
        this.message_id = data.message_id;
        this.connection_id = data.connection_id;
        this.sender_id = data.sender_id;
        this.message_text = data.message_text;
        this.is_read = data.is_read;
        this.created_at = data.created_at;
    }

    static async create(messageData) {
        try {
            const query = `
                INSERT INTO Messages (connection_id, sender_id, message_text, is_read, created_at)
                OUTPUT INSERTED.*
                VALUES ('${messageData.connection_id}', '${messageData.sender_id}', 
                        '${messageData.message_text.replace(/'/g, "''")}', 0, GETDATE())
            `;
            
            const result = await executeQuery(query);
            return new Message(result.recordset[0]);
        } catch (error) {
            console.error('Error creating message:', error);
            throw error;
        }
    }

    static async getConnectionMessages(connectionId) {
        try {
            const query = `
                SELECT m.*, up.name as sender_name, up.profile_image_url as sender_avatar
                FROM Messages m
                LEFT JOIN users up ON m.sender_id = up.id
                WHERE m.connection_id = '${connectionId}'
                ORDER BY m.created_at ASC
            `;
            
            const result = await executeQuery(query);
            return result.recordset.map(message => new Message(message));
        } catch (error) {
            console.error('Error getting connection messages:', error);
            throw error;
        }
    }

    static async markAsRead(messageId) {
        try {
            const query = `UPDATE Messages SET is_read = 1 WHERE message_id = '${messageId}'`;
            await executeQuery(query);
        } catch (error) {
            console.error('Error marking message as read:', error);
            throw error;
        }
    }

    static async getUnreadCount(userId) {
        try {
            const query = `
                SELECT COUNT(*) as unread_count
                FROM Messages m
                INNER JOIN Connections c ON m.connection_id = c.connection_id
                WHERE (c.mentor_id = '${userId}' OR c.mentee_id = '${userId}')
                AND m.sender_id != '${userId}'
                AND m.is_read = 0
            `;
            
            const result = await executeQuery(query);
            return result.recordset[0].unread_count;
        } catch (error) {
            console.error('Error getting unread count:', error);
            throw error;
        }
    }

    static async getRecentMessages(userId, limit = 10) {
        try {
            const query = `
                SELECT TOP ${limit} m.*, 
                       up.name as sender_name, 
                       up.profile_image_url as sender_avatar,
                       c.mentor_id, c.mentee_id
                FROM Messages m
                INNER JOIN Connections c ON m.connection_id = c.connection_id
                LEFT JOIN users up ON m.sender_id = up.id
                WHERE (c.mentor_id = '${userId}' OR c.mentee_id = '${userId}')
                AND m.sender_id != '${userId}'
                ORDER BY m.created_at DESC
            `;
            
            const result = await executeQuery(query);
            return result.recordset.map(message => new Message(message));
        } catch (error) {
            console.error('Error getting recent messages:', error);
            throw error;
        }
    }
}

export default Message;
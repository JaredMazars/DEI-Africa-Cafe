import { executeQuery } from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
    constructor(data) {
        // DB column is 'id'; expose as both .id and .user_id for compatibility
        this.id = data.id || data.user_id;
        this.user_id = this.id;
        this.email = data.email;
        this.name = data.name;
        this.password_hash = data.password_hash;
        this.role = data.role;
        this.is_mentor = data.is_mentor;
        this.is_mentee = data.is_mentee;
        this.is_active = data.is_active;
        this.location = data.location;
        this.bio = data.bio;
        this.experience = data.experience;
        this.availability = data.availability;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static async create(userData) {
        try {
            const hashedPassword = await bcrypt.hash(userData.password, 12);
            const role = userData.role || 'mentee';
            const query = `
                INSERT INTO users (email, password_hash, name, role, is_mentor, is_mentee, is_active, created_at, updated_at)
                OUTPUT INSERTED.*
                VALUES ('${userData.email}', '${hashedPassword}',
                        ${userData.name ? `'${userData.name.replace(/'/g, "''")}'` : 'NULL'},
                        '${role}',
                        ${role === 'mentor' || role === 'both' ? 1 : 0},
                        ${role === 'mentee' || role === 'both' ? 1 : 0},
                        1, GETDATE(), GETDATE())
            `;
            const result = await executeQuery(query);
            return new User(result.recordset[0]);
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    static async findByEmail(email) {
        try {
            const query = `SELECT * FROM users WHERE email = '${email}' AND is_active = 1`;
            const result = await executeQuery(query);
            return result.recordset.length > 0 ? new User(result.recordset[0]) : null;
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    }

    static async findById(userId) {
        try {
            const query = `SELECT * FROM users WHERE id = '${userId}' AND is_active = 1`;
            const result = await executeQuery(query);
            return result.recordset.length > 0 ? new User(result.recordset[0]) : null;
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw error;
        }
    }

    static async getAll() {
        try {
            const query = `
                SELECT * FROM users
                WHERE is_active = 1
                ORDER BY created_at DESC
            `;
            
            const result = await executeQuery(query);
            return result.recordset.map(user => new User(user));
        } catch (error) {
            console.error('Error getting all users:', error);
            throw error;
        }
    }

    static async updateLastLogin(userId) {
        try {
            const query = `UPDATE users SET updated_at = GETDATE() WHERE id = '${userId}'`;
            await executeQuery(query);
        } catch (error) {
            console.error('Error updating last login:', error);
            throw error;
        }
    }

    async validatePassword(password) {
        return await bcrypt.compare(password, this.password_hash);
    }

    static async getUserStats() {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_users,
                    SUM(CASE WHEN role = 'mentor' OR is_mentor = 1 THEN 1 ELSE 0 END) as total_mentors,
                    SUM(CASE WHEN role = 'mentee' OR is_mentee = 1 THEN 1 ELSE 0 END) as total_mentees,
                    COUNT(CASE WHEN created_at >= DATEADD(month, -1, GETDATE()) THEN 1 END) as new_users_this_month
                FROM users
                WHERE is_active = 1
            `;
            
            const result = await executeQuery(query);
            return result.recordset[0];
        } catch (error) {
            console.error('Error getting user stats:', error);
            throw error;
        }
    }

    static async updateStatus(userId, isActive) {
        try {
            const query = `
                UPDATE users 
                SET is_active = ${isActive ? 1 : 0}, updated_at = GETDATE() 
                WHERE id = '${userId}'
            `;
            await executeQuery(query);
        } catch (error) {
            console.error('Error updating user status:', error);
            throw error;
        }
    }
}

export default User;
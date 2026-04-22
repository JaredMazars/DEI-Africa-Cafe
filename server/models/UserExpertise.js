import { executeQuery } from '../config/database.js';

class UserExpertise {
    constructor(data) {
        this.expertise_id = data.expertise_id;
        this.user_id = data.user_id;
        this.expertise = data.expertise;
        this.created_at = data.created_at;
    }

    static async create(userId, expertiseArray) {
        try {
            const values = expertiseArray.map(expertise => 
                `('${userId}', '${expertise.replace(/'/g, "''")}', GETDATE())`
            ).join(', ');
            
            const query = `
                INSERT INTO user_expertise (user_id, expertise, created_at)
                VALUES ${values}
            `;
            
            await executeQuery(query);
            return true;
        } catch (error) {
            console.error('Error creating user expertise:', error);
            throw error;
        }
    }

    static async findByUserId(userId) {
        try {
            const query = `SELECT * FROM user_expertise WHERE user_id = '${userId}'`;
            const result = await executeQuery(query);
            
            return result.recordset.map(expertise => new UserExpertise(expertise));
        } catch (error) {
            console.error('Error finding expertise by user ID:', error);
            throw error;
        }
    }

    static async deleteByUserId(userId) {
        try {
            const query = `DELETE FROM user_expertise WHERE user_id = '${userId}'`;
            await executeQuery(query);
        } catch (error) {
            console.error('Error deleting user expertise:', error);
            throw error;
        }
    }

    static async updateUserExpertise(userId, expertiseArray) {
        try {
            // Delete existing expertise
            await this.deleteByUserId(userId);
            
            // Insert new expertise
            if (expertiseArray && expertiseArray.length > 0) {
                await this.create(userId, expertiseArray);
            }
            
            return true;
        } catch (error) {
            console.error('Error updating user expertise:', error);
            throw error;
        }
    }
}

export default UserExpertise;
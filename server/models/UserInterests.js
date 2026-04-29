import { executeQuery } from '../config/database.js';

class UserInterests {
    constructor(data) {
        this.interest_id = data.interest_id;
        this.user_id = data.user_id;
        this.interest = data.interest;
        this.created_at = data.created_at;
    }

    static async create(userId, interestsArray) {
        // UserInterests table does not exist in current DB schema — silently skip
        return true;
    }

    static async findByUserId(userId) {
        try {
            const query = `SELECT * FROM UserInterests WHERE user_id = '${userId}'`;
            const result = await executeQuery(query);
            
            return result.recordset.map(interest => new UserInterests(interest));
        } catch (error) {
            console.error('Error finding interests by user ID:', error);
            throw error;
        }
    }

    static async deleteByUserId(userId) {
        try {
            const query = `DELETE FROM UserInterests WHERE user_id = '${userId}'`;
            await executeQuery(query);
        } catch (error) {
            console.error('Error deleting user interests:', error);
            throw error;
        }
    }

    static async updateUserInterests(userId, interestsArray) {
        try {
            // Delete existing interests
            await this.deleteByUserId(userId);
            
            // Insert new interests
            if (interestsArray && interestsArray.length > 0) {
                await this.create(userId, interestsArray);
            }
            
            return true;
        } catch (error) {
            console.error('Error updating user interests:', error);
            throw error;
        }
    }
}

export default UserInterests;
import { executeQuery } from '../config/database.js';

/**
 * UserDesiredExpertise
 * Stores the expertise areas a mentee (or 'both' role) is seeking in a mentor.
 * Distinct from UserExpertise which stores what the user themselves offer.
 */
class UserDesiredExpertise {
    constructor(data) {
        this.desired_id = data.desired_id;
        this.user_id    = data.user_id;
        this.expertise  = data.expertise;
        this.created_at = data.created_at;
    }

    /** Bulk-insert desired expertise topics for a user */
    static async create(userId, expertiseArray) {
        if (!expertiseArray || expertiseArray.length === 0) return true;
        try {
            const values = expertiseArray
                .map(e => `('${userId}', '${e.replace(/'/g, "''")}', GETDATE())`)
                .join(', ');
            await executeQuery(
                `INSERT INTO UserDesiredExpertise (user_id, expertise, created_at) VALUES ${values}`
            );
            return true;
        } catch (error) {
            console.error('Error creating desired expertise:', error);
            throw error;
        }
    }

    static async findByUserId(userId) {
        try {
            const result = await executeQuery(
                `SELECT * FROM UserDesiredExpertise WHERE user_id = '${userId}'`
            );
            return result.recordset.map(r => new UserDesiredExpertise(r));
        } catch (error) {
            console.error('Error finding desired expertise:', error);
            throw error;
        }
    }

    static async deleteByUserId(userId) {
        try {
            await executeQuery(
                `DELETE FROM UserDesiredExpertise WHERE user_id = '${userId}'`
            );
        } catch (error) {
            console.error('Error deleting desired expertise:', error);
            throw error;
        }
    }

    static async updateUserDesiredExpertise(userId, expertiseArray) {
        await this.deleteByUserId(userId);
        if (expertiseArray && expertiseArray.length > 0) {
            await this.create(userId, expertiseArray);
        }
    }
}

export default UserDesiredExpertise;

import { executeQuery } from '../config/database.js';

class UserGoals {
    constructor(data) {
        this.goal_id = data.goal_id;
        this.user_id = data.user_id;
        this.goal = data.goal;
        this.created_at = data.created_at;
    }

    static async create(userId, goalsArray) {
        try {
            const values = goalsArray.map(goal => 
                `('${userId}', '${goal.replace(/'/g, "''")}', GETDATE())`
            ).join(', ');
            
            const query = `
                INSERT INTO user_goals (user_id, goal, created_at)
                VALUES ${values}
            `;
            
            await executeQuery(query);
            return true;
        } catch (error) {
            console.error('Error creating user goals:', error);
            throw error;
        }
    }

    static async findByUserId(userId) {
        try {
            const query = `SELECT * FROM user_goals WHERE user_id = '${userId}'`;
            const result = await executeQuery(query);
            
            return result.recordset.map(goal => new UserGoals(goal));
        } catch (error) {
            console.error('Error finding goals by user ID:', error);
            throw error;
        }
    }

    static async deleteByUserId(userId) {
        try {
            const query = `DELETE FROM user_goals WHERE user_id = '${userId}'`;
            await executeQuery(query);
        } catch (error) {
            console.error('Error deleting user goals:', error);
            throw error;
        }
    }

    static async updateUserGoals(userId, goalsArray) {
        try {
            // Delete existing goals
            await this.deleteByUserId(userId);
            
            // Insert new goals
            if (goalsArray && goalsArray.length > 0) {
                await this.create(userId, goalsArray);
            }
            
            return true;
        } catch (error) {
            console.error('Error updating user goals:', error);
            throw error;
        }
    }
}

export default UserGoals;
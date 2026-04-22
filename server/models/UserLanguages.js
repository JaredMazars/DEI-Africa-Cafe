import { executeQuery } from '../config/database.js';

class UserLanguages {
    constructor(data) {
        this.language_id = data.language_id;
        this.user_id = data.user_id;
        this.language = data.language;
        this.created_at = data.created_at;
    }

    static async create(userId, languagesArray) {
        try {
            const values = languagesArray.map(language => 
                `('${userId}', '${language.replace(/'/g, "''")}', GETDATE())`
            ).join(', ');
            
            const query = `
                INSERT INTO user_languages (user_id, language, created_at)
                VALUES ${values}
            `;
            
            await executeQuery(query);
            return true;
        } catch (error) {
            console.error('Error creating user languages:', error);
            throw error;
        }
    }

    static async findByUserId(userId) {
        try {
            const query = `SELECT * FROM user_languages WHERE user_id = '${userId}'`;
            const result = await executeQuery(query);
            
            return result.recordset.map(language => new UserLanguages(language));
        } catch (error) {
            console.error('Error finding languages by user ID:', error);
            throw error;
        }
    }

    static async deleteByUserId(userId) {
        try {
            const query = `DELETE FROM user_languages WHERE user_id = '${userId}'`;
            await executeQuery(query);
        } catch (error) {
            console.error('Error deleting user languages:', error);
            throw error;
        }
    }

    static async updateUserLanguages(userId, languagesArray) {
        try {
            // Delete existing languages
            await this.deleteByUserId(userId);
            
            // Insert new languages
            if (languagesArray && languagesArray.length > 0) {
                await this.create(userId, languagesArray);
            }
            
            return true;
        } catch (error) {
            console.error('Error updating user languages:', error);
            throw error;
        }
    }
}

export default UserLanguages;
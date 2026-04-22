import { executeQuery } from '../config/database.js';

class Expert {
    constructor(data) {
        this.expert_id = data.expert_id;
        this.user_id = data.user_id;
        this.specializations = data.specializations;
        this.industries = data.industries;
        this.past_clients = data.past_clients;
        this.hourly_rate = data.hourly_rate;
        this.response_time = data.response_time;
        this.is_verified = data.is_verified;
        this.is_available = data.is_available;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static async create(expertData) {
        try {
            const query = `
                INSERT INTO Experts (user_id, specializations, industries, past_clients, hourly_rate, 
                                   response_time, is_verified, is_available, created_at, updated_at)
                OUTPUT INSERTED.*
                VALUES ('${expertData.user_id}', '${expertData.specializations}', '${expertData.industries}', 
                        '${expertData.past_clients}', ${expertData.hourly_rate}, '${expertData.response_time}', 
                        ${expertData.is_verified ? 1 : 0}, ${expertData.is_available ? 1 : 0}, GETDATE(), GETDATE())
            `;
            
            const result = await executeQuery(query);
            return new Expert(result.recordset[0]);
        } catch (error) {
            console.error('Error creating expert:', error);
            throw error;
        }
    }

    static async getAllWithProfiles() {
        try {
            const query = `
                SELECT e.*, up.name, up.location, up.bio, up.profile_image_url, up.experience,
                       (SELECT AVG(CAST(rating as FLOAT)) FROM Reviews r WHERE r.reviewee_id = e.user_id) as average_rating,
                       (SELECT COUNT(*) FROM Reviews r WHERE r.reviewee_id = e.user_id) as review_count
                FROM Experts e
                INNER JOIN users up ON e.user_id = up.id
                WHERE e.is_verified = 1
                ORDER BY e.created_at DESC
            `;
            
            const result = await executeQuery(query);
            return result.recordset.map(expert => new Expert(expert));
        } catch (error) {
            console.error('Error getting all experts with profiles:', error);
            throw error;
        }
    }

    static async findById(expertId) {
        try {
            const query = `
                SELECT e.*, up.name, up.location, up.bio, up.profile_image_url, up.experience
                FROM Experts e
                INNER JOIN users up ON e.user_id = up.id
                WHERE e.expert_id = '${expertId}'
            `;
            
            const result = await executeQuery(query);
            return result.recordset.length > 0 ? new Expert(result.recordset[0]) : null;
        } catch (error) {
            console.error('Error finding expert by ID:', error);
            throw error;
        }
    }

    static async updateAvailability(expertId, isAvailable) {
        try {
            const query = `
                UPDATE Experts 
                SET is_available = ${isAvailable ? 1 : 0}, updated_at = GETDATE()
                WHERE expert_id = '${expertId}'
            `;
            
            await executeQuery(query);
        } catch (error) {
            console.error('Error updating expert availability:', error);
            throw error;
        }
    }
}

export default Expert;
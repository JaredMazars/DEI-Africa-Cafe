import { executeQuery } from '../config/database.js';

class Review {
    constructor(data) {
        this.review_id = data.review_id;
        this.connection_id = data.connection_id;
        this.reviewer_id = data.reviewer_id;
        this.reviewee_id = data.reviewee_id;
        this.rating = data.rating;
        this.review_text = data.review_text;
        this.created_at = data.created_at;
    }

    static async create(reviewData) {
        try {
            const query = `
                INSERT INTO Reviews (connection_id, reviewer_id, reviewee_id, rating, review_text, created_at)
                OUTPUT INSERTED.*
                VALUES ('${reviewData.connection_id}', '${reviewData.reviewer_id}', 
                        '${reviewData.reviewee_id}', ${reviewData.rating}, 
                        ${reviewData.review_text ? `'${reviewData.review_text.replace(/'/g, "''")}'` : 'NULL'}, 
                        GETDATE())
            `;
            
            const result = await executeQuery(query);
            return new Review(result.recordset[0]);
        } catch (error) {
            console.error('Error creating review:', error);
            throw error;
        }
    }

    static async getUserReviews(userId) {
        try {
            const query = `
                SELECT r.*, 
                       reviewer_profile.name as reviewer_name,
                       reviewer_profile.profile_image_url as reviewer_avatar
                FROM Reviews r
                LEFT JOIN users reviewer_profile ON r.reviewer_id = reviewer_profile.id
                WHERE r.reviewee_id = '${userId}'
                ORDER BY r.created_at DESC
            `;
            
            const result = await executeQuery(query);
            return result.recordset.map(review => new Review(review));
        } catch (error) {
            console.error('Error getting user reviews:', error);
            throw error;
        }
    }

    static async getUserAverageRating(userId) {
        try {
            const query = `
                SELECT AVG(CAST(rating as FLOAT)) as average_rating, COUNT(*) as review_count
                FROM Reviews 
                WHERE reviewee_id = '${userId}'
            `;
            
            const result = await executeQuery(query);
            return result.recordset[0];
        } catch (error) {
            console.error('Error getting user average rating:', error);
            throw error;
        }
    }

    static async getRecentReviews(userId, limit = 5) {
        try {
            const query = `
                SELECT TOP ${limit} r.*, 
                       reviewer_profile.name as reviewer_name,
                       reviewer_profile.profile_image_url as reviewer_avatar
                FROM Reviews r
                LEFT JOIN users reviewer_profile ON r.reviewer_id = reviewer_profile.id
                WHERE r.reviewee_id = '${userId}'
                ORDER BY r.created_at DESC
            `;
            
            const result = await executeQuery(query);
            return result.recordset.map(review => new Review(review));
        } catch (error) {
            console.error('Error getting recent reviews:', error);
            throw error;
        }
    }
}

export default Review;
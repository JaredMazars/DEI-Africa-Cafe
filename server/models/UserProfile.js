import { executeQuery } from '../config/database.js';

class UserProfile {
    constructor(data) {
        this.profile_id = data.profile_id;
        this.user_id = data.user_id;
        this.role = data.role;
        this.name = data.name;
        this.location = data.location;
        this.experience = data.experience;
        this.availability = data.availability;
        this.bio = data.bio;
        this.profile_image_url = data.profile_image_url;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static async create(profileData) {
        try {
            const canMentor     = profileData.can_mentor     ?? (profileData.role === 'mentor' || profileData.role === 'both' ? 1 : 0);
            const canBeMentored = profileData.can_be_mentored ?? (profileData.role === 'mentee' || profileData.role === 'both' ? 1 : 0);

            const query = `
                INSERT INTO UserProfiles (user_id, role, name, location, experience, availability, bio, profile_image_url, can_mentor, can_be_mentored, created_at, updated_at)
                OUTPUT INSERTED.*
                VALUES ('${profileData.user_id}', '${profileData.role}', '${profileData.name.replace(/'/g, "''")}', 
                        '${profileData.location}', '${profileData.experience}', '${profileData.availability}', 
                        ${profileData.bio ? `'${profileData.bio.replace(/'/g, "''")}'` : 'NULL'}, 
                        ${profileData.profile_image_url ? `'${profileData.profile_image_url}'` : 'NULL'}, 
                        ${canMentor}, ${canBeMentored},
                        GETDATE(), GETDATE())
            `;
            
            const result = await executeQuery(query);
            return new UserProfile(result.recordset[0]);
        } catch (error) {
            console.error('Error creating user profile:', error);
            throw error;
        }
    }

    static async findByUserId(userId) {
        try {
            const query = `SELECT * FROM UserProfiles WHERE user_id = '${userId}'`;
            const result = await executeQuery(query);
            
            return result.recordset.length > 0 ? new UserProfile(result.recordset[0]) : null;
        } catch (error) {
            console.error('Error finding profile by user ID:', error);
            throw error;
        }
    }

    static async update(userId, updateData) {
        try {
            const query = `
                UPDATE UserProfiles 
                SET name = '${updateData.name}', 
                    location = '${updateData.location}', 
                    experience = '${updateData.experience}', 
                    availability = '${updateData.availability}', 
                    bio = ${updateData.bio ? `'${updateData.bio.replace(/'/g, "''")}'` : 'NULL'}, 
                    profile_image_url = ${updateData.profile_image_url ? `'${updateData.profile_image_url}'` : 'NULL'},
                    updated_at = GETDATE()
                OUTPUT INSERTED.*
                WHERE user_id = '${userId}'
            `;
            
            const result = await executeQuery(query);
            return result.recordset.length > 0 ? new UserProfile(result.recordset[0]) : null;
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    }

    static async getMentorsByExpertise(expertise) {
        try {
            const query = `
                SELECT DISTINCT up.*, ue.expertise
                FROM UserProfiles up
                INNER JOIN UserExpertise ue ON up.user_id = ue.user_id
                WHERE up.role = 'mentor' AND ue.expertise LIKE '%${expertise}%'
                ORDER BY up.created_at DESC
            `;
            
            const result = await executeQuery(query);
            return result.recordset.map(profile => new UserProfile(profile));
        } catch (error) {
            console.error('Error getting mentors by expertise:', error);
            throw error;
        }
    }

    static async getMenteesByInterests(interest) {
        try {
            const query = `
                SELECT DISTINCT up.*, ui.interest
                FROM UserProfiles up
                INNER JOIN UserInterests ui ON up.user_id = ui.user_id
                WHERE up.role = 'mentee' AND ui.interest LIKE '%${interest}%'
                ORDER BY up.created_at DESC
            `;
            
            const result = await executeQuery(query);
            return result.recordset.map(profile => new UserProfile(profile));
        } catch (error) {
            console.error('Error getting mentees by interests:', error);
            throw error;
        }
    }

    static async getAllMentors() {
        try {
            // Include role='mentor' and role='both'; include active mentee count for capacity display
            const query = `
                SELECT up.*,
                       STRING_AGG(DISTINCT ue.expertise, ', ')  as expertise_list,
                       STRING_AGG(DISTINCT ui.interest, ', ')   as interests_list,
                       STRING_AGG(DISTINCT ul.language, ', ')   as languages_list,
                       ISNULL(mc.active_mentees, 0)             as active_mentee_count,
                       CASE WHEN ISNULL(mc.active_mentees, 0) >= 3 THEN 1 ELSE 0 END as at_capacity
                FROM UserProfiles up
                LEFT JOIN UserExpertise ue  ON up.user_id = ue.user_id
                LEFT JOIN UserInterests ui  ON up.user_id = ui.user_id
                LEFT JOIN UserLanguages ul  ON up.user_id = ul.user_id
                LEFT JOIN (
                    SELECT mentor_id, COUNT(*) as active_mentees
                    FROM Connections
                    WHERE status = 'accepted'
                    GROUP BY mentor_id
                ) mc ON up.user_id = mc.mentor_id
                WHERE up.role IN ('mentor', 'both') OR up.can_mentor = 1
                GROUP BY up.profile_id, up.user_id, up.role, up.name, up.location,
                         up.experience, up.availability, up.bio, up.profile_image_url,
                         up.created_at, up.updated_at,
                         up.can_mentor, up.can_be_mentored, mc.active_mentees
                ORDER BY mc.active_mentees ASC, up.created_at DESC
            `;
            
            const result = await executeQuery(query);
            return result.recordset;
        } catch (error) {
            console.error('Error getting all mentors:', error);
            throw error;
        }
    }

    /**
     * Get mentors ranked by match score for a given mentee.
     * Match score = number of overlapping expertise areas between
     * the mentee's desired_expertise and the mentor's UserExpertise.
     * Mentors at capacity (3 active mentees) are excluded.
     */
    static async getMatchedMentorsForUser(userId) {
        try {
            const query = `
                SELECT up.*,
                       STRING_AGG(DISTINCT ue.expertise,  ', ') as expertise_list,
                       STRING_AGG(DISTINCT ui.interest,   ', ') as interests_list,
                       STRING_AGG(DISTINCT ul.language,   ', ') as languages_list,
                       ISNULL(mc.active_mentees, 0)             as active_mentee_count,
                       CASE WHEN ISNULL(mc.active_mentees, 0) >= 3 THEN 1 ELSE 0 END as at_capacity,
                       -- Count how many of the user's desired_expertise areas overlap
                       ISNULL((
                           SELECT COUNT(*)
                           FROM UserDesiredExpertise ude
                           WHERE ude.user_id = '${userId}'
                             AND EXISTS (
                                 SELECT 1 FROM UserExpertise me2
                                 WHERE me2.user_id = up.user_id
                                   AND me2.expertise = ude.expertise
                             )
                       ), 0) as match_score
                FROM UserProfiles up
                LEFT JOIN UserExpertise ue  ON up.user_id = ue.user_id
                LEFT JOIN UserInterests ui  ON up.user_id = ui.user_id
                LEFT JOIN UserLanguages ul  ON up.user_id = ul.user_id
                LEFT JOIN (
                    SELECT mentor_id, COUNT(*) as active_mentees
                    FROM Connections WHERE status = 'accepted'
                    GROUP BY mentor_id
                ) mc ON up.user_id = mc.mentor_id
                WHERE (up.role IN ('mentor', 'both') OR up.can_mentor = 1)
                  AND up.user_id <> '${userId}'
                  AND ISNULL(mc.active_mentees, 0) < 3
                GROUP BY up.profile_id, up.user_id, up.role, up.name, up.location,
                         up.experience, up.availability, up.bio, up.profile_image_url,
                         up.created_at, up.updated_at,
                         up.can_mentor, up.can_be_mentored, mc.active_mentees
                ORDER BY match_score DESC, mc.active_mentees ASC
            `;
            const result = await executeQuery(query);
            return result.recordset;
        } catch (error) {
            console.error('Error getting matched mentors:', error);
            throw error;
        }
    }

    static async getAllMentees() {
        try {
            const query = `
                SELECT up.*, 
                       STRING_AGG(ue.expertise, ', ') as expertise_list,
                       STRING_AGG(ui.interest, ', ') as interests_list,
                       STRING_AGG(ul.language, ', ') as languages_list
                FROM UserProfiles up
                LEFT JOIN UserExpertise ue ON up.user_id = ue.user_id
                LEFT JOIN UserInterests ui ON up.user_id = ui.user_id
                LEFT JOIN UserLanguages ul ON up.user_id = ul.user_id
                WHERE up.role = 'mentee'
                GROUP BY up.profile_id, up.user_id, up.role, up.name, up.location, 
                         up.experience, up.availability, up.bio, up.profile_image_url, 
                         up.created_at, up.updated_at
                ORDER BY up.created_at DESC
            `;
            
            const result = await executeQuery(query);
            return result.recordset.map(profile => new UserProfile(profile));
        } catch (error) {
            console.error('Error getting all mentees:', error);
            throw error;
        }
    }
}

export default UserProfile;
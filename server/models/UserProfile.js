import { executeQuery } from '../config/database.js';

/**
 * UserProfile
 *
 * Real Azure SQL schema:
 *   users:                 id, name, email, bio, location, role, is_mentor, is_mentee, experience, availability, avatar_url
 *   experts:               id, user_id (→ users.id), name, title, bio, avatar_url, location, experience_years, is_available
 *   expert_expertise:      id, expert_id (→ experts.id), expertise
 *   expert_languages:      id, expert_id, language
 *   user_desired_expertise: id, user_id (→ users.id), expertise
 *   user_expertise:        id, user_id (→ users.id), expertise  (for non-expert mentors)
 *   connections:           id, requester_id (users.id), expert_id (experts.id), status
 *
 * When a user registers as mentor/both, we also insert an experts row, so they
 * appear in the matching pool.
 */
class UserProfile {
    constructor(data) {
        this.id            = data.id || data.user_id;
        this.user_id       = this.id;
        this.expert_id     = data.expert_id;
        this.name          = data.name;
        this.role          = data.role;
        this.location      = data.location;
        this.bio           = data.bio;
        this.experience    = data.experience;
        this.availability  = data.availability;
        this.is_mentor     = data.is_mentor;
        this.is_mentee     = data.is_mentee;
        this.profile_image_url = data.avatar_url || data.profile_image_url;
        this.created_at    = data.created_at;
        this.updated_at    = data.updated_at;
    }

    /** s(q) helper — single-quote escape */
    static sq(v) { return v ? `'${String(v).replace(/'/g, "''")}'` : 'NULL'; }

    /**
     * "Create" profile:
     * 1. UPDATE the users row with onboarding data.
     * 2. If mentor/both, ensure an experts row exists for this user.
     */
    static async create(profileData) {
        try {
            const role     = profileData.role || 'mentee';
            const isMentor = (role === 'mentor' || role === 'both') ? 1 : 0;
            const isMentee = (role === 'mentee' || role === 'both') ? 1 : 0;
            const userId   = profileData.user_id;

            // 1. UPDATE users
            await executeQuery(`
                UPDATE users SET
                    name         = ${UserProfile.sq(profileData.name)},
                    role         = '${role}',
                    is_mentor    = ${isMentor},
                    is_mentee    = ${isMentee},
                    location     = ${UserProfile.sq(profileData.location)},
                    bio          = ${UserProfile.sq(profileData.bio)},
                    experience   = ${UserProfile.sq(profileData.experience)},
                    availability = ${UserProfile.sq(profileData.availability)},
                    updated_at   = GETDATE()
                WHERE id = '${userId}'
            `);

            // 2. If mentor/both, ensure an experts entry
            if (isMentor) {
                const existingExpert = await executeQuery(
                    `SELECT id FROM experts WHERE user_id = '${userId}'`
                );
                if (existingExpert.recordset.length === 0) {
                    const expertTitle   = UserProfile.sq(profileData.title    || profileData.experience || 'Mentor');
                    const expertCompany = UserProfile.sq(profileData.company  || 'Forvis Mazars');
                    const expertCountry = UserProfile.sq(profileData.country  || (profileData.location?.split(',').pop()?.trim()) || 'South Africa');
                    await executeQuery(`
                        INSERT INTO experts (user_id, name, title, company, bio, location, country, is_available, created_at, updated_at)
                        VALUES (
                            '${userId}',
                            ${UserProfile.sq(profileData.name)},
                            ${expertTitle},
                            ${expertCompany},
                            ${UserProfile.sq(profileData.bio || '')},
                            ${UserProfile.sq(profileData.location || '')},
                            ${expertCountry},
                            1, GETDATE(), GETDATE()
                        )
                    `);
                }
            }

            return await UserProfile.findByUserId(userId);
        } catch (error) {
            console.error('Error creating/updating user profile:', error);
            throw error;
        }
    }

    static async findByUserId(userId) {
        try {
            const query = `
                SELECT u.*, e.id as expert_id,
                       COALESCE(e.avatar_url, u.avatar_url) as profile_image_url
                FROM users u
                LEFT JOIN experts e ON e.user_id = u.id
                WHERE u.id = '${userId}'
            `;
            const result = await executeQuery(query);
            if (result.recordset.length === 0) return null;
            return new UserProfile(result.recordset[0]);
        } catch (error) {
            console.error('Error finding profile by user ID:', error);
            throw error;
        }
    }

    static async update(userId, updateData) {
        try {
            const sets = ['updated_at = GETDATE()'];
            if (updateData.name)         sets.push(`name = ${UserProfile.sq(updateData.name)}`);
            if (updateData.location)     sets.push(`location = ${UserProfile.sq(updateData.location)}`);
            if (updateData.experience)   sets.push(`experience = ${UserProfile.sq(updateData.experience)}`);
            if (updateData.availability) sets.push(`availability = ${UserProfile.sq(updateData.availability)}`);
            if (updateData.bio)          sets.push(`bio = ${UserProfile.sq(updateData.bio)}`);

            await executeQuery(`UPDATE users SET ${sets.join(', ')} WHERE id = '${userId}'`);
            return UserProfile.findByUserId(userId);
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    }

    /**
     * Get all mentors from the experts table with expertise lists + capacity info.
     */
    static async getAllMentors() {
        try {
            const query = `
                SELECT
                    e.id         as expert_id,
                    e.user_id,
                    e.name,
                    e.title,
                    e.bio,
                    e.location,
                    e.avatar_url as profile_image_url,
                    e.experience_years,
                    e.is_available,
                    (
                        SELECT STRING_AGG(ee.expertise, ', ')
                        FROM expert_expertise ee WHERE ee.expert_id = e.id
                    ) as expertise_list,
                    (
                        SELECT STRING_AGG(el.language, ', ')
                        FROM expert_languages el WHERE el.expert_id = e.id
                    ) as languages_list,
                    (
                        SELECT COUNT(*) FROM connections c2
                        WHERE c2.expert_id = e.id AND c2.status = 'accepted'
                    ) as active_mentee_count
                FROM experts e
                WHERE e.is_available = 1
                ORDER BY e.name
            `;
            const result = await executeQuery(query);
            return result.recordset.map(row => ({
                ...row,
                at_capacity: row.active_mentee_count >= 3,
            }));
        } catch (error) {
            console.error('Error getting all mentors:', error);
            throw error;
        }
    }

    /**
     * SQL-based mentor matching:
     * Counts overlap between requesting user's user_desired_expertise
     * and each expert's expert_expertise, sorted by match_score DESC.
     * Excludes experts already at 3-mentee capacity.
     */
    static async getMatchedMentorsForUser(userId) {
        try {
            const query = `
                SELECT
                    e.id         as expert_id,
                    e.user_id,
                    e.name,
                    e.title,
                    e.bio,
                    e.location,
                    e.avatar_url as profile_image_url,
                    e.experience_years,
                    (
                        SELECT STRING_AGG(ee.expertise, ', ')
                        FROM expert_expertise ee WHERE ee.expert_id = e.id
                    ) as expertise_list,
                    (
                        SELECT STRING_AGG(el.language, ', ')
                        FROM expert_languages el WHERE el.expert_id = e.id
                    ) as languages_list,
                    (
                        SELECT COUNT(*)
                        FROM expert_expertise ee2
                        WHERE ee2.expert_id = e.id
                          AND ee2.expertise IN (
                            SELECT expertise FROM user_desired_expertise
                            WHERE user_id = '${userId}'
                          )
                    ) as match_score,
                    (
                        SELECT COUNT(*) FROM connections c2
                        WHERE c2.expert_id = e.id AND c2.status = 'accepted'
                    ) as active_mentee_count
                FROM experts e
                WHERE e.is_available = 1
                  AND (e.user_id IS NULL OR e.user_id != '${userId}')
                  AND (
                        SELECT COUNT(*) FROM connections c3
                        WHERE c3.expert_id = e.id AND c3.status = 'accepted'
                      ) < 3
                ORDER BY match_score DESC, active_mentee_count ASC
            `;
            const result = await executeQuery(query);
            return result.recordset.map(row => ({
                ...row,
                at_capacity: false,
                atCapacity:  false,
            }));
        } catch (error) {
            console.error('Error getting matched mentors:', error);
            throw error;
        }
    }
    /**
     * Get all mentees (users where is_mentee=1 or role mentee/both)
     */
    static async getAllMentees() {
        try {
            const query = `
                SELECT
                    u.id as user_id,
                    u.name,
                    u.role,
                    u.location,
                    u.bio,
                    u.experience,
                    u.availability,
                    u.avatar_url as profile_image_url,
                    (
                        SELECT STRING_AGG(ude.expertise, ', ')
                        FROM user_desired_expertise ude WHERE ude.user_id = u.id
                    ) as desired_expertise_list,
                    (
                        SELECT STRING_AGG(ul.language, ', ')
                        FROM user_languages ul WHERE ul.user_id = u.id
                    ) as languages_list
                FROM users u
                WHERE u.is_active = 1 AND (u.is_mentee = 1 OR u.role IN ('mentee','both'))
                ORDER BY u.name
            `;
            const result = await executeQuery(query);
            return result.recordset;
        } catch (error) {
            console.error('Error getting all mentees:', error);
            throw error;
        }
    }
}

export default UserProfile;

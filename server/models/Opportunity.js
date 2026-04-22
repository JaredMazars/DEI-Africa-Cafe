import { executeQuery } from '../config/database.js';

class Opportunity {
    constructor(data) {
        this.opportunity_id = data.opportunity_id;
        this.title = data.title;
        this.description = data.description;
        this.industry = data.industry;
        this.client_sector = data.client_sector;
        this.regions_needed = data.regions_needed;
        this.budget_range = data.budget_range;
        this.deadline = data.deadline;
        this.priority = data.priority;
        this.status = data.status;
        this.contact_person_id = data.contact_person_id;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static async create(opportunityData) {
        try {
            const query = `
                INSERT INTO Opportunities (title, description, industry, client_sector, regions_needed, 
                                         budget_range, deadline, priority, status, contact_person_id, created_at, updated_at)
                OUTPUT INSERTED.*
                VALUES ('${opportunityData.title}', '${opportunityData.description.replace(/'/g, "''")}', 
                        '${opportunityData.industry}', '${opportunityData.client_sector}', 
                        '${opportunityData.regions_needed}', '${opportunityData.budget_range}', 
                        '${opportunityData.deadline}', '${opportunityData.priority}', 'open', 
                        '${opportunityData.contact_person_id}', GETDATE(), GETDATE())
            `;
            
            const result = await executeQuery(query);
            return new Opportunity(result.recordset[0]);
        } catch (error) {
            console.error('Error creating opportunity:', error);
            throw error;
        }
    }

    static async getAll() {
        try {
            const query = `
                SELECT o.*, 
                       up.name as contact_person_name,
                       up.profile_image_url as contact_person_avatar,
                       (SELECT COUNT(*) FROM OpportunityInterests oi WHERE oi.opportunity_id = o.opportunity_id) as applicant_count
                FROM Opportunities o
                LEFT JOIN users up ON o.contact_person_id = up.id
                ORDER BY o.created_at DESC
            `;
            
            const result = await executeQuery(query);
            return result.recordset.map(opportunity => new Opportunity(opportunity));
        } catch (error) {
            console.error('Error getting all opportunities:', error);
            throw error;
        }
    }

    static async findById(opportunityId) {
        try {
            const query = `
                SELECT o.*, 
                       up.name as contact_person_name,
                       up.profile_image_url as contact_person_avatar
                FROM Opportunities o
                LEFT JOIN users up ON o.contact_person_id = up.id
                WHERE o.opportunity_id = '${opportunityId}'
            `;
            
            const result = await executeQuery(query);
            return result.recordset.length > 0 ? new Opportunity(result.recordset[0]) : null;
        } catch (error) {
            console.error('Error finding opportunity by ID:', error);
            throw error;
        }
    }

    static async updateStatus(opportunityId, status) {
        try {
            const query = `
                UPDATE Opportunities 
                SET status = '${status}', updated_at = GETDATE()
                WHERE opportunity_id = '${opportunityId}'
            `;
            
            await executeQuery(query);
        } catch (error) {
            console.error('Error updating opportunity status:', error);
            throw error;
        }
    }
}

export default Opportunity;
import { executeQuery } from '../config/database.js';

class Question {
    constructor(data) {
        this.question_id = data.question_id;
        this.user_id = data.user_id;
        this.title = data.title;
        this.content = data.content;
        this.tags = data.tags;
        this.is_answered = data.is_answered;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static async create(questionData) {
        try {
            const query = `
                INSERT INTO Questions (user_id, title, content, tags, is_answered, created_at, updated_at)
                OUTPUT INSERTED.*
                VALUES ('${questionData.user_id}', '${questionData.title.replace(/'/g, "''")}', 
                        '${questionData.content.replace(/'/g, "''")}', '${questionData.tags}', 
                        0, GETDATE(), GETDATE())
            `;
            
            const result = await executeQuery(query);
            return new Question(result.recordset[0]);
        } catch (error) {
            console.error('Error creating question:', error);
            throw error;
        }
    }

    static async getAll() {
        try {
            const query = `
                SELECT q.*, 
                       up.name as author_name,
                       up.profile_image_url as author_avatar,
                       (SELECT COUNT(*) FROM QuestionAnswers qa WHERE qa.question_id = q.question_id) as response_count
                FROM Questions q
                LEFT JOIN users up ON q.user_id = up.id
                ORDER BY q.created_at DESC
            `;
            
            const result = await executeQuery(query);
            return result.recordset.map(question => new Question(question));
        } catch (error) {
            console.error('Error getting all questions:', error);
            throw error;
        }
    }

    static async findById(questionId) {
        try {
            const query = `
                SELECT q.*, 
                       up.name as author_name,
                       up.profile_image_url as author_avatar
                FROM Questions q
                LEFT JOIN users up ON q.user_id = up.id
                WHERE q.question_id = '${questionId}'
            `;
            
            const result = await executeQuery(query);
            return result.recordset.length > 0 ? new Question(result.recordset[0]) : null;
        } catch (error) {
            console.error('Error finding question by ID:', error);
            throw error;
        }
    }

    static async markAsAnswered(questionId) {
        try {
            const query = `
                UPDATE Questions 
                SET is_answered = 1, updated_at = GETDATE()
                WHERE question_id = '${questionId}'
            `;
            
            await executeQuery(query);
        } catch (error) {
            console.error('Error marking question as answered:', error);
            throw error;
        }
    }
}

export default Question;
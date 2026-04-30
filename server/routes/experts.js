import express from 'express';
import User from '../models/User.js';
import Expert from '../models/Expert.js';
import { cache } from '../utils/cache.js';
import { executeQuery } from '../config/database.js';
import { body, validationResult } from 'express-validator';
import Question from '../models/Question.js';
import UserProfile from '../models/UserProfile.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all experts with profiles
router.get('/', auth, async (req, res) => {
    try {
        const { expertise, industry, location, availability } = req.query;

        // Cache the full unfiltered expert list — filters applied in-memory (10-minute TTL)
        const CACHE_KEY = 'experts:all';
        let experts = cache.get(CACHE_KEY);
        if (!experts) {
            experts = await Expert.getAllWithProfiles();
            cache.set(CACHE_KEY, experts, 600);
        }
        
        // Apply filters if provided (in-memory — no extra DB hit)
        if (expertise) {
            experts = experts.filter(expert => 
                expert.specializations && expert.specializations.toLowerCase().includes(expertise.toLowerCase())
            );
        }
        
        if (industry) {
            experts = experts.filter(expert => 
                expert.industries && expert.industries.toLowerCase().includes(industry.toLowerCase())
            );
        }
        
        if (location) {
            experts = experts.filter(expert => 
                expert.location && expert.location.toLowerCase().includes(location.toLowerCase())
            );
        }
        
        if (availability === 'available') {
            experts = experts.filter(expert => expert.is_available);
        }

        res.json({
            success: true,
            data: { experts }
        });

    } catch (error) {
        console.error('Error fetching experts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch experts'
        });
    }
});

// Apply to become an expert (creates an unverified expert record for admin review)
router.post('/apply', auth, [
    body('motivation').notEmpty().trim().withMessage('Motivation is required'),
    body('experience').notEmpty().trim().withMessage('Experience is required'),
    body('expertise').isArray({ min: 1 }).withMessage('At least one expertise area is required'),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array()[0].msg });
        }

        const userId = req.user.id || req.user.user_id;
        const { expertise, industries, motivation, experience, achievements } = req.body;

        // Check if this user already has an expert record
        const existing = await executeQuery(`SELECT id, is_verified FROM experts WHERE user_id = '${userId}'`);
        if (existing.recordset.length > 0) {
            const rec = existing.recordset[0];
            if (rec.is_verified) {
                return res.status(409).json({ success: false, message: 'You are already a verified expert.' });
            }
            return res.status(409).json({ success: false, message: 'Your application is already under review.' });
        }

        // Get user details for the expert record
        const userRow = await executeQuery(`SELECT name, email FROM users WHERE id = '${userId}'`);
        const user = userRow.recordset[0];
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

        const bio = `${motivation.replace(/'/g, "''")} ${achievements ? '\n\nAchievements: ' + achievements.replace(/'/g, "''") : ''}`.trim();
        const expStr = (experience || '').replace(/'/g, "''");

        // Create expert record (is_verified=0 → pending admin approval)
        const ins = await executeQuery(`
            INSERT INTO experts (user_id, name, bio, location, is_available, is_verified, is_rejected,
                                 experience_years, created_at, updated_at)
            OUTPUT INSERTED.id
            VALUES ('${userId}', '${user.name.replace(/'/g, "''")}', '${bio}', '',
                    0, 0, 0, 0, GETDATE(), GETDATE())
        `);
        const expertId = ins.recordset[0].id;

        // Insert expertise tags
        if (Array.isArray(expertise) && expertise.length > 0) {
            for (const exp of expertise) {
                await executeQuery(`
                    INSERT INTO expert_expertise (expert_id, expertise)
                    VALUES ('${expertId}', '${exp.replace(/'/g, "''")}')
                `);
            }
        }

        // Bust the expert cache so the pending record appears to admins
        cache.invalidatePattern('experts:');

        res.status(201).json({
            success: true,
            message: 'Your application has been submitted! We will review it within 2-3 business days.',
            data: { expertId }
        });
    } catch (error) {
        console.error('Expert application error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit application. Please try again.' });
    }
});

// Get expert by ID
router.get('/:expertId', auth, async (req, res) => {
    try {
        const { expertId } = req.params;
        const expert = await Expert.findById(expertId);
        
        if (!expert) {
            return res.status(404).json({
                success: false,
                message: 'Expert not found'
            });
        }

        res.json({
            success: true,
            data: { expert }
        });

    } catch (error) {
        console.error('Error fetching expert:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch expert'
        });
    }
});

// Create expert profile
router.post('/', auth, [
    body('specializations').notEmpty().withMessage('Specializations are required'),
    body('industries').notEmpty().withMessage('Industries are required'),
    body('hourly_rate').isNumeric().withMessage('Valid hourly rate is required'),
    body('response_time').notEmpty().withMessage('Response time is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const expertData = {
            user_id: req.user.user_id,
            ...req.body,
            is_verified: false,
            is_available: true
        };

        const expert = await Expert.create(expertData);

        res.status(201).json({
            success: true,
            message: 'Expert profile created successfully',
            data: { expert }
        });

    } catch (error) {
        console.error('Error creating expert profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create expert profile'
        });
    }
});

// Update expert availability
router.put('/:expertId/availability', auth, [
    body('is_available').isBoolean().withMessage('Availability must be true or false')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { expertId } = req.params;
        const { is_available } = req.body;

        await Expert.updateAvailability(expertId, is_available);

        res.json({
            success: true,
            message: 'Expert availability updated successfully'
        });

    } catch (error) {
        console.error('Error updating expert availability:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update expert availability'
        });
    }
});

export default router;
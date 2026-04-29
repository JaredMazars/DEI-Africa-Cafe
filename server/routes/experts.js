import express from 'express';
import User from '../models/User.js';
import Expert from '../models/Expert.js';
import { cache } from '../utils/cache.js';
import Question from '../models/Question.js';
import UserProfile from '../models/UserProfile.js';
import auth from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

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
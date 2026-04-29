import express from 'express';
import User from '../models/User.js';
import Opportunity from '../models/Opportunity.js';
import auth from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all opportunities
router.get('/', auth, async (req, res) => {
    try {
        const { industry, region, status } = req.query;
        
        let opportunities = await Opportunity.getAll();
        
        // Apply filters if provided
        if (industry) {
            opportunities = opportunities.filter(opp => 
                opp.industry.toLowerCase().includes(industry.toLowerCase())
            );
        }
        
        if (region) {
            opportunities = opportunities.filter(opp => 
                opp.regions_needed.toLowerCase().includes(region.toLowerCase())
            );
        }
        
        if (status && status !== 'all') {
            opportunities = opportunities.filter(opp => opp.status === status);
        }

        res.json({
            success: true,
            data: { opportunities }
        });

    } catch (error) {
        console.error('Error fetching opportunities:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch opportunities'
        });
    }
});

// Create new opportunity
router.post('/', auth, [
    body('title').notEmpty().withMessage('Opportunity title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('industry').notEmpty().withMessage('Industry is required'),
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

        const opportunityData = {
            ...req.body,
            contact_person_id: req.user.user_id,
            client_sector: req.body.client_sector || req.body.industry || '',
            regions_needed: req.body.regions_needed || '',
            budget_range: req.body.budget_range || 'To be discussed',
            deadline: (req.body.deadline && req.body.deadline.trim())
                ? req.body.deadline.trim()
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            priority: req.body.priority || 'medium',
        };

        const opportunity = await Opportunity.create(opportunityData);

        res.status(201).json({
            success: true,
            message: 'Opportunity posted successfully',
            data: { opportunity }
        });

    } catch (error) {
        console.error('Error creating opportunity:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to post opportunity'
        });
    }
});

// Get opportunity by ID
router.get('/:opportunityId', auth, async (req, res) => {
    try {
        const { opportunityId } = req.params;
        const opportunity = await Opportunity.findById(opportunityId);
        
        if (!opportunity) {
            return res.status(404).json({
                success: false,
                message: 'Opportunity not found'
            });
        }

        res.json({
            success: true,
            data: { opportunity }
        });

    } catch (error) {
        console.error('Error fetching opportunity:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch opportunity'
        });
    }
});

// Update opportunity status
router.put('/:opportunityId/status', auth, [
    body('status').isIn(['open', 'in-progress', 'closed']).withMessage('Invalid status')
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

        const { opportunityId } = req.params;
        const { status } = req.body;

        await Opportunity.updateStatus(opportunityId, status);

        res.json({
            success: true,
            message: 'Opportunity status updated successfully'
        });

    } catch (error) {
        console.error('Error updating opportunity status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update opportunity status'
        });
    }
});

export default router;
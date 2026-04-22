import express from 'express';
import User from '../models/User.js';
import UserProfile from '../models/UserProfile.js';
import Connection from '../models/Connection.js';
import Session from '../models/Session.js';
import Message from '../models/Message.js';
import Review from '../models/Review.js';
import auth from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get user's connections with full details
router.get('/', auth, async (req, res) => {
    try {
        const connections = await Connection.getConnectionsWithDetails(req.user.user_id);
        
        res.json({
            success: true,
            data: { connections }
        });

    } catch (error) {
        console.error('Error fetching connections:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch connections'
        });
    }
});

// Get connection statistics for dashboard
router.get('/stats', auth, async (req, res) => {
    try {
        const [connectionStats, userConnections] = await Promise.all([
            Connection.getConnectionStats(),
            Connection.getUserConnections(req.user.user_id)
        ]);

        const userStats = {
            totalConnections: userConnections.length,
            activeConnections: userConnections.filter(c => c.status === 'accepted').length,
            pendingConnections: userConnections.filter(c => c.status === 'pending').length,
            mentorConnections: userConnections.filter(c => c.mentor_id === req.user.user_id).length,
            menteeConnections: userConnections.filter(c => c.mentee_id === req.user.user_id).length
        };

        res.json({
            success: true,
            data: { 
                platformStats: connectionStats,
                userStats 
            }
        });

    } catch (error) {
        console.error('Error fetching connection stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch connection statistics'
        });
    }
});

// Create new connection request
router.post('/', auth, [
    body('mentor_id').isUUID().withMessage('Valid mentor ID is required'),
    body('mentee_id').isUUID().withMessage('Valid mentee ID is required')
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

        const { mentor_id, mentee_id } = req.body;

        // Check if connection already exists
        const existingConnection = await Connection.checkExistingConnection(mentor_id, mentee_id);
        if (existingConnection) {
            return res.status(400).json({
                success: false,
                message: 'Connection already exists between these users'
            });
        }

        // Enforce 3-mentee capacity rule
        const atCapacity = await Connection.isMentorAtCapacity(mentor_id);
        if (atCapacity) {
            return res.status(400).json({
                success: false,
                message: `This mentor has reached their maximum capacity of ${Connection.MENTOR_CAPACITY} active mentees. Please choose another mentor.`
            });
        }

        // Verify that the requesting user is either the mentor or mentee
        if (req.user.user_id !== mentor_id && req.user.user_id !== mentee_id) {
            return res.status(403).json({
                success: false,
                message: 'You can only create connections involving yourself'
            });
        }

        const connection = await Connection.create({ mentor_id, mentee_id });

        res.status(201).json({
            success: true,
            message: 'Connection request created successfully',
            data: { connection }
        });

    } catch (error) {
        console.error('Error creating connection:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create connection'
        });
    }
});

// Update connection status
router.put('/:connectionId/status', auth, [
    body('status').isIn(['pending', 'accepted', 'rejected', 'inactive']).withMessage('Invalid status')
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

        const { connectionId } = req.params;
        const { status } = req.body;

        // Find the connection
        const connection = await Connection.findById(connectionId);
        if (!connection) {
            return res.status(404).json({
                success: false,
                message: 'Connection not found'
            });
        }

        // Verify that the requesting user is part of this connection
        if (req.user.user_id !== connection.mentor_id && req.user.user_id !== connection.mentee_id) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own connections'
            });
        }

        // When a mentor accepts a new mentee, re-check capacity
        if (status === 'accepted') {
            const atCapacity = await Connection.isMentorAtCapacity(connection.mentor_id);
            if (atCapacity) {
                return res.status(400).json({
                    success: false,
                    message: `Mentor has reached their maximum capacity of ${Connection.MENTOR_CAPACITY} active mentees.`
                });
            }
        }

        const updatedConnection = await Connection.updateStatus(connectionId, status);

        res.json({
            success: true,
            message: 'Connection status updated successfully',
            data: { connection: updatedConnection }
        });

    } catch (error) {
        console.error('Error updating connection status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update connection status'
        });
    }
});

// Get potential mentors for a mentee
router.get('/potential-mentors', auth, async (req, res) => {
    try {
        const { expertise, location } = req.query;
        
        let mentors;
        if (expertise) {
            mentors = await UserProfile.getMentorsByExpertise(expertise);
        } else {
            mentors = await UserProfile.getAllMentors();
        }

        // Filter out existing connections
        const existingConnections = await Connection.getUserConnections(req.user.user_id);
        const connectedMentorIds = existingConnections.map(c => c.mentor_id);
        
        const availableMentors = mentors.filter(mentor => 
            !connectedMentorIds.includes(mentor.user_id) && 
            mentor.user_id !== req.user.user_id
        );

        res.json({
            success: true,
            data: { mentors: availableMentors }
        });

    } catch (error) {
        console.error('Error fetching potential mentors:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch potential mentors'
        });
    }
});

// Get potential mentees for a mentor
router.get('/potential-mentees', auth, async (req, res) => {
    try {
        const { interest, location } = req.query;
        
        let mentees;
        if (interest) {
            mentees = await UserProfile.getMenteesByInterests(interest);
        } else {
            mentees = await UserProfile.getAllMentees();
        }

        // Filter out existing connections
        const existingConnections = await Connection.getUserConnections(req.user.user_id);
        const connectedMenteeIds = existingConnections.map(c => c.mentee_id);
        
        const availableMentees = mentees.filter(mentee => 
            !connectedMenteeIds.includes(mentee.user_id) && 
            mentee.user_id !== req.user.user_id
        );

        res.json({
            success: true,
            data: { mentees: availableMentees }
        });

    } catch (error) {
        console.error('Error fetching potential mentees:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch potential mentees'
        });
    }
});

export default router;